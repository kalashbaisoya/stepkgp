import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listRoles, listPermissions } from "@/modules/admin/users-service";
import { RolesManager } from "@/components/admin/roles-manager";

export default async function RolesPage() {
  const user = await getCurrentUser();
  if (!can(user, "role:manage")) redirect("/admin");

  const [roles, permissions] = await Promise.all([listRoles(), listPermissions()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; permissions</h1>
      <p className="mt-2 text-muted-foreground">Control what each role can do. Super Administrator always holds every permission.</p>
      <RolesManager
        roles={roles.map((r) => ({ key: r.key, name: r.name, permissions: r.permissions.map((p) => p.permission.key) }))}
        allPermissions={permissions.map((p) => p.key)}
      />
    </div>
  );
}
