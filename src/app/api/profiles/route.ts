import { NextResponse } from "next/server";
import { createTalentProfile, getTalentProfiles } from "@/modules/profiles/service";
import { ProfileRole } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") as ProfileRole | null;

    const profiles = await getTalentProfiles(roleParam || undefined);
    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, departmentOrCompany, bio, skills, interests, availability, location, linkedinUrl, githubUrl } = body;

    if (!name || !email || !role || !departmentOrCompany) {
      return NextResponse.json({ error: "Missing required fields: name, email, role, departmentOrCompany" }, { status: 400 });
    }

    const profile = await createTalentProfile({
      name,
      email,
      role,
      departmentOrCompany,
      bio,
      skills: Array.isArray(skills) ? skills : [skills].filter(Boolean),
      interests: Array.isArray(interests) ? interests : [interests].filter(Boolean),
      availability,
      location,
      linkedinUrl,
      githubUrl,
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create profile" }, { status: 500 });
  }
}
