import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";

// Authenticated app shell (Phase 6 IA §3). Server-side auth gate: middleware
// handles the cheap redirect; here we resolve the real user + roles.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/app");

  return (
    <div className="min-h-dvh bg-surface-2">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/app" className="text-sm font-semibold uppercase tracking-widest text-brand">
            STEP · Portal
          </Link>
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
