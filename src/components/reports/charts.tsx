// Presentational, dependency-free charts (server-safe). Accessible: every bar shows
// its label + value as text, not color alone.

export function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function BarList({ title, items, unit }: { title: string; items: { name: string; count: number }[]; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize">{it.name}</span>
              <span className="text-muted-foreground">{it.count}{unit ? ` ${unit}` : ""}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(it.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
      </div>
    </div>
  );
}

export function TrendBars({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-6 flex items-end gap-3" style={{ height: "160px" }}>
        {items.map((it) => (
          <div key={it.label} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-medium">{it.count}</span>
            <div className="w-full rounded-t-md bg-linear-to-t from-brand to-brand-accent" style={{ height: `${(it.count / max) * 100}%`, minHeight: it.count > 0 ? "4px" : "0" }} />
            <span className="text-xs text-muted-foreground">{it.label}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
      </div>
    </div>
  );
}

export function ReviewerTable({ rows }: { rows: { name: string; assigned: number; completed: number; avgScore: number | null }[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <h3 className="border-b border-border px-6 py-4 font-semibold">Reviewer performance</h3>
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
          <tr>
            <th className="px-6 py-2 font-medium">Reviewer</th>
            <th className="px-6 py-2 font-medium">Assigned</th>
            <th className="px-6 py-2 font-medium">Completed</th>
            <th className="px-6 py-2 font-medium">Avg score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="px-6 py-2 font-medium">{r.name}</td>
              <td className="px-6 py-2 text-muted-foreground">{r.assigned}</td>
              <td className="px-6 py-2 text-muted-foreground">{r.completed}</td>
              <td className="px-6 py-2 text-muted-foreground">{r.avgScore ?? "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-6 text-center text-muted-foreground">No reviews yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
