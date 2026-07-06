import Link from "next/link";
import { getNavigation } from "@/modules/cms/service";

// Premium public shell (Phase 6 IA §2) — navigation + footer driven by the CMS.
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
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand to-brand-accent text-sm font-bold text-white">S</span>
            <span className="text-sm uppercase tracking-widest">STEP · IIT-KGP</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm sm:flex">
            {primary.map((item) => (
              <Link key={item.id} href={item.href} className="font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
            <Link href="/auth/login" className="font-medium text-muted-foreground transition-colors hover:text-foreground">Sign in</Link>
            <Link href="/apply" className="inline-flex h-9 items-center rounded-full bg-brand px-5 font-semibold text-brand-foreground transition-opacity hover:opacity-90">
              Apply
            </Link>
          </nav>
          <Link href="/apply" className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground sm:hidden">Apply</Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border bg-surface-2">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand to-brand-accent text-sm font-bold text-white">S</span>
              STEP · IIT Kharagpur
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Science &amp; Technology Entrepreneurs&rsquo; Park — India&rsquo;s pioneering technology
              incubator, nurturing deep-tech ventures at IIT Kharagpur since 1986.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              STEP, IIT Kharagpur, West Bengal 721302<br />
              +91-3222-281090 · info@stepiitkgp.org
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Explore</div>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {footer.map((item) => (
                <Link key={item.id} href={item.href} className="hover:text-foreground">{item.label}</Link>
              ))}
            </nav>
          </div>
          <div>
            <div className="text-sm font-semibold">Get started</div>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/apply" className="hover:text-foreground">Apply</Link>
              <Link href="/auth/register" className="hover:text-foreground">Create account</Link>
              <Link href="/auth/login" className="hover:text-foreground">Sign in</Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} STEP, IIT Kharagpur. Supported by DST, IDBI, IFCI &amp; ICICI.
        </div>
      </footer>
    </div>
  );
}
