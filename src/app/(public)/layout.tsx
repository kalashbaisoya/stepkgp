import Link from "next/link";
import { getNavigation } from "@/modules/cms/service";

// Public shell — YC-inspired: minimal, high-contrast, orange accent.
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" className="h-8 w-8 object-contain" />
            <span className="text-[15px] font-bold tracking-tight">
              STEP<span className="text-brand">.</span>
              <span className="ml-1.5 font-medium text-muted-foreground">IIT Kharagpur</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            {primary.map((item) => (
              <Link key={item.id} href={item.href} className="font-medium text-foreground/80 transition-colors hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm font-medium text-foreground/80 transition-colors hover:text-brand sm:block">
              Sign in
            </Link>
            <Link
              href="/apply"
              className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              Apply
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border bg-surface-2">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="" className="h-9 w-9 object-contain" />
              <span className="text-[15px] font-bold tracking-tight">
                STEP<span className="text-brand">.</span> IIT Kharagpur
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Science &amp; Technology Entrepreneurs&rsquo; Park — India&rsquo;s pioneering technology
              incubator, backing founders out of IIT Kharagpur since 1986.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              IIT Kharagpur, West Bengal 721302, India<br />
              <a href="tel:+913222281090" className="hover:text-foreground">+91-3222-281090</a> ·{" "}
              <a href="mailto:info@stepiitkgp.org" className="hover:text-foreground">info@stepiitkgp.org</a>
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">Explore</div>
            <nav className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
              {footer.map((item) => (
                <Link key={item.id} href={item.href} className="hover:text-brand">{item.label}</Link>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">Founders</div>
            <nav className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/apply" className="hover:text-brand">Apply to STEP</Link>
              <Link href="/startups" className="hover:text-brand">Portfolio</Link>
              <Link href="/auth/register" className="hover:text-brand">Create account</Link>
              <Link href="/auth/login" className="hover:text-brand">Sign in</Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} STEP, IIT Kharagpur. All rights reserved.</span>
            <span>Supported by DST · IDBI · IFCI · ICICI · NSTEDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
