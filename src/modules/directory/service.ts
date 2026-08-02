import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";

const TAG = "showcase";

export type ShowcaseProfile = {
  slug: string;
  name: string;
  description: string;
  sector: string | null;
  website: string | null;
  logoUrl: string | null;
  funding: string | null;
  batch: string | null;
  stage: string | null;
  location: string | null;
  tags: string[];
  featured: boolean;
  founders: { name: string; role?: string }[];
  achievements: string[];
  socials: { label: string; url: string }[];
  gallery: string[];
  videos: string[];
};

function toProfile(e: {
  slug: string; name: string; description: string; sector: string | null; website: string | null;
  logoUrl: string | null; funding: string | null; batch?: string | null; stage?: string | null;
  location?: string | null; tags?: string[]; featured?: boolean; founders: unknown; achievements: unknown;
  socials: unknown; gallery: unknown; videos: unknown;
}): ShowcaseProfile {
  return {
    slug: e.slug,
    name: e.name,
    description: e.description,
    sector: e.sector,
    website: e.website,
    logoUrl: e.logoUrl,
    funding: e.funding,
    batch: e.batch ?? null,
    stage: e.stage ?? null,
    location: e.location ?? null,
    tags: e.tags ?? [],
    featured: e.featured ?? false,
    founders: (Array.isArray(e.founders) ? e.founders : []) as { name: string; role?: string }[],
    achievements: (Array.isArray(e.achievements) ? e.achievements : []) as string[],
    socials: (Array.isArray(e.socials) ? e.socials : []) as { label: string; url: string }[],
    gallery: (Array.isArray(e.gallery) ? e.gallery : []) as string[],
    videos: (Array.isArray(e.videos) ? e.videos : []) as string[],
  };
}

/** Published startups for the public directory. Cached, revalidated on publish/edit. */
export const listPublishedShowcase = unstable_cache(
  async () => {
    const rows = await db.showcaseEntry.findMany({ where: { published: true }, orderBy: { name: "asc" } });
    const profiles = rows.map(toProfile);
    const uniq = (xs: (string | null)[]) => Array.from(new Set(xs.filter(Boolean) as string[])).sort();
    return {
      profiles,
      sectors: uniq(profiles.map((p) => p.sector)),
      batches: uniq(profiles.map((p) => p.batch)).reverse(), // newest first
      stages: uniq(profiles.map((p) => p.stage)),
      tags: uniq(profiles.flatMap((p) => p.tags)),
    };
  },
  ["showcase-list"],
  { tags: [TAG] },
);

/** Companies to feature on the homepage. Falls back to all published if none flagged. */
export const listFeaturedShowcase = unstable_cache(
  async () => {
    const featured = await db.showcaseEntry.findMany({ where: { published: true, featured: true }, orderBy: { name: "asc" } });
    const rows = featured.length > 0
      ? featured
      : await db.showcaseEntry.findMany({ where: { published: true }, orderBy: { name: "asc" }, take: 6 });
    return rows.map(toProfile);
  },
  ["showcase-featured"],
  { tags: [TAG] },
);

export function getShowcaseBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const e = await db.showcaseEntry.findUnique({ where: { slug } });
      if (!e || !e.published) return null;
      return toProfile(e);
    },
    ["showcase-slug", slug],
    { tags: [TAG] },
  )();
}

// ---- Admin curation ----
export async function listAllShowcase() {
  return db.showcaseEntry.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function getShowcaseForEdit(id: string) {
  const e = await db.showcaseEntry.findUnique({ where: { id } });
  if (!e) return null;
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    description: e.description,
    sector: e.sector ?? "",
    website: e.website ?? "",
    logoUrl: e.logoUrl ?? "",
    funding: e.funding ?? "",
    batch: e.batch ?? "",
    stage: e.stage ?? "",
    location: e.location ?? "",
    tags: e.tags ?? [],
    published: e.published,
    featured: e.featured,
    founders: (Array.isArray(e.founders) ? e.founders : []) as { name: string; role?: string }[],
    achievements: (Array.isArray(e.achievements) ? e.achievements : []) as string[],
    socials: (Array.isArray(e.socials) ? e.socials : []) as { label: string; url: string }[],
    gallery: (Array.isArray(e.gallery) ? e.gallery : []) as string[],
    videos: (Array.isArray(e.videos) ? e.videos : []) as string[],
  };
}

export type ShowcaseInput = {
  name: string;
  description: string;
  sector: string;
  website: string;
  logoUrl: string;
  funding: string;
  batch: string;
  stage: string;
  location: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  founders: { name: string; role?: string }[];
  achievements: string[];
  socials: { label: string; url: string }[];
  gallery: string[];
  videos: string[];
};

export async function updateShowcase(id: string, input: ShowcaseInput, actorId?: string) {
  await db.showcaseEntry.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      sector: input.sector || null,
      website: input.website || null,
      logoUrl: input.logoUrl || null,
      funding: input.funding || null,
      batch: input.batch || null,
      stage: input.stage || null,
      location: input.location || null,
      tags: input.tags ?? [],
      published: input.published,
      featured: input.featured,
      founders: input.founders,
      achievements: input.achievements,
      socials: input.socials,
      gallery: input.gallery,
      videos: input.videos,
    },
  });
  revalidateTag(TAG);
  await audit({ actorId, action: "showcase.updated", targetType: "ShowcaseEntry", targetId: id });
}

/** Create a standalone showcase entry (not tied to an incubation). */
export async function createShowcase(name: string, actorId?: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "startup";
  const slug = `${base}-${Math.abs(hash(name + actorId)).toString(36).slice(0, 4)}`;
  const entry = await db.showcaseEntry.create({ data: { slug, name, description: "", published: false } });
  await audit({ actorId, action: "showcase.created", targetType: "ShowcaseEntry", targetId: entry.id });
  return entry.id;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
