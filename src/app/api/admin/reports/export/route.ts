import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AuthError } from "@/lib/rbac/guard";
import { reportCsv } from "@/modules/reports/service";

// CSV export of a report (report:view). ?report=summary|pipeline|categories|sectors|trends|reviewers
export async function GET(req: NextRequest) {
  try {
    await requirePermission("report:view");
    const report = req.nextUrl.searchParams.get("report") ?? "summary";
    const cycle = req.nextUrl.searchParams.get("cycle") ?? undefined;
    const { filename, csv } = await reportCsv(report, cycle);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return new NextResponse("Unauthorized", { status: err.code === "FORBIDDEN" ? 403 : 401 });
    return new NextResponse("Error", { status: 500 });
  }
}
