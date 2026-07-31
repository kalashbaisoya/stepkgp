import { NextResponse } from "next/server";
import { searchPoliciesAndSOPs, syncGujaratStartupPoliciesFromWeb } from "@/modules/search/policies-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const state = searchParams.get("state") || undefined;
    const type = (searchParams.get("type") as "all" | "scheme" | "sop") || "all";

    const policies = await searchPoliciesAndSOPs(q, state, type);
    return NextResponse.json({
      sources: [
        "https://startup.gujarat.gov.in/policy/startup-policies",
        "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
      ],
      total: policies.length,
      policies,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Policy search failed" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const syncResult = await syncGujaratStartupPoliciesFromWeb();
    return NextResponse.json(syncResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Policy sync failed" }, { status: 500 });
  }
}
