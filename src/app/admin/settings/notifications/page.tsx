import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listTemplates } from "@/modules/notifications/service";
import { TemplatesEditor } from "@/components/notifications/templates-editor";

export default async function NotificationTemplatesPage() {
  const user = await getCurrentUser();
  if (!can(user, "settings:manage")) redirect("/admin");
  const templates = await listTemplates();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Notification templates</h1>
      <p className="mt-2 text-muted-foreground">
        Edit the email + in-app messages sent for each event. Use <code className="rounded bg-muted px-1">{"{{name}}"}</code> and other
        placeholders; they&rsquo;re filled at send time.
      </p>
      <TemplatesEditor
        templates={templates.map((t) => ({ key: t.key, title: t.title, emailSubject: t.emailSubject, body: t.body, channels: t.channels }))}
      />
    </div>
  );
}
