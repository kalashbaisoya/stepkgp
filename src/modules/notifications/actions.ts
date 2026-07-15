"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/rbac/guard";
import { requirePermission } from "@/lib/rbac/guard";
import * as notif from "./service";

export async function markReadAction(id: string) {
  const user = await requireUser();
  await notif.markRead(user.id, id);
  revalidatePath("/app/notifications");
  return { ok: true };
}

export async function markAllReadAction() {
  const user = await requireUser();
  await notif.markAllRead(user.id);
  revalidatePath("/app/notifications");
  return { ok: true };
}

export async function savePreferenceAction(emailEnabled: boolean, inappEnabled: boolean) {
  const user = await requireUser();
  await notif.savePreference(user.id, emailEnabled, inappEnabled);
  revalidatePath("/app/notifications");
  return { ok: true };
}

export async function saveTemplateAction(
  key: string,
  data: { title: string; emailSubject: string; body: string; channels: string[] },
) {
  await requirePermission("settings:manage");
  await notif.saveTemplate(key, data);
  revalidatePath("/admin/settings/notifications");
  return { ok: true };
}
