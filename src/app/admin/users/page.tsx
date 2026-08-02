import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listUsers, listRoles } from "@/modules/admin/users-service";
import { UsersManager } from "@/components/admin/users-manager";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!can(user, "user:manage")) redirect("/admin");

  const { q } = await searchParams;
  const [users, roles] = await Promise.all([listUsers(q), listRoles()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Users &amp; roles</h1>
      <p className="mt-2 text-muted-foreground">Assign roles and manage account access.</p>

      <form method="get" className="mt-6 flex gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search name or email…" className="h-9 w-72 clay-field text-sm" />
        <button className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground">Search</button>
      </form>

      <UsersManager
        users={users}
        roles={roles.map((r) => ({ key: r.key, name: r.name }))}
        canManageRoles={can(user, "role:manage")}
      />
    </div>
  );
}
