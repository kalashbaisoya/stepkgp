import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedShowcase } from "@/modules/directory/service";

export const metadata: Metadata = {
  title: "Startups",
  description: "Startups incubated at STEP, IIT Kharagpur.",
};

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector } = await searchParams;
  const { profiles, sectors } = await listPublishedShowcase();
  const filtered = sector ? profiles.filter((p) => p.sector === sector) : profiles;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Our startups</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Ventures incubated at STEP, IIT Kharagpur — building deep-tech since 1986.
      </p>

      {sectors.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/startups" className={`rounded-full border px-3 py-1 text-sm ${!sector ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted"}`}>
            All
          </Link>
          {sectors.map((s) => (
            <Link key={s} href={`/startups?sector=${encodeURIComponent(s)}`} className={`rounded-full border px-3 py-1 text-sm capitalize ${sector === s ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {s}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/startups/${p.slug}`} className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logoUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">{p.name.charAt(0)}</span>
              )}
            </div>
            <h2 className="mt-3 font-semibold group-hover:text-brand">{p.name}</h2>
            {p.sector && <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.sector}</p>}
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {profiles.length === 0 ? "The startup directory will appear here as startups graduate." : "No startups in this sector."}
        </p>
      )}
    </div>
  );
}
