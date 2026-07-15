"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as users from "./users-service";

// Assigning/revoking privileged roles requires role:manage (super admin); ordinary
// user management requires user:manage.
const PRIVILEGED = ["admin", "super_admin"];

export async function assignRoleAction(userId: string, roleKey: string) {
  const user = await requirePermission(PRIVILEGED.includes(roleKey) ? "role:manage" : "user:manage");
  await users.assignRole(userId, roleKey, user.id);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function revokeRoleAction(userId: string, roleKey: string) {
  const user = await requirePermission(PRIVILEGED.includes(roleKey) ? "role:manage" : "user:manage");
  await users.revokeRole(userId, roleKey, user.id);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserStatusAction(userId: string, status: "ACTIVE" | "SUSPENDED") {
  const user = await requirePermission("user:manage");
  await users.setUserStatus(userId, status, user.id);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setRolePermissionsAction(roleKey: string, permissionKeys: string[]) {
  const user = await requirePermission("role:manage");
  await users.setRolePermissions(roleKey, permissionKeys, user.id);
  revalidatePath("/admin/roles");
  return { ok: true };
}
