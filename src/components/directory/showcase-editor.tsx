"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateShowcaseAction } from "@/modules/directory/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ImageUpload } from "@/components/cms/image-upload";

type Entry = {
  id: string; slug: string; name: string; description: string; sector: string; website: string;
  logoUrl: string; funding: string; batch: string; stage: string; location: string; tags: string[];
  published: boolean; featured: boolean;
  founders: { name: string; role?: string }[];
  achievements: string[];
  socials: { label: string; url: string }[];
  gallery: string[];
  videos: string[];
};

export function ShowcaseEditor({ entry }: { entry: Entry }) {
  const [e, setE] = useState<Entry>(entry);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const set = (patch: Partial<Entry>) => setE((p) => ({ ...p, ...patch }));

  function save() {
    start(async () => {
      await updateShowcaseAction(e.id, {
        name: e.name, description: e.description, sector: e.sector, website: e.website,
        logoUrl: e.logoUrl, funding: e.funding, batch: e.batch, stage: e.stage,
        location: e.location, tags: e.tags, published: e.published, featured: e.featured,
        founders: e.founders, achievements: e.achievements, socials: e.socials, gallery: e.gallery, videos: e.videos,
      });
      setMsg("Saved.");
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/cms/showcase" className="text-sm text-muted-foreground hover:text-foreground">← Showcase</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{e.name}</h1>
          <p className="text-sm text-muted-foreground">Public URL: /startups/{e.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-status-success">{msg}</span>}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={e.published} onChange={(ev) => set({ published: ev.target.checked })} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={e.featured} onChange={(ev) => set({ featured: ev.target.checked })} />
            Featured on homepage
          </label>
          <Button onClick={save} disabled={pending}>Save</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Name</Label><Input value={e.name} onChange={(ev) => set({ name: ev.target.value })} /></div>
        <div><Label>Sector</Label><Input value={e.sector} onChange={(ev) => set({ sector: ev.target.value })} /></div>
        <div><Label>Website</Label><Input value={e.website} onChange={(ev) => set({ website: ev.target.value })} placeholder="https://" /></div>
        <div><Label>Funding</Label><Input value={e.funding} onChange={(ev) => set({ funding: ev.target.value })} placeholder="₹2 Cr" /></div>
        <div><Label>Batch / year</Label><Input value={e.batch} onChange={(ev) => set({ batch: ev.target.value })} placeholder="2016" /></div>
        <div><Label>Stage</Label><Input value={e.stage} onChange={(ev) => set({ stage: ev.target.value })} placeholder="Growth / Established / Acquired" /></div>
        <div><Label>Location</Label><Input value={e.location} onChange={(ev) => set({ location: ev.target.value })} placeholder="Bengaluru, India" /></div>
        <div><Label>Tags (comma separated)</Label><Input value={e.tags.join(", ")} onChange={(ev) => set({ tags: ev.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="SaaS, AI/ML" /></div>
        <div className="sm:col-span-2">
          <ImageUpload
            label="Logo"
            value={e.logoUrl}
            onChange={(url) => set({ logoUrl: url })}
            hint="PNG, JPEG, WebP, GIF or AVIF, up to 5MB. Leave empty to show a lettered monogram instead."
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <textarea value={e.description} onChange={(ev) => set({ description: ev.target.value })} rows={3} className="clay-field text-sm" />
        </div>
      </div>

      <ListEditor title="Founders" items={e.founders.map((f) => `${f.name}${f.role ? ` | ${f.role}` : ""}`)}
        onChange={(vals) => set({ founders: vals.map((v) => { const [name, role] = v.split("|").map((s) => s.trim()); return { name, role }; }) })}
        placeholder="Name | Role" />
      <ListEditor title="Achievements" items={e.achievements} onChange={(vals) => set({ achievements: vals })} placeholder="Achievement" />
      <ListEditor title="Social / links (Label | URL)" items={e.socials.map((s) => `${s.label} | ${s.url}`)}
        onChange={(vals) => set({ socials: vals.map((v) => { const [label, url] = v.split("|").map((s) => s.trim()); return { label, url }; }) })}
        placeholder="LinkedIn | https://" />
      <div className="mt-6">
        <Label>Gallery images</Label>
        <div className="space-y-2">
          {e.gallery.map((url, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageUpload
                  label={`Image ${i + 1}`}
                  value={url}
                  onChange={(next) => {
                    const g = e.gallery.slice();
                    g[i] = next;
                    set({ gallery: g });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => set({ gallery: e.gallery.filter((_, j) => j !== i) })}
                className="mt-7 text-status-danger"
                aria-label={`Remove image ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ gallery: [...e.gallery, ""] })}
            className="clay-sm px-2.5 py-1 text-xs hover:bg-muted"
          >
            + Add image
          </button>
        </div>
      </div>
      <ListEditor title="Video URLs" items={e.videos} onChange={(vals) => set({ videos: vals })} placeholder="https://youtube" />
    </div>
  );
}

function ListEditor({ title, items, onChange, placeholder }: { title: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className="mt-6">
      <Label>{title}</Label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <Input value={it} placeholder={placeholder} onChange={(e) => { const next = items.slice(); next[i] = e.target.value; onChange(next); }} />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-status-danger">✕</button>
          </div>
        ))}
        <button onClick={() => onChange([...items, ""])} className="clay-sm px-2.5 py-1 text-xs hover:bg-muted">+ Add</button>
      </div>
    </div>
  );
}
