import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Manage the platform without touching code.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cms/pages"
          className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-brand"
        >
          <h2 className="font-medium">Content (CMS)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit and publish website pages with structured blocks.
          </p>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-surface p-6 opacity-60">
          <h2 className="font-medium">Forms, Cycles, Reports…</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Added in later milestones (M3–M12).
          </p>
        </div>
      </div>
    </div>
  );
}
