import { NextResponse } from "next/server";
import { executeFullGraphPipeline, getSavedGraphExecutions } from "@/modules/playground/graph-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ideaState } = body;

    if (!ideaState || !ideaState.title || !ideaState.problemStatement) {
      return NextResponse.json({ error: "Missing required ideaState fields" }, { status: 400 });
    }

    const result = await executeFullGraphPipeline(ideaState);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to execute full graph pipeline" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const executions = await getSavedGraphExecutions();
    return NextResponse.json(executions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch saved graph executions" }, { status: 500 });
  }
}
