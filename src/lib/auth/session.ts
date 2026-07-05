import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { db } from "@/lib/db";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "stepkgp_session";
const SESSION_TTL_DAYS = 30;

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
};

/** Create a DB-backed session and set the httpOnly cookie. */
export async function createSession(userId: string) {
  const id = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await db.session.create({ data: { id, userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Destroy the current session (logout). */
export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) {
    await db.session.deleteMany({ where: { id } });
    jar.delete(COOKIE);
  }
}

/**
 * Resolve the current user (with roles + flattened permissions) from the session cookie.
 * Memoized per-request via React cache. Returns null when unauthenticated.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;

  const session = await db.session.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
    return null;
  }

  const roles = session.user.roles.map((ur) => ur.role.key);
  const permissions = Array.from(
    new Set(
      session.user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.key),
      ),
    ),
  );

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    roles,
    permissions,
  };
});
