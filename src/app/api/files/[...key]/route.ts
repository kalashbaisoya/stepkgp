import { NextRequest, NextResponse } from "next/server";
import { getObject } from "@/lib/storage/storage";
import { db } from "@/lib/db";
import { requireUser, can, AuthError } from "@/lib/rbac/guard";

// Serve a stored document to authorized users only (owner or staff/reviewer/admin).
// Production replaces this with signed, expiring URLs from object storage.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const storageKey = key.join("/");

  try {
    const user = await requireUser();
    const doc = await db.applicationDocument.findFirst({
      where: { storageKey },
      include: { application: { select: { userId: true } } },
    });
    if (!doc) return new NextResponse("Not found", { status: 404 });

    const isOwner = doc.application.userId === user.id;
    const isStaff = can(user, "application:read_any") || can(user, "application:review");
    if (!isOwner && !isStaff) return new NextResponse("Forbidden", { status: 403 });

    const buffer = await getObject(storageKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": doc.mimeType, "Content-Disposition": `inline; filename="${doc.fileName}"` },
    });
  } catch (err) {
    if (err instanceof AuthError) return new NextResponse("Unauthorized", { status: 401 });
    return new NextResponse("Error", { status: 500 });
  }
}
