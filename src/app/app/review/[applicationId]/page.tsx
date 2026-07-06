import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getReviewData, ReviewError } from "@/modules/review/service";
import { ReviewPanel } from "@/components/review/review-panel";

export default async function ReviewPortal({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!can(user, "application:review") && !can(user, "application:read_any")) redirect("/app");

  let data;
  try {
    data = await getReviewData(applicationId, user.id);
  } catch (err) {
    if (err instanceof ReviewError) notFound();
    throw err;
  }
  const app = data.application;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Left: application detail */}
      <div className="min-w-0">
        <Link href={can(user, "lifecycle:transition") ? "/app/staff/pipeline" : "/app/review"} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{app.cycleName} · {app.categoryName}</h1>
        <p className="text-sm capitalize text-muted-foreground">Status: {app.status.replace(/_/g, " ")}</p>

        {/* Summary of field values */}
        <div className="mt-6 space-y-6">
          {app.sections.map((s) => (
            <section key={s.key}>
              <h2 className="text-sm font-medium text-muted-foreground">{s.title}</h2>
              <dl className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
                {s.fields.map((f) => (
                  <div key={f.key} className="flex justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right">{formatValue(app.values[f.key])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {/* Documents + business plan */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground">Documents</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {app.documents.map((d) => (
                <li key={d.requirementKey}>
                  <a href={`/api/files/${d.storageKey}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    {d.fileName}
                  </a>
                </li>
              ))}
              {data.hasBusinessPlan && (
                <li>
                  <a href={`/api/applications/${applicationId}/business-plan`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    Business plan (PDF)
                  </a>
                </li>
              )}
              {app.documents.length === 0 && !data.hasBusinessPlan && <li className="text-muted-foreground">None.</li>}
            </ul>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground">Timeline</h2>
            <ol className="mt-2 space-y-1 text-sm">
              {data.history.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span>{h.state}</span>
                  <span className="text-muted-foreground">{new Date(h.at).toLocaleDateString()}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* Right: scoring + aggregate + notes */}
      <ReviewPanel
        applicationId={applicationId}
        criteria={data.criteria}
        myAssignment={data.myAssignment}
        aggregate={data.aggregate}
        averageTotal={data.averageTotal}
        notes={data.notes}
        canScore={can(user, "application:score") && !!data.myAssignment}
        canNote={can(user, "application:review")}
      />
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
