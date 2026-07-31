import { NextResponse } from "next/server";
import { executeSingleNode } from "@/modules/playground/graph-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodeId, ideaState } = body;

    if (!nodeId || !ideaState || !ideaState.title || !ideaState.problemStatement) {
      return NextResponse.json({ error: "Missing required nodeId or ideaState input fields" }, { status: 400 });
    }

    const result = await executeSingleNode(Number(nodeId), ideaState);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to execute node" }, { status: 500 });
  }
}
