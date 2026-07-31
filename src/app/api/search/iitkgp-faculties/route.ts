import { NextResponse } from "next/server";
import { ALL_IITKGP_DEPARTMENTS, scrapeIITKGPDepartmentFaculty, syncAllIITKGPDepartmentsToDB } from "@/modules/directory/iitkgp-dept-scraper";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dept = searchParams.get("dept")?.toUpperCase();
    const sync = searchParams.get("sync");

    if (dept) {
      const deptObj = ALL_IITKGP_DEPARTMENTS.find((d) => d.code === dept);
      const facultyList = await scrapeIITKGPDepartmentFaculty(dept);
      return NextResponse.json({
        departmentCode: dept,
        departmentName: deptObj ? deptObj.name : `Department of ${dept}`,
        url: `https://www.iitkgp.ac.in/department/${dept}`,
        count: facultyList.length,
        faculties: facultyList,
      });
    }

    // If sync=true, force a full resync
    if (sync === "true") {
      const syncStatus = await syncAllIITKGPDepartmentsToDB();
      return NextResponse.json({
        syncStatus,
        availableDepartments: ALL_IITKGP_DEPARTMENTS,
      });
    }

    // Default: Return all faculty from the database (fast, no rescrape)
    const dbFaculties = await db.facultyMember.findMany({
      orderBy: { department: "asc" },
    });

    const faculties = dbFaculties.map((f) => ({
      id: f.id,
      name: f.name,
      department: f.department,
      labName: f.labName || "",
      email: f.email,
      officialUrl: f.officialUrl || `https://www.iitkgp.ac.in`,
      researchAreas: f.researchAreas as string[],
      lastScrapedAt: f.updatedAt?.toISOString() || "",
      mentorshipAvailable: f.mentorshipAvailable ?? true,
    }));

    return NextResponse.json({
      total: faculties.length,
      faculties,
      availableDepartments: ALL_IITKGP_DEPARTMENTS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch IIT Kharagpur faculty directory" }, { status: 500 });
  }
}
