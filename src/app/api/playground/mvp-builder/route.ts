import { NextResponse } from "next/server";
import { generateMVPSpec } from "@/modules/playground/mvp-builder";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ideaState } = body;

    if (!ideaState || !ideaState.title || !ideaState.problemStatement) {
      return NextResponse.json({ error: "Missing required ideaState fields" }, { status: 400 });
    }

    const mvpSpec = generateMVPSpec(ideaState);
    return NextResponse.json(mvpSpec);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate MVP specification" }, { status: 500 });
  }
}
