import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";
import type {
  FieldType,
  FormFieldDef,
  FormSectionDef,
} from "./field-types";

function mapField(f: {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  helpText: string | null;
  validation: unknown;
  conditional: unknown;
  options: unknown;
}): FormFieldDef {
  return {
    id: f.id,
    key: f.key,
    label: f.label,
    type: f.type as FieldType,
    required: f.required,
    order: f.order,
    helpText: f.helpText,
    validation: (f.validation as FormFieldDef["validation"]) ?? null,
    conditional: (f.conditional as FormFieldDef["conditional"]) ?? null,
    options: (f.options as FormFieldDef["options"]) ?? [],
  };
}

/** Current draft structure of a template (for builder + live rendering pre-publish). */
export async function getTemplateForEdit(key: string) {
  const t = await db.formTemplate.findUnique({
    where: { key },
    include: { sections: { orderBy: { order: "asc" }, include: { fields: { orderBy: { order: "asc" } } } } },
  });
  if (!t) return null;
  return {
    id: t.id,
    key: t.key,
    name: t.name,
    sections: t.sections.map((s) => ({
      id: s.id,
      key: s.key,
      title: s.title,
      order: s.order,
      fields: s.fields.map(mapField),
    })) as FormSectionDef[],
  };
}

/** Latest published version snapshot (source of truth for filling/validating). */
export async function getPublishedTemplate(key: string) {
  const t = await db.formTemplate.findUnique({
    where: { key },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const v = t?.versions[0];
  if (!t || !v) return null;
  return {
    key: t.key,
    name: t.name,
    version: v.version,
    sections: v.snapshot as unknown as FormSectionDef[],
  };
}

export async function listTemplates() {
  const templates = await db.formTemplate.findMany({
    orderBy: { key: "asc" },
    include: { versions: { orderBy: { version: "desc" }, take: 1 }, _count: { select: { sections: true } } },
  });
  return templates.map((t) => ({
    key: t.key,
    name: t.name,
    sectionCount: t._count.sections,
    publishedVersion: t.versions[0]?.version ?? null,
  }));
}

type DraftSection = { key: string; title: string; fields: DraftField[] };
type DraftField = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  helpText?: string | null;
  validation?: unknown;
  conditional?: unknown;
  options?: { value: string; label: string }[];
};

/** Replace a template's draft sections/fields (builder save). */
export async function saveTemplate(key: string, sections: DraftSection[], actorId?: string) {
  const t = await db.formTemplate.findUnique({ where: { key } });
  if (!t) throw new Error(`Unknown template: ${key}`);

  await db.$transaction(async (tx) => {
    await tx.formSection.deleteMany({ where: { templateId: t.id } });
    for (const [si, s] of sections.entries()) {
      const section = await tx.formSection.create({
        data: { templateId: t.id, key: s.key || `section_${si}`, title: s.title, order: si },
      });
      for (const [fi, f] of s.fields.entries()) {
        await tx.formField.create({
          data: {
            sectionId: section.id,
            key: f.key,
            label: f.label,
            type: f.type,
            required: f.required,
            order: fi,
            helpText: f.helpText ?? null,
            validation: (f.validation as object) ?? undefined,
            conditional: (f.conditional as object) ?? undefined,
            options: (f.options as object) ?? undefined,
          },
        });
      }
    }
  });
  await audit({ actorId, action: "form.draft_saved", targetType: "FormTemplate", targetId: t.id });
}

/** Snapshot the current draft as a new immutable published version. */
export async function publishTemplateVersion(key: string, actorId?: string) {
  const edit = await getTemplateForEdit(key);
  const t = await db.formTemplate.findUnique({
    where: { key },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!edit || !t) throw new Error(`Unknown template: ${key}`);

  const nextVersion = (t.versions[0]?.version ?? 0) + 1;
  await db.formTemplateVersion.create({
    data: {
      templateId: t.id,
      version: nextVersion,
      snapshot: edit.sections as object,
      publishedBy: actorId ?? null,
    },
  });
  await audit({
    actorId,
    action: "form.template_versioned",
    targetType: "FormTemplate",
    targetId: t.id,
    after: { version: nextVersion },
  });
  return { version: nextVersion };
}
