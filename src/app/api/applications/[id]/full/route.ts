import { NextRequest, NextResponse } from "next/server";
import { requireUser, can, AuthError } from "@/lib/rbac/guard";
import { db } from "@/lib/db";
import { buildFullApplicationPdf } from "@/modules/applications/full-pdf";

// One-click full application PDF: form answers + business plan + all documents,
// merged into a single previewable/downloadable PDF. Owner or staff/reviewer only.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const app = await db.application.findUnique({ where: { id }, select: { userId: true } });
    if (!app) return new NextResponse("Not found", { status: 404 });

    const isOwner = app.userId === user.id;
    const isStaff = can(user, "application:read_any") || can(user, "application:review");
    if (!isOwner && !isStaff) return new NextResponse("Forbidden", { status: 403 });

    const buffer = await buildFullApplicationPdf(id);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="application-${id}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return new NextResponse("Unauthorized", { status: 401 });
    console.error("[full pdf]", err);
    return new NextResponse("Error", { status: 500 });
  }
}
