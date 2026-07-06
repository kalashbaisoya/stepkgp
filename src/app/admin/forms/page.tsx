import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listTemplates } from "@/modules/forms/service";

export default async function FormsList() {
  const user = await getCurrentUser();
  if (!can(user, "form:manage")) redirect("/admin");
  const templates = await listTemplates();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
      <p className="mt-2 text-muted-foreground">
        Build application form templates — fields, validation, and options — with no code.
        Publishing creates an immutable version so past submissions stay valid.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Sections</th>
              <th className="px-4 py-3 font-medium">Published version</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {templates.map((t) => (
              <tr key={t.key}>
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.sectionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.publishedVersion ? `v${t.publishedVersion}` : "— (draft only)"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/forms/${t.key}`} className="font-medium text-brand hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No templates yet. Seed creates a sample application template.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
