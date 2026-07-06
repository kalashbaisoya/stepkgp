"use client";

import { useState, useTransition } from "react";
import { saveDocumentRequirementsAction } from "@/modules/cycles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Req = { key: string; label: string; required: boolean; maxSizeMb: number; allowedTypes: string[] };

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function DocumentsManager({
  categoryKey,
  categoryName,
  initial,
}: {
  categoryKey: string;
  categoryName: string;
  initial: Req[];
}) {
  const [reqs, setReqs] = useState<Req[]>(initial);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  function update(i: number, patch: Partial<Req>) {
    const next = reqs.slice();
    next[i] = { ...next[i], ...patch };
    setReqs(next);
  }
  function add() {
    setReqs([...reqs, { key: `doc_${reqs.length}`, label: "New document", required: true, maxSizeMb: 10, allowedTypes: ["pdf"] }]);
  }
  function save() {
    start(async () => {
      await saveDocumentRequirementsAction(categoryKey, reqs.map((r) => ({ ...r, key: r.key || slug(r.label) })));
      setNote("Saved.");
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium">{categoryName}</h2>
        <div className="flex items-center gap-3">
          {note && <span className="text-sm text-status-success">{note}</span>}
          <Button variant="secondary" onClick={save} disabled={pending}>Save</Button>
        </div>
      </div>
      <div className="space-y-2">
        {reqs.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
            <Input value={r.label} onChange={(e) => update(i, { label: e.target.value, key: slug(e.target.value) })} placeholder="Document name" className="min-w-[10rem] flex-1" />
            <Input value={r.allowedTypes.join(",")} onChange={(e) => update(i, { allowedTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="pdf,jpg" className="w-32" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">max</span>
              <Input type="number" value={r.maxSizeMb} onChange={(e) => update(i, { maxSizeMb: Number(e.target.value) })} className="w-16" />
              <span className="text-xs text-muted-foreground">MB</span>
            </div>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={r.required} onChange={(e) => update(i, { required: e.target.checked })} />
              Required
            </label>
            <button onClick={() => setReqs(reqs.filter((_, j) => j !== i))} className="text-status-danger">✕</button>
          </div>
        ))}
        {reqs.length === 0 && <p className="text-sm text-muted-foreground">No documents required for this category.</p>}
      </div>
      <button onClick={add} className="mt-3 rounded border border-border px-2.5 py-1 text-xs hover:bg-muted">+ Add document</button>
    </div>
  );
}
