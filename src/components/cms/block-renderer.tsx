import Link from "next/link";
import type { Block, BlockType } from "@/modules/cms/blocks";

// Public block renderer. Given a published block array, renders each typed block.
// Unknown block types are skipped (forward-compatible with new block types).

function CtaLink({ href, label }: { href?: string; label?: string }) {
  if (!href || !label) return null;
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-6 text-base font-medium text-brand-foreground transition-colors hover:opacity-90"
    >
      {label}
    </Link>
  );
}

function get<T = string>(data: Record<string, unknown>, key: string): T | undefined {
  return data[key] as T | undefined;
}

function Hero({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-brand">
        {get(data, "eyebrow")}
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        {get(data, "heading")}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        {get(data, "subheading")}
      </p>
      <div className="mt-10 flex justify-center">
        <CtaLink href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
      </div>
    </section>
  );
}

function RichText({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <h2 className="text-2xl font-semibold tracking-tight">{get(data, "title")}</h2>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
        {get(data, "body")}
      </p>
    </section>
  );
}

function StatStrip({ data }: { data: Record<string, unknown> }) {
  const stats = (get<{ value: string; label: string }[]>(data, "stats")) ?? [];
  return (
    <section className="border-y border-border bg-surface-2">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-16 gap-y-6 px-6 py-10">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl font-semibold text-brand">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Facilities({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ title: string; body: string }[]>(data, "items")) ?? [];
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{get(data, "title")}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-medium">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShowcaseTeaser({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{get(data, "title")}</h2>
        <CtaLink href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-video rounded-xl border border-dashed border-border bg-surface-2" />
        ))}
      </div>
    </section>
  );
}

function DirectorMessage({ data }: { data: Record<string, unknown> }) {
  const photo = get(data, "photoUrl");
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{get(data, "heading")}</h2>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface-2">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo as string} alt={String(get(data, "name") ?? "")} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <blockquote className="text-lg italic text-muted-foreground">
          &ldquo;{get(data, "quote")}&rdquo;
          <footer className="mt-3 text-sm not-italic text-foreground">
            — {get(data, "name")}, {get(data, "role")}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

function Partners({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ name: string }[]>(data, "items")) ?? [];
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="text-2xl font-semibold tracking-tight">{get(data, "title")}</h2>
      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 text-muted-foreground">
        {items.map((p, i) => (
          <span key={i} className="text-lg font-medium">{p.name}</span>
        ))}
      </div>
    </section>
  );
}

function Faq({ data }: { data: Record<string, unknown> }) {
  const items = (get<{ q: string; a: string }[]>(data, "items")) ?? [];
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{get(data, "title")}</h2>
      <dl className="mt-6 divide-y divide-border">
        {items.map((it, i) => (
          <div key={i} className="py-4">
            <dt className="font-medium">{it.q}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{it.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Cta({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="bg-surface-2">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">{get(data, "heading")}</h2>
        <div className="mt-8 flex justify-center">
          <CtaLink href={get(data, "ctaHref")} label={get(data, "ctaLabel")} />
        </div>
      </div>
    </section>
  );
}

const REGISTRY: Record<BlockType, (p: { data: Record<string, unknown> }) => React.ReactNode> = {
  hero: Hero,
  richtext: RichText,
  statStrip: StatStrip,
  facilities: Facilities,
  showcaseTeaser: ShowcaseTeaser,
  directorMessage: DirectorMessage,
  partners: Partners,
  faq: Faq,
  cta: Cta,
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const Comp = REGISTRY[block.type];
          if (!Comp) return null;
          return <Comp key={block.id} data={block.data} />;
        })}
    </>
  );
}
