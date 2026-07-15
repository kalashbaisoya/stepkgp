import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { LogoutButton } from "@/components/auth/logout-button";

// Admin shell (Phase 6 IA §4). Middleware ensures a session; here we enforce the
// real permission. Any admin-surface permission grants entry; nav + per-page guards refine.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/admin");
  const hasAdminAccess =
    can(user, "cms:read") ||
    can(user, "user:manage") ||
    can(user, "report:view") ||
    can(user, "audit:view") ||
    can(user, "settings:manage");
  if (!hasAdminAccess) redirect("/app");

  const NAV = [
    { label: "Dashboard", href: "/admin", show: true },
    { label: "Content (CMS)", href: "/admin/cms/pages", show: can(user, "cms:read") },
    { label: "Showcase", href: "/admin/cms/showcase", show: can(user, "cms:read") },
    { label: "Forms", href: "/admin/forms", show: can(user, "form:manage") },
    { label: "Business plan", href: "/admin/business-plan", show: can(user, "form:manage") },
    { label: "Cycles", href: "/admin/cycles", show: can(user, "cycle:manage") },
    { label: "Documents", href: "/admin/documents", show: can(user, "document:configure") },
    { label: "Notifications", href: "/admin/settings/notifications", show: can(user, "settings:manage") },
    { label: "Reports", href: "/admin/reports", show: can(user, "report:view") },
    { label: "Users", href: "/admin/users", show: can(user, "user:manage") },
    { label: "Roles", href: "/admin/roles", show: can(user, "role:manage") },
    { label: "Audit log", href: "/admin/audit", show: can(user, "audit:view") },
  ].filter((n) => n.show);

  return (
    <div className="min-h-dvh bg-surface-2">
      <header className="border-b border-border bg-surface">
        <div className="flex h-14 items-center justify-between px-6">
          <Link href="/admin" className="text-sm font-semibold uppercase tracking-widest text-brand">
            STEP · Admin
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">
              Portal
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-52 shrink-0">
          <nav className="space-y-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
