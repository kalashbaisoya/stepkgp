/**
 * Seed script. Idempotent, and provisions the foundation:
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

// Permission catalog (Phase 9 §4.1): resource:action.
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
  await seedBusinessPlanDefs();
  await seedLifecycle();
  await seedCycles();
  await seedShowcase();
  await seedNotificationTemplates();

  console.log(
    `Seeded: org=${org.slug}, ${PERMISSIONS.length} permissions, ${Object.keys(ROLES).length} roles, admin=${adminEmail} (password: ${adminPassword})`,
  );
}

// ---- CMS content (Milestone 2) ----
async function seedCms() {
  // Pages with published blocks: real STEP IIT Kharagpur content.
  const SECTORS = [
    { name: "Deep-tech" }, { name: "Robotics" }, { name: "Life sciences" },
    { name: "Enterprise software" }, { name: "Fintech" }, { name: "Hardware" }, { name: "Clean-tech" },
  ];
  const PARTNERS = [{ name: "DST New Delhi" }, { name: "DST West Bengal" }, { name: "IDBI" }, { name: "IFCI" }, { name: "ICICI" }, { name: "NSTEDB" }];
  const FACILITIES = {
    title: "What STEP offers",
    subtitle: "Everything a founder needs to take an idea from the lab to the market.",
    items: [
      { title: "Phase-II incubation", body: "Structured incubation for both IIT Kharagpur ventures and external startups." },
      { title: "Campus infrastructure", body: "Office and laboratory space with the full support of IIT Kharagpur." },
      { title: "Mentorship", body: "Guidance from experienced founders, faculty, and domain experts." },
      { title: "Funding access", body: "Connections to DST and other government and private funding programmes." },
      { title: "Technology transfer", body: "A conduit between IIT Kharagpur research and commercial ventures." },
      { title: "Founder network", body: "A community of 100+ incubated startups, alumni, and investors." },
    ],
  };
  const TIMELINE = {
    title: "Four decades of building",
    items: [
      { year: "1986", title: "STEP established", body: "One of India's earliest science & technology entrepreneurs' parks, set up at IIT Kharagpur." },
      { year: "1987", title: "DST recognition", body: "Approved by the Department of Science & Technology, Government of India." },
      { year: "1989", title: "Operations begin", body: "STEP begins incubating its first ventures on the IIT Kharagpur campus." },
      { year: "Today", title: "100+ startups", body: "A portfolio spanning deep-tech, robotics, life sciences, fintech and more, with global success stories." },
    ],
  };

  const pages: { key: string; title: string; blocks: { type: string; data: unknown }[] }[] = [
    {
      key: "home",
      title: "STEP IIT Kharagpur",
      blocks: [
        {
          type: "heroCarousel",
          data: {
            eyebrow: "Science & Technology Entrepreneurs' Park",
            heading: "Where deep-tech ventures begin.",
            subheading:
              "India's pioneering technology incubator at IIT Kharagpur, turning research into companies since 1986. 100+ startups nurtured and counting.",
            ctaLabel: "Apply to the 2026 Cohort",
            ctaHref: "/apply",
            secondaryLabel: "Explore startups",
            secondaryHref: "/startups",
            slides: [
              { src: "/images/kgp-main-building.webp", caption: "IIT Kharagpur, Main Building" },
              { src: "/images/step-office.webp", caption: "STEP campus office" },
              { src: "/images/gopali-tea-garden.webp", caption: "Kharagpur" },
            ],
            stats: [
              { value: "1986", label: "Established" },
              { value: "100+", label: "Startups incubated" },
              { value: "5", label: "Founding partners" },
            ],
          },
        },
        { type: "featuredStartups", data: { eyebrow: "Portfolio", title: "Companies built at STEP", subtitle: "Ventures that began at STEP and went on to national and global impact." } },
        {
          // NOTE: placeholder quotes. Replace with real, approved founder testimonials
          // via Admin → Content. We do not publish quotes attributed to real people
          // without their sign-off.
          type: "testimonials",
          data: {
            eyebrow: "Founders",
            title: "What founders say",
            items: [
              { quote: "Add an approved founder testimonial here from the admin panel.", name: "Founder name", role: "Co-founder", company: "Company" },
              { quote: "Add an approved founder testimonial here from the admin panel.", name: "Founder name", role: "CEO", company: "Company" },
              { quote: "Add an approved founder testimonial here from the admin panel.", name: "Founder name", role: "Founder", company: "Company" },
            ],
          },
        },
        { type: "facilities", data: FACILITIES },
        { type: "sectors", data: { title: "Sectors we back", items: SECTORS } },
        {
          type: "directorMessage",
          data: {
            heading: "From the Managing Director",
            quote:
              "For nearly four decades, STEP has provided a nurturing environment for entrepreneurs, acting as a conduit between IIT Kharagpur and the world, turning research outcomes into commercially viable ventures.",
            name: "Prof. Siddhartha Das",
            role: "Managing Director, STEP IIT Kharagpur",
            photoUrl: "",
          },
        },
        { type: "timeline", data: TIMELINE },
        { type: "partners", data: { title: "Supported by", items: PARTNERS } },
        { type: "cta", data: { heading: "Ready to build the future?", subheading: "Apply to the current cohort and join 100+ ventures built at STEP.", ctaLabel: "Start your application", ctaHref: "/apply" } },
      ],
    },
    {
      key: "about",
      title: "About STEP",
      blocks: [
        {
          type: "richtext",
          data: {
            title: "About STEP, IIT Kharagpur",
            body:
              "The Science & Technology Entrepreneurs' Park (STEP) at IIT Kharagpur was set up in 1986 as one of India's earliest technology incubators, with support from DST New Delhi, DST West Bengal, IDBI, IFCI and ICICI.\n\nUnder the mandate of the National Science & Technology Entrepreneurship Development Board (NSTEDB), STEP has come a long way in promoting entrepreneurship by providing a conducive environment for nurturing and mentoring prospective entrepreneurs. It works in harmony with the institute's other incubation programmes and acts as a conduit between IIT Kharagpur and the external world, facilitating technology transfer and converting research outcomes into commercially viable propositions.\n\nOver nearly four decades, STEP has nurtured 100+ incubations, several of which have become global success stories.",
          },
        },
        { type: "timeline", data: TIMELINE },
        { type: "facilities", data: FACILITIES },
        { type: "partners", data: { title: "Supported by", items: PARTNERS } },
        { type: "cta", data: { heading: "Join the next cohort", ctaLabel: "Apply now", ctaHref: "/apply" } },
      ],
    },
    {
      key: "programs",
      title: "Programs",
      blocks: [
        {
          type: "richtext",
          data: {
            title: "Incubation at STEP",
            body:
              "STEP offers Phase-II incubation for ventures emerging from IIT Kharagpur as well as external startups. Incubatees receive campus infrastructure, mentorship, funding connections, and access to the institute's research and alumni network, with a structured lifecycle from application through graduation.",
          },
        },
        { type: "facilities", data: FACILITIES },
        { type: "sectors", data: { title: "Focus sectors", items: SECTORS } },
        { type: "cta", data: { heading: "Apply for incubation", ctaLabel: "Start application", ctaHref: "/apply" } },
      ],
    },
    {
      key: "contact",
      title: "Contact",
      blocks: [
        {
          type: "contact",
          data: {
            title: "Get in touch",
            address: "STEP, Indian Institute of Technology Kharagpur, Kharagpur, West Bengal 721302, India",
            phone: "+91-3222-281090 / +91-3222-281091",
            email: "info@stepiitkgp.org",
          },
        },
        {
          type: "faq",
          data: {
            title: "Frequently asked questions",
            items: [
              { q: "Who can apply to STEP?", a: "IIT Kharagpur students, faculty and staff, as well as external startups, may apply during an open cohort." },
              { q: "What does incubation include?", a: "Office/lab space, mentorship, funding connections, and access to the IIT Kharagpur ecosystem." },
              { q: "How long is the incubation?", a: "The core incubation runs up to 11 months, after which startups graduate from the programme." },
              { q: "How do I apply?", a: "Create an account and complete the online application, including a structured business plan, during an open cohort." },
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
    { label: "Programs", href: "/programs" },
    { label: "Startups", href: "/startups" },
    { label: "Contact", href: "/contact" },
  ];
  const footer = [
    { label: "About", href: "/about" },
    { label: "Programs", href: "/programs" },
    { label: "Startups", href: "/startups" },
    { label: "Contact", href: "/contact" },
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

// ---- Business plan section definitions (admin-configurable) ----
async function seedBusinessPlanDefs() {
  const { BUSINESS_PLAN_SECTIONS } = await import("../src/modules/businessPlan/sections");
  for (const [i, s] of BUSINESS_PLAN_SECTIONS.entries()) {
    await db.businessPlanSectionDef.upsert({
      where: { key: s.key },
      update: { title: s.title, prompt: s.prompt, required: s.required, minWords: s.minWords ?? null, maxWords: s.maxWords ?? null, order: i },
      create: { key: s.key, title: s.title, prompt: s.prompt, required: s.required, minWords: s.minWords ?? null, maxWords: s.maxWords ?? null, order: i },
    });
  }
}

// ---- Lifecycle states + transitions + scorecard (Milestone 7) ----
async function seedLifecycle() {
  const states = [
    { key: "draft", name: "Draft", order: 0 },
    { key: "submitted", name: "Submitted", order: 1 },
    { key: "screening", name: "Screening", order: 2 },
    { key: "under_review", name: "Under Review", order: 3 },
    { key: "presentation_scheduled", name: "Presentation Scheduled", order: 4 },
    { key: "interview", name: "Interview", order: 5 },
    { key: "selected", name: "Selected", order: 6 },
    { key: "rejected", name: "Rejected", order: 7, isTerminal: true },
    { key: "agreement_pending", name: "Agreement Pending", order: 8 },
    { key: "incubated", name: "Incubated", order: 9 },
    { key: "monthly_review", name: "Monthly Review", order: 10 },
    { key: "graduated", name: "Graduated", order: 11, isTerminal: true },
    { key: "archived", name: "Archived", order: 12, isTerminal: true },
  ];
  for (const s of states) {
    await db.lifecycleState.upsert({
      where: { key: s.key },
      update: { name: s.name, order: s.order, isTerminal: s.isTerminal ?? false },
      create: { key: s.key, name: s.name, order: s.order, isTerminal: s.isTerminal ?? false },
    });
  }

  // Allowed transitions (from -> [to]). Staff-driven unless noted.
  const flow: Record<string, string[]> = {
    submitted: ["screening", "rejected"],
    screening: ["under_review", "rejected"],
    under_review: ["presentation_scheduled", "rejected"],
    presentation_scheduled: ["interview", "rejected"],
    interview: ["selected", "rejected"],
    selected: ["agreement_pending"],
    agreement_pending: ["incubated"],
    incubated: ["monthly_review", "graduated"],
    monthly_review: ["graduated", "incubated"],
    graduated: ["archived"],
    rejected: ["archived"],
  };
  const byKey = Object.fromEntries((await db.lifecycleState.findMany()).map((s) => [s.key, s.id]));
  for (const [from, tos] of Object.entries(flow)) {
    for (const to of tos) {
      await db.lifecycleTransition.upsert({
        where: { fromStateId_toStateId: { fromStateId: byKey[from], toStateId: byKey[to] } },
        update: { requiredPermission: "lifecycle:transition" },
        create: { fromStateId: byKey[from], toStateId: byKey[to], requiredPermission: "lifecycle:transition" },
      });
    }
  }

  // Default scorecard.
  const sc = await db.scorecard.upsert({
    where: { key: "default" },
    update: { name: "Default Scorecard" },
    create: { key: "default", name: "Default Scorecard" },
  });
  const criteria = [
    { key: "innovation", name: "Innovation", weight: 1.5 },
    { key: "market", name: "Market", weight: 1.2 },
    { key: "technology", name: "Technology", weight: 1.3 },
    { key: "team", name: "Team", weight: 1.2 },
    { key: "scalability", name: "Scalability", weight: 1 },
    { key: "business_model", name: "Business Model", weight: 1 },
    { key: "financial_viability", name: "Financial Viability", weight: 1 },
  ];
  await db.scorecardCriterion.deleteMany({ where: { scorecardId: sc.id } });
  await db.scorecardCriterion.createMany({
    data: criteria.map((c, i) => ({ scorecardId: sc.id, key: c.key, name: c.name, weight: c.weight, maxScore: 10, order: i })),
  });
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
  const scorecard = await db.scorecard.findUnique({ where: { key: "default" } });
  const allCats = await db.category.findMany();
  const existing = await db.cycle.findFirst({ where: { year: 2026 } });
  const cycle = existing
    ? await db.cycle.update({ where: { id: existing.id }, data: { status: "OPEN", formTemplateId: template?.id ?? null, scorecardId: scorecard?.id ?? null } })
    : await db.cycle.create({
        data: {
          year: 2026,
          name: "2026 Cohort",
          status: "OPEN",
          opensAt: new Date("2026-01-01"),
          closesAt: new Date("2026-12-31"),
          formTemplateId: template?.id ?? null,
          scorecardId: scorecard?.id ?? null,
        },
      });
  await db.cycleCategory.deleteMany({ where: { cycleId: cycle.id } });
  await db.cycleCategory.createMany({
    data: allCats.map((c) => ({ cycleId: cycle.id, categoryId: c.id })),
  });
}

// ---- Notification templates (Milestone 10) ----
async function seedNotificationTemplates() {
  const templates = [
    { key: "application.submitted", title: "Application received", emailSubject: "Your STEP application has been received", body: "Hi {{name}}, we've received your application for {{cycle}}. You can track its status in your portal." },
    { key: "application.clarification_requested", title: "Clarification requested", emailSubject: "Action needed on your STEP application", body: "Hi {{name}}, our team has requested a clarification on your application. Please review and respond." },
    { key: "application.presentation_scheduled", title: "Presentation scheduled", emailSubject: "Your STEP presentation is scheduled", body: "Hi {{name}}, a presentation has been scheduled for your application. Details will follow." },
    { key: "application.interview", title: "Interview stage", emailSubject: "You've advanced to the interview stage", body: "Hi {{name}}, your application has advanced to the interview stage at STEP." },
    { key: "application.selected", title: "Congratulations, you have been selected!", emailSubject: "Congratulations! You've been selected by STEP", body: "Hi {{name}}, we're delighted to inform you that your application has been selected. Next steps will follow." },
    { key: "application.rejected", title: "Application update", emailSubject: "Update on your STEP application", body: "Hi {{name}}, thank you for applying to STEP. After careful review, your application was not selected this cycle." },
    { key: "application.agreement_pending", title: "Agreement pending", emailSubject: "Next steps: incubation agreement", body: "Hi {{name}}, please complete your incubation agreement to proceed." },
    { key: "application.incubated", title: "Welcome to incubation", emailSubject: "Welcome to STEP incubation", body: "Hi {{name}}, your startup is now incubated at STEP. Welcome aboard!" },
    { key: "incubation.milestone_11m", title: "11-month milestone reached", emailSubject: "Your incubation has reached 11 months", body: "Hi {{name}}, your incubation at STEP has reached the 11-month milestone. Our team will be in touch about graduation." },
    { key: "incubation.graduated", title: "Congratulations on graduating!", emailSubject: "You've graduated from STEP", body: "Hi {{name}}, congratulations on graduating from STEP incubation. We're proud to have you in our alumni network." },
    { key: "mentor.assigned", title: "New mentee assigned", emailSubject: "You've been assigned a new mentee", body: "Hi {{name}}, a new startup has been assigned to you for mentorship at STEP." },
    { key: "review.assigned", title: "New application to review", emailSubject: "You have a new application to review", body: "Hi {{name}}, a new application has been assigned to you for review." },
  ];
  for (const t of templates) {
    await db.notificationTemplate.upsert({
      where: { key: t.key },
      update: { title: t.title, emailSubject: t.emailSubject, body: t.body },
      create: { ...t, channels: ["inapp", "email"] },
    });
  }
}

// ---- Public showcase: real STEP IIT Kharagpur portfolio ----
// Logos resolve via Clearbit from each company's own domain; the UI falls back to a
// branded monogram if a logo can't be fetched, so nothing ever renders broken.
// Clearbit's free logo API was retired and logo.clearbit.com no longer resolves,
// so every seeded logo 404'd. Google's favicon endpoint is still live and serves
// the real mark for a live domain. Anything that does fail falls back to the
// branded monogram in CompanyLogo.
const logo = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

async function seedShowcase() {
  // Remove earlier placeholder entries (not tied to a real incubation).
  await db.showcaseEntry.deleteMany({ where: { slug: { in: ["aeronyx-robotics", "medgenix-labs", "auro-robotics"] } } });

  const entries = [
    {
      slug: "capillary-technologies",
      name: "Capillary Technologies",
      sector: "Enterprise Software",
      stage: "Growth",
      batch: "2008",
      location: "Bengaluru, India",
      tags: ["SaaS", "AI/ML", "Retail Tech", "Loyalty"],
      description:
        "Loyalty and customer-engagement software for retail and consumer brands. Runs loyalty programmes, personalisation and campaign management on one platform, using AI to segment shoppers and target offers.",
      website: "https://www.capillarytech.com",
      logoUrl: logo("capillarytech.com"),
      funding: "Listed on NSE and BSE",
      founders: [
        { name: "Aneesh Reddy", role: "Co-founder & CEO" },
        { name: "Krishna Mehra", role: "Co-founder" },
        { name: "Ajay Modani", role: "Co-founder" },
      ],
      achievements: [
        "Founded in August 2008 by three IIT Kharagpur alumni",
        "Backed by Warburg Pincus and Sequoia Capital before listing",
        "Now publicly traded on the NSE as CAPILLARY",
        "Runs 100+ loyalty programmes reaching over 500 million consumers",
      ],
      socials: [{ label: "Website", url: "https://www.capillarytech.com" }],
    },
    {
      slug: "agnext-technologies",
      name: "AgNext Technologies",
      sector: "Agritech",
      stage: "Growth",
      batch: "2016",
      location: "Chandigarh, India",
      tags: ["AI/ML", "Food Quality", "Deep Tech", "Hardware"],
      description:
        "Food quality testing hardware and software. Its Qualix platform pairs spectroscopy and imaging devices with AI to grade grain, milk, oilseeds, pulses, spices, tea and animal feed in seconds, at the point of trade.",
      website: "https://www.agnext.com",
      logoUrl: logo("agnext.com"),
      funding: "About $34M raised",
      founders: [
        { name: "Taranjeet Singh Bhamra", role: "Founder & CEO" },
        { name: "Sparsh Kaur", role: "Co-founder" },
        { name: "Mrigank Sharad", role: "Co-founder" },
      ],
      achievements: [
        "Qualix platform grades produce in seconds using AI, imaging and IoT",
        "Raised a $21M Series A led by Alpha Wave Incubation",
        "Novo Holdings led the Series B; Kalaari Capital and Omnivore also invested",
        "Roughly $34M raised across six rounds",
      ],
      socials: [{ label: "Website", url: "https://www.agnext.com" }],
    },
    {
      slug: "ecozen-solutions",
      name: "Ecozen Solutions (Ecofrost)",
      sector: "Agritech",
      stage: "Growth",
      batch: "2010",
      location: "Pune, India",
      tags: ["Clean Energy", "Solar", "Cold Chain", "Climate"],
      description:
        "Solar powered farm infrastructure. Ecofrost is an off-grid cold room that uses thermal energy storage to keep produce cold without a grid connection, and Ecotron is a solar pump controller for irrigation.",
      website: "https://www.ecozensolutions.com/ecofrost",
      logoUrl: logo("ecozensolutions.com"),
      funding: "$25M Series C",
      founders: [
        { name: "Devendra Gupta", role: "Co-founder" },
        { name: "Prateek Singhal", role: "Co-founder" },
        { name: "Vivek Pandey", role: "Co-founder" },
      ],
      achievements: [
        "Ecofrost solar cold rooms run off-grid on thermal energy storage",
        "Ecotron solar pumping adopted by more than 70,000 farmers",
        "$25M Series C led by Nuveen and Dare Ventures",
        "Founded on campus by three IIT Kharagpur alumni",
      ],
      socials: [{ label: "Website", url: "https://www.ecozensolutions.com" }],
    },
    {
      slug: "intinno-technologies",
      name: "Intinno Technologies",
      sector: "Edtech",
      stage: "Acquired / Evolved",
      batch: "2009",
      location: "Kharagpur, India",
      tags: ["Education", "SaaS", "Learning"],
      description:
        "Education technology platform built by IIT Kharagpur founders. The team went on to create SplashLearn, one of the most successful learning products out of India.",
      website: "https://www.intinno.com",
      logoUrl: logo("intinno.com"),
      funding: "Founders later built SplashLearn",
      founders: [
        { name: "Mayank Jain", role: "Co-founder" },
        { name: "Arpit Jain", role: "Co-founder" },
        { name: "Joy Deep Nath", role: "Co-founder" },
        { name: "Umang Jain", role: "Co-founder" },
      ],
      achievements: [
        "Education technology platform",
        "Founders later started SplashLearn, a global edtech success",
      ],
      socials: [],
    },
    {
      slug: "p2power-solutions",
      name: "P2Power Solutions",
      sector: "Energy",
      stage: "Established",
      batch: "2006",
      location: "Noida, India",
      tags: ["Power Quality", "Hardware", "Clean Energy"],
      description:
        "Power quality and energy solutions. Designing and manufacturing systems that improve efficiency and reliability for industrial power users.",
      website: "https://www.p2power.co.in",
      logoUrl: logo("p2power.co.in"),
      funding: "Bootstrapped",
      founders: [{ name: "Shwetank Jain", role: "Founder" }],
      achievements: [
        "Power quality & energy solutions",
        "IIT Kharagpur alumni venture, founded around 2006 at STEP",
      ],
      socials: [{ label: "Website", url: "https://www.p2power.co.in" }],
    },
    {
      slug: "dataresolve-technologies",
      name: "DataResolve Technologies",
      sector: "Cybersecurity",
      stage: "Established",
      batch: "2013",
      location: "Noida, India",
      tags: ["Security", "DLP", "Enterprise", "SaaS"],
      description:
        "Insider threat and data loss prevention software. Its inDefend product watches email, USB drives, cloud uploads, printing and browsers to block unauthorised data transfers, and flags risky employee behaviour before it becomes a breach.",
      website: "https://www.dataresolve.com",
      logoUrl: logo("dataresolve.com"),
      funding: "$4.77M raised",
      founders: [
        { name: "Dhruv Khanna", role: "Co-founder" },
        { name: "Nagarjun Rao Kota", role: "Co-founder" },
        { name: "Dipanjan Biswas", role: "Co-founder" },
      ],
      achievements: [
        "inDefend combines data loss prevention with user behaviour analytics",
        "Founded in 2008 by IIT Kharagpur alumni",
        "$4.77M raised from Parampara Capital and IIT Kharagpur",
        "Serves 200+ enterprise customers across BFSI, IT services and healthcare",
      ],
      socials: [{ label: "Website", url: "https://www.dataresolve.com" }],
    },
    {
      slug: "ants-ceramics",
      name: "Ants Ceramics",
      sector: "Advanced Materials",
      stage: "Established",
      batch: "2007",
      location: "Thane, India",
      tags: ["Materials", "Deep Tech", "Manufacturing"],
      description:
        "Precision technical ceramics. Manufactures alumina, zirconia, fused silica and zircon components by powder compaction, injection moulding, isostatic pressing and slip casting, plus micro-machining of sintered ceramic blocks.",
      website: "https://www.antslab.in",
      logoUrl: logo("antslab.in"),
      funding: "Bootstrapped",
      founders: [],
      achievements: [
        "Won the National Technology Day award from the President of India in 2018",
        "Recognised for zirconia components and carbon sulphur analysis crucibles",
        "Incubated at STEP IIT Kharagpur and CIIE IIM Ahmedabad from 2006",
        "Micro-machines ZTA, silicon carbide, aluminium nitride and silicon nitride",
      ],
      socials: [{ label: "Website", url: "https://www.antslab.in" }],
    },
    {
      slug: "tradelab-software",
      name: "Tradelab Software",
      sector: "Fintech",
      stage: "Established",
      batch: "2012",
      location: "Bengaluru, India",
      tags: ["Trading", "Low Latency", "Fintech"],
      description:
        "Trading and fintech software. Low-latency infrastructure, analytics and real-time execution tooling for brokerages and capital markets.",
      website: "https://www.tradelab.in",
      logoUrl: logo("tradelab.in"),
      funding: "Profitable",
      founders: [],
      achievements: ["Trading / fintech software", "Real-time analytics and execution infrastructure"],
      socials: [{ label: "Website", url: "https://www.tradelab.in" }],
    },
    {
      slug: "azure-software",
      name: "Azure Software",
      sector: "IT Services",
      stage: "Established",
      batch: "2005",
      location: "Kalyani, West Bengal",
      tags: ["Software Services", "IoT", "Embedded", "Enterprise"],
      description:
        "Engineering services for data acquisition and analytics, embedded and IoT systems, cloud applications and ERP. Takes projects from concept through to deployment for industrial and research clients.",
      website: "https://www.azuresys.com",
      logoUrl: logo("azuresys.com"),
      funding: "Bootstrapped, IIT Kharagpur holds a stake",
      founders: [],
      achievements: [
        "Over 25 years building embedded, IoT and data acquisition systems",
        "IIT Kharagpur holds an equity stake in the company",
        "Clients include AIIMS, DRDO, BHEL and IOCL",
        "Also works with Intel, SanDisk and Synopsys",
      ],
      socials: [{ label: "Website", url: "https://www.azuresys.com" }],
    },
  ];

  // Additional STEP companies: published (searchable in the directory) but NOT
  // featured on the homepage. Founder data is best-effort from public sources.
  const moreEntries = [
    {
      slug: "drishtee-foundation",
      name: "Drishtee Foundation",
      sector: "Social Enterprise",
      stage: "Established",
      batch: "2001",
      location: "Noida, India",
      tags: ["Rural Development", "Livelihoods", "Impact", "Social"],
      description:
        "Rural development and social enterprise focused on building sustainable livelihoods. Drishtee empowers rural communities through its Community, Capacity, Capital and Channels (4C) approach across thousands of villages.",
      website: "https://drishteefoundation.org",
      logoUrl: logo("drishteefoundation.org"),
      funding: "Social enterprise",
      founders: [
        { name: "Satyan Mishra", role: "Co-founder & Managing Director" },
        { name: "Nitin Gachhayat", role: "Co-founder" },
        { name: "Shailesh Thakur", role: "Co-founder" },
      ],
      achievements: [
        "Rural livelihoods across thousands of villages",
        "Founder Satyan Mishra is an Ashoka Fellow",
        "4C approach: Community, Capacity, Capital & Channels",
      ],
      socials: [{ label: "Website", url: "https://drishteefoundation.org" }],
    },
    {
      slug: "maribus-solar",
      name: "Maribus Solar",
      sector: "Clean Energy",
      stage: "Early",
      batch: "2022",
      location: "Gopali, Kharagpur, India",
      tags: ["Solar", "Marine", "Blue Economy", "Deep Tech"],
      description:
        "Solar-powered marine solutions for the blue economy. Designing electro-mechanical systems, solar motor boats and remote monitoring for waterways. Incubated at STEP Gopali, IIT Kharagpur.",
      website: "https://maribussolar.com",
      logoUrl: logo("maribussolar.com"),
      funding: "Early stage",
      founders: [
        { name: "Sharat Kumar", role: "Co-founder & Director" },
        { name: "Kshitij Shrivastava", role: "CEO" },
      ],
      achievements: [
        "Solar-powered marine solutions for the blue economy",
        "Incubated at STEP Gopali, IIT Kharagpur",
        "Founders from Ocean Engineering & Naval Architecture, IIT Kharagpur",
      ],
      socials: [{ label: "Website", url: "https://maribussolar.com" }],
    },
    {
      slug: "sensordrops-networks",
      name: "SensorDrops Networks",
      sector: "IoT",
      stage: "Early",
      batch: "2018",
      location: "Kharagpur, India",
      tags: ["IoT", "Sensors", "Deep Tech", "Industry 4.0"],
      description:
        "IoT-based sensing, monitoring and control solutions for healthcare, industry, agriculture and power. A government-recognised startup incubated at STEP, IIT Kharagpur.",
      website: "https://sensordropsnetworks.com",
      logoUrl: logo("sensordropsnetworks.com"),
      funding: "Early stage",
      founders: [
        { name: "Prof. Sudip Misra", role: "Co-founder & Director" },
        { name: "Anandarup Mukherjee", role: "Co-founder & Director" },
      ],
      achievements: [
        "IoT sensing, monitoring & control across sectors",
        "Incubated at STEP, IIT Kharagpur",
        "Founded by IIT Kharagpur IoT researchers",
      ],
      socials: [{ label: "Website", url: "https://sensordropsnetworks.com" }],
    },
    {
      slug: "weevils-drones",
      name: "Weevils Drones",
      sector: "Drones",
      stage: "Early",
      batch: "2024",
      location: "Bhubaneswar, India",
      tags: ["Drones", "UAV", "Robotics", "Hardware"],
      description:
        "Drone technology company designing, manufacturing and deploying advanced all-terrain UAVs, tested in extreme conditions from high-altitude Ladakh to high-temperature desert environments.",
      website: "https://weevildrone.co.in",
      logoUrl: logo("weevildrone.co.in"),
      funding: "Early stage",
      founders: [
        { name: "Siddhartha Sircar", role: "Director" },
        { name: "Sagarika Parija", role: "Director" },
        { name: "Ashis Saha", role: "Director" },
      ],
      achievements: [
        "Advanced all-terrain UAV design and manufacturing",
        "Tested from high-altitude Ladakh to desert conditions",
      ],
      socials: [{ label: "Website", url: "https://weevildrone.co.in" }],
    },
    {
      slug: "shrishtikhetra-agro-aqua",
      name: "Shrishtikhetra Agro & Aqua",
      sector: "Agritech",
      stage: "Early",
      batch: "2020",
      location: "West Bengal, India",
      tags: ["Agriculture", "Aquaculture", "AgriTech"],
      description:
        "Agro and aquaculture products and services. Building sustainable agriculture and aquaculture solutions for farmers and producers.",
      website: "https://shrishtikhetra.com",
      logoUrl: logo("shrishtikhetra.com"),
      funding: "Early stage",
      founders: [],
      achievements: ["Agro and aquaculture products & services"],
      socials: [{ label: "Website", url: "https://shrishtikhetra.com" }],
    },
  ];

  const all = [
    ...entries.map((e) => ({ ...e, featured: true })),
    ...moreEntries.map((e) => ({ ...e, featured: false })),
  ];

  for (const e of all) {
    const data = {
      name: e.name, sector: e.sector, description: e.description, website: e.website,
      funding: e.funding, logoUrl: e.logoUrl, batch: e.batch, stage: e.stage,
      location: e.location, tags: e.tags, founders: e.founders,
      achievements: e.achievements, socials: e.socials, published: true, featured: e.featured,
    };
    await db.showcaseEntry.upsert({
      where: { slug: e.slug },
      update: data,
      create: { slug: e.slug, ...data },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
