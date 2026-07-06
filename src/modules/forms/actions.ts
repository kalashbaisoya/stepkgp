"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as forms from "./service";
import { FIELD_TYPES, type FieldType } from "./field-types";

type EditorField = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  helpText?: string | null;
  validation?: unknown;
  conditional?: unknown;
  options?: { value: string; label: string }[];
};
type EditorSection = { key: string; title: string; fields: EditorField[] };

function sanitize(sections: EditorSection[]): EditorSection[] {
  return sections.map((s) => ({
    key: s.key,
    title: s.title,
    fields: s.fields
      .filter((f) => f.type in FIELD_TYPES && f.key.trim().length > 0)
      .map((f) => ({
        key: f.key.trim(),
        label: f.label,
        type: f.type,
        required: Boolean(f.required),
        helpText: f.helpText ?? null,
        validation: f.validation ?? undefined,
        conditional: f.conditional ?? undefined,
        options: FIELD_TYPES[f.type].hasOptions ? (f.options ?? []) : undefined,
      })),
  }));
}

export async function saveTemplateAction(key: string, sections: EditorSection[]) {
  const user = await requirePermission("form:manage");
  await forms.saveTemplate(key, sanitize(sections), user.id);
  revalidatePath(`/admin/forms/${key}`);
  return { ok: true };
}

export async function publishTemplateAction(key: string) {
  const user = await requirePermission("form:manage");
  const res = await forms.publishTemplateVersion(key, user.id);
  revalidatePath(`/admin/forms/${key}`);
  return { ok: true, version: res.version };
}
