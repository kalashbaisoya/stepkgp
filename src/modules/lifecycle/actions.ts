"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as lifecycle from "./service";
import { LifecycleError } from "./service";
import * as review from "@/modules/review/service";

export async function transitionAction(
  applicationId: string,
  toKey: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePermission("lifecycle:transition");
  try {
    await lifecycle.transition(applicationId, toKey, user.id, note);
    revalidatePath("/app/staff/pipeline");
    revalidatePath(`/app/review/${applicationId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof LifecycleError ? err.message : "Transition failed." };
  }
}

export async function assignReviewersAction(
  applicationId: string,
  reviewerIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePermission("application:read_any");
  try {
    await review.assignReviewers(applicationId, reviewerIds, user.id);
    revalidatePath("/app/staff/pipeline");
    revalidatePath(`/app/review/${applicationId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not assign reviewers." };
  }
}
