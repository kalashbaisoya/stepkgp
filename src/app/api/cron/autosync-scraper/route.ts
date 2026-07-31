import { NextResponse } from "next/server";
import { getLastAutoSyncReport, runAutoSyncScraperAll } from "@/modules/cron/autosync-scraper";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (!force) {
      const cached = getLastAutoSyncReport();
      if (cached) {
        return NextResponse.json({
          source: "cache",
          report: cached,
        });
      }
    }

    const report = await runAutoSyncScraperAll();
    return NextResponse.json({
      source: "live_execution",
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Auto-sync scraper failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const report = await runAutoSyncScraperAll();
    return NextResponse.json({
      message: "⚡ Auto-sync scraper triggered manually! All 65 IIT KGP departments, MP Startup Portal, iDEX Defence, and State portals re-scraped and updated in DB.",
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Manual auto-sync trigger failed" }, { status: 500 });
  }
}
