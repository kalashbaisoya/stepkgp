import "server-only";
import { db } from "@/lib/db";

type AuditInput = {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
};

/**
 * Write an audit-log entry (Phase 9 §9 / FR-O). Fire-and-forget safe: audit
 * failures are logged but never break the primary operation.
 */
export async function audit(entry: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        before: entry.before === undefined ? undefined : (entry.before as object),
        after: entry.after === undefined ? undefined : (entry.after as object),
        ip: entry.ip ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write entry", entry.action, err);
  }
}
