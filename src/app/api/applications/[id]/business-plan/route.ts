import { NextRequest, NextResponse } from "next/server";
import { requireUser, can, AuthError } from "@/lib/rbac/guard";
import { db } from "@/lib/db";
import { generatePdf } from "@/modules/businessPlan/service";
import { getObject } from "@/lib/storage/storage";

// Download the business plan PDF. For submitted applications the stored PDF is
// served; for drafts a fresh preview is generated on the fly. Owner/staff only.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const app = await db.application.findUnique({
      where: { id },
      include: { businessPlan: true },
    });
    if (!app) return new NextResponse("Not found", { status: 404 });

    const isOwner = app.userId === user.id;
    const isStaff = can(user, "application:read_any") || can(user, "application:review");
    if (!isOwner && !isStaff) return new NextResponse("Forbidden", { status: 403 });

    let buffer: Buffer;
    if (app.status === "submitted" && app.businessPlan?.pdfKey) {
      buffer = await getObject(app.businessPlan.pdfKey);
    } else {
      const { key } = await generatePdf(id);
      buffer = await getObject(key);
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="business-plan.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return new NextResponse("Unauthorized", { status: 401 });
    console.error("[bp pdf]", err);
    return new NextResponse("Error", { status: 500 });
  }
}
