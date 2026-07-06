"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormRenderer } from "@/components/forms/form-renderer";
import { validateValues } from "@/modules/forms/validation";
import type { FormSectionDef } from "@/modules/forms/field-types";
import { saveValuesAction, submitApplicationAction } from "@/modules/applications/actions";
import { Button } from "@/components/ui/button";

type Requirement = { key: string; label: string; required: boolean; allowedTypes: string[]; maxSizeMb: number };
type Doc = { requirementKey: string; fileName: string; storageKey: string };

type Props = {
  id: string;
  cycleName: string;
  categoryName: string;
  sections: FormSectionDef[];
  initialValues: Record<string, unknown>;
  requirements: Requirement[];
  initialDocuments: Doc[];
};

type Step = { key: string; title: string; kind: "section" | "documents" | "review"; section?: FormSectionDef };

export function ApplicationWizard(props: Props) {
  const router = useRouter();
  const steps: Step[] = [
    ...props.sections.map((s) => ({ key: s.key, title: s.title, kind: "section" as const, section: s })),
    { key: "__documents", title: "Documents", kind: "documents" as const },
    { key: "__review", title: "Review & Submit", kind: "review" as const },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(props.initialValues);
  const [documents, setDocuments] = useState<Doc[]>(props.initialDocuments);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, start] = useTransition();
  const [submitError, setSubmitError] = useState<string>("");
  const [missingDocs, setMissingDocs] = useState<string[]>([]);

  const step = steps[stepIndex];

  const scheduleSave = useCallback((next: Record<string, unknown>) => {
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveValuesAction(props.id, next);
      setSaveState(res.ok ? "saved" : "idle");
    }, 700);
  }, [props.id]);

  function onField(key: string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      scheduleSave(next);
      return next;
    });
  }

  // required-field completion per section (for the rail)
  function sectionComplete(section: FormSectionDef) {
    return section.fields.filter((f) => f.required).every((f) => {
      const v = values[f.key];
      return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
    });
  }

  const review = validateValues(props.sections, values);
  const missingRequiredDocs = props.requirements.filter(
    (r) => r.required && !documents.some((d) => d.requirementKey === r.key),
  );
  const canSubmit = review.ok && missingRequiredDocs.length === 0;

  function submit() {
    start(async () => {
      setSubmitError("");
      setMissingDocs([]);
      const res = await submitApplicationAction(props.id);
      if (res.ok) {
        router.refresh();
      } else {
        setSubmitError(res.error ?? "Submit failed.");
        setMissingDocs(res.missingDocs ?? []);
        if (!review.ok) setErrors(review.errors);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* Step rail */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ol className="space-y-1 text-sm">
          {steps.map((s, i) => {
            const done = s.kind === "section" && s.section ? sectionComplete(s.section) : s.kind === "documents" ? missingRequiredDocs.length === 0 : canSubmit;
            const active = i === stepIndex;
            return (
              <li key={s.key}>
                <button
                  onClick={() => setStepIndex(i)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors ${active ? "bg-brand/10 font-medium text-brand" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${done ? "bg-status-success text-white" : "border border-border"}`}>
                    {done ? "✓" : i + 1}
                  </span>
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Step body */}
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{props.cycleName} · {props.categoryName}</p>
            <h2 className="text-xl font-semibold tracking-tight">{step.title}</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : ""}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          {step.kind === "section" && step.section && (
            <FormRenderer sections={[step.section]} values={values} onChange={onField} errors={errors} />
          )}

          {step.kind === "documents" && (
            <DocumentsStep
              appId={props.id}
              requirements={props.requirements}
              documents={documents}
              onUploaded={(doc) => setDocuments((prev) => [...prev.filter((d) => d.requirementKey !== doc.requirementKey), doc])}
            />
          )}

          {step.kind === "review" && (
            <ReviewStep
              sections={props.sections}
              values={values}
              requirements={props.requirements}
              documents={documents}
              review={review}
              canSubmit={canSubmit}
              pending={pending}
              submitError={submitError}
              missingDocs={missingDocs}
              onSubmit={submit}
              onGoto={(key) => {
                const idx = steps.findIndex((s) => s.section?.fields.some((f) => f.key === key) || s.key === key);
                if (idx >= 0) setStepIndex(idx);
              }}
            />
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>
            Back
          </Button>
          {stepIndex < steps.length - 1 && (
            <Button onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentsStep({
  appId,
  requirements,
  documents,
  onUploaded,
}: {
  appId: string;
  requirements: Requirement[];
  documents: Doc[];
  onUploaded: (doc: Doc) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  async function upload(reqKey: string, file: File) {
    setBusy(reqKey);
    setError((e) => ({ ...e, [reqKey]: "" }));
    const fd = new FormData();
    fd.set("requirementKey", reqKey);
    fd.set("file", file);
    const res = await fetch(`/api/applications/${appId}/documents`, { method: "POST", body: fd });
    const json = await res.json();
    setBusy(null);
    if (res.ok) onUploaded({ requirementKey: reqKey, fileName: file.name, storageKey: "" });
    else setError((e) => ({ ...e, [reqKey]: json.error ?? "Upload failed." }));
  }

  if (requirements.length === 0) return <p className="text-sm text-muted-foreground">No documents required for this category.</p>;

  return (
    <div className="space-y-4">
      {requirements.map((r) => {
        const uploaded = documents.find((d) => d.requirementKey === r.key);
        return (
          <div key={r.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">
                {r.label} {r.required ? <span className="text-status-danger">*</span> : <span className="text-xs text-muted-foreground">(optional)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{r.allowedTypes.join(", ") || "any"} · ≤{r.maxSizeMb}MB</p>
              {uploaded && <p className="mt-1 text-sm text-status-success">✓ {uploaded.fileName}</p>}
              {error[r.key] && <p className="mt-1 text-sm text-status-danger">{error[r.key]}</p>}
            </div>
            <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
              {busy === r.key ? "Uploading…" : uploaded ? "Replace" : "Upload"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(r.key, f); }}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}

function ReviewStep({
  sections,
  values,
  requirements,
  documents,
  review,
  canSubmit,
  pending,
  submitError,
  missingDocs,
  onSubmit,
  onGoto,
}: {
  sections: FormSectionDef[];
  values: Record<string, unknown>;
  requirements: Requirement[];
  documents: Doc[];
  review: { ok: boolean; errors: Record<string, string> };
  canSubmit: boolean;
  pending: boolean;
  submitError: string;
  missingDocs: string[];
  onSubmit: () => void;
  onGoto: (key: string) => void;
}) {
  const missingReqDocs = requirements.filter((r) => r.required && !documents.some((d) => d.requirementKey === r.key));
  return (
    <div>
      <h3 className="text-lg font-semibold">Review your application</h3>
      <div className="mt-4 space-y-6">
        {sections.map((s) => (
          <div key={s.key}>
            <h4 className="text-sm font-medium text-muted-foreground">{s.title}</h4>
            <dl className="mt-2 divide-y divide-border rounded-lg border border-border">
              {s.fields.map((f) => (
                <div key={f.key} className="flex justify-between gap-4 px-3 py-2 text-sm">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="text-right">
                    {formatValue(values[f.key])}
                    {review.errors[f.key] && <span className="ml-2 text-status-danger">⚠ {review.errors[f.key]}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Documents</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {requirements.map((r) => {
              const up = documents.find((d) => d.requirementKey === r.key);
              return (
                <li key={r.key} className={up ? "text-status-success" : r.required ? "text-status-danger" : "text-muted-foreground"}>
                  {up ? "✓" : r.required ? "⚠" : "○"} {r.label}{up ? ` — ${up.fileName}` : r.required ? " — missing" : " (optional)"}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {(!canSubmit || submitError) && (
        <div className="mt-6 rounded-md border border-status-danger/30 bg-status-danger/10 p-3 text-sm text-status-danger">
          {submitError || "Complete all required fields and documents before submitting."}
          {(missingDocs.length > 0 || missingReqDocs.length > 0) && (
            <ul className="mt-1 list-inside list-disc">
              {(missingDocs.length ? missingDocs : missingReqDocs.map((d) => d.label)).map((m) => <li key={m}>{m}</li>)}
            </ul>
          )}
          {!review.ok && (
            <button onClick={() => onGoto(Object.keys(review.errors)[0])} className="mt-1 underline">
              Go to first error
            </button>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-border pt-4">
        <Button size="lg" onClick={onSubmit} disabled={!canSubmit || pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">Once submitted, your application is locked and versioned.</p>
      </div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
