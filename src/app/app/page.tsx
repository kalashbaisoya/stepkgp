import { getCurrentUser } from "@/lib/auth/session";

// Applicant dashboard (placeholder). Milestone 5 fills this with real applications
// across cycles + a status tracker. For now it proves the authenticated session + RBAC.
export default async function AppDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-2 text-muted-foreground">
        This is your STEP portal. Your applications will appear here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Your roles</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.roles.map((r) => (
              <span
                key={r}
                className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
              >
                {r}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Applications</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No applications yet. The online application opens in Milestone 5.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Milestone 1 · Identity, Auth &amp; RBAC.
      </p>
    </div>
  );
}
