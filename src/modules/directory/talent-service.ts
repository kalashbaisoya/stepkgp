import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

const prismaInstance = new PrismaClient();

function getTalentModel() {
  if ((db as any)?.coFounderTalent) {
    return (db as any).coFounderTalent;
  }
  return prismaInstance.coFounderTalent;
}

export type CoFounderTalentDTO = {
  id?: string;
  name: string;
  email: string;
  roleTarget: string;
  education: string;
  department?: string;
  capabilities: string[];
  availability: string;
  bio: string;
  linkedinUrl?: string;
  githubUrl?: string;
  featured?: boolean;
};

export const INITIAL_SEED_TALENTS: CoFounderTalentDTO[] = [
  {
    id: "talent-kgp-1",
    name: "Arjun Mehta",
    email: "arjun.m@iitkgp.ac.in",
    roleTarget: "Technical Co-Founder / CTO",
    education: "B.Tech Computer Science & Engineering, IIT Kharagpur ('25)",
    department: "Computer Science & Engineering",
    capabilities: ["PyTorch", "CUDA", "Next.js", "Distributed Systems", "LLM Fine-Tuning"],
    availability: "Full-Time Co-Founder",
    bio: "Ex-Google Summer of Code scholar. Built open-source edge-AI models. Looking for a domain-expert CEO / Business Co-Founder in AgriTech or HealthTech.",
    linkedinUrl: "https://linkedin.com/in/arjun-mehta-kgp",
    githubUrl: "https://github.com/arjunmehta-kgp",
    featured: true,
  },
  {
    id: "talent-kgp-2",
    name: "Dr. Ananya Ray",
    email: "ananya.ray@biotech.iitkgp.ac.in",
    roleTarget: "Scientific Co-Founder / Chief Scientist",
    education: "Ph.D. Biotechnology & Micro-Fluidics, IIT Kharagpur",
    department: "Biotechnology",
    capabilities: ["Point-of-Care Diagnostics", "Microfluidic Chip Fabrication", "FDA Regulatory Compliance", "Bioprocess Scaling"],
    availability: "Full-Time Co-Founder",
    bio: "3 Patents published in microfluidic lab-on-a-chip diagnostic devices. Looking for a commercialization & fundraising co-founder.",
    linkedinUrl: "https://linkedin.com/in/dr-ananya-ray",
    featured: true,
  },
  {
    id: "talent-kgp-3",
    name: "Vikramaditya Sen",
    email: "v.sen@aero.iitkgp.ac.in",
    roleTarget: "Lead Hardware & Avionics Engineer",
    education: "Dual Degree Aerospace Engineering, IIT Kharagpur ('24)",
    department: "Aerospace Engineering",
    capabilities: ["PX4 Flight Controller", "ArduPilot", "SolidWorks CAD", "CFD Simulation", "Battery Management Systems"],
    availability: "Founding Engineer / Full-Time",
    bio: "Lead Systems Engineer for IIT Kharagpur Autonomous Drone Team. Experience with VTOL drone fabrication and Defence iDEX challenge prototypes.",
    linkedinUrl: "https://linkedin.com/in/vikramaditya-sen",
    githubUrl: "https://github.com/vsen-aero",
    featured: true,
  },
  {
    id: "talent-kgp-4",
    name: "Sneha Mukherjee",
    email: "sneha.m@vgsom.iitkgp.ac.in",
    roleTarget: "Co-Founder & Chief Operating Officer (COO)",
    education: "MBA, Vinod Gupta School of Management (VGSOM), IIT Kharagpur",
    department: "Vinod Gupta School of Management",
    capabilities: ["Financial Modeling", "Go-To-Market Strategy", "B2B SaaS Sales", "DPIIT & Grant Compliance"],
    availability: "Full-Time Co-Founder",
    bio: "Former Consultant at Deloitte. Experienced in B2B enterprise sales pipelines, government tender bids, and seed funding rounds.",
    linkedinUrl: "https://linkedin.com/in/sneha-mukherjee-vgsom",
    featured: true,
  },
];

/**
 * Ensures initial seed talent directory is populated in SQLite DB
 */
export async function seedTalentsIfEmpty() {
  const model = getTalentModel();
  const count = await model.count();
  if (count === 0) {
    for (const item of INITIAL_SEED_TALENTS) {
      await model.upsert({
        where: { email: item.email },
        update: {
          name: item.name,
          roleTarget: item.roleTarget,
          education: item.education,
          department: item.department,
          capabilities: item.capabilities,
          availability: item.availability,
          bio: item.bio,
          linkedinUrl: item.linkedinUrl,
          githubUrl: item.githubUrl,
          featured: item.featured ?? false,
        },
        create: {
          id: item.id,
          name: item.name,
          email: item.email,
          roleTarget: item.roleTarget,
          education: item.education,
          department: item.department,
          capabilities: item.capabilities,
          availability: item.availability,
          bio: item.bio,
          linkedinUrl: item.linkedinUrl,
          githubUrl: item.githubUrl,
          featured: item.featured ?? false,
        },
      });
    }
  }
}

/**
 * Searches and lists talent profiles with optional query filtering
 */
export async function getTalentProfiles(query?: string, roleFilter?: string) {
  await seedTalentsIfEmpty();

  const model = getTalentModel();
  const rows = await model.findMany({
    orderBy: { createdAt: "desc" },
  });

  let filtered = rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    roleTarget: r.roleTarget,
    education: r.education,
    department: r.department,
    capabilities: (Array.isArray(r.capabilities) ? r.capabilities : []) as string[],
    availability: r.availability,
    bio: r.bio,
    linkedinUrl: r.linkedinUrl,
    githubUrl: r.githubUrl,
    featured: r.featured,
  }));

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (t: any) =>
        t.name.toLowerCase().includes(q) ||
        t.roleTarget.toLowerCase().includes(q) ||
        t.education.toLowerCase().includes(q) ||
        t.capabilities.some((c: string) => c.toLowerCase().includes(q)) ||
        t.bio.toLowerCase().includes(q)
    );
  }

  if (roleFilter && roleFilter !== "ALL") {
    filtered = filtered.filter((t: any) => t.roleTarget.toLowerCase().includes(roleFilter.toLowerCase()));
  }

  return filtered;
}

/**
 * Register a new co-founder / talent candidate profile
 */
export async function createTalentProfile(data: CoFounderTalentDTO) {
  const model = getTalentModel();
  const newProfile = await model.create({
    data: {
      name: data.name,
      email: data.email,
      roleTarget: data.roleTarget,
      education: data.education,
      department: data.department || "General / Interdisciplinary",
      capabilities: data.capabilities || [],
      availability: data.availability || "Full-Time Co-Founder",
      bio: data.bio,
      linkedinUrl: data.linkedinUrl || null,
      githubUrl: data.githubUrl || null,
      featured: true,
    },
  });

  return newProfile;
}
