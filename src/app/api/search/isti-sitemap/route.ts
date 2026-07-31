import { NextResponse } from "next/server";
import { getISTIPortalSitemap } from "@/modules/search/isti-sitemap";

export async function GET() {
  try {
    const sitemapData = getISTIPortalSitemap();
    return NextResponse.json(sitemapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch ISTI sitemap" }, { status: 500 });
  }
}
