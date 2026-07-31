import { db } from "@/lib/db";
import { ProfileRole } from "@prisma/client";

export type CreateProfileInput = {
  name: string;
  email: string;
  role: ProfileRole;
  departmentOrCompany: string;
  bio?: string;
  skills: string[];
  interests: string[];
  availability?: boolean;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

export async function createTalentProfile(input: CreateProfileInput) {
  return db.talentProfile.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      departmentOrCompany: input.departmentOrCompany,
      bio: input.bio || "",
      skills: JSON.stringify(input.skills),
      interests: JSON.stringify(input.interests),
      availability: input.availability ?? true,
      location: input.location || null,
      linkedinUrl: input.linkedinUrl || null,
      githubUrl: input.githubUrl || null,
    },
  });
}

export async function getTalentProfiles(role?: ProfileRole) {
  const profiles = await db.talentProfile.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return profiles.map((p) => ({
    ...p,
    skills: typeof p.skills === "string" ? JSON.parse(p.skills) : p.skills,
    interests: typeof p.interests === "string" ? JSON.parse(p.interests) : p.interests,
  }));
}
