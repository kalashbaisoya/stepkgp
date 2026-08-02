import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listMentees } from "@/modules/incubation/service";

export default async function MentorDashboard() {
  const user = await getCurrentUser();
  if (!can(user, "mentor:read_assigned")) redirect("/app");
  const mentees = await listMentees(user!.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Mentees</h1>
      <p className="mt-2 text-muted-foreground">Startups you mentor.</p>
      <div className="mt-8 space-y-3">
        {mentees.map((m) => (
          <Link key={m.id} href={`/app/mentor/${m.id}`} className="clay clay-hover flex items-center justify-between p-5">
            <div>
              <p className="font-medium">{m.startupName || m.applicant}</p>
              <p className="text-sm capitalize text-muted-foreground">{m.status} · Month {m.monthsElapsed}/11 · {m.milestoneCount} milestones</p>
            </div>
            <span className="text-brand">→</span>
          </Link>
        ))}
        {mentees.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No mentees assigned yet.</p>
        )}
      </div>
    </div>
  );
}
