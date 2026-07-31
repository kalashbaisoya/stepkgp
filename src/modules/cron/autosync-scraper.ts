import { syncAllIITKGPDepartmentsToDB } from "../directory/iitkgp-dept-scraper";
import { syncGujaratStartupPoliciesFromWeb } from "../search/policies-service";
import { seedTalentsIfEmpty } from "../directory/talent-service";

export type AutoSyncRunReport = {
  timestamp: string;
  status: "success" | "error" | "partial";
  modulesSynced: {
    iitkgpFaculties: { totalSynced: number; status: string };
    governmentPolicies: { totalSynced: number; contentHash: string; status: string };
    talentDirectory: { status: string };
  };
  durationMs: number;
  message: string;
};

let lastSyncReport: AutoSyncRunReport | null = null;
let isSyncing = false;

/**
 * Main Auto-Sync Scraper Engine
 * Scrapes IIT Kharagpur faculty rosters, MP Startup Policy 2025/2022, Gujarat REST schemes, iDEX Defence, and State portals.
 */
export async function runAutoSyncScraperAll(): Promise<AutoSyncRunReport> {
  if (isSyncing) {
    return (
      lastSyncReport || {
        timestamp: new Date().toISOString(),
        status: "partial",
        modulesSynced: {
          iitkgpFaculties: { totalSynced: 0, status: "sync_in_progress" },
          governmentPolicies: { totalSynced: 0, contentHash: "", status: "sync_in_progress" },
          talentDirectory: { status: "sync_in_progress" },
        },
        durationMs: 0,
        message: "Scraper sync is already in progress in the background.",
      }
    );
  }

  isSyncing = true;
  const startTime = Date.now();

  const report: AutoSyncRunReport = {
    timestamp: new Date().toISOString(),
    status: "success",
    modulesSynced: {
      iitkgpFaculties: { totalSynced: 0, status: "pending" },
      governmentPolicies: { totalSynced: 0, contentHash: "", status: "pending" },
      talentDirectory: { status: "pending" },
    },
    durationMs: 0,
    message: "Auto-sync scraper executed successfully.",
  };

  try {
    // 1. Scrape & Auto-Sync IIT Kharagpur Faculty Rosters across 65 academic units
    try {
      const iitkgpRes = await syncAllIITKGPDepartmentsToDB();
      report.modulesSynced.iitkgpFaculties = {
        totalSynced: iitkgpRes.totalSynced,
        status: "success",
      };
    } catch (err: any) {
      console.error("[AutoSync] Error scraping IIT KGP departments:", err);
      report.modulesSynced.iitkgpFaculties.status = `error: ${err.message}`;
      report.status = "partial";
    }

    // 2. Scrape & Auto-Sync Government Policies (MP Startup Portal, Gujarat, UP, iDEX Defence, DPIIT, DST, MeitY)
    try {
      const govRes = await syncGujaratStartupPoliciesFromWeb();
      report.modulesSynced.governmentPolicies = {
        totalSynced: govRes.totalSynced,
        contentHash: govRes.contentHash,
        status: "success",
      };
    } catch (err: any) {
      console.error("[AutoSync] Error syncing government policies:", err);
      report.modulesSynced.governmentPolicies.status = `error: ${err.message}`;
      report.status = "partial";
    }

    // 3. Auto-Sync Talent & Co-Founder Seed Directory
    try {
      await seedTalentsIfEmpty();
      report.modulesSynced.talentDirectory.status = "success";
    } catch (err: any) {
      console.error("[AutoSync] Error seeding talent directory:", err);
      report.modulesSynced.talentDirectory.status = `error: ${err.message}`;
    }
  } catch (globalErr: any) {
    report.status = "error";
    report.message = `Global Auto-Sync Error: ${globalErr.message}`;
  } finally {
    report.durationMs = Date.now() - startTime;
    lastSyncReport = report;
    isSyncing = false;
  }

  return report;
}

/**
 * Returns latest cached auto-sync report
 */
export function getLastAutoSyncReport(): AutoSyncRunReport | null {
  return lastSyncReport;
}
