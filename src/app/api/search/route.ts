import { NextResponse } from "next/server";
import { searchPlatform } from "@/modules/search/service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const state = searchParams.get("state") || undefined;

    const searchResult = await searchPlatform(q, state);
    return NextResponse.json(searchResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
