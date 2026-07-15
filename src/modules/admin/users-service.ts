import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";

export async function listUsers(search?: string) {
  const users = await db.user.findMany({
    where: search ? { OR: [{ email: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }] } : {},
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    roles: u.roles.map((r) => r.role.key),
  }));
}

export function listRoles() {
  return db.role.findMany({ orderBy: { name: "asc" }, include: { permissions: { include: { permission: true } } } });
}

export async function assignRole(userId: string, roleKey: string, actorId?: string) {
  const role = await db.role.findUnique({ where: { key: roleKey } });
  if (!role) return;
  await db.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  });
  await audit({ actorId, action: "rbac.role_assigned", targetType: "User", targetId: userId, after: { roleKey } });
}

export async function revokeRole(userId: string, roleKey: string, actorId?: string) {
  const role = await db.role.findUnique({ where: { key: roleKey } });
  if (!role) return;
  await db.userRole.deleteMany({ where: { userId, roleId: role.id } });
  await audit({ actorId, action: "rbac.role_revoked", targetType: "User", targetId: userId, after: { roleKey } });
}

export async function setUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED", actorId?: string) {
  await db.user.update({ where: { id: userId }, data: { status } });
  if (status === "SUSPENDED") await db.session.deleteMany({ where: { userId } }); // force logout
  await audit({ actorId, action: "user.status_changed", targetType: "User", targetId: userId, after: { status } });
}

// ---- Role permission management (super admin) ----
export function listPermissions() {
  return db.permission.findMany({ orderBy: { key: "asc" } });
}

export async function setRolePermissions(roleKey: string, permissionKeys: string[], actorId?: string) {
  const role = await db.role.findUnique({ where: { key: roleKey } });
  if (!role) return;
  const perms = await db.permission.findMany({ where: { key: { in: permissionKeys } } });
  await db.$transaction([
    db.rolePermission.deleteMany({ where: { roleId: role.id } }),
    ...perms.map((p) => db.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } })),
  ]);
  await audit({ actorId, action: "rbac.role_permissions_changed", targetType: "Role", targetId: role.id, after: { permissionKeys } });
}
