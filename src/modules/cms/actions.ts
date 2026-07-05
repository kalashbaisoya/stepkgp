"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/guard";
import * as cms from "./service";
import { BLOCK_CATALOG, defaultBlockData, type BlockType } from "./blocks";

type EditorBlock = { id?: string; type: BlockType; data: Record<string, unknown>; order: number };

/** Save the editor's block list as the page draft. */
export async function saveBlocksAction(key: string, blocks: EditorBlock[]) {
  const user = await requirePermission("cms:write");
  // sanitize: only known block types
  const clean = blocks
    .filter((b) => b.type in BLOCK_CATALOG)
    .map((b, i) => ({ type: b.type, data: b.data ?? defaultBlockData(b.type), order: i }));
  await cms.savePageBlocks(key, clean, user.id);
  revalidatePath(`/admin/cms/pages/${key}`);
  return { ok: true };
}

/** Publish the page (requires cms:publish). */
export async function publishPageAction(key: string) {
  const user = await requirePermission("cms:publish");
  const res = await cms.publishPage(key, user.id);
  revalidatePath(`/admin/cms/pages/${key}`);
  return { ok: true, version: res.version };
}
