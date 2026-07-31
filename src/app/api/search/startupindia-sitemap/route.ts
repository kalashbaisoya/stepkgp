import { NextResponse } from "next/server";
import { getStartupIndiaSitemap } from "@/modules/search/startupindia-sitemap";

export async function GET() {
  try {
    const sitemapData = getStartupIndiaSitemap();
    return NextResponse.json(sitemapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch Startup India sitemap" }, { status: 500 });
  }
}
