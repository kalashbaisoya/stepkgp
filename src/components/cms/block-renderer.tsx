import Link from "next/link";
import type { Block, BlockType } from "@/modules/cms/blocks";
import { listFeaturedShowcase } from "@/modules/directory/service";
import { CompanyLogo } from "@/components/directory/company-logo";
import { HeroCarousel } from "./hero-carousel";

// Public block renderer — YC-inspired: minimal, high-contrast, orange accent.
// Unknown block types are skipped. Some blocks read live data (async server components).

function get<T = string>(data: Record<string, unknown>, key: string): T | undefined {
  return data[key] as T | undefined;
}

function PrimaryCta({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link href={href} className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-7 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover">
      {label}
    </Link>
  );
}
function GhostCta({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link href={href} className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-surface px-7 text-sm font-semibold transition-colors hover:bg-muted">
      {label}
    </Link>
  );
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow?: string; title?: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <div className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</div>}
      {title && <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
      {subtitle && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Hero({ data }: { data: Record<string, unknown> }) {
  const stats = (get<{ value: string; label: string }[]>(data, "stats")) ?? [];
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <span className="reveal text-xs font-bold uppercase tracking-widest text-brand">{get(data, "eyebrow")}</span>
          <h1 className="reveal mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl" style={{ animationDelay: "60ms" }}>
            {get(data, "heading")}
          </h1>
          <p className="reveal mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground" style={{ animationDelay: "120ms" }}>
            {get(data, "subheading")}
          </p>
          <div className="reveal mt-9 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <PrimaryCta href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
            <GhostCta href={get(data, "secondaryHref")} label={get(data, "secondaryLabel")} />
          </div>
        </div>
        {stats.length > 0 && (
          <div className="reveal mt-20 grid grid-cols-2 gap-8 border-t border-border pt-10 sm:grid-cols-4" style={{ animationDelay: "240ms" }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-4xl font-extrabold tracking-tight">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroCarouselBlock({ data }: { data: Record<string, unknown> }) {
  const slides = (get<{ src: string; caption?: string }[]>(data, "slides")) ?? [];
  return (
    <HeroCarousel
      eyebrow={get(data, "eyebrow")}
      heading={get(data, "heading")}
      subheading={get(data, "subheading")}
      ctaLabel={get(data, "ctaLabel")}
      ctaHref={get(data, "ctaHref")}
      secondaryLabel={get(data, "secondaryLabel")}
      secondaryHref={get(data, "secondaryHref")}
      slides={slides}
      stats={get<{ value: string; label: string }[]>(data, "stats") ?? []}
    />
  );
}

function StatStrip({ data }: { data: Record<string, unknown> }) {
  const stats = (get<{ value: string; label: string }[]>(data, "stats")) ?? [];
  return (
    <section className="border-b border-border bg-surface-2">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">{s.value}</div>
            <div className="mt-1.5 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RichText({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-3xl font-extrabold tracking-tight">{get(data, "title")}</h2>
      <div className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{get(data, "body")}</div>
    </section>
  );
}

async function FeaturedStartups({ data }: { data: Record<string, unknown> }) {
  const profiles = await listFeaturedShowcase();
  const featured = profiles.slice(0, 6);
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow={get(data, "eyebrow") ?? "Portfolio"} title={get(data, "title") ?? "Companies built at STEP"} subtitle={get(data, "subtitle")} />
          <Link href="/startups" className="text-sm font-semibold text-brand hover:underline">See all companies →</Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link key={p.slug} href={`/startups/${p.slug}`} className="lift group rounded-lg border border-border bg-surface p-6">
              <div className="flex items-center gap-4">
                <CompanyLogo name={p.name} src={p.logoUrl} className="h-12 w-12" />
                <div className="min-w-0">
                  <h3 className="truncate font-bold group-hover:text-brand">{p.name}</h3>
                  {p.sector && <p className="truncate text-xs text-muted-foreground">{p.sector}</p>}
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                {p.batch && <span className="rounded bg-brand-subtle px-2 py-0.5 font-semibold text-brand">Batch {p.batch}</span>}
                {p.funding && <span className="font-medium text-muted-foreground">{p.funding}</span>}
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <p className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">Companies appear here as they graduate.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ quote: string; name: string; role?: string; company?: string }[]>(data, "items")) ?? [];
  if (items.length === 0) return null;
  return (
    <section className="border-b border-border bg-surface-2">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow={get(data, "eyebrow") ?? "Founders"} title={get(data, "title") ?? "What founders say"} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((t, i) => (
            <figure key={i} className="flex flex-col rounded-lg border border-border bg-surface p-7">
              <span className="text-3xl font-extrabold leading-none text-brand" aria-hidden>&ldquo;</span>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-xs font-bold text-brand">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{t.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{[t.role, t.company].filter(Boolean).join(", ")}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Facilities({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ title: string; body: string }[]>(data, "items")) ?? [];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow={get(data, "eyebrow") ?? "What we offer"} title={get(data, "title")} subtitle={get(data, "subtitle")} />
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={i}>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-subtle text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-4 text-lg font-bold">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
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
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead title={get(data, "title") ?? "Sectors we back"} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {items.map((s, i) => (
            <span key={i} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium">{s.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ year: string; title: string; body?: string }[]>(data, "items")) ?? [];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <SectionHead title={get(data, "title") ?? "Our journey"} />
        <ol className="mt-10 space-y-9 border-l-2 border-border pl-8">
          {items.map((it, i) => (
            <li key={i} className="relative">
              <span className="absolute left-[-2.3rem] mt-1 h-3 w-3 rounded-full border-2 border-background bg-brand" />
              <div className="text-sm font-bold text-brand">{it.year}</div>
              <div className="mt-1 text-lg font-bold">{it.title}</div>
              {it.body && <p className="mt-1.5 leading-relaxed text-muted-foreground">{it.body}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function DirectorMessage({ data }: { data: Record<string, unknown> }) {
  const photo = get(data, "photoUrl");
  return (
    <section className="border-b border-border bg-surface-2">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo as string} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand">
                {String(get(data, "name") ?? "S").charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-brand">{get(data, "heading")}</div>
            <blockquote className="mt-4 text-2xl font-medium leading-relaxed tracking-tight">
              &ldquo;{get(data, "quote")}&rdquo;
            </blockquote>
            <footer className="mt-5 text-sm">
              <span className="font-bold">{get(data, "name")}</span>
              <span className="text-muted-foreground"> · {get(data, "role")}</span>
            </footer>
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
    <section className="border-b border-border py-14">
      <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">{get(data, "title") ?? "Supported by"}</p>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex w-max gap-16 px-8">
          {loop.map((p, i) => (
            <span key={i} className="text-xl font-bold text-muted-foreground/60">{p.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ q: string; a: string }[]>(data, "items")) ?? [];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <SectionHead title={get(data, "title")} />
        <div className="mt-8 divide-y divide-border border-y border-border">
          {items.map((it, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {it.q}
                <span className="shrink-0 text-xl text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{it.a}</p>
            </details>
          ))}
        </div>
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
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead title={get(data, "title") ?? "Get in touch"} />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-brand">{it.label}</div>
              <div className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{String(it.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{get(data, "heading")}</h2>
        {get(data, "subheading") && <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">{get(data, "subheading")}</p>}
        <div className="mt-9 flex justify-center">
          <PrimaryCta href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
        </div>
      </div>
    </section>
  );
}

const REGISTRY: Record<string, (p: { data: Record<string, unknown> }) => React.ReactNode | Promise<React.ReactNode>> = {
  hero: Hero,
  heroCarousel: HeroCarouselBlock,
  statStrip: StatStrip,
  richtext: RichText,
  featuredStartups: FeaturedStartups,
  showcaseTeaser: FeaturedStartups, // legacy alias
  testimonials: Testimonials,
  facilities: Facilities,
  sectors: Sectors,
  timeline: Timeline,
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
