import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";

/**
 * Object-storage adapter (Phase 9 §6). Milestone 5 ships a local-filesystem
 * implementation for development; production swaps in an S3-compatible client
 * (R2/S3) behind the same interface — callers never change. Binaries never touch
 * the DB; only the returned storage key is persisted.
 */

const LOCAL_ROOT = join(process.cwd(), ".uploads");

export async function putObject(key: string, data: Buffer): Promise<{ key: string }> {
  if (process.env.STORAGE_BUCKET) {
    // TODO(prod): S3 PutObject via @aws-sdk/client-s3.
    throw new Error("S3 storage not yet configured");
  }
  const path = join(LOCAL_ROOT, key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
  return { key };
}

export async function getObject(key: string): Promise<Buffer> {
  if (process.env.STORAGE_BUCKET) {
    throw new Error("S3 storage not yet configured");
  }
  return readFile(join(LOCAL_ROOT, key));
}

/** URL through which a stored object is served (signed GET seam in production). */
export function objectUrl(key: string): string {
  return `/api/files/${key}`;
}
