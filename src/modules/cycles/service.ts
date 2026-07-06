import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit/audit";

export async function listCycles() {
  return db.cycle.findMany({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: {
      formTemplate: { select: { key: true, name: true } },
      categories: { include: { category: true } },
      _count: { select: { categories: true } },
    },
  });
}

export async function getCycle(id: string) {
  return db.cycle.findUnique({
    where: { id },
    include: { categories: { include: { category: true } }, formTemplate: true },
  });
}

/** The single currently-open cycle for the public /apply page. */
export async function getOpenCycle() {
  const now = new Date();
  const cycle = await db.cycle.findFirst({
    where: {
      status: "OPEN",
      OR: [{ opensAt: null }, { opensAt: { lte: now } }],
      AND: [{ OR: [{ closesAt: null }, { closesAt: { gte: now } }] }],
    },
    orderBy: { year: "desc" },
    include: {
      categories: { include: { category: true }, orderBy: { category: { order: "asc" } } },
      formTemplate: { select: { key: true, name: true } },
    },
  });
  if (!cycle) return null;
  return {
    id: cycle.id,
    year: cycle.year,
    name: cycle.name,
    closesAt: cycle.closesAt,
    formTemplateKey: cycle.formTemplate?.key ?? null,
    categories: cycle.categories.map((cc) => ({ key: cc.category.key, name: cc.category.name })),
  };
}

export async function listCategories() {
  return db.category.findMany({ orderBy: { order: "asc" } });
}

type CycleInput = {
  year: number;
  name: string;
  opensAt?: string | null;
  closesAt?: string | null;
  formTemplateKey?: string | null;
  categoryKeys: string[];
};

export async function upsertCycle(id: string | null, input: CycleInput, actorId?: string) {
  const template = input.formTemplateKey
    ? await db.formTemplate.findUnique({ where: { key: input.formTemplateKey } })
    : null;
  const categories = await db.category.findMany({ where: { key: { in: input.categoryKeys } } });

  const data = {
    year: input.year,
    name: input.name,
    opensAt: input.opensAt ? new Date(input.opensAt) : null,
    closesAt: input.closesAt ? new Date(input.closesAt) : null,
    formTemplateId: template?.id ?? null,
  };

  const cycle = id
    ? await db.cycle.update({ where: { id }, data })
    : await db.cycle.create({ data });

  // Reset category links.
  await db.cycleCategory.deleteMany({ where: { cycleId: cycle.id } });
  await db.cycleCategory.createMany({
    data: categories.map((c) => ({ cycleId: cycle.id, categoryId: c.id })),
    skipDuplicates: true,
  });

  await audit({ actorId, action: id ? "cycle.updated" : "cycle.created", targetType: "Cycle", targetId: cycle.id });
  return cycle;
}

export async function setCycleStatus(id: string, status: "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED", actorId?: string) {
  const cycle = await db.cycle.update({ where: { id }, data: { status } });
  await audit({ actorId, action: `cycle.${status.toLowerCase()}`, targetType: "Cycle", targetId: id });
  return cycle;
}

// ---- Document requirements ----
export async function listDocumentRequirements() {
  const cats = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { documentReqs: { orderBy: { order: "asc" } } },
  });
  return cats;
}

export async function getRequirementsForCategory(categoryKey: string) {
  const category = await db.category.findUnique({
    where: { key: categoryKey },
    include: { documentReqs: { orderBy: { order: "asc" } } },
  });
  return category?.documentReqs ?? [];
}

type DocReq = { key: string; label: string; required: boolean; maxSizeMb: number; allowedTypes: string[] };

export async function saveDocumentRequirements(categoryKey: string, reqs: DocReq[], actorId?: string) {
  const category = await db.category.findUnique({ where: { key: categoryKey } });
  if (!category) throw new Error(`Unknown category: ${categoryKey}`);
  await db.$transaction([
    db.documentRequirement.deleteMany({ where: { categoryId: category.id, cycleId: null } }),
    ...reqs.map((r, i) =>
      db.documentRequirement.create({
        data: {
          categoryId: category.id,
          key: r.key,
          label: r.label,
          required: r.required,
          maxSizeMb: r.maxSizeMb,
          allowedTypes: r.allowedTypes,
          order: i,
        },
      }),
    ),
  ]);
  await audit({ actorId, action: "documents.config_changed", targetType: "Category", targetId: category.id });
}
