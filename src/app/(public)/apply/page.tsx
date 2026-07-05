import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Apply" };

// Placeholder apply landing. Milestone 4/5 replace this with the open-cycle +
// eligibility view that launches the online application wizard.
export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Apply to STEP</h1>
      <p className="mt-4 text-muted-foreground">
        The fully online application opens in Milestone 5. Create your account now so
        you&rsquo;re ready when the cohort opens.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/auth/register"
          className="inline-flex h-11 items-center rounded-md bg-brand px-5 font-medium text-brand-foreground hover:opacity-90"
        >
          Create account
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex h-11 items-center rounded-md border border-border bg-surface px-5 font-medium hover:bg-muted"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
