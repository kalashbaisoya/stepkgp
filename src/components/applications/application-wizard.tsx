"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormRenderer } from "@/components/forms/form-renderer";
import { validateValues } from "@/modules/forms/validation";
import type { FormSectionDef } from "@/modules/forms/field-types";
import { saveValuesAction, submitApplicationAction } from "@/modules/applications/actions";
import { saveSectionAction as saveBpSectionAction } from "@/modules/businessPlan/actions";
import { Button } from "@/components/ui/button";

type Requirement = { key: string; label: string; required: boolean; allowedTypes: string[]; maxSizeMb: number };
type Doc = { requirementKey: string; fileName: string; storageKey: string };
type BpSection = { key: string; title: string; prompt: string; required: boolean; minWords: number | null; maxWords: number | null; content: string };

type Props = {
  id: string;
  cycleName: string;
  categoryName: string;
  sections: FormSectionDef[];
  initialValues: Record<string, unknown>;
  requirements: Requirement[];
  initialDocuments: Doc[];
  businessPlan: BpSection[];
};

type Step =
  | { key: string; title: string; kind: "section"; section: FormSectionDef }
  | { key: "__businessPlan"; title: string; kind: "businessPlan" }
  | { key: "__documents"; title: string; kind: "documents" }
  | { key: "__review"; title: string; kind: "review" };

function words(s: string) {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

function bpSectionError(s: BpSection): string | null {
  const w = words(s.content);
  if (s.required && w === 0) return "Required.";
  if (w > 0 && s.minWords && w < s.minWords) return `Min ${s.minWords} words (has ${w}).`;
  if (w > 0 && s.maxWords && w > s.maxWords) return `Max ${s.maxWords} words (has ${w}).`;
  return null;
}

export function ApplicationWizard(props: Props) {
  const router = useRouter();
  const steps: Step[] = [
    ...props.sections.map((s) => ({ key: s.key, title: s.title, kind: "section" as const, section: s })),
    { key: "__businessPlan", title: "Business Plan", kind: "businessPlan" },
    { key: "__documents", title: "Documents", kind: "documents" },
    { key: "__review", title: "Review & Submit", kind: "review" },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(props.initialValues);
  const [documents, setDocuments] = useState<Doc[]>(props.initialDocuments);
  const [bp, setBp] = useState<BpSection[]>(props.businessPlan);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const valueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bpTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [pending, start] = useTransition();
  const [submitError, setSubmitError] = useState("");
  const [missingDocs, setMissingDocs] = useState<string[]>([]);

  const step = steps[stepIndex];

  const scheduleSave = useCallback((next: Record<string, unknown>) => {
    setSaveState("saving");
    if (valueTimer.current) clearTimeout(valueTimer.current);
    valueTimer.current = setTimeout(async () => {
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

  function onBpChange(key: string, content: string) {
    setBp((prev) => prev.map((s) => (s.key === key ? { ...s, content } : s)));
    setSaveState("saving");
    if (bpTimers.current[key]) clearTimeout(bpTimers.current[key]);
    bpTimers.current[key] = setTimeout(async () => {
      const res = await saveBpSectionAction(props.id, key, content);
      setSaveState(res.ok ? "saved" : "idle");
    }, 700);
  }

  function sectionComplete(section: FormSectionDef) {
    return section.fields.filter((f) => f.required).every((f) => {
      const v = values[f.key];
      return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
    });
  }

  const review = validateValues(props.sections, values);
  const bpErrors = bp.map((s) => ({ key: s.key, title: s.title, error: bpSectionError(s) })).filter((e) => e.error);
  const bpComplete = bpErrors.length === 0;
  const missingRequiredDocs = props.requirements.filter((r) => r.required && !documents.some((d) => d.requirementKey === r.key));
  const canSubmit = review.ok && bpComplete && missingRequiredDocs.length === 0;

  function submit() {
    start(async () => {
      setSubmitError("");
      setMissingDocs([]);
      const res = await submitApplicationAction(props.id);
      if (res.ok) router.refresh();
      else {
        setSubmitError(res.error ?? "Submit failed.");
        setMissingDocs(res.missingDocs ?? []);
        if (!review.ok) setErrors(review.errors);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ol className="space-y-1 text-sm">
          {steps.map((s, i) => {
            const done =
              s.kind === "section" ? sectionComplete(s.section) :
              s.kind === "businessPlan" ? bpComplete :
              s.kind === "documents" ? missingRequiredDocs.length === 0 :
              canSubmit;
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

        <div className="clay p-6">
          {step.kind === "section" && (
            <FormRenderer sections={[step.section]} values={values} onChange={onField} errors={errors} />
          )}

          {step.kind === "businessPlan" && (
            <BusinessPlanStep sections={bp} onChange={onBpChange} />
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
              appId={props.id}
              sections={props.sections}
              values={values}
              requirements={props.requirements}
              documents={documents}
              bpErrors={bpErrors}
              review={review}
              canSubmit={canSubmit}
              pending={pending}
              submitError={submitError}
              missingDocs={missingDocs}
              onSubmit={submit}
              onGotoBp={() => setStepIndex(steps.findIndex((s) => s.kind === "businessPlan"))}
            />
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>Back</Button>
          {stepIndex < steps.length - 1 && (
            <Button onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessPlanStep({ sections, onChange }: { sections: BpSection[]; onChange: (key: string, content: string) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Complete your business plan here, no separate document needed. Required sections and word limits are set by the incubation centre.
      </p>
      {sections.map((s) => {
        const w = words(s.content);
        const err = bpSectionError(s);
        const limit = s.minWords || s.maxWords
          ? `${s.minWords ? `min ${s.minWords}` : ""}${s.minWords && s.maxWords ? " · " : ""}${s.maxWords ? `max ${s.maxWords}` : ""}`
          : "";
        return (
          <div key={s.key}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {s.title}{s.required && <span className="ml-0.5 text-status-danger">*</span>}
              </label>
              <span className={`text-xs ${err ? "text-status-danger" : "text-muted-foreground"}`}>
                {w} words{limit ? ` · ${limit}` : ""}
              </span>
            </div>
            <p className="mb-1 text-xs text-muted-foreground">{s.prompt}</p>
            <textarea
              value={s.content}
              onChange={(e) => onChange(s.key, e.target.value)}
              rows={5}
              className={`w-full rounded-md border bg-surface p-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${err ? "border-status-danger" : "border-border"}`}
            />
            {err && <p className="mt-1 text-xs text-status-danger">{err}</p>}
          </div>
        );
      })}
    </div>
  );
}

function DocumentsStep({
  appId, requirements, documents, onUploaded,
}: {
  appId: string; requirements: Requirement[]; documents: Doc[]; onUploaded: (doc: Doc) => void;
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
          <div key={r.key} className="flex flex-wrap items-center justify-between gap-3 clay p-4">
            <div>
              <p className="font-medium">
                {r.label} {r.required ? <span className="text-status-danger">*</span> : <span className="text-xs text-muted-foreground">(optional)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{r.allowedTypes.join(", ") || "any"} · ≤{r.maxSizeMb}MB</p>
              {uploaded && <p className="mt-1 text-sm text-status-success">✓ {uploaded.fileName}</p>}
              {error[r.key] && <p className="mt-1 text-sm text-status-danger">{error[r.key]}</p>}
            </div>
            <label className="clay-btn clay-plain cursor-pointer px-4 py-2.5 text-sm">
              {busy === r.key ? "Uploading…" : uploaded ? "Replace" : "Upload"}
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(r.key, f); }} />
            </label>
          </div>
        );
      })}
    </div>
  );
}

function ReviewStep({
  appId, sections, values, requirements, documents, bpErrors, review, canSubmit, pending, submitError, missingDocs, onSubmit, onGotoBp,
}: {
  appId: string;
  sections: FormSectionDef[];
  values: Record<string, unknown>;
  requirements: Requirement[];
  documents: Doc[];
  bpErrors: { key: string; title: string; error: string | null }[];
  review: { ok: boolean; errors: Record<string, string> };
  canSubmit: boolean;
  pending: boolean;
  submitError: string;
  missingDocs: string[];
  onSubmit: () => void;
  onGotoBp: () => void;
}) {
  const missingReqDocs = requirements.filter((r) => r.required && !documents.some((d) => d.requirementKey === r.key));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Review your application</h3>
        <a href={`/api/applications/${appId}/full`} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary">Preview full application (PDF)</Button>
        </a>
      </div>

      <div className="mt-4 space-y-6">
        {sections.map((s) => (
          <div key={s.key}>
            <h4 className="text-sm font-medium text-muted-foreground">{s.title}</h4>
            <dl className="mt-2 divide-y divide-border clay overflow-hidden">
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
          <h4 className="text-sm font-medium text-muted-foreground">Business plan</h4>
          {bpErrors.length === 0 ? (
            <p className="mt-1 text-sm text-status-success">✓ Complete</p>
          ) : (
            <div className="mt-1 text-sm text-status-danger">
              <ul className="list-inside list-disc">
                {bpErrors.map((e) => <li key={e.key}>{e.title}: {e.error}</li>)}
              </ul>
              <button onClick={onGotoBp} className="mt-1 underline">Go to business plan</button>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Documents</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {requirements.map((r) => {
              const up = documents.find((d) => d.requirementKey === r.key);
              return (
                <li key={r.key} className={up ? "text-status-success" : r.required ? "text-status-danger" : "text-muted-foreground"}>
                  {up ? "✓" : r.required ? "⚠" : "○"} {r.label}{up ? `: ${up.fileName}` : r.required ? " (missing)" : " (optional)"}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {(!canSubmit || submitError) && (
        <div className="mt-6 rounded-md border border-status-danger/30 bg-status-danger/10 p-3 text-sm text-status-danger">
          {submitError || "Complete all required fields, the business plan, and documents before submitting."}
          {(missingDocs.length > 0 || missingReqDocs.length > 0) && (
            <ul className="mt-1 list-inside list-disc">
              {(missingDocs.length ? missingDocs : missingReqDocs.map((d) => d.label)).map((m) => <li key={m}>{m}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-border pt-4">
        <Button size="lg" onClick={onSubmit} disabled={!canSubmit || pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">Once submitted, your application is locked and versioned, and a PDF is generated.</p>
      </div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null || v === "") return "-";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "-";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
