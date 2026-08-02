import Link from "next/link";
import type { Block, BlockType } from "@/modules/cms/blocks";
import { listFeaturedShowcase } from "@/modules/directory/service";
import { CompanyLogo } from "@/components/directory/company-logo";
import { HeroCarousel } from "./hero-carousel";

// Public block renderer. Claymorphism: soft raised surfaces, orange accent.
// Unknown block types are skipped. Some blocks read live data (async server components).

function get<T = string>(data: Record<string, unknown>, key: string): T | undefined {
  return data[key] as T | undefined;
}

function PrimaryCta({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link href={href} className="clay-btn clay-primary h-12 px-7 text-sm">
      {label}
    </Link>
  );
}
function GhostCta({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link href={href} className="clay-btn clay-plain h-12 px-7 text-sm">
      {label}
    </Link>
  );
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow?: string; title?: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <span className="clay-chip clay-soft text-[11px] uppercase tracking-widest">{eyebrow}</span>}
      {title && <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
      {subtitle && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Hero({ data }: { data: Record<string, unknown> }) {
  const stats = (get<{ value: string; label: string }[]>(data, "stats")) ?? [];
  return (
    <section className="relative overflow-hidden">
      <div className="clay-blobs absolute inset-0" aria-hidden />
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <span className="reveal clay-chip clay-soft text-[11px] uppercase tracking-widest">{get(data, "eyebrow")}</span>
          <h1 className="reveal mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-7xl" style={{ animationDelay: "60ms" }}>
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
          <div className="reveal mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "240ms" }}>
            {stats.map((s, i) => (
              <div key={i} className="clay p-6">
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
    <section className="bg-surface-2 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="clay p-6">
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
      <div className="clay p-8 sm:p-10">
        <h2 className="text-3xl font-extrabold tracking-tight">{get(data, "title")}</h2>
        <div className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{get(data, "body")}</div>
      </div>
    </section>
  );
}

async function FeaturedStartups({ data }: { data: Record<string, unknown> }) {
  const profiles = await listFeaturedShowcase();
  const featured = profiles.slice(0, 6);
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow={get(data, "eyebrow") ?? "Portfolio"} title={get(data, "title") ?? "Companies built at STEP"} subtitle={get(data, "subtitle")} />
          <Link href="/startups" className="text-sm font-semibold text-brand hover:underline">See all companies →</Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link key={p.slug} href={`/startups/${p.slug}`} className="clay clay-hover group p-6">
              <div className="flex items-center gap-4">
                <CompanyLogo name={p.name} src={p.logoUrl} className="clay-sm h-12 w-12 p-1" />
                <div className="min-w-0">
                  <h3 className="truncate font-bold group-hover:text-brand">{p.name}</h3>
                  {p.sector && <p className="truncate text-xs text-muted-foreground">{p.sector}</p>}
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                {p.batch && <span className="clay-chip clay-soft text-[11px]">Batch {p.batch}</span>}
                {p.funding && <span className="font-medium text-muted-foreground">{p.funding}</span>}
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <p className="clay-inset col-span-full p-12 text-center text-muted-foreground">Companies appear here as they graduate.</p>
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
    <section className="bg-surface-2">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow={get(data, "eyebrow") ?? "Founders"} title={get(data, "title") ?? "What founders say"} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((t, i) => (
            <figure key={i} className="clay clay-hover flex flex-col p-7">
              <span className="text-3xl font-extrabold leading-none text-brand" aria-hidden>&ldquo;</span>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                <span className="clay-sm clay-soft flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
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
  const TINTS = ["clay-soft", "clay-sky", "clay-mint", "clay-lilac", "clay-sun", "clay-rose"];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow={get(data, "eyebrow") ?? "What we offer"} title={get(data, "title")} subtitle={get(data, "subtitle")} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="clay clay-hover p-7">
              <div className={`clay-sm ${TINTS[i % TINTS.length]} flex h-10 w-10 items-center justify-center text-sm font-bold`}>
                {String(i + 1).padStart(2, "0")}
              </div>
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
  const TINTS = ["clay-plain", "clay-soft", "clay-sky", "clay-mint", "clay-lilac", "clay-sun", "clay-rose"];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead title={get(data, "title") ?? "Sectors we back"} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {items.map((s, i) => (
            <span key={i} className={`clay-chip ${TINTS[i % TINTS.length]} px-4 py-2 text-sm`}>{s.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ year: string; title: string; body?: string }[]>(data, "items")) ?? [];
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-24">
        <SectionHead title={get(data, "title") ?? "Our journey"} />
        <ol className="mt-10 space-y-5 pl-8">
          {items.map((it, i) => (
            <li key={i} className="clay relative p-6">
              <span className="clay-sm clay-primary absolute left-[-1.35rem] top-7 h-6 w-6 rounded-full" />
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
    <section className="bg-surface-2">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="clay flex flex-col gap-8 p-8 sm:flex-row sm:p-10">
          <div className="clay-sm h-24 w-24 shrink-0 overflow-hidden rounded-full">
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
            <span className="clay-chip clay-soft text-[11px] uppercase tracking-widest">{get(data, "heading")}</span>
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
    <section className="py-14">
      <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">{get(data, "title") ?? "Supported by"}</p>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex w-max gap-5 px-8">
          {loop.map((p, i) => (
            <span key={i} className="clay-sm shrink-0 px-6 py-3 text-lg font-bold text-muted-foreground">{p.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ q: string; a: string }[]>(data, "items")) ?? [];
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-24">
        <SectionHead title={get(data, "title")} />
        <div className="mt-8 space-y-3">
          {items.map((it, i) => (
            <details key={i} className="clay group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {it.q}
                <span className="clay-sm clay-soft flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-transform group-open:rotate-45">+</span>
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
    <section>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead title={get(data, "title") ?? "Get in touch"} />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="clay clay-hover p-6">
              <span className="clay-chip clay-soft text-[11px] uppercase tracking-widest">{it.label}</span>
              <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(it.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="px-6 py-16">
      <div className="clay-lg clay-dark mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{get(data, "heading")}</h2>
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
