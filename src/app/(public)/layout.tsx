import Link from "next/link";
import { getNavigation } from "@/modules/cms/service";

// Public shell (Phase 6 IA §2) — navigation + footer driven by the CMS.
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [primary, footer] = await Promise.all([
    getNavigation("primary"),
    getNavigation("footer"),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-brand">
            STEP · IIT-KGP
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {primary.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className="inline-flex h-9 items-center rounded-md bg-brand px-4 font-medium text-brand-foreground transition-colors hover:opacity-90"
            >
              Apply
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border bg-surface-2">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <div>
            <div className="font-semibold text-foreground">STEP · IIT Kharagpur</div>
            <p className="mt-1 max-w-sm">
              Science &amp; Technology Entrepreneurs&rsquo; Park — building deep-tech
              ventures since 1986.
            </p>
          </div>
          <nav className="flex flex-col gap-2">
            {footer.map((item) => (
              <Link key={item.id} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} STEP, IIT Kharagpur. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
