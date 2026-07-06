"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as directory from "./service";
import type { ShowcaseInput } from "./service";

export async function createShowcaseAction(formData: FormData) {
  const user = await requirePermission("cms:write");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const id = await directory.createShowcase(name, user.id);
  redirect(`/admin/cms/showcase/${id}`);
}

export async function updateShowcaseAction(id: string, input: ShowcaseInput): Promise<{ ok: boolean }> {
  const user = await requirePermission("cms:write");
  await directory.updateShowcase(id, input, user.id);
  revalidatePath(`/admin/cms/showcase/${id}`);
  revalidatePath("/admin/cms/showcase");
  return { ok: true };
}
