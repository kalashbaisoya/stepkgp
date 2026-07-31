import { NextResponse } from "next/server";
import { getMeitYMSHSitemap } from "@/modules/search/msh-sitemap";

export async function GET() {
  try {
    const sitemapData = getMeitYMSHSitemap();
    return NextResponse.json(sitemapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch MeitY MSH sitemap" }, { status: 500 });
  }
}
