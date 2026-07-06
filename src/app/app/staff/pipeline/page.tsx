import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { db } from "@/lib/db";
import { getPipeline, getStates, getTransitionMap } from "@/modules/lifecycle/service";
import { listReviewers } from "@/modules/review/service";
import { PipelineBoard } from "@/components/review/pipeline-board";

export default async function PipelinePage() {
  const user = await getCurrentUser();
  if (!can(user, "application:read_any") && !can(user, "lifecycle:transition")) redirect("/app");

  // Pick the open cycle, else the most recent.
  const cycle =
    (await db.cycle.findFirst({ where: { status: "OPEN" }, orderBy: { year: "desc" } })) ??
    (await db.cycle.findFirst({ orderBy: { year: "desc" } }));

  if (!cycle) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-2 text-muted-foreground">No cycles yet.</p>
      </div>
    );
  }

  const [{ states, columns }, transitionMap, reviewers] = await Promise.all([
    getPipeline(cycle.id),
    getTransitionMap(),
    listReviewers(),
  ]);
  void getStates;

  const canTransition = can(user, "lifecycle:transition");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
      <p className="mt-2 text-muted-foreground">
        {cycle.name || `${cycle.year} Cohort`} · move applications through the lifecycle and assign reviewers.
      </p>
      <PipelineBoard
        states={states.map((s) => ({ key: s.key, name: s.name }))}
        columns={Object.fromEntries(
          Object.entries(columns).map(([k, apps]) => [
            k,
            apps.map((a) => ({
              id: a.id,
              applicant: a.user.name ?? a.user.email,
              category: a.category.name,
              status: a.status,
              reviewerCount: a.assignments.length,
            })),
          ]),
        )}
        transitionMap={transitionMap}
        reviewers={reviewers.map((r) => ({ id: r.id, name: r.name ?? r.email }))}
        canTransition={canTransition}
      />
    </div>
  );
}
