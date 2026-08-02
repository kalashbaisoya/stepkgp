import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/** Query the audit trail with optional filters, cursor-paginated (newest first). */
export async function queryAudit(opts: {
  action?: string;
  targetType?: string;
  actorId?: string;
  cursor?: string;
  limit?: number;
}) {
  const limit = Math.min(opts.limit ?? 50, 200);
  const where: Prisma.AuditLogWhereInput = {};
  if (opts.action) where.action = { contains: opts.action };
  if (opts.targetType) where.targetType = opts.targetType;
  if (opts.actorId) where.actorId = opts.actorId;

  const rows = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);

  // Resolve actor display names.
  const actorIds = Array.from(new Set(page.map((r) => r.actorId).filter(Boolean))) as string[];
  const actors = await db.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } });
  const actorName = Object.fromEntries(actors.map((a) => [a.id, a.name ?? a.email]));

  return {
    entries: page.map((r) => ({
      id: r.id,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      actor: r.actorId ? actorName[r.actorId] ?? "-" : "system",
      ip: r.ip,
      at: r.createdAt,
      before: r.before,
      after: r.after,
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/** Distinct target types + recent action prefixes for filter dropdowns. */
export async function auditFacets() {
  const targets = await db.auditLog.findMany({ distinct: ["targetType"], select: { targetType: true }, take: 50 });
  return { targetTypes: targets.map((t) => t.targetType).sort() };
}
