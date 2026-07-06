"use client";

import { useState, useTransition } from "react";
import { saveBpConfigAction } from "@/modules/businessPlan/config-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Def = { key: string; title: string; prompt: string; required: boolean; minWords: number | null; maxWords: number | null };

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function BpConfigEditor({ initial }: { initial: Def[] }) {
  const [defs, setDefs] = useState<Def[]>(initial);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  function update(i: number, patch: Partial<Def>) {
    const next = defs.slice();
    next[i] = { ...next[i], ...patch };
    setDefs(next);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= defs.length) return;
    const next = defs.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setDefs(next);
  }
  function add() {
    setDefs([...defs, { key: `section_${defs.length}`, title: "New section", prompt: "", required: false, minWords: null, maxWords: null }]);
  }
  function save() {
    start(async () => {
      const payload = defs.map((d) => ({ ...d, key: d.key || slug(d.title) }));
      const res = await saveBpConfigAction(payload);
      setNote(res.ok ? "Saved." : res.error ?? "Failed.");
    });
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-end gap-3">
        {note && <span className="text-sm text-status-success">{note}</span>}
        <Button onClick={save} disabled={pending}>Save configuration</Button>
      </div>

      <div className="space-y-2">
        {defs.map((d, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[10rem] flex-1">
                <span className="mb-1 block text-xs text-muted-foreground">Title</span>
                <Input value={d.title} onChange={(e) => update(i, { title: e.target.value, key: slug(e.target.value) })} />
              </div>
              <label className="flex items-center gap-1.5 pb-2.5 text-sm">
                <input type="checkbox" checked={d.required} onChange={(e) => update(i, { required: e.target.checked })} />
                Required
              </label>
              <div className="w-24">
                <span className="mb-1 block text-xs text-muted-foreground">Min words</span>
                <Input type="number" value={d.minWords ?? ""} onChange={(e) => update(i, { minWords: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
              <div className="w-24">
                <span className="mb-1 block text-xs text-muted-foreground">Max words</span>
                <Input type="number" value={d.maxWords ?? ""} onChange={(e) => update(i, { maxWords: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-1 pb-1.5 text-muted-foreground">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === defs.length - 1} className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30">↓</button>
                <button onClick={() => setDefs(defs.filter((_, j) => j !== i))} className="rounded px-2 py-1 text-status-danger hover:bg-status-danger/10">✕</button>
              </div>
            </div>
            <div className="mt-2">
              <span className="mb-1 block text-xs text-muted-foreground">Prompt / guidance</span>
              <Input value={d.prompt} onChange={(e) => update(i, { prompt: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">+ Add section</button>
    </div>
  );
}
