import "server-only";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/email";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function render(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? "");
}

/**
 * Deliver a notification to a user from a template (event-driven). Best-effort:
 * failures are logged, never thrown, so the triggering operation is never broken.
 * Respects per-user channel preferences (FR-M). SMS is a future channel.
 */
export async function notify(
  userId: string,
  templateKey: string,
  vars: Record<string, string> = {},
  href?: string,
): Promise<void> {
  try {
    const [tpl, user, pref] = await Promise.all([
      db.notificationTemplate.findUnique({ where: { key: templateKey } }),
      db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
      db.notificationPreference.findUnique({ where: { userId } }),
    ]);
    if (!user) return;

    const title = tpl ? render(tpl.title, vars) : templateKey;
    const body = tpl ? render(tpl.body, { name: user.name ?? "", ...vars }) : "";
    const channels = tpl?.channels ?? ["inapp", "email"];
    const inappOn = pref?.inappEnabled ?? true;
    const emailOn = pref?.emailEnabled ?? true;

    if (channels.includes("inapp") && inappOn) {
      await db.notification.create({ data: { userId, templateKey, title, body, href: href ?? null } });
    }
    if (channels.includes("email") && emailOn) {
      const subject = tpl ? render(tpl.emailSubject, vars) : templateKey;
      await sendEmail({
        to: user.email,
        subject,
        html: `<p>${body}</p>${href ? `<p><a href="${APP_URL}${href}">View</a></p>` : ""}`,
        text: body,
      });
    }
  } catch (err) {
    console.error(`[notify] failed for ${templateKey}`, err);
  }
}

/** Notify several users with the same template. */
export async function notifyMany(userIds: string[], templateKey: string, vars?: Record<string, string>, href?: string) {
  await Promise.all(Array.from(new Set(userIds)).map((id) => notify(id, templateKey, vars, href)));
}

/** Users holding a given permission-bearing role (e.g. staff), for internal alerts. */
export async function usersWithRole(...roleKeys: string[]) {
  const rows = await db.user.findMany({
    where: { roles: { some: { role: { key: { in: roleKeys } } } }, deletedAt: null },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

// ---- In-app center ----
export async function listNotifications(userId: string, limit = 50) {
  return db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit });
}
export function unreadCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}
export async function markRead(userId: string, id: string) {
  await db.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
}
export async function markAllRead(userId: string) {
  await db.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}

// ---- Admin template management ----
export function listTemplates() {
  return db.notificationTemplate.findMany({ orderBy: { key: "asc" } });
}
export async function saveTemplate(key: string, data: { title: string; emailSubject: string; body: string; channels: string[] }) {
  await db.notificationTemplate.update({ where: { key }, data });
}
export async function getPreference(userId: string) {
  const p = await db.notificationPreference.findUnique({ where: { userId } });
  return { emailEnabled: p?.emailEnabled ?? true, inappEnabled: p?.inappEnabled ?? true };
}
export async function savePreference(userId: string, emailEnabled: boolean, inappEnabled: boolean) {
  await db.notificationPreference.upsert({
    where: { userId },
    update: { emailEnabled, inappEnabled },
    create: { userId, emailEnabled, inappEnabled },
  });
}
