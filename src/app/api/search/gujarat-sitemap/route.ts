import { NextResponse } from "next/server";
import { getGujaratSitemap } from "@/modules/search/gujarat-sitemap";

export async function GET() {
  try {
    const sitemapData = getGujaratSitemap();
    return NextResponse.json(sitemapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch sitemap" }, { status: 500 });
  }
}
