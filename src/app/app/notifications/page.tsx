import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listNotifications, getPreference } from "@/modules/notifications/service";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [items, pref] = await Promise.all([listNotifications(user.id), getPreference(user.id)]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 text-muted-foreground">Updates on your applications and activity.</p>
      <NotificationList
        items={items.map((n) => ({ id: n.id, title: n.title, body: n.body, href: n.href, read: !!n.readAt, at: n.createdAt.toISOString() }))}
        pref={pref}
      />
    </div>
  );
}
