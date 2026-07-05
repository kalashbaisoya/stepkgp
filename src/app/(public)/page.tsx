import { getPublishedPage } from "@/modules/cms/service";
import { BlockRenderer } from "@/components/cms/block-renderer";
import type { Block } from "@/modules/cms/blocks";

export default async function HomePage() {
  const page = await getPublishedPage("home");

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">STEP · IIT Kharagpur</h1>
        <p className="mt-4 text-muted-foreground">
          Homepage content has not been published yet. An administrator can publish it
          from the CMS.
        </p>
      </div>
    );
  }

  return <BlockRenderer blocks={page.blocks as Block[]} />;
}
