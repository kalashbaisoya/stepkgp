"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CompanyLogo } from "./company-logo";
import type { ShowcaseProfile } from "@/modules/directory/service";

type Facets = { sectors: string[]; batches: string[]; stages: string[]; tags: string[] };

export function CompanyDirectory({
  companies,
  facets,
}: {
  companies: ShowcaseProfile[];
  facets: Facets;
}) {
  const [q, setQ] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return companies.filter((c) => {
      if (sectors.length && !(c.sector && sectors.includes(c.sector))) return false;
      if (batches.length && !(c.batch && batches.includes(c.batch))) return false;
      if (stages.length && !(c.stage && stages.includes(c.stage))) return false;
      if (tags.length && !c.tags.some((t) => tags.includes(t))) return false;
      if (!needle) return true;
      const hay = [
        c.name, c.description, c.sector ?? "", c.stage ?? "", c.batch ?? "",
        ...c.tags, ...c.founders.map((f) => f.name),
      ].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [companies, q, sectors, batches, stages, tags]);

  const activeCount = sectors.length + batches.length + stages.length + tags.length;

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest">Filters</h2>
          {activeCount > 0 && (
            <button
              onClick={() => { setSectors([]); setBatches([]); setStages([]); setTags([]); }}
              className="text-xs font-medium text-brand hover:underline"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>

        <FilterGroup title="Industry" options={facets.sectors} selected={sectors} onToggle={(v) => toggle(sectors, setSectors, v)} />
        <FilterGroup title="Batch" options={facets.batches} selected={batches} onToggle={(v) => toggle(batches, setBatches, v)} />
        <FilterGroup title="Stage" options={facets.stages} selected={stages} onToggle={(v) => toggle(stages, setStages, v)} />
        <FilterGroup title="Tags" options={facets.tags} selected={tags} onToggle={(v) => toggle(tags, setTags, v)} collapsible />
      </aside>

      {/* Results */}
      <div className="min-w-0">
        <div className="relative">
          <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies, founders, industries…"
            aria-label="Search companies"
            className="h-12 w-full rounded-lg border border-border bg-surface pl-11 pr-4 text-sm outline-none transition-colors focus:border-brand"
          />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span> {results.length === 1 ? "company" : "companies"}
          {q && <> matching &ldquo;{q}&rdquo;</>}
        </p>

        <div className="mt-5 divide-y divide-border border-y border-border">
          {results.map((c) => (
            <CompanyRow key={c.slug} c={c} />
          ))}
        </div>

        {results.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-border p-16 text-center">
            <p className="font-medium">No companies match your search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or a different keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyRow({ c }: { c: ShowcaseProfile }) {
  return (
    <Link href={`/startups/${c.slug}`} className="group flex gap-5 py-6 transition-colors hover:bg-surface-2/60">
      <CompanyLogo name={c.name} src={c.logoUrl} className="h-14 w-14" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-lg font-bold tracking-tight group-hover:text-brand">{c.name}</h3>
          {c.batch && <span className="rounded bg-brand-subtle px-2 py-0.5 text-xs font-semibold text-brand">Batch {c.batch}</span>}
          {c.stage && <span className="text-xs font-medium text-muted-foreground">{c.stage}</span>}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {c.sector && <Tag>{c.sector}</Tag>}
          {c.tags.slice(0, 3).map((t) => <Tag key={t} muted>{t}</Tag>)}
          {c.location && <span className="text-xs text-muted-foreground">· {c.location}</span>}
        </div>

        {c.founders.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Founders:</span>{" "}
            {c.founders.map((f) => f.name).join(", ")}
          </p>
        )}
      </div>
      {c.funding && (
        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-xs text-muted-foreground">Funding</div>
          <div className="text-sm font-semibold">{c.funding}</div>
        </div>
      )}
    </Link>
  );
}

function Tag({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${muted ? "border-border text-muted-foreground" : "border-brand/30 bg-brand-subtle text-brand"}`}>
      {children}
    </span>
  );
}

function FilterGroup({
  title, options, selected, onToggle, collapsible,
}: {
  title: string; options: string[]; selected: string[]; onToggle: (v: string) => void; collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (options.length === 0) return null;
  const shown = collapsible && !expanded ? options.slice(0, 6) : options;

  return (
    <div className="mt-7">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <div className="mt-3 space-y-1.5">
        {shown.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(o)}
              onChange={() => onToggle(o)}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            <span className={selected.includes(o) ? "font-medium text-foreground" : "text-muted-foreground"}>{o}</span>
          </label>
        ))}
      </div>
      {collapsible && options.length > 6 && (
        <button onClick={() => setExpanded((e) => !e)} className="mt-2 text-xs font-medium text-brand hover:underline">
          {expanded ? "Show less" : `Show all ${options.length}`}
        </button>
      )}
    </div>
  );
}
