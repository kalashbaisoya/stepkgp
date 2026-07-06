"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import { saveSectionDefs } from "./service";

export async function saveBpConfigAction(
  defs: { key: string; title: string; prompt: string; required: boolean; minWords: number | null; maxWords: number | null }[],
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePermission("form:manage");
  try {
    await saveSectionDefs(defs, user.id);
    revalidatePath("/admin/business-plan");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save configuration." };
  }
}
