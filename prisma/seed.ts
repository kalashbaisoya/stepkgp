/**
 * Seed script — idempotent. Provisions the foundation:
 *   - default organization (single-tenant v1)
 *   - RBAC roles + permission catalog + role↔permission mapping
 *   - an initial super-admin user (credentials from env or defaults for local dev)
 *
 * Password hashing is a placeholder here (Milestone 0). Milestone 1 replaces it with argon2/bcrypt
 * via the auth module and wires real verification. Run: pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Permission catalog (Phase 9 §4.1) — resource:action.
const PERMISSIONS = [
  "user:manage",
  "role:manage",
  "cms:read",
  "cms:write",
  "cms:publish",
  "form:manage",
  "cycle:manage",
  "document:configure",
  "scorecard:manage",
  "application:create",
  "application:read_own",
  "application:read_any",
  "application:submit",
  "application:clarify",
  "application:review",
  "application:score",
  "application:comment",
  "application:recommend",
  "lifecycle:transition",
  "lifecycle:configure",
  "incubation:manage",
  "incubation:read",
  "mentor:read_assigned",
  "mentor:note",
  "showcase:publish",
  "report:view",
  "audit:view",
  "settings:manage",
] as const;

// Role → permissions (Phase 9 §4.2 RBAC matrix).
const ROLES: Record<string, { name: string; permissions: string[] }> = {
  applicant: {
    name: "Applicant",
    permissions: ["application:create", "application:read_own", "application:submit"],
  },
  reviewer: {
    name: "Reviewer",
    permissions: [
      "application:read_any",
      "application:review",
      "application:score",
      "application:comment",
      "application:recommend",
    ],
  },
  mentor: {
    name: "Mentor",
    permissions: ["mentor:read_assigned", "mentor:note", "incubation:read"],
  },
  staff: {
    name: "Incubation Staff",
    permissions: [
      "application:read_any",
      "application:clarify",
      "lifecycle:transition",
      "incubation:manage",
      "incubation:read",
      "showcase:publish",
      "report:view",
    ],
  },
  admin: {
    name: "Administrator",
    permissions: [
      "user:manage",
      "cms:read",
      "cms:write",
      "cms:publish",
      "form:manage",
      "cycle:manage",
      "document:configure",
      "scorecard:manage",
      "application:read_any",
      "report:view",
      "audit:view",
      "settings:manage",
    ],
  },
  super_admin: {
    name: "Super Administrator",
    permissions: [...PERMISSIONS], // everything
  },
};

async function main() {
  // Organization (tenant seam)
  const org = await db.organization.upsert({
    where: { slug: "step-iit-kgp" },
    update: {},
    create: { name: "STEP IIT Kharagpur", slug: "step-iit-kgp" },
  });

  // Permissions
  for (const key of PERMISSIONS) {
    await db.permission.upsert({ where: { key }, update: {}, create: { key } });
  }

  // Roles + mappings
  for (const [key, def] of Object.entries(ROLES)) {
    const role = await db.role.upsert({
      where: { key },
      update: { name: def.name },
      create: { key, name: def.name },
    });
    for (const permKey of def.permissions) {
      const perm = await db.permission.findUnique({ where: { key: permKey } });
      if (!perm) continue;
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // Initial super-admin. Password hashed with bcrypt (Milestone 1).
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@stepiitkgp.org";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: "STEP Administrator",
      passwordHash,
      status: "ACTIVE",
      emailVerified: new Date(),
      organizationId: org.id,
    },
  });
  const superRole = await db.role.findUnique({ where: { key: "super_admin" } });
  if (superRole) {
    await db.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: superRole.id } },
      update: {},
      create: { userId: admin.id, roleId: superRole.id },
    });
  }

  await seedCms();
  await seedForms();
  await seedCycles();

  console.log(
    `Seeded: org=${org.slug}, ${PERMISSIONS.length} permissions, ${Object.keys(ROLES).length} roles, admin=${adminEmail} (password: ${adminPassword})`,
  );
}

// ---- CMS content (Milestone 2) ----
async function seedCms() {
  // Pages with published blocks.
  const pages: { key: string; title: string; blocks: { type: string; data: unknown }[] }[] = [
    {
      key: "home",
      title: "Home",
      blocks: [
        {
          type: "hero",
          data: {
            eyebrow: "STEP · IIT Kharagpur",
            heading: "Building deep-tech ventures since 1986.",
            subheading:
              "India's pioneering technology incubator at IIT Kharagpur — from idea to graduation.",
            ctaLabel: "Apply to the 2026 Cohort",
            ctaHref: "/apply",
          },
        },
        {
          type: "statStrip",
          data: {
            stats: [
              { value: "100+", label: "Startups incubated" },
              { value: "1986", label: "Established" },
              { value: "15+", label: "Sectors" },
            ],
          },
        },
        {
          type: "showcaseTeaser",
          data: { title: "Featured startups", ctaLabel: "View all startups", ctaHref: "/startups" },
        },
        {
          type: "facilities",
          data: {
            title: "Why STEP",
            items: [
              { title: "Facilities", body: "Office and lab infrastructure on the IIT KGP campus." },
              { title: "Mentorship", body: "Access to experienced founders and domain mentors." },
              { title: "Funding", body: "Connections to DST and other government and private funding." },
            ],
          },
        },
        {
          type: "directorMessage",
          data: {
            heading: "Director's message",
            quote:
              "STEP has been nurturing technology ventures for nearly four decades, turning research into impact.",
            name: "Prof. Siddhartha Das",
            role: "Managing Director",
            photoUrl: "",
          },
        },
        {
          type: "partners",
          data: { title: "Our partners", items: [{ name: "DST" }, { name: "IDBI" }, { name: "IFCI" }, { name: "ICICI" }] },
        },
        { type: "cta", data: { heading: "Ready to build?", ctaLabel: "Apply now", ctaHref: "/apply" } },
      ],
    },
    {
      key: "about",
      title: "About STEP",
      blocks: [
        {
          type: "richtext",
          data: {
            title: "About STEP",
            body:
              "Set up in 1986, the Science & Technology Entrepreneurs' Park (STEP) at IIT Kharagpur has nurtured 100+ incubations, supported by DST, IDBI, IFCI, and ICICI. STEP connects founders to funding, prototyping, and mentorship — helping science & technology ventures get to market.",
          },
        },
        {
          type: "facilities",
          data: {
            title: "What we offer",
            items: [
              { title: "Incubation", body: "Phase-II incubation for internal and external startups." },
              { title: "Infrastructure", body: "Office and lab space with institute support." },
              { title: "Network", body: "A community of founders, mentors, and alumni." },
            ],
          },
        },
      ],
    },
  ];

  for (const p of pages) {
    const page = await db.page.upsert({
      where: { key: p.key },
      update: { title: p.title },
      create: { key: p.key, title: p.title },
    });
    await db.contentBlock.deleteMany({ where: { pageId: page.id } });
    const created = await Promise.all(
      p.blocks.map((b, i) =>
        db.contentBlock.create({ data: { pageId: page.id, type: b.type, data: b.data as object, order: i } }),
      ),
    );
    const snapshot = created.map((b) => ({ id: b.id, type: b.type, data: b.data, order: b.order }));
    // publish
    const last = await db.contentVersion.findFirst({ where: { pageId: page.id }, orderBy: { version: "desc" } });
    await db.contentVersion.create({
      data: { pageId: page.id, version: (last?.version ?? 0) + 1, snapshot: snapshot as object },
    });
    await db.page.update({
      where: { id: page.id },
      data: { status: "PUBLISHED", publishedBlocks: snapshot as object, publishedAt: new Date() },
    });
  }

  // Navigation.
  const primary = [
    { label: "About", href: "/about" },
    { label: "Startups", href: "/startups" },
    { label: "Apply", href: "/apply" },
  ];
  const footer = [
    { label: "About", href: "/about" },
    { label: "Startups", href: "/startups" },
    { label: "Apply", href: "/apply" },
    { label: "Sign in", href: "/auth/login" },
  ];
  await db.navigationItem.deleteMany({});
  await Promise.all([
    ...primary.map((n, i) => db.navigationItem.create({ data: { location: "primary", label: n.label, href: n.href, order: i } })),
    ...footer.map((n, i) => db.navigationItem.create({ data: { location: "footer", label: n.label, href: n.href, order: i } })),
  ]);
}

// ---- Form Engine sample template (Milestone 3) ----
async function seedForms() {
  const template = await db.formTemplate.upsert({
    where: { key: "student-application" },
    update: { name: "Student Application" },
    create: { key: "student-application", name: "Student Application" },
  });

  // Rebuild draft structure idempotently.
  await db.formSection.deleteMany({ where: { templateId: template.id } });

  const sections = [
    {
      key: "applicant",
      title: "Applicant details",
      fields: [
        { key: "full_name", label: "Full name", type: "TEXT", required: true, validation: { minLength: 2, maxLength: 120 } },
        { key: "roll_number", label: "Roll number", type: "TEXT", required: true },
        { key: "department", label: "Department", type: "SELECT", required: true, options: [
          { value: "cse", label: "Computer Science" },
          { value: "ece", label: "Electronics" },
          { value: "mech", label: "Mechanical" },
          { value: "other", label: "Other" },
        ] },
        { key: "email", label: "Email", type: "EMAIL", required: true },
      ],
    },
    {
      key: "startup",
      title: "Startup details",
      fields: [
        { key: "startup_name", label: "Startup name", type: "TEXT", required: true },
        { key: "stage", label: "Stage", type: "RADIO", required: true, options: [
          { value: "idea", label: "Idea" },
          { value: "prototype", label: "Prototype" },
          { value: "revenue", label: "Revenue" },
        ] },
        { key: "prototype_url", label: "Prototype URL", type: "URL", required: false, conditional: { field: "stage", equals: "prototype" } },
        { key: "one_liner", label: "One-line description", type: "TEXTAREA", required: true, validation: { maxLength: 280 } },
        { key: "funding_sought", label: "Funding sought (₹)", type: "CURRENCY", required: false, validation: { min: 0 } },
      ],
    },
  ];

  for (const [si, s] of sections.entries()) {
    const section = await db.formSection.create({
      data: { templateId: template.id, key: s.key, title: s.title, order: si },
    });
    for (const [fi, f] of s.fields.entries()) {
      await db.formField.create({
        data: {
          sectionId: section.id,
          key: f.key,
          label: f.label,
          type: f.type as never,
          required: f.required,
          order: fi,
          validation: (f as { validation?: object }).validation ?? undefined,
          conditional: (f as { conditional?: object }).conditional ?? undefined,
          options: (f as { options?: object }).options ?? undefined,
        },
      });
    }
  }

  // Publish v1 if not already published.
  const existing = await db.formTemplateVersion.findFirst({ where: { templateId: template.id } });
  if (!existing) {
    const full = await db.formSection.findMany({
      where: { templateId: template.id },
      orderBy: { order: "asc" },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    await db.formTemplateVersion.create({
      data: { templateId: template.id, version: 1, snapshot: full as object },
    });
  }
}

// ---- Cycles, Categories & Documents (Milestone 4) ----
async function seedCycles() {
  const categories = [
    { key: "student", name: "Student", order: 0 },
    { key: "faculty", name: "Faculty", order: 1 },
    { key: "staff", name: "Institute Staff", order: 2 },
    { key: "external", name: "External Startup", order: 3 },
  ];
  for (const c of categories) {
    await db.category.upsert({ where: { key: c.key }, update: { name: c.name, order: c.order }, create: c });
  }

  const sectors = ["deeptech", "lifesciences", "hardware", "software", "cleantech"];
  for (const s of sectors) {
    await db.sector.upsert({ where: { key: s }, update: {}, create: { key: s, name: s } });
  }

  // Per-category document requirements (idempotent: clear global reqs then recreate).
  const docsByCategory: Record<string, { key: string; label: string; required: boolean; allowedTypes: string[]; maxSizeMb: number }[]> = {
    student: [
      { key: "id_proof", label: "Institute ID proof", required: true, allowedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
      { key: "supervisor_rec", label: "Supervisor recommendation", required: true, allowedTypes: ["pdf"], maxSizeMb: 5 },
      { key: "pitch_deck", label: "Pitch deck", required: false, allowedTypes: ["pdf"], maxSizeMb: 20 },
    ],
    faculty: [
      { key: "id_proof", label: "Faculty ID proof", required: true, allowedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
      { key: "noc", label: "No-objection certificate", required: true, allowedTypes: ["pdf"], maxSizeMb: 5 },
    ],
    staff: [
      { key: "id_proof", label: "Staff ID proof", required: true, allowedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
    ],
    external: [
      { key: "incorporation", label: "Certificate of incorporation", required: true, allowedTypes: ["pdf"], maxSizeMb: 10 },
      { key: "pitch_deck", label: "Pitch deck", required: true, allowedTypes: ["pdf"], maxSizeMb: 20 },
      { key: "founder_id", label: "Founder ID proof", required: true, allowedTypes: ["pdf", "jpg", "png"], maxSizeMb: 5 },
    ],
  };
  for (const [catKey, reqs] of Object.entries(docsByCategory)) {
    const cat = await db.category.findUnique({ where: { key: catKey } });
    if (!cat) continue;
    await db.documentRequirement.deleteMany({ where: { categoryId: cat.id, cycleId: null } });
    await Promise.all(
      reqs.map((r, i) =>
        db.documentRequirement.create({
          data: { categoryId: cat.id, key: r.key, label: r.label, required: r.required, allowedTypes: r.allowedTypes, maxSizeMb: r.maxSizeMb, order: i },
        }),
      ),
    );
  }

  // A 2026 open cohort bound to the student-application template, all categories.
  const template = await db.formTemplate.findUnique({ where: { key: "student-application" } });
  const allCats = await db.category.findMany();
  const existing = await db.cycle.findFirst({ where: { year: 2026 } });
  const cycle = existing
    ? await db.cycle.update({ where: { id: existing.id }, data: { status: "OPEN", formTemplateId: template?.id ?? null } })
    : await db.cycle.create({
        data: {
          year: 2026,
          name: "2026 Cohort",
          status: "OPEN",
          opensAt: new Date("2026-01-01"),
          closesAt: new Date("2026-12-31"),
          formTemplateId: template?.id ?? null,
        },
      });
  await db.cycleCategory.deleteMany({ where: { cycleId: cycle.id } });
  await db.cycleCategory.createMany({
    data: allCats.map((c) => ({ cycleId: cycle.id, categoryId: c.id })),
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
