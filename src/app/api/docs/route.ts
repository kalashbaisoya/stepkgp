import { NextResponse } from "next/server";
import { getLearningDocs, getLearningDocBySlug } from "@/modules/docs/service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");

    if (slug) {
      const doc = await getLearningDocBySlug(slug);
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      return NextResponse.json(doc);
    }

    const docs = await getLearningDocs(category || undefined);
    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch docs" }, { status: 500 });
  }
}
