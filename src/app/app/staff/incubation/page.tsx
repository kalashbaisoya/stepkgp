import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listIncubations } from "@/modules/incubation/service";
import { ScanButton } from "@/components/incubation/scan-button";

export default async function IncubationsPage() {
  const user = await getCurrentUser();
  if (!can(user, "incubation:manage") && !can(user, "incubation:read")) redirect("/app");
  const incubations = await listIncubations();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incubation</h1>
          <p className="mt-2 text-muted-foreground">Active and graduated startups. The system flags each at 11 months.</p>
        </div>
        {can(user, "incubation:manage") && <ScanButton />}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Startup / applicant</th>
              <th className="px-4 py-3 font-medium">Cohort</th>
              <th className="px-4 py-3 font-medium">Month</th>
              <th className="px-4 py-3 font-medium">Mentors</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {incubations.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-medium">{i.applicant}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.cycleName}</td>
                <td className="px-4 py-3">
                  <span className={i.elevenMonthFlagged ? "font-medium text-status-progress" : "text-muted-foreground"}>
                    {i.monthsElapsed}/11 {i.elevenMonthFlagged && "⚠"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{i.mentors.join(", ") || "—"}</td>
                <td className="px-4 py-3 capitalize">{i.status}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/app/staff/incubation/${i.id}`} className="font-medium text-brand hover:underline">Open</Link>
                </td>
              </tr>
            ))}
            {incubations.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No incubations yet. Move a selected application to &ldquo;Incubated&rdquo; in the pipeline.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
