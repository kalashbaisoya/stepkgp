import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";
import type { Block, BlockType } from "./blocks";

const pageTag = (key: string) => `cms:page:${key}`;
const navTag = "cms:navigation";

/** Published page blocks for public rendering. Cached, tag-revalidated on publish. */
export function getPublishedPage(key: string) {
  return unstable_cache(
    async () => {
      const page = await db.page.findUnique({ where: { key } });
      if (!page || page.status !== "PUBLISHED" || !page.publishedBlocks) return null;
      return {
        key: page.key,
        title: page.title,
        blocks: page.publishedBlocks as unknown as Block[],
      };
    },
    ["cms-page", key],
    { tags: [pageTag(key)] },
  )();
}

/** Draft page (with editable blocks) for the admin editor. */
export async function getPageForEdit(key: string) {
  const page = await db.page.findUnique({
    where: { key },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!page) return null;
  return {
    id: page.id,
    key: page.key,
    title: page.title,
    status: page.status,
    publishedAt: page.publishedAt,
    blocks: page.blocks.map((b) => ({
      id: b.id,
      type: b.type as BlockType,
      data: b.data as Record<string, unknown>,
      order: b.order,
    })),
  };
}

export async function listPages() {
  return db.page.findMany({ orderBy: { key: "asc" }, select: { key: true, title: true, status: true, publishedAt: true } });
}

/** Replace a page's draft blocks (admin editor save). */
export async function savePageBlocks(
  key: string,
  blocks: { id?: string; type: BlockType; data: Record<string, unknown>; order: number }[],
  actorId?: string,
) {
  const page = await db.page.findUnique({ where: { key } });
  if (!page) throw new Error(`Unknown page: ${key}`);

  await db.$transaction([
    db.contentBlock.deleteMany({ where: { pageId: page.id } }),
    ...blocks.map((b, i) =>
      db.contentBlock.create({
        data: { pageId: page.id, type: b.type, data: b.data as object, order: i },
      }),
    ),
    db.page.update({ where: { id: page.id }, data: { status: page.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT" } }),
  ]);
  await audit({ actorId, action: "cms.draft_saved", targetType: "Page", targetId: page.id });
}

/** Publish current draft blocks: snapshot a version + copy to publishedBlocks + revalidate. */
export async function publishPage(key: string, actorId?: string) {
  const page = await db.page.findUnique({
    where: { key },
    include: { blocks: { orderBy: { order: "asc" } }, versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!page) throw new Error(`Unknown page: ${key}`);

  const snapshot = page.blocks.map((b) => ({ id: b.id, type: b.type, data: b.data, order: b.order }));
  const nextVersion = (page.versions[0]?.version ?? 0) + 1;

  await db.$transaction([
    db.contentVersion.create({
      data: { pageId: page.id, version: nextVersion, snapshot: snapshot as object, publishedBy: actorId ?? null },
    }),
    db.page.update({
      where: { id: page.id },
      data: { status: "PUBLISHED", publishedBlocks: snapshot as object, publishedAt: new Date() },
    }),
  ]);

  revalidateTag(pageTag(key));
  await audit({ actorId, action: "cms.published", targetType: "Page", targetId: page.id, after: { version: nextVersion } });
  return { version: nextVersion };
}

// ---- Navigation ----
export function getNavigation(location: "primary" | "footer") {
  return unstable_cache(
    async () => db.navigationItem.findMany({ where: { location }, orderBy: { order: "asc" } }),
    ["cms-nav", location],
    { tags: [navTag] },
  )();
}

// ---- Collections (public read) ----
export async function listCollectionItems(collectionKey: string) {
  const collection = await db.collection.findUnique({
    where: { key: collectionKey },
    include: { items: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } },
  });
  return collection?.items.map((i) => ({ slug: i.slug, data: i.data as Record<string, unknown> })) ?? [];
}
