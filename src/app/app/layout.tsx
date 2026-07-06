import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { LogoutButton } from "@/components/auth/logout-button";

// Authenticated app shell (Phase 6 IA §3). Server-side auth gate: middleware
// handles the cheap redirect; here we resolve the real user + roles and derive
// the navigation from permissions (users never see links they can't use).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/app");

  const nav = [
    { label: "My applications", href: "/app", show: true },
    { label: "Pipeline", href: "/app/staff/pipeline", show: can(user, "application:read_any") || can(user, "lifecycle:transition") },
    { label: "Reviews", href: "/app/review", show: can(user, "application:review") },
    { label: "Admin", href: "/admin", show: can(user, "cms:read") || can(user, "user:manage") || can(user, "settings:manage") },
  ].filter((n) => n.show);

  return (
    <div className="min-h-dvh bg-surface-2">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-sm font-semibold uppercase tracking-widest text-brand">
              STEP · Portal
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
