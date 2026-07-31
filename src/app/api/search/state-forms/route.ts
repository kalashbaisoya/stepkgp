import { NextResponse } from "next/server";
import { getDirectFormsAndPDFsForState } from "@/modules/search/state-forms-registry";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state") || undefined;

    const formsAndPDFs = getDirectFormsAndPDFsForState(state);
    return NextResponse.json({
      state: state || "All States & Central",
      count: formsAndPDFs.length,
      formsAndPDFs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch state forms and PDFs" }, { status: 500 });
  }
}
