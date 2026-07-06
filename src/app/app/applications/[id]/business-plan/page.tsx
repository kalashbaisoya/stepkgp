import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getOrCreateBusinessPlan } from "@/modules/businessPlan/service";

export default async function BusinessPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const app = await db.application.findUnique({ where: { id }, select: { userId: true, status: true } });
  if (!app) notFound();
  if (app.userId !== user.id) redirect("/app");

  const bp = await getOrCreateBusinessPlan(id, user.id);
  const { BusinessPlanEditor } = await import("@/components/businessPlan/business-plan-editor");

  return (
    <div>
      <div className="mb-6">
        <Link href={`/app/applications/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Application
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Business plan</h1>
        <p className="text-sm text-muted-foreground">
          Complete each section online — no Word document needed. Saves automatically.
        </p>
      </div>
      <BusinessPlanEditor applicationId={id} initialSections={bp.sections} readOnly={app.status !== "draft"} />
    </div>
  );
}
