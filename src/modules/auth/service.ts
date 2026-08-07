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
} from "./schema";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

/**
 * Role handed to every new signup.
 *
 * TEMPORARY: set to super_admin so anyone who signs in can reach /admin while
 * the CMS is being built out. Registration is open and no longer email
 * verified, so this means any address at all, real or not, gets user
 * management, role editing, the audit log and CMS write.
 *
 * Change this back to "applicant" before the site is public. It is the only
 * line that needs to change; existing accounts are adjusted from the admin
 * Users page or by removing the role row directly.
 */
const SIGNUP_ROLE_KEY = "super_admin";

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Register a new user, assign the applicant role, and sign them straight in. */
export async function register(input: unknown) {
  const { name, email, password } = registerSchema.parse(input);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new ServiceError("CONFLICT", "An account with this email already exists.");

  const org = await db.organization.findUnique({ where: { slug: "step-iit-kgp" } });
  const passwordHash = await hashPassword(password);

  // No email confirmation step: an account is usable the moment it is created.
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      status: "ACTIVE",
      emailVerified: new Date(),
      organizationId: org?.id,
    },
  });

  const role = await db.role.findUnique({ where: { key: SIGNUP_ROLE_KEY } });
  if (role) {
    await db.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  await createSession(user.id);
  await audit({ actorId: user.id, action: "user.registered", targetType: "User", targetId: user.id });
  return { userId: user.id };
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

/** Password login. Email and password are the only credentials required. */
export async function login(input: unknown, ip?: string) {
  const { email, password } = loginSchema.parse(input);
  const limit = rateLimit(`login:${ip ?? email}`, 10, 15 * 60_000);
  if (!limit.ok) throw new ServiceError("RATE_LIMITED", "Too many attempts. Try again later.");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.deletedAt || !(await verifyPassword(password, user.passwordHash))) {
    throw new ServiceError("INVALID_CREDENTIALS", "Incorrect email or password.");
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
