import { NextResponse } from "next/server";
import { getDSTNIDHISitemap } from "@/modules/search/nidhi-sitemap";

export async function GET() {
  try {
    const sitemapData = getDSTNIDHISitemap();
    return NextResponse.json(sitemapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch DST NIDHI sitemap" }, { status: 500 });
  }
}
