"use server";

import { redirect } from "next/navigation";
import { requirePermission, requireUser } from "@/lib/rbac/guard";
import * as apps from "./service";
import { AppError } from "./service";

export async function createApplicationAction(cycleId: string, categoryKey: string) {
  const user = await requirePermission("application:create");
  const app = await apps.createApplication(user.id, cycleId, categoryKey);
  redirect(`/app/applications/${app.id}`);
}

export async function saveValuesAction(
  id: string,
  values: Record<string, unknown>,
): Promise<{ ok: boolean; progress?: number; error?: string }> {
  const user = await requireUser();
  try {
    const res = await apps.saveFieldValues(id, user.id, values);
    return { ok: true, progress: res.progress };
  } catch (err) {
    return { ok: false, error: err instanceof AppError ? err.message : "Save failed." };
  }
}

export async function validateApplicationAction(id: string) {
  await requireUser();
  return apps.validateApplication(id);
}

export async function submitApplicationAction(
  id: string,
): Promise<{ ok: boolean; error?: string; missingDocs?: string[] }> {
  const user = await requireUser();
  try {
    await apps.submitApplication(id, user.id);
    return { ok: true };
  } catch (err) {
    if (err instanceof AppError && err.code === "INCOMPLETE") {
      const check = await apps.validateApplication(id);
      return { ok: false, error: "Please complete all required fields and documents.", missingDocs: check.missingDocs };
    }
    return { ok: false, error: err instanceof AppError ? err.message : "Submit failed." };
  }
}
