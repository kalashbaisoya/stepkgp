import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getApplication } from "@/modules/applications/service";
import { ApplicationWizard } from "@/components/applications/application-wizard";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const app = await getApplication(id);
  if (!app) notFound();
  if (app.userId !== user.id) redirect("/app"); // owner-only (staff view comes in M7)

  if (app.status !== "draft") {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
        <div className="mt-4 rounded-xl border border-border bg-surface p-8 text-center">
          <span className="inline-flex items-center rounded-full bg-status-info/10 px-3 py-1 text-sm font-medium capitalize text-status-info">
            ● {app.status}
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{app.cycleName}</h1>
          <p className="mt-1 text-muted-foreground">{app.categoryName}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {app.submittedAt
              ? `Submitted on ${new Date(app.submittedAt).toLocaleDateString()}. Your application is locked and versioned.`
              : "Your application has been received."}
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            You&rsquo;ll be notified as it moves through review (Milestones 7 & 10).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your application</h1>
          <p className="text-sm text-muted-foreground">Progress saves automatically. You can leave and continue anytime.</p>
        </div>
        <Link
          href={`/app/applications/${app.id}/business-plan`}
          className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
        >
          Business plan →
        </Link>
      </div>
      <ApplicationWizard
        id={app.id}
        cycleName={app.cycleName}
        categoryName={app.categoryName}
        sections={app.sections}
        initialValues={app.values}
        requirements={app.requirements.map((r) => ({ key: r.key, label: r.label, required: r.required, allowedTypes: r.allowedTypes, maxSizeMb: r.maxSizeMb }))}
        initialDocuments={app.documents}
      />
    </div>
  );
}
