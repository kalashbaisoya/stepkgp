import Link from "next/link";
import { getNavigation } from "@/modules/cms/service";
import { getCurrentUser } from "@/lib/auth/session";
import { roleLandingPath } from "@/lib/rbac/guard";

// Public shell. Claymorphism: soft raised surfaces on warm paper, orange accent.
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [primary, footer, user] = await Promise.all([
    getNavigation("primary"),
    getNavigation("footer"),
    getCurrentUser(),
  ]);

  // Apply always ends up inside the app. Signed out, that means signing up
  // first and being carried through to the same place afterwards.
  const applyHref = user ? "/app" : "/auth/register?next=%2Fapp";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="clay mx-auto flex h-16 max-w-7xl items-center justify-between px-4 backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" className="clay-sm h-9 w-9 object-contain p-1" />
            <span className="text-[15px] font-bold tracking-tight">
              STEP<span className="text-brand">.</span>
              <span className="ml-1.5 font-medium text-muted-foreground">IIT Kharagpur</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm lg:flex">
            {primary.map((item) => (
              <Link key={item.id} href={item.href} className="font-medium text-foreground/80 transition-colors hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                href={roleLandingPath(user)}
                className="hidden text-sm font-medium text-foreground/80 transition-colors hover:text-brand sm:block"
              >
                {user.name?.split(" ")[0] ?? "Dashboard"}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden text-sm font-medium text-foreground/80 transition-colors hover:text-brand sm:block"
              >
                Sign in
              </Link>
            )}
            <Link href={applyHref} className="clay-btn clay-primary h-10 px-5 text-sm">
              Apply
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-16 rounded-t-[2rem] bg-surface-2 shadow-[inset_0_3px_6px_-2px_var(--clay-shade)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="" className="clay-sm h-10 w-10 object-contain p-1" />
              <span className="text-[15px] font-bold tracking-tight">
                STEP<span className="text-brand">.</span> IIT Kharagpur
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Science &amp; Technology Entrepreneurs&rsquo; Park. India&rsquo;s pioneering technology
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
              <Link href="/playground" className="hover:text-brand">Startup Playground</Link>
              <Link href="/auth/login" className="hover:text-brand">Sign in</Link>
            </nav>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">Government Policies &amp; SOPs</div>
            <nav className="mt-5 flex flex-col gap-2.5 text-xs text-muted-foreground">
              <a href="https://startup.gujarat.gov.in/policy/standard-operating-procedure" target="_blank" rel="noreferrer" className="hover:text-brand flex items-center gap-1">
                <span>🦁</span> Gujarat Policies &amp; SOPs (1-5)
              </a>
              <a href="https://startinup.up.gov.in/" target="_blank" rel="noreferrer" className="hover:text-brand flex items-center gap-1">
                <span>🟢</span> StartInUP Uttar Pradesh
              </a>
              <a href="https://www.startupindia.gov.in/" target="_blank" rel="noreferrer" className="hover:text-brand flex items-center gap-1">
                <span>🇮🇳</span> Startup India DPIIT Grants
              </a>
              <a href="https://nidhi.dst.gov.in/" target="_blank" rel="noreferrer" className="hover:text-brand flex items-center gap-1">
                <span>🎯</span> DST NIDHI (PRAYAS, EIR, SSP)
              </a>
              <a href="https://msh.meity.gov.in/" target="_blank" rel="noreferrer" className="hover:text-brand flex items-center gap-1">
                <span>💻</span> MeitY Startup Hub (SAMRIDH)
              </a>
              <a href="https://www.indiascienceandtechnology.gov.in/" target="_blank" rel="noreferrer" className="hover:text-brand flex items-center gap-1">
                <span>🔬</span> India Science &amp; Tech (ISTI)
              </a>
              <a href="/api/search/gujarat-sitemap" target="_blank" rel="noreferrer" className="clay-chip clay-plain mt-2 self-start text-[11px] transition-transform hover:-translate-y-0.5">
                🗺️ Portal Sitemaps &amp; API Feeds ↗
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t border-border/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} STEP, IIT Kharagpur. All rights reserved.</span>
            <span>Supported by DST · IDBI · IFCI · ICICI · NSTEDB · DPIIT · MeitY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
