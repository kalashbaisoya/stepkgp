import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";
import { putObject } from "@/lib/storage/storage";
import { renderBusinessPlanPdf } from "./pdf";
import { BUSINESS_PLAN_SECTIONS } from "./sections";

export class BpError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

async function ownedApp(applicationId: string, userId: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { user: true, cycle: true, category: true },
  });
  if (!app || app.userId !== userId) throw new BpError("NOT_FOUND", "Application not found.");
  return app;
}

/** Ensure a business plan (with all catalog sections) exists; return its sections. */
export async function getOrCreateBusinessPlan(applicationId: string, userId: string) {
  await ownedApp(applicationId, userId);

  let bp = await db.businessPlan.findUnique({ where: { applicationId }, include: { sections: true } });
  if (!bp) {
    bp = await db.businessPlan.create({
      data: {
        applicationId,
        sections: {
          create: BUSINESS_PLAN_SECTIONS.map((s, i) => ({ key: s.key, title: s.title, content: "", order: i })),
        },
      },
      include: { sections: true },
    });
  } else {
    // Backfill any newly-added catalog sections.
    const existingKeys = new Set(bp.sections.map((s) => s.key));
    const missing = BUSINESS_PLAN_SECTIONS.filter((s) => !existingKeys.has(s.key));
    if (missing.length) {
      await db.businessPlanSection.createMany({
        data: missing.map((s) => ({ businessPlanId: bp!.id, key: s.key, title: s.title, order: BUSINESS_PLAN_SECTIONS.indexOf(s) })),
      });
      bp = await db.businessPlan.findUnique({ where: { applicationId }, include: { sections: true } });
    }
  }

  const byKey = new Map(bp!.sections.map((s) => [s.key, s]));
  return {
    id: bp!.id,
    pdfKey: bp!.pdfKey,
    sections: BUSINESS_PLAN_SECTIONS.map((cat) => ({
      key: cat.key,
      title: cat.title,
      prompt: cat.prompt,
      content: byKey.get(cat.key)?.content ?? "",
    })),
  };
}

/** Save one section's content (draft only). */
export async function saveSection(applicationId: string, userId: string, key: string, content: string) {
  const app = await ownedApp(applicationId, userId);
  if (app.status !== "draft") throw new BpError("LOCKED", "This application can no longer be edited.");

  const bp = await db.businessPlan.findUnique({ where: { applicationId } });
  if (!bp) throw new BpError("NO_BP", "Business plan not initialized.");
  await db.businessPlanSection.upsert({
    where: { businessPlanId_key: { businessPlanId: bp.id, key } },
    update: { content },
    create: { businessPlanId: bp.id, key, title: BUSINESS_PLAN_SECTIONS.find((s) => s.key === key)?.title ?? key, content, order: BUSINESS_PLAN_SECTIONS.findIndex((s) => s.key === key) },
  });
  return { ok: true };
}

/** Completion: fraction of sections with content (for the wizard indicator). */
export async function businessPlanProgress(applicationId: string, userId: string) {
  const bp = await getOrCreateBusinessPlan(applicationId, userId);
  const filled = bp.sections.filter((s) => s.content.trim().length > 0).length;
  return Math.round((filled / bp.sections.length) * 100);
}

/** Render the business plan to a branded PDF, store it, and record the key. */
export async function generatePdf(applicationId: string, userId?: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { user: true, cycle: true, businessPlan: { include: { sections: { orderBy: { order: "asc" } } } }, values: true },
  });
  if (!app) throw new BpError("NOT_FOUND", "Application not found.");
  if (userId && app.userId !== userId) throw new BpError("FORBIDDEN", "Not your application.");

  const bp = app.businessPlan;
  if (!bp) throw new BpError("NO_BP", "No business plan to render.");

  const startupName =
    (app.values.find((v) => v.fieldKey === "startup_name")?.value as string) || "Business Plan";

  const buffer = await renderBusinessPlanPdf({
    startupName: String(startupName),
    applicantName: app.user.name ?? app.user.email,
    cycleName: app.cycle.name || `${app.cycle.year} Cohort`,
    sections: bp.sections.map((s) => ({ title: s.title, content: s.content })),
  });

  const key = `applications/${applicationId}/business-plan-${Date.now()}.pdf`;
  await putObject(key, buffer);
  await db.businessPlan.update({ where: { id: bp.id }, data: { pdfKey: key } });
  await audit({ actorId: userId ?? null, action: "business_plan.pdf_generated", targetType: "Application", targetId: applicationId });
  return { key, size: buffer.length };
}

export async function getPdfBuffer(applicationId: string) {
  const bp = await db.businessPlan.findUnique({ where: { applicationId } });
  return bp?.pdfKey ?? null;
}
