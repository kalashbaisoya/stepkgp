import { NextResponse } from "next/server";
import { createTalentProfile, getTalentProfiles } from "@/modules/directory/talent-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const role = searchParams.get("role") || undefined;

    const talents = await getTalentProfiles(q, role);
    return NextResponse.json({
      count: talents.length,
      talents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch talent profiles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, roleTarget, education, capabilities, availability, bio, linkedinUrl, githubUrl } = body;

    if (!name || !email || !roleTarget || !education || !bio) {
      return NextResponse.json({ error: "Name, email, roleTarget, education, and bio are required fields" }, { status: 400 });
    }

    const created = await createTalentProfile({
      name,
      email,
      roleTarget,
      education,
      capabilities: Array.isArray(capabilities) ? capabilities : typeof capabilities === "string" ? capabilities.split(",").map((s) => s.trim()) : [],
      availability,
      bio,
      linkedinUrl,
      githubUrl,
    });

    return NextResponse.json({
      message: "Talent profile successfully registered! You are now visible to founders.",
      profile: created,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register talent profile" }, { status: 500 });
  }
}
