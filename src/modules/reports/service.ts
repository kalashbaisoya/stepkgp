import "server-only";
import { db } from "@/lib/db";

function monthsBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()));
}

/** Everything the reports dashboard needs, optionally scoped to a cycle. */
export async function getDashboard(cycleId?: string) {
  const appWhere = { deletedAt: null, ...(cycleId ? { cycleId } : {}) };

  const [byStatus, byCategoryRaw, categories, cycles] = await Promise.all([
    db.application.groupBy({ by: ["status"], where: appWhere, _count: { _all: true } }),
    db.application.groupBy({ by: ["categoryId"], where: { ...appWhere, status: { not: "draft" } }, _count: { _all: true } }),
    db.category.findMany(),
    db.cycle.findMany({ orderBy: { year: "asc" }, include: { _count: { select: { applications: true } } } }),
  ]);

  const statusCount = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
  const total = byStatus.reduce((n, s) => n + s._count._all, 0);
  const submitted = total - (statusCount["draft"] ?? 0);
  const selected = statusCount["selected"] ?? 0;
  const rejected = statusCount["rejected"] ?? 0;
  const incubated = (statusCount["incubated"] ?? 0) + (statusCount["monthly_review"] ?? 0);
  const graduated = statusCount["graduated"] ?? 0;
  const decided = selected + rejected;
  const selectionRate = decided > 0 ? Math.round((selected / decided) * 100) : 0;

  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const byCategory = byCategoryRaw.map((c) => ({ name: catName[c.categoryId] ?? "—", count: c._count._all })).sort((a, b) => b.count - a.count);

  // Pipeline (status) breakdown, excluding draft, in lifecycle order.
  const states = await db.lifecycleState.findMany({ orderBy: { order: "asc" } });
  const pipeline = states.filter((s) => s.key !== "draft").map((s) => ({ name: s.name, count: statusCount[s.key] ?? 0 })).filter((s) => s.count > 0);

  // Funding (scoped to cycle if provided).
  const funding = await db.fundingRecord.aggregate({
    where: cycleId ? { incubation: { application: { cycleId } } } : {},
    _sum: { amount: true },
    _count: { _all: true },
  });

  // Incubation duration (avg months for graduated).
  const gradIncubations = await db.incubation.findMany({
    where: { status: "graduated", graduatedAt: { not: null }, ...(cycleId ? { application: { cycleId } } : {}) },
    select: { startDate: true, graduatedAt: true },
  });
  const avgDuration = gradIncubations.length
    ? Math.round((gradIncubations.reduce((n, i) => n + monthsBetween(i.startDate, i.graduatedAt!), 0) / gradIncubations.length) * 10) / 10
    : null;

  // Sector breakdown (published showcase).
  const showcase = await db.showcaseEntry.findMany({ where: { published: true }, select: { sector: true } });
  const sectorMap: Record<string, number> = {};
  for (const s of showcase) { const k = s.sector || "Other"; sectorMap[k] = (sectorMap[k] ?? 0) + 1; }
  const sectors = Object.entries(sectorMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Trends: submitted applications per cohort year.
  const trends = cycles.map((c) => ({ label: String(c.year), count: c._count.applications }));

  // Reviewer performance.
  const assignments = await db.reviewAssignment.findMany({
    where: cycleId ? { application: { cycleId } } : {},
    include: { reviewer: { select: { name: true, email: true } }, scores: true },
  });
  const revMap: Record<string, { name: string; assigned: number; completed: number; scoreSum: number; scoreN: number }> = {};
  for (const a of assignments) {
    const key = a.reviewerId;
    const r = (revMap[key] ??= { name: a.reviewer.name ?? a.reviewer.email, assigned: 0, completed: 0, scoreSum: 0, scoreN: 0 });
    r.assigned++;
    if (a.status === "completed") r.completed++;
    for (const s of a.scores) { r.scoreSum += s.value; r.scoreN++; }
  }
  const reviewers = Object.values(revMap)
    .map((r) => ({ name: r.name, assigned: r.assigned, completed: r.completed, avgScore: r.scoreN ? Math.round((r.scoreSum / r.scoreN) * 10) / 10 : null }))
    .sort((a, b) => b.completed - a.completed);

  return {
    cards: {
      total: submitted,
      selectionRate,
      incubated,
      graduated,
      funding: funding._sum.amount ? funding._sum.amount.toString() : "0",
      fundingCount: funding._count._all,
      avgDuration,
    },
    pipeline,
    byCategory,
    sectors,
    trends,
    reviewers,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;

/** CSV export of a chosen report. */
export async function reportCsv(report: string, cycleId?: string): Promise<{ filename: string; csv: string }> {
  const d = await getDashboard(cycleId);
  const rows: string[][] = [];
  let filename = report;

  switch (report) {
    case "pipeline": rows.push(["State", "Count"], ...d.pipeline.map((p) => [p.name, String(p.count)])); break;
    case "categories": rows.push(["Category", "Applications"], ...d.byCategory.map((c) => [c.name, String(c.count)])); break;
    case "sectors": rows.push(["Sector", "Startups"], ...d.sectors.map((s) => [s.name, String(s.count)])); break;
    case "trends": rows.push(["Cohort", "Applications"], ...d.trends.map((t) => [t.label, String(t.count)])); break;
    case "reviewers": rows.push(["Reviewer", "Assigned", "Completed", "Avg score"], ...d.reviewers.map((r) => [r.name, String(r.assigned), String(r.completed), r.avgScore === null ? "" : String(r.avgScore)])); break;
    default:
      filename = "summary";
      rows.push(["Metric", "Value"],
        ["Applications", String(d.cards.total)],
        ["Selection rate %", String(d.cards.selectionRate)],
        ["Incubated", String(d.cards.incubated)],
        ["Graduated", String(d.cards.graduated)],
        ["Funding (₹)", d.cards.funding],
        ["Avg incubation months", d.cards.avgDuration === null ? "" : String(d.cards.avgDuration)],
      );
  }
  const csv = rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
  return { filename, csv };
}
