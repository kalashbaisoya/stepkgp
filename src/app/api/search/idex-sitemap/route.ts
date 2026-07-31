import { NextResponse } from "next/server";
import { getIDEXDefenceSitemap } from "@/modules/search/idex-sitemap";

export async function GET() {
  try {
    const data = getIDEXDefenceSitemap();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch iDEX sitemap index" }, { status: 500 });
  }
}
