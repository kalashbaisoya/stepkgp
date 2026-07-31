import { NextResponse } from "next/server";
import { getNationalAndStatePortalRegistry } from "@/modules/search/national-portal-registry";

export async function GET() {
  try {
    const data = getNationalAndStatePortalRegistry();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch national and state portal registry" }, { status: 500 });
  }
}
