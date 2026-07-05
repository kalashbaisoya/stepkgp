import type { Metadata } from "next";

export const metadata: Metadata = { title: "Startups" };

// Placeholder public directory. Milestone 9 renders published graduated startups
// (logo, founders, sector, funding, gallery) with sector filters.
export default function StartupsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Our startups</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        STEP has nurtured 100+ ventures since 1986. The public startup directory
        launches in Milestone 9.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded-xl border border-dashed border-border bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}
