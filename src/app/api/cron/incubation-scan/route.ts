import { NextRequest, NextResponse } from "next/server";
import { runElevenMonthScan } from "@/modules/incubation/service";

// Scheduled 11-month incubation scan (Phase 9 scheduler). Invoke from a platform
// cron (e.g. Vercel Cron) with `Authorization: Bearer <CRON_SECRET>`. Idempotent:
// only flags incubations not already flagged.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const flagged = await runElevenMonthScan();
  return NextResponse.json({ ok: true, flagged: flagged.length, ids: flagged });
}
