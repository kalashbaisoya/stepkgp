import Link from "next/link";
import type { Block, BlockType } from "@/modules/cms/blocks";
import { listPublishedShowcase } from "@/modules/directory/service";

// Premium public block renderer. Each block is a self-contained section. Unknown
// block types are skipped (forward-compatible). Some blocks (featuredStartups) are
// async server components that read live data.

function get<T = string>(data: Record<string, unknown>, key: string): T | undefined {
  return data[key] as T | undefined;
}

function PrimaryCta({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-brand-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {label}
    </Link>
  );
}
function GhostCta({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface/60 px-7 text-sm font-semibold backdrop-blur transition-colors hover:bg-muted"
    >
      {label}
    </Link>
  );
}

function GradientLogo({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-16 w-16 text-2xl" : size === "sm" ? "h-11 w-11 text-base" : "h-14 w-14 text-xl";
  return (
    <div className={`flex ${cls} shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand to-brand-accent font-bold text-white shadow-sm`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Hero({ data }: { data: Record<string, unknown> }) {
  const stats = (get<{ value: string; label: string }[]>(data, "stats")) ?? [];
  return (
    <section className="mesh relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-6 py-28 text-center sm:py-36">
        <span className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand backdrop-blur" style={{ animationDelay: "0ms" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
          {get(data, "eyebrow")}
        </span>
        <h1 className="reveal mx-auto mt-7 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl" style={{ animationDelay: "80ms" }}>
          {get(data, "heading")}
        </h1>
        <p className="reveal mx-auto mt-7 max-w-2xl text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: "160ms" }}>
          {get(data, "subheading")}
        </p>
        <div className="reveal mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
          <PrimaryCta href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
          <GhostCta href={get(data, "secondaryHref")} label={get(data, "secondaryLabel")} />
        </div>
        {stats.length > 0 && (
          <div className="reveal mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-x-12 gap-y-6" style={{ animationDelay: "320ms" }}>
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-semibold text-gradient">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatStrip({ data }: { data: Record<string, unknown> }) {
  const stats = (get<{ value: string; label: string }[]>(data, "stats")) ?? [];
  return (
    <section className="border-b border-border bg-surface-2">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-semibold text-gradient sm:text-5xl">{s.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RichText({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-3xl font-semibold tracking-tight">{get(data, "title")}</h2>
      <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{get(data, "body")}</p>
    </section>
  );
}

async function FeaturedStartups({ data }: { data: Record<string, unknown> }) {
  const { profiles } = await listPublishedShowcase();
  const featured = profiles.slice(0, 6);
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{get(data, "title") ?? "Featured startups"}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{get(data, "subtitle") ?? "A few of the ventures built at STEP."}</p>
        </div>
        <Link href="/startups" className="text-sm font-semibold text-brand hover:underline">View all startups →</Link>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <Link key={p.slug} href={`/startups/${p.slug}`} className="lift group rounded-2xl border border-border bg-surface p-6 hover:border-brand hover:shadow-md">
            <div className="flex items-center gap-4">
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logoUrl} alt={p.name} className="h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <GradientLogo name={p.name} />
              )}
              <div>
                <h3 className="font-semibold group-hover:text-brand">{p.name}</h3>
                {p.sector && <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.sector}</p>}
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
            {p.funding && <p className="mt-4 text-xs font-medium text-brand">{p.funding} raised</p>}
          </Link>
        ))}
        {featured.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Startups appear here as they graduate.</p>
        )}
      </div>
    </section>
  );
}

function Facilities({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ title: string; body: string }[]>(data, "items")) ?? [];
  return (
    <section className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{get(data, "title")}</h2>
        {get(data, "subtitle") && <p className="mt-2 max-w-xl text-muted-foreground">{get(data, "subtitle")}</p>}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="lift rounded-2xl border border-border bg-surface p-7 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-lg font-bold text-brand">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-5 text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sectors({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ name: string }[]>(data, "items")) ?? [];
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h2 className="text-3xl font-semibold tracking-tight">{get(data, "title") ?? "Sectors we back"}</h2>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {items.map((s, i) => (
          <span key={i} className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium capitalize text-muted-foreground">{s.name}</span>
        ))}
      </div>
    </section>
  );
}

function Timeline({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ year: string; title: string; body?: string }[]>(data, "items")) ?? [];
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">{get(data, "title") ?? "Our journey"}</h2>
      <ol className="mt-10 space-y-8 border-l border-border pl-8">
        {items.map((it, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[2.6rem] flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">•</span>
            <div className="text-sm font-semibold text-brand">{it.year}</div>
            <div className="mt-0.5 font-medium">{it.title}</div>
            {it.body && <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function DirectorMessage({ data }: { data: Record<string, unknown> }) {
  const photo = get(data, "photoUrl");
  return (
    <section className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <div className="h-28 w-28 shrink-0 rounded-full bg-linear-to-br from-brand to-brand-accent p-1">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo as string} alt={String(get(data, "name") ?? "")} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-brand">{String(get(data, "name") ?? "S").charAt(0)}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">{get(data, "heading")}</p>
              <blockquote className="mt-3 text-xl font-medium leading-relaxed sm:text-2xl">&ldquo;{get(data, "quote")}&rdquo;</blockquote>
              <footer className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{get(data, "name")}</span> · {get(data, "role")}
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Partners({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ name: string }[]>(data, "items")) ?? [];
  const loop = [...items, ...items];
  return (
    <section className="border-b border-border py-16">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">{get(data, "title") ?? "Supported by"}</p>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex w-max gap-16 px-8">
          {loop.map((p, i) => (
            <span key={i} className="text-2xl font-semibold text-muted-foreground/70">{p.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ q: string; a: string }[]>(data, "items")) ?? [];
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">{get(data, "title")}</h2>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((it, i) => (
          <details key={i} className="group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {it.q}
              <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact({ data }: { data: Record<string, unknown> }) {
  const items = [
    { label: "Address", value: get(data, "address") },
    { label: "Phone", value: get(data, "phone") },
    { label: "Email", value: get(data, "email") },
  ].filter((i) => i.value);
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">{get(data, "title") ?? "Get in touch"}</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">{it.label}</div>
            <div className="mt-2 text-sm text-muted-foreground">{String(it.value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="px-6 py-24">
      <div className="mesh relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border px-6 py-20 text-center">
        <div className="grid-bg absolute inset-0" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight">{get(data, "heading")}</h2>
          {get(data, "subheading") && <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{get(data, "subheading")}</p>}
          <div className="mt-8 flex justify-center gap-3">
            <PrimaryCta href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
          </div>
        </div>
      </div>
    </section>
  );
}

const REGISTRY: Record<string, (p: { data: Record<string, unknown> }) => React.ReactNode | Promise<React.ReactNode>> = {
  hero: Hero,
  statStrip: StatStrip,
  richtext: RichText,
  featuredStartups: FeaturedStartups,
  facilities: Facilities,
  sectors: Sectors,
  timeline: Timeline,
  showcaseTeaser: FeaturedStartups, // legacy alias
  directorMessage: DirectorMessage,
  partners: Partners,
  faq: Faq,
  contact: Contact,
  cta: Cta,
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const Comp = REGISTRY[block.type as BlockType | string];
          if (!Comp) return null;
          return <Comp key={block.id} data={block.data} />;
        })}
    </>
  );
}
