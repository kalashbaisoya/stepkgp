import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";

export class LifecycleError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export function getStates() {
  return db.lifecycleState.findMany({ orderBy: { order: "asc" } });
}

/** State keys reachable from the given state. */
export async function getAllowedTransitions(fromKey: string): Promise<string[]> {
  const from = await db.lifecycleState.findUnique({
    where: { key: fromKey },
    include: { fromTransitions: { include: { toState: true } } },
  });
  return from?.fromTransitions.map((t) => t.toState.key) ?? [];
}

/**
 * Transition an application to a new state. Validates the transition is defined,
 * writes history, updates status, and audits. Permission is enforced by the caller
 * (action) via requirePermission("lifecycle:transition").
 */
export async function transition(applicationId: string, toKey: string, actorId: string, note?: string) {
  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app) throw new LifecycleError("NOT_FOUND", "Application not found.");

  const allowed = await getAllowedTransitions(app.status);
  if (!allowed.includes(toKey)) {
    throw new LifecycleError("INVALID_TRANSITION", `Cannot move from ${app.status} to ${toKey}.`);
  }
  const toState = await db.lifecycleState.findUnique({ where: { key: toKey } });
  if (!toState) throw new LifecycleError("BAD_STATE", "Unknown state.");

  await db.$transaction([
    db.application.update({ where: { id: applicationId }, data: { status: toKey } }),
    db.applicationStateHistory.create({ data: { applicationId, stateId: toState.id, actorId, note } }),
  ]);
  await audit({ actorId, action: "application.state_changed", targetType: "Application", targetId: applicationId, before: { status: app.status }, after: { status: toKey } });
  return { status: toKey };
}

/** Map of stateKey -> allowed next state keys (for pipeline move menus). */
export async function getTransitionMap(): Promise<Record<string, string[]>> {
  const transitions = await db.lifecycleTransition.findMany({ include: { fromState: true, toState: true } });
  const map: Record<string, string[]> = {};
  for (const t of transitions) (map[t.fromState.key] ??= []).push(t.toState.key);
  return map;
}

export async function getHistory(applicationId: string) {
  const rows = await db.applicationStateHistory.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
    include: { state: true },
  });
  return rows.map((r) => ({ state: r.state.name, key: r.state.key, note: r.note, at: r.createdAt }));
}

/** Applications grouped by lifecycle state for a cycle (staff pipeline board). */
export async function getPipeline(cycleId: string) {
  const [states, apps] = await Promise.all([
    db.lifecycleState.findMany({ orderBy: { order: "asc" } }),
    db.application.findMany({
      where: { cycleId, status: { not: "draft" }, deletedAt: null },
      include: { user: { select: { name: true, email: true } }, category: true, assignments: true },
      orderBy: { submittedAt: "asc" },
    }),
  ]);
  const byState: Record<string, typeof apps> = {};
  for (const s of states) byState[s.key] = [];
  for (const a of apps) (byState[a.status] ??= []).push(a);

  return {
    // pipeline columns exclude draft (not yet submitted)
    states: states.filter((s) => s.key !== "draft"),
    columns: byState,
  };
}
