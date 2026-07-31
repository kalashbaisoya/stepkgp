import { db } from "@/lib/db";
import { searchPoliciesAndSOPs } from "./policies-service";

export type SearchQueryResult = {
  query: string;
  totalMatches: number;
  results: {
    type: "faculty" | "alumni" | "profile" | "problem" | "startup" | "policy";
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    relevanceScore: number;
    href?: string;
    presentedAt?: string;
  }[];
};

export async function searchPlatform(query: string, state?: string): Promise<SearchQueryResult> {
  const cleanQuery = query.trim().toLowerCase();
  const terms = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  // 1. Search Government Policies & SOPs dynamically
  const fetchedPolicies = await searchPoliciesAndSOPs(cleanQuery, state);
  const policyResults = fetchedPolicies.map((p) => {
    const text = `${p.schemeName} ${p.department} ${p.state} ${p.type} ${p.financialAssistance} ${p.summary} ${p.eligibility} ${p.tags.join(" ")}`.toLowerCase();
    let score = terms.length > 0 ? terms.reduce((acc, t) => (text.includes(t) ? acc + 30 : acc), 10) : 100;
    if (state && state.toLowerCase() !== "all" && p.state.toLowerCase().includes(state.toLowerCase())) {
      score += 5000;
    }
    return {
      type: "policy" as const,
      id: p.id,
      title: p.schemeName,
      subtitle: `[${p.state.toUpperCase()} ${p.type.toUpperCase()}] • ${p.department} • ${p.financialAssistance}`,
      description: `${p.summary} Eligibility: ${p.eligibility}`,
      tags: p.tags,
      relevanceScore: score,
      href: p.officialUrl,
      presentedAt: p.lastFetchedAt ? new Date(p.lastFetchedAt).toLocaleString() : "Updated / Presented: July 2026",
    };
  });

  // 2. Search Faculty
  const faculty = await db.facultyMember.findMany();
  const facultyResults = faculty
    .map((f) => {
      const text = `${f.name} ${f.department} ${f.labName} ${JSON.stringify(f.researchAreas)}`.toLowerCase();
      const score = terms.length > 0 ? terms.reduce((acc, t) => (text.includes(t) ? acc + 25 : acc), 0) : 40;
      const researchAreas = Array.isArray(f.researchAreas) ? (f.researchAreas as string[]) : [];
      return {
        type: "faculty" as const,
        id: f.id,
        title: f.name,
        subtitle: `${f.department} • ${f.labName}`,
        description: `Research Areas: ${researchAreas.join(", ")}`,
        tags: researchAreas,
        relevanceScore: score,
        href: `/startups?search=${encodeURIComponent(f.name)}`,
        presentedAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Presented: July 2026",
      };
    })
    .filter((r) => r.relevanceScore > 0);

  // 3. Search Alumni
  const alumni = await db.alumniMentor.findMany();
  const alumniResults = alumni
    .map((a) => {
      const text = `${a.name} ${a.company} ${a.role} ${a.domain} ${a.location}`.toLowerCase();
      const score = terms.length > 0 ? terms.reduce((acc, t) => (text.includes(t) ? acc + 25 : acc), 0) : 40;
      return {
        type: "alumni" as const,
        id: a.id,
        title: a.name,
        subtitle: `${a.role} at ${a.company} (Batch of ${a.batch})`,
        description: `Domain expertise: ${a.domain}. Location: ${a.location}`,
        tags: [a.domain, a.batch, a.location].filter(Boolean),
        relevanceScore: score,
        href: `/startups?search=${encodeURIComponent(a.name)}`,
        presentedAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Presented: July 2026",
      };
    })
    .filter((r) => r.relevanceScore > 0);

  // 4. Search Profiles (Students, Professors, Alumni)
  const profiles = await db.talentProfile.findMany();
  const profileResults = profiles
    .map((p) => {
      const text = `${p.name} ${p.role} ${p.departmentOrCompany} ${p.bio} ${JSON.stringify(p.skills)} ${JSON.stringify(p.interests)}`.toLowerCase();
      const score = terms.length > 0 ? terms.reduce((acc, t) => (text.includes(t) ? acc + 25 : acc), 0) : 40;
      const skills = Array.isArray(p.skills) ? (p.skills as string[]) : [];
      return {
        type: "profile" as const,
        id: p.id,
        title: `${p.name} (${p.role})`,
        subtitle: p.departmentOrCompany,
        description: p.bio || `Skills: ${skills.join(", ")}`,
        tags: skills,
        relevanceScore: score,
        href: `/startups?search=${encodeURIComponent(p.name)}`,
        presentedAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Presented: July 2026",
      };
    })
    .filter((r) => r.relevanceScore > 0);

  // 5. Search Seeded Problem Statements
  const problems = await db.seededProblem.findMany();
  const problemResults = problems
    .map((pr) => {
      const text = `${pr.title} ${pr.category} ${pr.description} ${pr.authorName} ${JSON.stringify(pr.tags)}`.toLowerCase();
      const score = terms.length > 0 ? terms.reduce((acc, t) => (text.includes(t) ? acc + 25 : acc), 0) : 40;
      const tags = Array.isArray(pr.tags) ? (pr.tags as string[]) : [];
      return {
        type: "problem" as const,
        id: pr.id,
        title: pr.title,
        subtitle: `Category: ${pr.category} • Author: ${pr.authorName}`,
        description: pr.description,
        tags,
        relevanceScore: score,
        href: `/playground?problem=${pr.id}`,
        presentedAt: new Date(pr.createdAt).toLocaleDateString(),
      };
    })
    .filter((r) => r.relevanceScore > 0);

  // 6. Search Incubated Startups
  const startups = await db.showcaseEntry.findMany({ where: { published: true } });
  const startupResults = startups
    .map((s) => {
      const text = `${s.name} ${s.description} ${s.sector} ${s.batch} ${s.stage}`.toLowerCase();
      const score = terms.length > 0 ? terms.reduce((acc, t) => (text.includes(t) ? acc + 25 : acc), 0) : 40;
      return {
        type: "startup" as const,
        id: s.id,
        title: s.name,
        subtitle: `Incubated Startup • Sector: ${s.sector || "Tech"} • Cohort ${s.batch || ""}`,
        description: s.description,
        tags: [s.sector, s.stage, s.batch].filter((t): t is string => Boolean(t)),
        relevanceScore: score,
        href: `/startups/${s.slug}`,
        presentedAt: new Date(s.createdAt).toLocaleDateString(),
      };
    })
    .filter((r) => r.relevanceScore > 0);

  const allResults = [
    ...policyResults,
    ...facultyResults,
    ...alumniResults,
    ...profileResults,
    ...problemResults,
    ...startupResults,
  ].sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    query: cleanQuery,
    totalMatches: allResults.length,
    results: allResults.slice(0, 100),
  };
}
