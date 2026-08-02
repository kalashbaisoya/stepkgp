import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { queryAudit, auditFacets } from "@/modules/audit/service";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; targetType?: string }>;
}) {
  const user = await getCurrentUser();
  if (!can(user, "audit:view")) redirect("/admin");

  const { action, targetType } = await searchParams;
  const [{ entries }, facets] = await Promise.all([
    queryAudit({ action, targetType, limit: 100 }),
    auditFacets(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
      <p className="mt-2 text-muted-foreground">Every significant action is recorded: who did what, and when.</p>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input name="action" defaultValue={action ?? ""} placeholder="Filter by action…" className="h-9 w-56 clay-field text-sm" />
        <select name="targetType" defaultValue={targetType ?? ""} className="h-9 clay-field text-sm">
          <option value="">All targets</option>
          {facets.targetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground">Filter</button>
      </form>

      <div className="mt-6 overflow-hidden clay">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">{new Date(e.at).toLocaleString()}</td>
                <td className="px-4 py-2">{e.actor}</td>
                <td className="px-4 py-2"><span className="font-mono text-xs">{e.action}</span></td>
                <td className="px-4 py-2 text-muted-foreground">{e.targetType}{e.targetId ? ` · ${e.targetId.slice(-6)}` : ""}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No matching entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
