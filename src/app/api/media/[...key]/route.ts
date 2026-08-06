import { NextRequest, NextResponse } from "next/server";
import { readImage } from "@/modules/media/service";

/**
 * Serves uploaded site imagery to anyone, since these appear on public pages.
 *
 * Unlike /api/files, which gates ApplicationDocument behind an ownership check,
 * there is nothing private here. The key is still matched against a MediaAsset
 * row before touching disk, so this cannot be used to read arbitrary paths.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const storageKey = key.join("/");

  // Belt and braces: the DB lookup already constrains this, but reject traversal
  // outright rather than relying on a single check.
  if (storageKey.includes("..") || storageKey.includes("\\")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const asset = await readImage(storageKey);
    if (!asset) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(new Uint8Array(asset.buffer), {
      headers: {
        "Content-Type": asset.mimeType,
        // Content at a given key never changes: a new upload gets a new uuid.
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
