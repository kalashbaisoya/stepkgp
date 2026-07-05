import "server-only";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export class AuthError extends Error {
  constructor(
    public code: "UNAUTHENTICATED" | "FORBIDDEN",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** Throw unless a user is authenticated; returns the user. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED", "Sign in required.");
  return user;
}

/** True if the user holds the permission (super_admin implicitly holds all). */
export function can(user: CurrentUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.roles.includes("super_admin")) return true;
  return user.permissions.includes(permission);
}

/**
 * Enforce a permission. Optional `resource` scope check for own-vs-any:
 * pass `ownerId` and the guard confirms the user owns the resource when they
 * lack the broad `*:read_any`-style permission but hold the `own` variant.
 */
export async function requirePermission(
  permission: string,
  opts?: { ownerId?: string; ownPermission?: string },
): Promise<CurrentUser> {
  const user = await requireUser();

  if (can(user, permission)) return user;

  // Fallback to an "own"-scoped permission when the resource belongs to the user.
  if (
    opts?.ownPermission &&
    opts.ownerId === user.id &&
    can(user, opts.ownPermission)
  ) {
    return user;
  }

  throw new AuthError("FORBIDDEN", `Missing permission: ${permission}`);
}
