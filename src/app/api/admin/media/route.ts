import { NextRequest, NextResponse } from "next/server";
import { requireUser, can, AuthError } from "@/lib/rbac/guard";
import { uploadImage, MediaError } from "@/modules/media/service";

// Image upload for CMS editors. Kept as a route rather than a server action
// because server actions cap request bodies well below our 5MB image limit.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!can(user, "cms:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const result = await uploadImage(
      {
        name: file.name,
        type: file.type || "application/octet-stream",
        buffer: Buffer.from(await file.arrayBuffer()),
      },
      String(form.get("alt") ?? ""),
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof MediaError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[media upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
