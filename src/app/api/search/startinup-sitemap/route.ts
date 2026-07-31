import { NextResponse } from "next/server";
import { getStartInUPSitemap } from "@/modules/search/startinup-sitemap";

export async function GET() {
  try {
    const sitemapData = getStartInUPSitemap();
    return NextResponse.json(sitemapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch StartInUP sitemap" }, { status: 500 });
  }
}
