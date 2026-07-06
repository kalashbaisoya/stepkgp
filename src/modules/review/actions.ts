"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as review from "./service";
import { ReviewError } from "./service";

export async function submitScoresAction(
  applicationId: string,
  scores: { criterionId: string; value: number }[],
  recommendation?: string,
  rationale?: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePermission("application:score");
  try {
    await review.submitScores(applicationId, user.id, scores, recommendation, rationale);
    revalidatePath(`/app/review/${applicationId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ReviewError ? err.message : "Could not save scores." };
  }
}

export async function addNoteAction(
  applicationId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePermission("application:review");
  if (!body.trim()) return { ok: false, error: "Note is empty." };
  try {
    await review.addNote(applicationId, user.id, body.trim());
    revalidatePath(`/app/review/${applicationId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not add note." };
  }
}
