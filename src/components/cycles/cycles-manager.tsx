"use client";

import { useState, useTransition } from "react";
import { upsertCycleAction, setCycleStatusAction } from "@/modules/cycles/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Cycle = {
  id: string;
  year: number;
  name: string;
  status: string;
  opensAt: string;
  closesAt: string;
  formTemplateKey: string;
  categoryKeys: string[];
};
type Opt = { key: string; name: string };

const statusColor: Record<string, string> = {
  OPEN: "text-status-success",
  DRAFT: "text-status-progress",
  CLOSED: "text-muted-foreground",
  ARCHIVED: "text-muted-foreground",
};

const emptyForm = (): Cycle => ({
  id: "",
  year: new Date().getFullYear() + 1,
  name: "",
  status: "DRAFT",
  opensAt: "",
  closesAt: "",
  formTemplateKey: "",
  categoryKeys: [],
});

export function CyclesManager({
  cycles,
  categories,
  templates,
}: {
  cycles: Cycle[];
  categories: Opt[];
  templates: Opt[];
}) {
  const [form, setForm] = useState<Cycle | null>(null);
  const [pending, start] = useTransition();

  function save() {
    if (!form) return;
    start(async () => {
      await upsertCycleAction(form.id || null, {
        year: Number(form.year),
        name: form.name,
        opensAt: form.opensAt || null,
        closesAt: form.closesAt || null,
        formTemplateKey: form.formTemplateKey || null,
        categoryKeys: form.categoryKeys,
      });
      setForm(null);
    });
  }
  function status(id: string, s: "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED") {
    start(async () => {
      await setCycleStatusAction(id, s);
    });
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setForm(emptyForm())}>+ New cycle</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Cohort</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cycles.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name || `${c.year} Cohort`}</td>
                <td className={`px-4 py-3 ${statusColor[c.status]}`}>{c.status}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.formTemplateKey || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.categoryKeys.join(", ") || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 text-xs">
                    <button onClick={() => setForm(c)} className="text-brand hover:underline">Edit</button>
                    {c.status !== "OPEN" && <button onClick={() => status(c.id, "OPEN")} disabled={pending} className="text-status-success hover:underline">Open</button>}
                    {c.status === "OPEN" && <button onClick={() => status(c.id, "CLOSED")} disabled={pending} className="text-muted-foreground hover:underline">Close</button>}
                  </div>
                </td>
              </tr>
            ))}
            {cycles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No cycles yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">{form.id ? "Edit cycle" : "New cycle"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="2026 Cohort" />
            </div>
            <div>
              <Label>Opens</Label>
              <Input type="date" value={form.opensAt} onChange={(e) => setForm({ ...form, opensAt: e.target.value })} />
            </div>
            <div>
              <Label>Closes</Label>
              <Input type="date" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} />
            </div>
            <div>
              <Label>Form template</Label>
              <select
                value={form.formTemplateKey}
                onChange={(e) => setForm({ ...form, formTemplateKey: e.target.value })}
                className="h-10 w-full rounded-md border border-border bg-surface px-2 text-sm"
              >
                <option value="">Select template…</option>
                {templates.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Categories accepted</Label>
              <div className="flex flex-wrap gap-3 pt-2">
                {categories.map((cat) => (
                  <label key={cat.key} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={form.categoryKeys.includes(cat.key)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoryKeys: e.target.checked
                            ? [...form.categoryKeys, cat.key]
                            : form.categoryKeys.filter((k) => k !== cat.key),
                        })
                      }
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={save} disabled={pending || !form.name}>Save cycle</Button>
            <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
