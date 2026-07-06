"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FIELD_TYPES,
  FIELD_TYPE_KEYS,
  type FieldType,
  type FormFieldDef,
  type FormSectionDef,
} from "@/modules/forms/field-types";
import { validateValues } from "@/modules/forms/validation";
import { saveTemplateAction, publishTemplateAction } from "@/modules/forms/actions";
import { FormRenderer } from "./form-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

let tmp = 0;
const uid = () => `tmp-${tmp++}`;

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function FormBuilder({
  templateKey,
  name,
  initialSections,
}: {
  templateKey: string;
  name: string;
  initialSections: FormSectionDef[];
}) {
  const [sections, setSections] = useState<FormSectionDef[]>(initialSections);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [dirty, setDirty] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  function commit(next: FormSectionDef[]) {
    setSections(next.map((s, i) => ({ ...s, order: i })));
    setDirty(true);
  }

  function addSection() {
    commit([...sections, { id: uid(), key: `section_${sections.length}`, title: "New section", order: sections.length, fields: [] }]);
  }
  function updateSection(si: number, patch: Partial<FormSectionDef>) {
    const next = sections.slice();
    next[si] = { ...next[si], ...patch };
    commit(next);
  }
  function moveSection(si: number, dir: -1 | 1) {
    const j = si + dir;
    if (j < 0 || j >= sections.length) return;
    const next = sections.slice();
    [next[si], next[j]] = [next[j], next[si]];
    commit(next);
  }
  function removeSection(si: number) {
    commit(sections.filter((_, i) => i !== si));
  }

  function addField(si: number, type: FieldType) {
    const next = sections.slice();
    const field: FormFieldDef = {
      id: uid(), key: `field_${next[si].fields.length}`, label: "New field", type,
      required: false, order: next[si].fields.length,
      options: FIELD_TYPES[type].hasOptions ? [{ value: "opt1", label: "Option 1" }] : [],
    };
    next[si] = { ...next[si], fields: [...next[si].fields, field] };
    commit(next);
  }
  function updateField(si: number, fi: number, patch: Partial<FormFieldDef>) {
    const next = sections.slice();
    const fields = next[si].fields.slice();
    fields[fi] = { ...fields[fi], ...patch };
    next[si] = { ...next[si], fields };
    commit(next);
  }
  function moveField(si: number, fi: number, dir: -1 | 1) {
    const j = fi + dir;
    const fields = sections[si].fields;
    if (j < 0 || j >= fields.length) return;
    const next = sections.slice();
    const arr = fields.slice();
    [arr[fi], arr[j]] = [arr[j], arr[fi]];
    next[si] = { ...next[si], fields: arr };
    commit(next);
  }
  function removeField(si: number, fi: number) {
    const next = sections.slice();
    next[si] = { ...next[si], fields: next[si].fields.filter((_, i) => i !== fi) };
    commit(next);
  }

  const payload = () =>
    sections.map((s) => ({
      key: s.key || slug(s.title),
      title: s.title,
      fields: s.fields.map((f) => ({
        key: f.key, label: f.label, type: f.type, required: f.required,
        helpText: f.helpText, validation: f.validation, conditional: f.conditional, options: f.options,
      })),
    }));

  function save() {
    start(async () => {
      await saveTemplateAction(templateKey, payload());
      setDirty(false);
      setNote("Draft saved.");
    });
  }
  function publish() {
    start(async () => {
      await saveTemplateAction(templateKey, payload());
      const res = await publishTemplateAction(templateKey);
      setDirty(false);
      setNote(`Published v${res.version}.`);
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/forms" className="text-sm text-muted-foreground hover:text-foreground">← Forms</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {templateKey}{dirty && <span className="text-status-progress"> · unsaved changes</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {note && <span className="text-sm text-status-success">{note}</span>}
          <div className="flex rounded-md border border-border p-0.5 text-sm">
            <button onClick={() => setMode("edit")} className={`rounded px-3 py-1 ${mode === "edit" ? "bg-muted font-medium" : "text-muted-foreground"}`}>Edit</button>
            <button onClick={() => setMode("preview")} className={`rounded px-3 py-1 ${mode === "preview" ? "bg-muted font-medium" : "text-muted-foreground"}`}>Preview</button>
          </div>
          <Button variant="secondary" onClick={save} disabled={pending}>Save draft</Button>
          <Button onClick={publish} disabled={pending}>Publish version</Button>
        </div>
      </div>

      {mode === "preview" ? (
        <Preview sections={sections} />
      ) : (
        <div className="space-y-6">
          {sections.map((section, si) => (
            <div key={section.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center gap-2">
                <Input value={section.title} onChange={(e) => updateSection(si, { title: e.target.value, key: slug(e.target.value) })} className="max-w-xs font-medium" />
                <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <button onClick={() => moveSection(si, -1)} disabled={si === 0} className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30">↑</button>
                  <button onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1} className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30">↓</button>
                  <button onClick={() => removeSection(si)} className="rounded px-2 py-1 text-status-danger hover:bg-status-danger/10">Remove section</button>
                </div>
              </div>

              <div className="space-y-3">
                {section.fields.map((field, fi) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    allKeys={sections.flatMap((s) => s.fields.map((f) => f.key)).filter((k) => k !== field.key)}
                    onChange={(patch) => updateField(si, fi, patch)}
                    onMove={(d) => moveField(si, fi, d)}
                    onRemove={() => removeField(si, fi)}
                  />
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Add field:</span>
                {FIELD_TYPE_KEYS.map((t) => (
                  <button key={t} onClick={() => addField(si, t)} className="rounded border border-border px-2 py-1 text-xs hover:bg-muted">
                    + {FIELD_TYPES[t].label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={addSection}>+ Add section</Button>
        </div>
      )}
    </div>
  );
}

function FieldEditor({
  field,
  allKeys,
  onChange,
  onMove,
  onRemove,
}: {
  field: FormFieldDef;
  allKeys: string[];
  onChange: (patch: Partial<FormFieldDef>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const meta = FIELD_TYPES[field.type];
  const v = field.validation ?? {};
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[9rem] flex-1">
          <span className="mb-1 block text-xs text-muted-foreground">Label</span>
          <Input value={field.label} onChange={(e) => onChange({ label: e.target.value })} />
        </div>
        <div className="w-40">
          <span className="mb-1 block text-xs text-muted-foreground">Key</span>
          <Input value={field.key} onChange={(e) => onChange({ key: slug(e.target.value) })} />
        </div>
        <div className="w-40">
          <span className="mb-1 block text-xs text-muted-foreground">Type</span>
          <select
            value={field.type}
            onChange={(e) => onChange({ type: e.target.value as FieldType })}
            className="h-10 w-full rounded-md border border-border bg-surface px-2 text-sm"
          >
            {FIELD_TYPE_KEYS.map((t) => <option key={t} value={t}>{FIELD_TYPES[t].label}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1.5 pb-2.5 text-sm">
          <input type="checkbox" checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} />
          Required
        </label>
        <div className="ml-auto flex items-center gap-1 pb-1.5 text-muted-foreground">
          <button onClick={() => onMove(-1)} className="rounded px-2 py-1 hover:bg-muted">↑</button>
          <button onClick={() => onMove(1)} className="rounded px-2 py-1 hover:bg-muted">↓</button>
          <button onClick={onRemove} className="rounded px-2 py-1 text-status-danger hover:bg-status-danger/10">✕</button>
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs text-muted-foreground">Help text</span>
          <Input value={field.helpText ?? ""} onChange={(e) => onChange({ helpText: e.target.value })} />
        </div>
        {meta.supports.length > 0 && (
          <div className="flex flex-wrap items-end gap-2">
            {meta.supports.map((rule) => (
              <div key={rule} className="w-24">
                <span className="mb-1 block text-xs text-muted-foreground">{rule}</span>
                <Input
                  value={String((v as Record<string, unknown>)[rule] ?? "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = rule === "pattern" ? raw : raw === "" ? undefined : Number(raw);
                    onChange({ validation: { ...v, [rule]: val } });
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {meta.hasOptions && (
        <div className="mt-2">
          <span className="mb-1 block text-xs text-muted-foreground">Options</span>
          <div className="space-y-1.5">
            {(field.options ?? []).map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input placeholder="value" value={o.value} onChange={(e) => {
                  const opts = (field.options ?? []).slice(); opts[i] = { ...opts[i], value: slug(e.target.value) }; onChange({ options: opts });
                }} className="w-40" />
                <Input placeholder="label" value={o.label} onChange={(e) => {
                  const opts = (field.options ?? []).slice(); opts[i] = { ...opts[i], label: e.target.value }; onChange({ options: opts });
                }} />
                <button onClick={() => onChange({ options: (field.options ?? []).filter((_, j) => j !== i) })} className="text-status-danger">✕</button>
              </div>
            ))}
            <button onClick={() => onChange({ options: [...(field.options ?? []), { value: `opt${(field.options ?? []).length + 1}`, label: "Option" }] })} className="rounded border border-border px-2 py-1 text-xs hover:bg-muted">+ Add option</button>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="w-48">
          <span className="mb-1 block text-xs text-muted-foreground">Show only if field</span>
          <select
            value={field.conditional?.field ?? ""}
            onChange={(e) => onChange({ conditional: e.target.value ? { field: e.target.value, equals: field.conditional?.equals ?? "" } : null })}
            className="h-10 w-full rounded-md border border-border bg-surface px-2 text-sm"
          >
            <option value="">(always show)</option>
            {allKeys.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        {field.conditional?.field && (
          <div className="w-40">
            <span className="mb-1 block text-xs text-muted-foreground">equals</span>
            <Input value={field.conditional.equals} onChange={(e) => onChange({ conditional: { field: field.conditional!.field, equals: e.target.value } })} />
          </div>
        )}
      </div>
    </div>
  );
}

function Preview({ sections }: { sections: FormSectionDef[] }) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <FormRenderer
        sections={sections}
        values={values}
        onChange={(k, val) => setValues((prev) => ({ ...prev, [k]: val }))}
        errors={errors}
      />
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <Button
          variant="secondary"
          onClick={() => {
            const res = validateValues(sections, values);
            setErrors(res.errors);
          }}
        >
          Validate
        </Button>
        <span className="text-sm text-muted-foreground">Preview only — validation runs the compiled rules.</span>
      </div>
    </div>
  );
}
