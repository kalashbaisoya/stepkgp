import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";
import { putObject } from "@/lib/storage/storage";
import { validateValues } from "@/modules/forms/validation";
import { getPublishedTemplate } from "@/modules/forms/service";
import { getRequirementsForCategory } from "@/modules/cycles/service";
import type { FormSectionDef } from "@/modules/forms/field-types";

export class AppError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** Create (or return the existing draft) for a user in a cycle+category. */
export async function createApplication(userId: string, cycleId: string, categoryKey: string) {
  const cycle = await db.cycle.findUnique({
    where: { id: cycleId },
    include: { formTemplate: { include: { versions: { orderBy: { version: "desc" }, take: 1 } } }, categories: { include: { category: true } } },
  });
  if (!cycle || cycle.status !== "OPEN") throw new AppError("CYCLE_CLOSED", "This cycle is not open.");

  const category = cycle.categories.map((c) => c.category).find((c) => c.key === categoryKey);
  if (!category) throw new AppError("BAD_CATEGORY", "This category is not accepted for this cycle.");

  const version = cycle.formTemplate?.versions[0];
  if (!cycle.formTemplate || !version) throw new AppError("NO_TEMPLATE", "This cycle has no published form.");

  // Reuse an existing draft rather than duplicating.
  const existing = await db.application.findFirst({
    where: { userId, cycleId, categoryId: category.id, status: "draft", deletedAt: null },
  });
  if (existing) return existing;

  const app = await db.application.create({
    data: {
      userId,
      cycleId,
      categoryId: category.id,
      templateKey: cycle.formTemplate.key,
      templateVersion: version.version,
      status: "draft",
    },
  });
  await audit({ actorId: userId, action: "application.created", targetType: "Application", targetId: app.id });
  return app;
}

/** Load an application with its template snapshot, values, documents, requirements. */
export async function getApplication(id: string) {
  const app = await db.application.findUnique({
    where: { id },
    include: { values: true, documents: true, cycle: true, category: true },
  });
  if (!app) return null;

  const template = app.templateKey ? await getPublishedTemplate(app.templateKey) : null;
  const requirements = await getRequirementsForCategory(app.category.key);
  const values: Record<string, unknown> = {};
  for (const v of app.values) values[v.fieldKey] = v.value;

  return {
    id: app.id,
    userId: app.userId,
    status: app.status,
    progress: app.progress,
    submittedAt: app.submittedAt,
    cycleName: app.cycle.name || `${app.cycle.year} Cohort`,
    categoryKey: app.category.key,
    categoryName: app.category.name,
    sections: (template?.sections ?? []) as FormSectionDef[],
    values,
    requirements,
    documents: app.documents.map((d) => ({ requirementKey: d.requirementKey, fileName: d.fileName, storageKey: d.storageKey })),
  };
}

export async function listUserApplications(userId: string) {
  const apps = await db.application.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { cycle: true, category: true },
  });
  return apps.map((a) => ({
    id: a.id,
    status: a.status,
    progress: a.progress,
    cycleName: a.cycle.name || `${a.cycle.year} Cohort`,
    categoryName: a.category.name,
    submittedAt: a.submittedAt,
  }));
}

function computeProgress(sections: FormSectionDef[], values: Record<string, unknown>): number {
  const fields = sections.flatMap((s) => s.fields).filter((f) => f.required);
  if (fields.length === 0) return 100;
  const filled = fields.filter((f) => {
    const v = values[f.key];
    return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;
  return Math.round((filled / fields.length) * 100);
}

/** Autosave field values; recompute progress. Only allowed while draft. */
export async function saveFieldValues(id: string, userId: string, values: Record<string, unknown>) {
  const app = await db.application.findUnique({ where: { id } });
  if (!app || app.userId !== userId) throw new AppError("NOT_FOUND", "Application not found.");
  if (app.status !== "draft") throw new AppError("LOCKED", "This application can no longer be edited.");

  await db.$transaction(
    Object.entries(values).map(([fieldKey, value]) =>
      db.applicationFieldValue.upsert({
        where: { applicationId_fieldKey: { applicationId: id, fieldKey } },
        update: { value: value as object },
        create: { applicationId: id, fieldKey, value: value as object },
      }),
    ),
  );

  const template = app.templateKey ? await getPublishedTemplate(app.templateKey) : null;
  const all = await db.applicationFieldValue.findMany({ where: { applicationId: id } });
  const merged: Record<string, unknown> = {};
  for (const v of all) merged[v.fieldKey] = v.value;
  const progress = computeProgress((template?.sections ?? []) as FormSectionDef[], merged);
  await db.application.update({ where: { id }, data: { progress } });
  return { progress };
}

/** Store an uploaded document against a requirement (validates type/size). */
export async function uploadDocument(
  id: string,
  userId: string,
  requirementKey: string,
  file: { name: string; type: string; size: number; buffer: Buffer },
) {
  const app = await db.application.findUnique({ where: { id }, include: { category: true } });
  if (!app || app.userId !== userId) throw new AppError("NOT_FOUND", "Application not found.");
  if (app.status !== "draft") throw new AppError("LOCKED", "This application can no longer be edited.");

  const reqs = await getRequirementsForCategory(app.category.key);
  const req = reqs.find((r) => r.key === requirementKey);
  if (!req) throw new AppError("BAD_DOC", "Unknown document requirement.");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (req.allowedTypes.length > 0 && !req.allowedTypes.includes(ext)) {
    throw new AppError("BAD_TYPE", `Allowed types: ${req.allowedTypes.join(", ")}.`);
  }
  if (file.size > req.maxSizeMb * 1024 * 1024) {
    throw new AppError("TOO_LARGE", `Maximum size is ${req.maxSizeMb}MB.`);
  }

  const storageKey = `applications/${id}/${requirementKey}-${Date.now()}.${ext}`;
  await putObject(storageKey, file.buffer);

  await db.applicationDocument.upsert({
    where: { applicationId_requirementKey: { applicationId: id, requirementKey } },
    update: { storageKey, fileName: file.name, mimeType: file.type, sizeBytes: file.size },
    create: { applicationId: id, requirementKey, storageKey, fileName: file.name, mimeType: file.type, sizeBytes: file.size },
  });
  await audit({ actorId: userId, action: "document.uploaded", targetType: "Application", targetId: id, after: { requirementKey } });
  return { ok: true };
}

/** Validate completeness (fields + required docs) without mutating. */
export async function validateApplication(id: string) {
  const app = await getApplication(id);
  if (!app) throw new AppError("NOT_FOUND", "Application not found.");
  const fieldResult = validateValues(app.sections, app.values);
  const missingDocs = app.requirements
    .filter((r) => r.required && !app.documents.some((d) => d.requirementKey === r.key))
    .map((r) => r.label);
  return {
    ok: fieldResult.ok && missingDocs.length === 0,
    fieldErrors: fieldResult.errors,
    missingDocs,
  };
}

/** Submit: validate, snapshot an immutable version, lock the application. Idempotent. */
export async function submitApplication(id: string, userId: string) {
  const app = await db.application.findUnique({ where: { id } });
  if (!app || app.userId !== userId) throw new AppError("NOT_FOUND", "Application not found.");
  if (app.status !== "draft") return { alreadySubmitted: true }; // idempotent

  const check = await validateApplication(id);
  if (!check.ok) throw new AppError("INCOMPLETE", "Application is incomplete.");

  const full = await getApplication(id);
  const last = await db.applicationVersion.findFirst({ where: { applicationId: id }, orderBy: { version: "desc" } });
  const snapshot = {
    templateKey: app.templateKey,
    templateVersion: app.templateVersion,
    values: full!.values,
    documents: full!.documents,
    sections: full!.sections,
  };

  await db.$transaction([
    db.applicationVersion.create({
      data: { applicationId: id, version: (last?.version ?? 0) + 1, snapshot: snapshot as object },
    }),
    db.application.update({ where: { id }, data: { status: "submitted", submittedAt: new Date(), progress: 100 } }),
  ]);
  await audit({ actorId: userId, action: "application.submitted", targetType: "Application", targetId: id });
  return { alreadySubmitted: false };
}
