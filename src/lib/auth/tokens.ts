import { randomBytes, randomInt } from "node:crypto";
import { db } from "@/lib/db";
import type { TokenType } from "@prisma/client";

const TOKEN_TTL_MIN: Record<TokenType, number> = {
  EMAIL_VERIFY: 60 * 24, // 24h
  OTP: 10, // 10 min
  PASSWORD_RESET: 30, // 30 min
  RECOMMENDATION: 60 * 24 * 14, // 14 days
};

function expiry(type: TokenType): Date {
  return new Date(Date.now() + TOKEN_TTL_MIN[type] * 60_000);
}

/** Create a URL-safe random token (email verify, reset, recommendation links). */
export async function createLinkToken(identifier: string, type: TokenType) {
  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.create({
    data: { identifier, token, type, expiresAt: expiry(type) },
  });
  return token;
}

/** Create a 6-digit numeric OTP. */
export async function createOtp(identifier: string) {
  const token = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.verificationToken.create({
    data: { identifier, token, type: "OTP", expiresAt: expiry("OTP") },
  });
  return token;
}

/** Consume (validate + delete) a token. Returns the identifier if valid, else null. */
export async function consumeToken(token: string, type: TokenType) {
  const row = await db.verificationToken.findUnique({ where: { token } });
  if (!row || row.type !== type || row.expiresAt < new Date()) return null;
  await db.verificationToken.delete({ where: { id: row.id } });
  return row.identifier;
}

/** Consume an OTP matched to a specific identifier. */
export async function consumeOtp(identifier: string, code: string) {
  const row = await db.verificationToken.findFirst({
    where: { identifier, token: code, type: "OTP", expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return false;
  await db.verificationToken.delete({ where: { id: row.id } });
  return true;
}
