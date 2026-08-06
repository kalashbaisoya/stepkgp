import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { putObject, getObject } from "@/lib/storage/storage";

/**
 * Uploads for public site imagery (startup logos, gallery shots).
 *
 * Distinct from ApplicationDocument, which is private and served behind an
 * authorization check. These are meant to be visible to anonymous visitors on
 * the homepage, so they get their own public serving route.
 */

export class MediaError extends Error {}

/**
 * SVG is deliberately absent: it is an XML document that can carry <script>,
 * and we serve these from our own origin, so an uploaded SVG would run as
 * same-origin JavaScript. Raster only.
 */
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_BYTES = 5 * 1024 * 1024;

/** On-disk prefix. Not part of the public URL. */
const MEDIA_PREFIX = "media";

/** Magic bytes, so a .png that is really something else is rejected. */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  const riff = buf.subarray(0, 4).toString("ascii");
  const webp = buf.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && buf.subarray(8, 12).toString("ascii").startsWith("avif"))
    return "image/avif";
  return null;
}

export async function uploadImage(file: { name: string; type: string; buffer: Buffer }, alt?: string) {
  if (file.buffer.length === 0) throw new MediaError("That file is empty.");
  if (file.buffer.length > MAX_BYTES) {
    throw new MediaError(`Image is ${(file.buffer.length / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`);
  }

  // Trust the bytes over the declared type or the extension.
  const actual = sniff(file.buffer);
  if (!actual || !ALLOWED[actual]) {
    throw new MediaError("Only PNG, JPEG, WebP, GIF or AVIF images can be uploaded.");
  }

  // The name is generated here and never derived from the uploaded filename, so
  // a crafted name cannot escape the media prefix. The prefix keeps uploads out
  // of the way of application documents on disk but stays out of the public URL.
  const name = `${randomUUID()}.${ALLOWED[actual]}`;
  await putObject(`${MEDIA_PREFIX}/${name}`, file.buffer);

  const asset = await db.mediaAsset.create({
    data: {
      url: `/api/media/${name}`,
      fileName: file.name.slice(0, 200),
      mimeType: actual,
      sizeBytes: file.buffer.length,
      alt: alt?.slice(0, 300) || null,
    },
  });

  return { url: asset.url, id: asset.id, mimeType: actual, sizeBytes: asset.sizeBytes };
}

/**
 * Read an asset back by its public name. The name must match a MediaAsset row
 * before anything touches disk, so an arbitrary path cannot be read even if it
 * survives the caller's own traversal check.
 */
export async function readImage(name: string) {
  const asset = await db.mediaAsset.findFirst({ where: { url: `/api/media/${name}` } });
  if (!asset) return null;
  return { buffer: await getObject(`${MEDIA_PREFIX}/${name}`), mimeType: asset.mimeType };
}

export function listMedia(limit = 60) {
  return db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
