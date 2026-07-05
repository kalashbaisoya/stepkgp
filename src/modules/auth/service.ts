import "server-only";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import {
  createLinkToken,
  createOtp,
  consumeToken,
  consumeOtp,
} from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/email";
import { audit } from "@/lib/audit/audit";
import { rateLimit } from "@/lib/rate-limit";
import {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  forgotSchema,
  resetSchema,
  verifyEmailSchema,
} from "./schema";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Register a new user, assign the applicant role, send a verification email. */
export async function register(input: unknown) {
  const { name, email, password } = registerSchema.parse(input);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new ServiceError("CONFLICT", "An account with this email already exists.");

  const org = await db.organization.findUnique({ where: { slug: "step-iit-kgp" } });
  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: { name, email, passwordHash, status: "PENDING", organizationId: org?.id },
  });

  // Default role: applicant.
  const applicant = await db.role.findUnique({ where: { key: "applicant" } });
  if (applicant) {
    await db.userRole.create({ data: { userId: user.id, roleId: applicant.id } });
  }

  const token = await createLinkToken(email, "EMAIL_VERIFY");
  await sendEmail({
    to: email,
    subject: "Verify your STEP account",
    html: `<p>Welcome to STEP IIT KGP. Verify your email:</p><p><a href="${APP_URL}/auth/verify?token=${token}">Verify my account</a></p>`,
  });

  await audit({ actorId: user.id, action: "user.registered", targetType: "User", targetId: user.id });
  return { userId: user.id };
}

/** Verify an email via link token. */
export async function verifyEmail(input: unknown) {
  const { token } = verifyEmailSchema.parse(input);
  const email = await consumeToken(token, "EMAIL_VERIFY");
  if (!email) throw new ServiceError("INVALID_TOKEN", "This verification link is invalid or expired.");

  const user = await db.user.update({
    where: { email },
    data: { emailVerified: new Date(), status: "ACTIVE" },
  });
  await audit({ actorId: user.id, action: "user.verified", targetType: "User", targetId: user.id });
  return { ok: true };
}

/** Send a one-time login code. */
export async function requestOtp(input: unknown) {
  const { email } = otpRequestSchema.parse(input);
  const limit = rateLimit(`otp:${email}`, 5, 15 * 60_000);
  if (!limit.ok) throw new ServiceError("RATE_LIMITED", "Too many requests. Try again later.");

  const user = await db.user.findUnique({ where: { email } });
  // Do not leak account existence.
  if (user) {
    const code = await createOtp(email);
    await sendEmail({
      to: email,
      subject: "Your STEP login code",
      html: `<p>Your one-time code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    });
  }
  return { ok: true };
}

/** Verify an OTP and start a session. */
export async function verifyOtp(input: unknown) {
  const { email, otp } = otpVerifySchema.parse(input);
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await consumeOtp(email, otp))) {
    throw new ServiceError("INVALID_OTP", "Invalid or expired code.");
  }
  if (!user.emailVerified) {
    await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date(), status: "ACTIVE" } });
  }
  await createSession(user.id);
  await audit({ actorId: user.id, action: "user.login", targetType: "User", targetId: user.id });
  return { ok: true };
}

/** Password login. Blocks unverified accounts. */
export async function login(input: unknown, ip?: string) {
  const { email, password } = loginSchema.parse(input);
  const limit = rateLimit(`login:${ip ?? email}`, 10, 15 * 60_000);
  if (!limit.ok) throw new ServiceError("RATE_LIMITED", "Too many attempts. Try again later.");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.deletedAt || !(await verifyPassword(password, user.passwordHash))) {
    throw new ServiceError("INVALID_CREDENTIALS", "Incorrect email or password.");
  }
  if (!user.emailVerified) {
    throw new ServiceError("UNVERIFIED", "Please verify your email before signing in.");
  }
  if (user.status === "SUSPENDED") {
    throw new ServiceError("SUSPENDED", "This account is suspended.");
  }

  await createSession(user.id);
  await audit({ actorId: user.id, action: "user.login", targetType: "User", targetId: user.id, ip });
  return { ok: true };
}

/** Begin password reset (always returns ok to avoid account enumeration). */
export async function forgotPassword(input: unknown) {
  const { email } = forgotSchema.parse(input);
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = await createLinkToken(email, "PASSWORD_RESET");
    await sendEmail({
      to: email,
      subject: "Reset your STEP password",
      html: `<p>Reset your password:</p><p><a href="${APP_URL}/auth/reset?token=${token}">Choose a new password</a></p>`,
    });
  }
  return { ok: true };
}

/** Complete password reset. */
export async function resetPassword(input: unknown) {
  const { token, password } = resetSchema.parse(input);
  const email = await consumeToken(token, "PASSWORD_RESET");
  if (!email) throw new ServiceError("INVALID_TOKEN", "This reset link is invalid or expired.");

  const passwordHash = await hashPassword(password);
  const user = await db.user.update({ where: { email }, data: { passwordHash } });
  // Invalidate existing sessions on password change.
  await db.session.deleteMany({ where: { userId: user.id } });
  await audit({ actorId: user.id, action: "user.password_reset", targetType: "User", targetId: user.id });
  return { ok: true };
}

export async function logout() {
  await destroySession();
  return { ok: true };
}
