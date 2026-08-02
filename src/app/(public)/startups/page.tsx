import type { Metadata } from "next";
import { listPublishedShowcase } from "@/modules/directory/service";
import { CompanyDirectory } from "@/components/directory/company-directory";

export const metadata: Metadata = {
  title: "Companies",
  description: "Startups incubated at STEP, IIT Kharagpur, from deep-tech and agritech to fintech and SaaS.",
};

export default async function StartupsPage() {
  const { profiles, sectors, batches, stages, tags } = await listPublishedShowcase();

  return (
    <div>
      {/* Masthead */}
      <section className="relative border-b border-border bg-surface-2">
        <div className="grid-bg absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            STEP <span className="text-brand">companies</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Since 1986, STEP at IIT Kharagpur has helped founders turn research into companies,
            spanning agritech, deep-tech, fintech, materials and enterprise software.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
            <Stat value={`${profiles.length}`} label="Featured companies" />
            <Stat value="100+" label="Startups incubated" />
            <Stat value="1986" label="Founded" />
          </div>
        </div>
      </section>

      <CompanyDirectory companies={profiles} facets={{ sectors, batches, stages, tags }} />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
