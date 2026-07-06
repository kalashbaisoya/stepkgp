import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getShowcaseBySlug } from "@/modules/directory/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getShowcaseBySlug(slug);
  return p ? { title: p.name, description: p.description } : { title: "Startup" };
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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/startups" className="text-sm text-muted-foreground hover:text-foreground">← All startups</Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
          {p.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logoUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">{p.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            {p.sector && <span className="capitalize">{p.sector}</span>}
            {p.funding && <span>· {p.funding} raised</span>}
            {p.website && (
              <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                Visit site ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {p.description && <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{p.description}</p>}

      {p.founders.length > 0 && (
        <Section title="Founders">
          <div className="flex flex-wrap gap-4">
            {p.founders.map((f, i) => (
              <div key={i}>
                <p className="font-medium">{f.name}</p>
                {f.role && <p className="text-sm text-muted-foreground">{f.role}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {p.achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            {p.achievements.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </Section>
      )}

      {p.gallery.length > 0 && (
        <Section title="Gallery">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {p.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="aspect-video w-full rounded-lg object-cover" />
            ))}
          </div>
        </Section>
      )}

      {p.videos.length > 0 && (
        <Section title="Videos">
          <ul className="space-y-1">
            {p.videos.map((v, i) => (
              <li key={i}><a href={v} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">{v}</a></li>
            ))}
          </ul>
        </Section>
      )}

      {p.socials.length > 0 && (
        <Section title="Links">
          <div className="flex flex-wrap gap-3">
            {p.socials.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted">{s.label}</a>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
