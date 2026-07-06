import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/rbac/guard";
import { uploadDocument, AppError } from "@/modules/applications/service";

// Multipart document upload (kept off server actions because files can be large).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const form = await req.formData();
    const requirementKey = String(form.get("requirementKey") ?? "");
    const file = form.get("file");

    if (!(file instanceof File) || !requirementKey) {
      return NextResponse.json({ error: "Missing file or requirement." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadDocument(id, user.id, requirementKey, {
      name: file.name,
      type: file.type || "application/octet-stream",
      size: buffer.length,
      buffer,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof AppError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
