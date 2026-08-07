import Link from "next/link";
import type { Metadata } from "next";
import { getOpenCycle, getRequirementsForCategory } from "@/modules/cycles/service";

export const metadata: Metadata = { title: "Apply" };

// Open/closed state is time-sensitive: evaluate per request, not at build.
export const dynamic = "force-dynamic";

// Apply landing (Phase 7). Shows the open cycle, eligible categories, and the
// document checklist per category. The wizard itself launches in Milestone 5.
export default async function ApplyPage() {
  const cycle = await getOpenCycle();

  if (!cycle) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Applications are closed</h1>
        <p className="mt-4 text-muted-foreground">
          There is no open cohort right now. Create an account and we&rsquo;ll notify you when the
          next cycle opens.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/auth/register?next=%2Fapp" className="inline-flex h-11 items-center rounded-md bg-brand px-5 font-medium text-brand-foreground hover:opacity-90">Create account</Link>
        </div>
      </div>
    );
  }

  // Document checklist per eligible category.
  const perCategory = await Promise.all(
    cycle.categories.map(async (c) => ({
      ...c,
      docs: await getRequirementsForCategory(c.key),
    })),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-widest text-status-success">
        Applications open
      </span>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{cycle.name || `${cycle.year} Cohort`}</h1>
      {cycle.closesAt && (
        <p className="mt-2 text-muted-foreground">
          Closes {new Date(cycle.closesAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      )}

      <h2 className="mt-10 text-lg font-semibold">Who can apply</h2>
      <div className="mt-4 space-y-4">
        {perCategory.map((cat) => (
          <div key={cat.key} className="clay p-5">
            <h3 className="font-medium">{cat.name}</h3>
            {cat.docs.length > 0 ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">You&rsquo;ll need to upload:</p>
                <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                  {cat.docs.map((d) => (
                    <li key={d.key}>
                      {d.label}
                      {d.required ? "" : " (optional)"}
                      {d.allowedTypes.length > 0 && (
                        <span className="text-xs"> · {d.allowedTypes.join(", ")} · ≤{d.maxSizeMb}MB</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No documents required.</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/auth/register?next=%2Fapp" className="inline-flex h-12 items-center rounded-md bg-brand px-6 text-base font-medium text-brand-foreground hover:opacity-90">
          Create account &amp; apply
        </Link>
        <Link href="/auth/login?next=%2Fapp" className="inline-flex h-12 items-center clay-sm px-6 text-base font-medium hover:bg-muted">
          Log in
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        The full online application wizard opens in Milestone 5.
      </p>
    </div>
  );
}
