"use client";

import { useCallback, useRef, useState } from "react";
import { saveSectionAction } from "@/modules/businessPlan/actions";
import { Button } from "@/components/ui/button";

type Section = { key: string; title: string; prompt: string; content: string };

export function BusinessPlanEditor({
  applicationId,
  initialSections,
  readOnly,
}: {
  applicationId: string;
  initialSections: Section[];
  readOnly: boolean;
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [active, setActive] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const filled = sections.filter((s) => s.content.trim().length > 0).length;

  const scheduleSave = useCallback(
    (key: string, content: string) => {
      setSaveState("saving");
      if (timers.current[key]) clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(async () => {
        const res = await saveSectionAction(applicationId, key, content);
        setSaveState(res.ok ? "saved" : "idle");
      }, 700);
    },
    [applicationId],
  );

  function onChange(i: number, content: string) {
    setSections((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], content };
      return next;
    });
    scheduleSave(sections[i].key, content);
  }

  const section = sections[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs text-muted-foreground">{filled}/{sections.length} sections written</p>
        <ol className="space-y-1 text-sm">
          {sections.map((s, i) => (
            <li key={s.key}>
              <button
                onClick={() => setActive(i)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors ${i === active ? "bg-brand/10 font-medium text-brand" : "text-muted-foreground hover:bg-muted"}`}
              >
                <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${s.content.trim() ? "bg-status-success text-white" : "border border-border"}`}>
                  {s.content.trim() ? "✓" : ""}
                </span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
          <span className="text-xs text-muted-foreground">
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : ""}
          </span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{section.prompt}</p>
        <textarea
          value={section.content}
          onChange={(e) => onChange(active, e.target.value)}
          readOnly={readOnly}
          rows={16}
          className="w-full rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          placeholder={readOnly ? "" : "Write this section…"}
        />

        <div className="mt-4 flex items-center gap-3">
          <a href={`/api/applications/${applicationId}/business-plan`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Preview / download PDF</Button>
          </a>
          <span className="text-sm text-muted-foreground">A branded PDF is generated automatically on submit.</span>
        </div>
      </div>
    </div>
  );
}
