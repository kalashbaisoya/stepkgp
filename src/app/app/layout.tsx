import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { unreadCount } from "@/modules/notifications/service";
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

  const unread = await unreadCount(user.id);

  const nav = [
    { label: "My applications", href: "/app", show: true },
    { label: "Pipeline", href: "/app/staff/pipeline", show: can(user, "application:read_any") || can(user, "lifecycle:transition") },
    { label: "Reviews", href: "/app/review", show: can(user, "application:review") },
    { label: "Incubation", href: "/app/staff/incubation", show: can(user, "incubation:manage") },
    { label: "Mentees", href: "/app/mentor", show: can(user, "mentor:read_assigned") },
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
            <Link href="/app/notifications" aria-label="Notifications" className="relative text-muted-foreground transition-colors hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
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
