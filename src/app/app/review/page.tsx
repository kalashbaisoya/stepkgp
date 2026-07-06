import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listAssignmentsForReviewer } from "@/modules/review/service";

export default async function ReviewDashboard() {
  const user = await getCurrentUser();
  if (!can(user, "application:review")) redirect("/app");

  const assignments = await listAssignmentsForReviewer(user!.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
      <p className="mt-2 text-muted-foreground">Applications assigned to you.</p>

      <div className="mt-8 space-y-3">
        {assignments.map((a) => (
          <Link
            key={a.applicationId}
            href={`/app/review/${a.applicationId}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand"
          >
            <div>
              <p className="font-medium">{a.cycleName} · {a.categoryName}</p>
              <p className="text-sm capitalize text-muted-foreground">Application: {a.appStatus.replace(/_/g, " ")}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${a.status === "completed" ? "bg-status-success/10 text-status-success" : "bg-status-progress/10 text-status-progress"}`}>
              {a.status === "completed" ? "Reviewed" : "Pending"}
            </span>
          </Link>
        ))}
        {assignments.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No applications assigned to you yet.
          </p>
        )}
      </div>
    </div>
  );
}
