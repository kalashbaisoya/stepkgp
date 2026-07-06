import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";

export class IncubationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** Ensure an incubation record exists for an application (idempotent). */
export async function ensureIncubation(applicationId: string, actorId?: string) {
  const existing = await db.incubation.findUnique({ where: { applicationId } });
  if (existing) return existing;
  const inc = await db.incubation.create({ data: { applicationId, startDate: new Date() } });
  await audit({ actorId: actorId ?? null, action: "incubation.started", targetType: "Incubation", targetId: inc.id });
  return inc;
}

export async function listIncubations() {
  const rows = await db.incubation.findMany({
    orderBy: { startDate: "desc" },
    include: {
      application: { include: { user: { select: { name: true, email: true } }, cycle: true } },
      mentors: { include: { mentor: { select: { name: true, email: true } } } },
      _count: { select: { milestones: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    applicant: r.application.user.name ?? r.application.user.email,
    startupName: null as string | null,
    cycleName: r.application.cycle.name || `${r.application.cycle.year} Cohort`,
    status: r.status,
    startDate: r.startDate,
    monthsElapsed: monthsBetween(r.startDate, new Date()),
    elevenMonthFlagged: r.elevenMonthFlagged,
    mentors: r.mentors.map((m) => m.mentor.name ?? m.mentor.email),
  }));
}

export async function getIncubation(id: string) {
  const inc = await db.incubation.findUnique({
    where: { id },
    include: {
      application: { include: { user: { select: { id: true, name: true, email: true } }, cycle: true, category: true, values: true } },
      milestones: { orderBy: { order: "asc" } },
      funding: { orderBy: { date: "desc" } },
      mentors: { include: { mentor: { select: { id: true, name: true, email: true } } } },
      reviews: { orderBy: { scheduledFor: "asc" } },
      showcase: true,
    },
  });
  if (!inc) return null;
  const startupName = (inc.application.values.find((v) => v.fieldKey === "startup_name")?.value as string) ?? null;
  return {
    id: inc.id,
    applicationId: inc.applicationId,
    applicant: inc.application.user.name ?? inc.application.user.email,
    startupName,
    cycleName: inc.application.cycle.name || `${inc.application.cycle.year} Cohort`,
    status: inc.status,
    startDate: inc.startDate,
    agreementDate: inc.agreementDate,
    officeSpace: inc.officeSpace,
    monthsElapsed: monthsBetween(inc.startDate, new Date()),
    elevenMonthFlagged: inc.elevenMonthFlagged,
    graduatedAt: inc.graduatedAt,
    milestones: inc.milestones.map((m) => ({ id: m.id, title: m.title, status: m.status, dueDate: m.dueDate })),
    funding: inc.funding.map((f) => ({ id: f.id, source: f.source, amount: f.amount.toString(), date: f.date, notes: f.notes })),
    mentors: inc.mentors.map((m) => ({ id: m.mentor.id, name: m.mentor.name ?? m.mentor.email })),
    reviews: inc.reviews.map((r) => ({ id: r.id, scheduledFor: r.scheduledFor, type: r.type, status: r.status })),
    showcase: inc.showcase ? { slug: inc.showcase.slug, published: inc.showcase.published } : null,
  };
}

export async function updateIncubation(id: string, data: { agreementDate?: string | null; officeSpace?: string | null }, actorId?: string) {
  await db.incubation.update({
    where: { id },
    data: {
      agreementDate: data.agreementDate ? new Date(data.agreementDate) : data.agreementDate === null ? null : undefined,
      officeSpace: data.officeSpace ?? undefined,
    },
  });
  await audit({ actorId, action: "incubation.updated", targetType: "Incubation", targetId: id });
}

export async function addMilestone(id: string, title: string, dueDate: string | null, actorId?: string) {
  const count = await db.milestone.count({ where: { incubationId: id } });
  return db.milestone.create({ data: { incubationId: id, title, dueDate: dueDate ? new Date(dueDate) : null, order: count } });
}
export async function toggleMilestone(milestoneId: string) {
  const m = await db.milestone.findUnique({ where: { id: milestoneId } });
  if (!m) return;
  await db.milestone.update({ where: { id: milestoneId }, data: { status: m.status === "done" ? "pending" : "done" } });
}
export async function addFunding(id: string, source: string, amount: string, notes: string | null, actorId?: string) {
  await db.fundingRecord.create({ data: { incubationId: id, source, amount, notes } });
  await audit({ actorId, action: "incubation.funding_added", targetType: "Incubation", targetId: id });
}
export async function addReviewSchedule(id: string, scheduledFor: string, type: string) {
  await db.reviewSchedule.create({ data: { incubationId: id, scheduledFor: new Date(scheduledFor), type } });
}

export async function listPotentialMentors() {
  return db.user.findMany({
    where: { roles: { some: { role: { key: { in: ["mentor", "staff", "admin", "super_admin"] } } } }, deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function assignMentor(id: string, mentorId: string, actorId?: string) {
  await db.mentorAssignment.upsert({
    where: { incubationId_mentorId: { incubationId: id, mentorId } },
    update: {},
    create: { incubationId: id, mentorId },
  });
  await audit({ actorId, action: "mentor.assigned", targetType: "Incubation", targetId: id, after: { mentorId } });
}

export async function graduate(id: string, actorId?: string) {
  const inc = await db.incubation.update({ where: { id }, data: { status: "graduated", graduatedAt: new Date() } });
  // also move the application lifecycle to graduated
  const app = await db.application.findUnique({ where: { id: inc.applicationId } });
  const gradState = await db.lifecycleState.findUnique({ where: { key: "graduated" } });
  if (app && gradState && app.status !== "graduated") {
    await db.application.update({ where: { id: app.id }, data: { status: "graduated" } });
    await db.applicationStateHistory.create({ data: { applicationId: app.id, stateId: gradState.id, actorId, note: "Graduated" } });
  }
  await audit({ actorId, action: "incubation.graduated", targetType: "Incubation", targetId: id });
}

// ---- Mentor portal (scoped) ----
export async function listMentees(mentorId: string) {
  const rows = await db.mentorAssignment.findMany({
    where: { mentorId },
    include: { incubation: { include: { application: { include: { user: { select: { name: true, email: true } }, values: true } }, milestones: true } } },
  });
  return rows.map((r) => ({
    id: r.incubation.id,
    applicant: r.incubation.application.user.name ?? r.incubation.application.user.email,
    startupName: (r.incubation.application.values.find((v) => v.fieldKey === "startup_name")?.value as string) ?? null,
    status: r.incubation.status,
    monthsElapsed: monthsBetween(r.incubation.startDate, new Date()),
    milestoneCount: r.incubation.milestones.length,
  }));
}

export async function isMentorOf(mentorId: string, incubationId: string) {
  return !!(await db.mentorAssignment.findUnique({ where: { incubationId_mentorId: { incubationId, mentorId } } }));
}

// ---- Showcase publish (rendered publicly in M9) ----
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "startup";
}

export async function publishShowcase(id: string, actorId?: string) {
  const inc = await db.incubation.findUnique({
    where: { id },
    include: { application: { include: { values: true, cycle: true } }, showcase: true },
  });
  if (!inc) throw new IncubationError("NOT_FOUND", "Incubation not found.");
  const startupName = (inc.application.values.find((v) => v.fieldKey === "startup_name")?.value as string) || "Startup";
  const description = (inc.application.values.find((v) => v.fieldKey === "one_liner")?.value as string) || "";
  const sector = (inc.application.values.find((v) => v.fieldKey === "sector")?.value as string) || null;

  const baseSlug = slugify(startupName);
  const slug = inc.showcase?.slug ?? `${baseSlug}-${inc.id.slice(-4)}`;

  const entry = await db.showcaseEntry.upsert({
    where: { incubationId: id },
    update: { name: startupName, description, sector, published: true },
    create: { incubationId: id, slug, name: startupName, description, sector, published: true },
  });
  await audit({ actorId, action: "showcase.published", targetType: "ShowcaseEntry", targetId: entry.id });
  return { slug: entry.slug };
}

// ---- 11-month scheduler ----
function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/**
 * Scan active incubations that have reached 11 months and haven't been flagged.
 * Flags them (for staff attention / graduation) and audits. Notifications are wired
 * in Milestone 10. Returns the flagged incubation ids.
 */
export async function runElevenMonthScan(now: Date = new Date()): Promise<string[]> {
  const threshold = new Date(now);
  threshold.setMonth(threshold.getMonth() - 11);

  const due = await db.incubation.findMany({
    where: { status: "active", elevenMonthFlagged: false, startDate: { lte: threshold } },
    select: { id: true },
  });

  for (const inc of due) {
    await db.incubation.update({ where: { id: inc.id }, data: { elevenMonthFlagged: true, elevenMonthFlaggedAt: now } });
    await audit({ action: "incubation.milestone_11m", targetType: "Incubation", targetId: inc.id });
    // TODO(M10): notify startup + staff.
  }
  return due.map((d) => d.id);
}
