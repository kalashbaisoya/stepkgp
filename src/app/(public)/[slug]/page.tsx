import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPage } from "@/modules/cms/service";
import { BlockRenderer } from "@/components/cms/block-renderer";
import type { Block } from "@/modules/cms/blocks";

// Generic CMS page (about, contact, programs, …). Explicit routes (/auth, /app,
// /startups, /apply) take precedence over this dynamic segment.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  return { title: page?.title ?? "Page" };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();
  return (
    <article>
      <BlockRenderer blocks={page.blocks as Block[]} />
    </article>
  );
}
