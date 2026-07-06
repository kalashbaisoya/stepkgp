"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/lib/rbac/guard";
import { can } from "@/lib/rbac/guard";
import * as inc from "./service";

export async function updateIncubationAction(id: string, data: { agreementDate?: string | null; officeSpace?: string | null }) {
  const user = await requirePermission("incubation:manage");
  await inc.updateIncubation(id, data, user.id);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function addMilestoneAction(id: string, title: string, dueDate: string | null) {
  const user = await requirePermission("incubation:manage");
  if (!title.trim()) return { ok: false };
  await inc.addMilestone(id, title.trim(), dueDate, user.id);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function toggleMilestoneAction(id: string, milestoneId: string) {
  await requirePermission("incubation:manage");
  await inc.toggleMilestone(milestoneId);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function addFundingAction(id: string, source: string, amount: string, notes: string | null) {
  const user = await requirePermission("incubation:manage");
  await inc.addFunding(id, source, amount, notes, user.id);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function addReviewScheduleAction(id: string, scheduledFor: string, type: string) {
  await requirePermission("incubation:manage");
  await inc.addReviewSchedule(id, scheduledFor, type);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function assignMentorAction(id: string, mentorId: string) {
  const user = await requirePermission("incubation:manage");
  await inc.assignMentor(id, mentorId, user.id);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function graduateAction(id: string) {
  const user = await requirePermission("lifecycle:transition");
  await inc.graduate(id, user.id);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true };
}

export async function publishShowcaseAction(id: string) {
  const user = await requirePermission("showcase:publish");
  const res = await inc.publishShowcase(id, user.id);
  revalidatePath(`/app/staff/incubation/${id}`);
  return { ok: true, slug: res.slug };
}

/** Manual trigger for the 11-month scan (staff button); also runnable via cron route. */
export async function runElevenMonthScanAction() {
  await requireUser().then((u) => {
    if (!can(u, "incubation:manage")) throw new Error("Forbidden");
  });
  const flagged = await inc.runElevenMonthScan();
  revalidatePath("/app/staff/incubation");
  return { ok: true, flagged: flagged.length };
}
