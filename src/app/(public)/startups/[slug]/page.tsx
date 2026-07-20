import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getShowcaseBySlug } from "@/modules/directory/service";
import { CompanyLogo } from "@/components/directory/company-logo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getShowcaseBySlug(slug);
  return p ? { title: p.name, description: p.description } : { title: "Company" };
}

export default async function StartupProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getShowcaseBySlug(slug);
  if (!p) notFound();

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border bg-surface-2">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link href="/startups" className="text-sm font-medium text-muted-foreground hover:text-brand">
            ← All companies
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <CompanyLogo name={p.name} src={p.logoUrl} className="h-20 w-20" />
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-extrabold tracking-tight">{p.name}</h1>
              <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {p.sector && <Chip accent>{p.sector}</Chip>}
                {p.batch && <Chip accent>Batch {p.batch}</Chip>}
                {p.stage && <Chip>{p.stage}</Chip>}
                {p.tags.map((t) => <Chip key={t}>{t}</Chip>)}
              </div>
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-10 items-center rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  Visit website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-12">
          {p.founders.length > 0 && (
            <Section title="Founders">
              <div className="grid gap-4 sm:grid-cols-2">
                {p.founders.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand">
                      {f.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{f.name}</div>
                      {f.role && <div className="truncate text-sm text-muted-foreground">{f.role}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {p.achievements.length > 0 && (
            <Section title="Highlights">
              <ul className="space-y-2.5">
                {p.achievements.map((a, i) => (
                  <li key={i} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {p.gallery.length > 0 && (
            <Section title="Gallery">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.gallery.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="aspect-video w-full rounded-lg border border-border object-cover" />
                ))}
              </div>
            </Section>
          )}

          {p.videos.length > 0 && (
            <Section title="Videos">
              <ul className="space-y-1.5">
                {p.videos.map((v, i) => (
                  <li key={i}><a href={v} target="_blank" rel="noopener noreferrer" className="link-accent text-sm">{v}</a></li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Sidebar facts */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Fact label="Industry" value={p.sector} />
              <Fact label="Batch" value={p.batch} />
              <Fact label="Stage" value={p.stage} />
              <Fact label="Funding" value={p.funding} />
              <Fact label="Location" value={p.location} />
            </dl>
            {p.socials.length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Links</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.socials.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded border border-border px-2.5 py-1 text-xs font-medium hover:border-brand hover:text-brand">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded border px-2.5 py-1 text-xs font-medium ${accent ? "border-brand/30 bg-brand-subtle text-brand" : "border-border text-muted-foreground"}`}>
      {children}
    </span>
  );
}
