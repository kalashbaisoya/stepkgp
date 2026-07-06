import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listUserApplications } from "@/modules/applications/service";
import { getOpenCycle } from "@/modules/cycles/service";
import { StartApplication } from "@/components/applications/start-application";

const statusStyle: Record<string, string> = {
  draft: "text-status-progress",
  submitted: "text-status-info",
};

export default async function AppDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [applications, openCycle] = await Promise.all([
    listUserApplications(user.id),
    getOpenCycle(),
  ]);

  // Staff/admin/reviewer/mentor users manage the platform; don't push the applicant
  // "start an application" CTA at them (they land on their own console after login).
  const isElevated =
    can(user, "cms:read") || can(user, "application:read_any") ||
    can(user, "application:review") || can(user, "incubation:manage") ||
    can(user, "mentor:read_assigned");
  const showStart = openCycle && !isElevated;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-2 text-muted-foreground">Your applications and their status.</p>

      <div className="mt-8 space-y-4">
        {applications.map((a) => (
          <Link
            key={a.id}
            href={`/app/applications/${a.id}`}
            className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{a.cycleName} · {a.categoryName}</p>
                <p className={`text-sm capitalize ${statusStyle[a.status] ?? "text-muted-foreground"}`}>
                  ● {a.status}
                  {a.submittedAt && ` · submitted ${new Date(a.submittedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="w-40">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-brand" style={{ width: `${a.progress}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">{a.progress}%</p>
              </div>
            </div>
          </Link>
        ))}
        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            You haven&rsquo;t started an application yet.
          </p>
        )}
      </div>

      {showStart && (
        <div className="mt-8">
          <StartApplication
            cycleId={openCycle.id}
            cycleName={openCycle.name || `${openCycle.year} Cohort`}
            categories={openCycle.categories}
          />
        </div>
      )}
    </div>
  );
}
