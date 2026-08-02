import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getIncubation, isMentorOf } from "@/modules/incubation/service";

export default async function MenteeDetail({
  params,
}: {
  params: Promise<{ incubationId: string }>;
}) {
  const { incubationId } = await params;
  const user = await getCurrentUser();
  if (!user || !can(user, "mentor:read_assigned")) redirect("/app");
  // Least-privilege: mentors only see their own mentees.
  if (!(await isMentorOf(user.id, incubationId))) redirect("/app/mentor");

  const inc = await getIncubation(incubationId);
  if (!inc) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/mentor" className="text-sm text-muted-foreground hover:text-foreground">← Mentees</Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{inc.startupName || inc.applicant}</h1>
      <p className="text-sm capitalize text-muted-foreground">{inc.status} · Month {inc.monthsElapsed}/11</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="clay p-5">
          <h2 className="mb-3 font-semibold">Milestones</h2>
          <ul className="space-y-1.5 text-sm">
            {inc.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${m.status === "done" ? "bg-status-success text-white" : "border border-border"}`}>{m.status === "done" ? "✓" : ""}</span>
                <span className={m.status === "done" ? "line-through text-muted-foreground" : ""}>{m.title}</span>
              </li>
            ))}
            {inc.milestones.length === 0 && <li className="text-muted-foreground">No milestones.</li>}
          </ul>
        </section>
        <section className="clay p-5">
          <h2 className="mb-3 font-semibold">Review schedule</h2>
          <ul className="space-y-1 text-sm">
            {inc.reviews.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span className="capitalize">{r.type}</span>
                <span className="text-muted-foreground">{new Date(r.scheduledFor).toLocaleDateString()}</span>
              </li>
            ))}
            {inc.reviews.length === 0 && <li className="text-muted-foreground">No reviews scheduled.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
