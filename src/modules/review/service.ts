import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";
import { getApplication } from "@/modules/applications/service";
import { getHistory } from "@/modules/lifecycle/service";

export class ReviewError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** The scorecard bound to an application's cycle (or the default). */
export async function getScorecard(applicationId: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { cycle: { include: { scorecard: { include: { criteria: { orderBy: { order: "asc" } } } } } } },
  });
  let scorecard = app?.cycle.scorecard;
  if (!scorecard) {
    scorecard = await db.scorecard.findUnique({ where: { key: "default" }, include: { criteria: { orderBy: { order: "asc" } } } });
  }
  return scorecard;
}

export async function assignReviewers(applicationId: string, reviewerIds: string[], actorId: string) {
  for (const reviewerId of reviewerIds) {
    await db.reviewAssignment.upsert({
      where: { applicationId_reviewerId: { applicationId, reviewerId } },
      update: {},
      create: { applicationId, reviewerId },
    });
  }
  await audit({ actorId, action: "review.assigned", targetType: "Application", targetId: applicationId, after: { reviewerIds } });
}

export async function listReviewers() {
  return db.user.findMany({
    where: { roles: { some: { role: { key: { in: ["reviewer", "staff", "admin", "super_admin"] } } } }, deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function listAssignmentsForReviewer(reviewerId: string) {
  const rows = await db.reviewAssignment.findMany({
    where: { reviewerId },
    include: { application: { include: { cycle: true, category: true, user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    applicationId: r.applicationId,
    status: r.status,
    cycleName: r.application.cycle.name || `${r.application.cycle.year} Cohort`,
    categoryName: r.application.category.name,
    appStatus: r.application.status,
  }));
}

/** Weighted total for a set of scores against a scorecard's criteria. */
function weightedTotal(
  criteria: { id: string; weight: number; maxScore: number }[],
  scores: { criterionId: string; value: number }[],
): { total: number; max: number } {
  let total = 0;
  let max = 0;
  for (const c of criteria) {
    max += c.maxScore * c.weight;
    const s = scores.find((x) => x.criterionId === c.id);
    if (s) total += s.value * c.weight;
  }
  return { total: Math.round(total * 10) / 10, max: Math.round(max * 10) / 10 };
}

/** Full data for the review portal: application + scorecard + this reviewer's scores + aggregate. */
export async function getReviewData(applicationId: string, reviewerId: string) {
  const app = await getApplication(applicationId);
  if (!app) throw new ReviewError("NOT_FOUND", "Application not found.");

  const scorecard = await getScorecard(applicationId);
  const criteria = scorecard?.criteria ?? [];
  const history = await getHistory(applicationId);
  const bp = await db.businessPlan.findUnique({ where: { applicationId }, select: { id: true } });

  const assignment = await db.reviewAssignment.findUnique({
    where: { applicationId_reviewerId: { applicationId, reviewerId } },
    include: { scores: true },
  });

  const allAssignments = await db.reviewAssignment.findMany({
    where: { applicationId },
    include: { scores: true, reviewer: { select: { name: true, email: true } } },
  });
  const aggregate = allAssignments.map((a) => ({
    reviewer: a.reviewer.name ?? a.reviewer.email,
    status: a.status,
    recommendation: a.recommendation,
    ...weightedTotal(criteria, a.scores),
  }));
  const completed = aggregate.filter((a) => a.status === "completed");
  const averageTotal = completed.length ? Math.round((completed.reduce((s, a) => s + a.total, 0) / completed.length) * 10) / 10 : null;

  const notes = await db.reviewNote.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
    include: {},
  });

  return {
    application: app,
    hasBusinessPlan: !!bp,
    history,
    criteria: criteria.map((c) => ({ id: c.id, name: c.name, weight: c.weight, maxScore: c.maxScore })),
    myAssignment: assignment
      ? { id: assignment.id, status: assignment.status, recommendation: assignment.recommendation, rationale: assignment.rationale, scores: assignment.scores.map((s) => ({ criterionId: s.criterionId, value: s.value })) }
      : null,
    aggregate,
    averageTotal,
    notes: notes.map((n) => ({ id: n.id, body: n.body, at: n.createdAt })),
  };
}

export async function submitScores(
  applicationId: string,
  reviewerId: string,
  scores: { criterionId: string; value: number }[],
  recommendation?: string,
  rationale?: string,
) {
  const assignment = await db.reviewAssignment.findUnique({ where: { applicationId_reviewerId: { applicationId, reviewerId } } });
  if (!assignment) throw new ReviewError("NOT_ASSIGNED", "You are not assigned to this application.");

  for (const s of scores) {
    await db.score.upsert({
      where: { assignmentId_criterionId: { assignmentId: assignment.id, criterionId: s.criterionId } },
      update: { value: s.value },
      create: { assignmentId: assignment.id, criterionId: s.criterionId, value: s.value },
    });
  }
  await db.reviewAssignment.update({
    where: { id: assignment.id },
    data: { status: "completed", completedAt: new Date(), recommendation: recommendation ?? assignment.recommendation, rationale: rationale ?? assignment.rationale },
  });
  await audit({ actorId: reviewerId, action: "score.submitted", targetType: "Application", targetId: applicationId });
  return { ok: true };
}

export async function addNote(applicationId: string, authorId: string, body: string) {
  const note = await db.reviewNote.create({ data: { applicationId, authorId, body } });
  await audit({ actorId: authorId, action: "review.note_added", targetType: "Application", targetId: applicationId });
  return note;
}
