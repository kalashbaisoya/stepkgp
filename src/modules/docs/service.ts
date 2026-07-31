import { db } from "@/lib/db";

export type LearningDocItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  order: number;
};

export const INITIAL_LEARNING_DOCS: LearningDocItem[] = [
  {
    slug: "playground-graph-nodes-architecture",
    title: "Understanding STEP Playground Node Topology",
    category: "graph-nodes",
    summary: "Learn how Node 1 through Node 5 execute sequentially to convert raw problem statements into validated incubation packages.",
    order: 1,
    content: `
# STEP Playground Node Topology Guide

The STEP Startup Playground operates on a 5-node graph pipeline designed to automate early-stage startup validation for IIT Kharagpur founders.

## Node Pipeline Breakdown

### Node 1: Seeded Problem Discovery
- Ingests raw problem statements from faculty research labs, industry challenges, or student proposals.
- Extracts domain key phrases, categorizes sector tags, and computes a Problem Clarity Score (0-100).

### Node 2: Faculty & Alumni Validation Lookup
- Queries the STEP database using hybrid keyword and semantic similarity.
- Matches relevant IIT Kharagpur faculty labs, alumni mentors, and student co-founders based on research interest overlap.

### Node 3: Surds Business Intelligence Engine
- Calculates Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM).
- Generates competitor risk matrices and unit economics projections (LTV:CAC, payback period).

### Node 4: Social Launchpack & Pitch Generator
- Auto-generates audience-tailored launch copy for LinkedIn, X (Twitter) threads, and 30-second elevator pitches.

### Node 5: VC Pitch & Legal Vault Dispatch
- Evaluates investment readiness score (0-100).
- Maps eligible government/institutional seed grants (DST NIDHI-PRAYAS, STEP Seed Fund, BIG).
- Generates IP assignment and incorporation compliance checklists.
    `,
  },
  {
    slug: "system-setup-and-tech-stack-guide",
    title: "Setting Up Your Startup Architecture & Local Dev Environment",
    category: "system-setup",
    summary: "Step-by-step setup guide for building robust MVPs with Next.js, FastAPI, Prisma DB, and edge AI runtime.",
    order: 2,
    content: `
# Startup MVP System Setup Guide

When building deep-tech or software MVPs at STEP IIT Kharagpur, follow this production-ready architecture specification.

## Tech Stack Recommendations

| Component | Standard Recommendation | DeepTech Alternative |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (React 19 + Tailwind v4) | Next.js + Three.js / WebGL |
| **Backend** | Next.js API Routes / Node.js Express | Python FastAPI / gRPC Microservices |
| **Database** | PostgreSQL / SQLite + Prisma ORM | PostgreSQL + pgvector (Semantic Search) |
| **AI / Edge** | OpenAI / Claude API via LangChain | PyTorch / ONNX Runtime on Jetson Nano |

## Quick Setup Steps

1. **Clone Base Repository**:
\`\`\`bash
git clone https://github.com/stepkgp/startup-mvp-template.git my-startup
cd my-startup
pnpm install
\`\`\`

2. **Configure Database Schema**:
\`\`\`bash
npx prisma db push
\`\`\`

3. **Launch Local Dev Server**:
\`\`\`bash
pnpm dev
\`\`\`
    `,
  },
  {
    slug: "claiming-student-alumni-professor-profiles",
    title: "Connecting with Faculty, Students & Alumni",
    category: "profiles",
    summary: "How students, alumni, and professors can publish their profile, list research interests, and join venture co-building.",
    order: 3,
    content: `
# IIT Kharagpur Talent Profile Guide

Collaboration is the core engine of STEP IIT Kharagpur. Whether you are a professor with patented research, an alumnus seeking mentoring opportunities, or a student co-founder looking for teammates, claiming your profile unlocks direct matches.

## Profile Roles

- **Professors & Researchers**: List lab facilities, patent portfolios, and available thesis advisory topics.
- **Alumni Mentors**: Specify industry domain, investment interest, and hours available for office hours.
- **Students**: Highlight software/hardware engineering skills, past projects, and startup ideas.
    `,
  },
  {
    slug: "step-incubation-pipeline-submission",
    title: "Submitting Your Node Package to STEP Incubation",
    category: "incubation-guide",
    summary: "Complete guide on seed capital grants, office space allocation, and 11-month incubation milestones.",
    order: 4,
    content: `
# STEP Incubation Pipeline Guide

Once your graph execution in the Playground achieves a **Viability Score > 75** and **TAM/SAM Score > 80**, you are eligible for direct submission to the STEP Incubation Selection Board.

## Selection Benefits

- **Seed Funding**: Access to ₹10L - ₹25L DST NIDHI-PRAYAS & STEP Seed Fund.
- **Infrastructure**: Dedicated office space at STEP IIT Kharagpur campus + high-performance computing lab access.
- **Legal & Patent Support**: Full patent filing assistance and incorporation legal support.
    `,
  },
];

export async function getLearningDocs(category?: string) {
  const docs = await db.learningDoc.findMany({
    where: category ? { category } : undefined,
    orderBy: { order: "asc" },
  });

  if (docs.length === 0) {
    // Seed initial docs if empty
    for (const doc of INITIAL_LEARNING_DOCS) {
      await db.learningDoc.upsert({
        where: { slug: doc.slug },
        update: {},
        create: doc,
      });
    }
    return db.learningDoc.findMany({ orderBy: { order: "asc" } });
  }

  return docs;
}

export async function getLearningDocBySlug(slug: string) {
  let doc = await db.learningDoc.findUnique({ where: { slug } });

  if (!doc) {
    const seed = INITIAL_LEARNING_DOCS.find((d) => d.slug === slug);
    if (seed) {
      doc = await db.learningDoc.create({ data: seed });
    }
  }

  return doc;
}
