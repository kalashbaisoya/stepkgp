import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { db } from "@/lib/db";
import { getDashboard } from "@/modules/reports/service";
import { MetricCard, BarList, TrendBars, ReviewerTable } from "@/components/reports/charts";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const user = await getCurrentUser();
  if (!can(user, "report:view")) redirect("/admin");

  const { cycle } = await searchParams;
  const [d, cycles] = await Promise.all([
    getDashboard(cycle),
    db.cycle.findMany({ orderBy: { year: "desc" }, select: { id: true, name: true, year: true } }),
  ]);
  const q = cycle ? `?cycle=${cycle}` : "";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-2 text-muted-foreground">Applications, selection, incubation, funding and reviewer metrics.</p>
        </div>
        <a href={`/api/admin/reports/export?report=summary${cycle ? `&cycle=${cycle}` : ""}`} className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
          Export CSV
        </a>
      </div>

      {/* Cycle filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/reports" className={`rounded-full border px-3 py-1 text-sm ${!cycle ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted"}`}>All cohorts</Link>
        {cycles.map((c) => (
          <Link key={c.id} href={`/admin/reports?cycle=${c.id}`} className={`rounded-full border px-3 py-1 text-sm ${cycle === c.id ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted"}`}>
            {c.name || `${c.year} Cohort`}
          </Link>
        ))}
      </div>

      {/* Metric cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Applications" value={String(d.cards.total)} />
        <MetricCard label="Selection rate" value={`${d.cards.selectionRate}%`} />
        <MetricCard label="Incubated" value={String(d.cards.incubated)} sub={`${d.cards.graduated} graduated`} />
        <MetricCard label="Funding tracked" value={`₹${Number(d.cards.funding).toLocaleString("en-IN")}`} sub={`${d.cards.fundingCount} records`} />
      </div>
      {d.cards.avgDuration !== null && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Avg incubation" value={`${d.cards.avgDuration} mo`} sub="graduated startups" />
        </div>
      )}

      {/* Breakdowns */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <TrendBars title="Applications by cohort" items={d.trends} />
        <BarList title="Pipeline" items={d.pipeline} />
        <BarList title="By category" items={d.byCategory} />
        <BarList title="Startups by sector" items={d.sectors} />
      </div>

      <div className="mt-8">
        <ReviewerTable rows={d.reviewers} />
      </div>
    </div>
  );
}
