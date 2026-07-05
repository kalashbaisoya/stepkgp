import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listPages } from "@/modules/cms/service";

const statusColor: Record<string, string> = {
  PUBLISHED: "text-status-success",
  DRAFT: "text-status-progress",
  ARCHIVED: "text-muted-foreground",
};

export default async function CmsPagesList() {
  const user = await getCurrentUser();
  if (!can(user, "cms:read")) redirect("/admin");
  const pages = await listPages();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Content · Pages</h1>
      <p className="mt-2 text-muted-foreground">Edit structured-block pages, then publish.</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pages.map((p) => (
              <tr key={p.key}>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className={`px-4 py-3 ${statusColor[p.status] ?? ""}`}>{p.status}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cms/pages/${p.key}`} className="font-medium text-brand hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No pages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
