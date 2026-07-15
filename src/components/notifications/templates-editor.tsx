"use client";

import { useState, useTransition } from "react";
import { saveTemplateAction } from "@/modules/notifications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Template = { key: string; title: string; emailSubject: string; body: string; channels: string[] };

export function TemplatesEditor({ templates }: { templates: Template[] }) {
  return (
    <div className="mt-8 space-y-3">
      {templates.map((t) => (
        <TemplateRow key={t.key} template={t} />
      ))}
    </div>
  );
}

function TemplateRow({ template }: { template: Template }) {
  const [t, setT] = useState(template);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const set = (patch: Partial<Template>) => setT((p) => ({ ...p, ...patch }));
  const toggleChannel = (c: string) =>
    set({ channels: t.channels.includes(c) ? t.channels.filter((x) => x !== c) : [...t.channels, c] });

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <div>
          <span className="font-medium">{t.title}</span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">{t.key}</span>
        </div>
        <span className="text-xs text-muted-foreground">{t.channels.join(" · ") || "off"} · {open ? "−" : "edit"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-5 py-4">
          <div>
            <label className="text-xs text-muted-foreground">In-app title</label>
            <Input value={t.title} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email subject</label>
            <Input value={t.emailSubject} onChange={(e) => set({ emailSubject: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Body</label>
            <textarea value={t.body} onChange={(e) => set({ body: e.target.value })} rows={3} className="w-full rounded-md border border-border bg-surface p-3 text-sm" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Channels:</span>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={t.channels.includes("inapp")} onChange={() => toggleChannel("inapp")} /> In-app</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={t.channels.includes("email")} onChange={() => toggleChannel("email")} /> Email</label>
            <div className="ml-auto flex items-center gap-3">
              {note && <span className="text-status-success">{note}</span>}
              <Button
                onClick={() => start(async () => { await saveTemplateAction(t.key, { title: t.title, emailSubject: t.emailSubject, body: t.body, channels: t.channels }); setNote("Saved."); })}
                disabled={pending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
