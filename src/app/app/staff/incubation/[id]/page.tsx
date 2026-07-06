import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getIncubation, listPotentialMentors } from "@/modules/incubation/service";
import { IncubationManager } from "@/components/incubation/incubation-manager";

export default async function IncubationRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!can(user, "incubation:manage") && !can(user, "incubation:read")) redirect("/app");

  const [incubation, mentors] = await Promise.all([getIncubation(id), listPotentialMentors()]);
  if (!incubation) notFound();

  return (
    <div>
      <Link href="/app/staff/incubation" className="text-sm text-muted-foreground hover:text-foreground">← Incubation</Link>
      <IncubationManager
        incubation={{
          ...incubation,
          startDate: incubation.startDate.toISOString(),
          agreementDate: incubation.agreementDate ? incubation.agreementDate.toISOString() : null,
          graduatedAt: incubation.graduatedAt ? incubation.graduatedAt.toISOString() : null,
          milestones: incubation.milestones.map((m) => ({ ...m, dueDate: m.dueDate ? m.dueDate.toISOString() : null })),
          funding: incubation.funding.map((f) => ({ ...f, date: f.date.toISOString() })),
          reviews: incubation.reviews.map((r) => ({ ...r, scheduledFor: r.scheduledFor.toISOString() })),
        }}
        mentorOptions={mentors.map((m) => ({ id: m.id, name: m.name ?? m.email }))}
        canManage={can(user, "incubation:manage")}
        canGraduate={can(user, "lifecycle:transition")}
        canPublish={can(user, "showcase:publish")}
      />
    </div>
  );
}
