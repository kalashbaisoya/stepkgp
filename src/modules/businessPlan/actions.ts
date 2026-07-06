"use server";

import { requireUser } from "@/lib/rbac/guard";
import * as bp from "./service";
import { BpError } from "./service";

export async function saveSectionAction(
  applicationId: string,
  key: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  try {
    await bp.saveSection(applicationId, user.id, key, content);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof BpError ? err.message : "Save failed." };
  }
}

export async function generatePdfAction(
  applicationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  try {
    await bp.generatePdf(applicationId, user.id);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof BpError ? err.message : "Could not generate PDF." };
  }
}
