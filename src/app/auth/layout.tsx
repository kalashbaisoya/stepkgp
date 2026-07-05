import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-2 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-sm font-semibold uppercase tracking-widest text-brand"
      >
        STEP · IIT Kharagpur
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        {children}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Science &amp; Technology Entrepreneurs&rsquo; Park, IIT Kharagpur
      </p>
    </div>
  );
}
