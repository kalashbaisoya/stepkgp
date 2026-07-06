"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as cycles from "./service";

export async function upsertCycleAction(
  id: string | null,
  input: {
    year: number;
    name: string;
    opensAt?: string | null;
    closesAt?: string | null;
    formTemplateKey?: string | null;
    categoryKeys: string[];
  },
) {
  const user = await requirePermission("cycle:manage");
  const cycle = await cycles.upsertCycle(id, input, user.id);
  revalidatePath("/admin/cycles");
  return { ok: true, id: cycle.id };
}

export async function setCycleStatusAction(
  id: string,
  status: "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED",
) {
  const user = await requirePermission("cycle:manage");
  await cycles.setCycleStatus(id, status, user.id);
  revalidatePath("/admin/cycles");
  revalidatePath("/apply");
  return { ok: true };
}

export async function saveDocumentRequirementsAction(
  categoryKey: string,
  reqs: { key: string; label: string; required: boolean; maxSizeMb: number; allowedTypes: string[] }[],
) {
  const user = await requirePermission("document:configure");
  await cycles.saveDocumentRequirements(categoryKey, reqs, user.id);
  revalidatePath("/admin/documents");
  return { ok: true };
}
