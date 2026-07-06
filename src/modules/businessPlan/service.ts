import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";
import { putObject } from "@/lib/storage/storage";
import { BUSINESS_PLAN_SECTIONS, wordCount } from "./sections";

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

/** Admin-configured section definitions (falls back to the seed catalog if empty). */
export async function getSectionDefs() {
  const defs = await db.businessPlanSectionDef.findMany({ orderBy: { order: "asc" } });
  if (defs.length > 0) {
    return defs.map((d) => ({ key: d.key, title: d.title, prompt: d.prompt, required: d.required, minWords: d.minWords, maxWords: d.maxWords }));
  }
  return BUSINESS_PLAN_SECTIONS.map((s) => ({ key: s.key, title: s.title, prompt: s.prompt, required: s.required, minWords: s.minWords ?? null, maxWords: s.maxWords ?? null }));
}

/** Ensure a business plan (with all configured sections) exists; return sections + defs. */
export async function getOrCreateBusinessPlan(applicationId: string, userId: string) {
  await ownedApp(applicationId, userId);
  const defs = await getSectionDefs();

  let bp = await db.businessPlan.findUnique({ where: { applicationId }, include: { sections: true } });
  if (!bp) {
    bp = await db.businessPlan.create({
      data: {
        applicationId,
        sections: { create: defs.map((s, i) => ({ key: s.key, title: s.title, content: "", order: i })) },
      },
      include: { sections: true },
    });
  } else {
    const existingKeys = new Set(bp.sections.map((s) => s.key));
    const missing = defs.filter((s) => !existingKeys.has(s.key));
    if (missing.length) {
      await db.businessPlanSection.createMany({
        data: missing.map((s) => ({ businessPlanId: bp!.id, key: s.key, title: s.title, order: defs.findIndex((d) => d.key === s.key) })),
      });
      bp = await db.businessPlan.findUnique({ where: { applicationId }, include: { sections: true } });
    }
  }

  const byKey = new Map(bp!.sections.map((s) => [s.key, s]));
  return {
    id: bp!.id,
    pdfKey: bp!.pdfKey,
    sections: defs.map((def) => ({
      key: def.key,
      title: def.title,
      prompt: def.prompt,
      required: def.required,
      minWords: def.minWords,
      maxWords: def.maxWords,
      content: byKey.get(def.key)?.content ?? "",
      words: wordCount(byKey.get(def.key)?.content ?? ""),
    })),
  };
}

/** Save one section's content (draft only). */
export async function saveSection(applicationId: string, userId: string, key: string, content: string) {
  const app = await ownedApp(applicationId, userId);
  if (app.status !== "draft") throw new BpError("LOCKED", "This application can no longer be edited.");

  const bp = await db.businessPlan.findUnique({ where: { applicationId } });
  if (!bp) throw new BpError("NO_BP", "Business plan not initialized.");
  const def = (await getSectionDefs()).find((s) => s.key === key);
  await db.businessPlanSection.upsert({
    where: { businessPlanId_key: { businessPlanId: bp.id, key } },
    update: { content },
    create: { businessPlanId: bp.id, key, title: def?.title ?? key, content, order: 0 },
  });
  return { ok: true };
}

/** Validate the business plan against admin config: required sections + word limits. */
export async function validateBusinessPlan(applicationId: string): Promise<{ ok: boolean; errors: Record<string, string> }> {
  const defs = await getSectionDefs();
  const bp = await db.businessPlan.findUnique({ where: { applicationId }, include: { sections: true } });
  const byKey = new Map((bp?.sections ?? []).map((s) => [s.key, s.content]));
  const errors: Record<string, string> = {};

  for (const def of defs) {
    const content = byKey.get(def.key) ?? "";
    const words = wordCount(content);
    if (def.required && words === 0) {
      errors[def.key] = `${def.title} is required.`;
    } else if (words > 0) {
      if (def.minWords && words < def.minWords) errors[def.key] = `${def.title} needs at least ${def.minWords} words (has ${words}).`;
      else if (def.maxWords && words > def.maxWords) errors[def.key] = `${def.title} exceeds ${def.maxWords} words (has ${words}).`;
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/** Render the business plan to a branded PDF, store it, record the key. */
export async function generatePdf(applicationId: string, userId?: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { user: true, cycle: true, businessPlan: { include: { sections: { orderBy: { order: "asc" } } } }, values: true },
  });
  if (!app) throw new BpError("NOT_FOUND", "Application not found.");
  if (userId && app.userId !== userId) throw new BpError("FORBIDDEN", "Not your application.");
  const bp = app.businessPlan;
  if (!bp) throw new BpError("NO_BP", "No business plan to render.");

  const startupName = (app.values.find((v) => v.fieldKey === "startup_name")?.value as string) || "Business Plan";
  const { renderBusinessPlanPdf } = await import("./pdf"); // lazy: keeps @react-pdf off non-PDF paths
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

// ---- Admin configuration ----
export async function saveSectionDefs(
  defs: { key: string; title: string; prompt: string; required: boolean; minWords: number | null; maxWords: number | null }[],
  actorId?: string,
) {
  await db.$transaction([
    db.businessPlanSectionDef.deleteMany({}),
    ...defs.map((d, i) =>
      db.businessPlanSectionDef.create({
        data: { key: d.key, title: d.title, prompt: d.prompt, required: d.required, minWords: d.minWords, maxWords: d.maxWords, order: i },
      }),
    ),
  ]);
  await audit({ actorId, action: "business_plan.config_changed", targetType: "BusinessPlanSectionDef" });
}
