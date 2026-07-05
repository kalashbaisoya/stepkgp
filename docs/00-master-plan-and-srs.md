# STEP IIT KGP — Incubation Management Platform
## Master Plan + Phase 3: Software Requirements Specification (SRS)

---

## Context

STEP (Science & Technology Entrepreneurs' Park), IIT Kharagpur — established **1986**,
Managing Director **Prof. Siddhartha Das**, **100+ startups incubated**, backed historically by
DST New Delhi, DST West Bengal, IDBI, IFCI, and ICICI. It runs a Phase-II incubation model for
both internal (students/scholars/faculty) and external startups across science, deep-tech,
life-sciences, hi-tech, and enterprise sectors.

**The problem.** Today the public site (stepiitkgp.org) is a static SPA, and the application
process is manual and painful: download a Word form → fill by pen → scan → convert to PDF →
upload → email. Every website content change requires a developer. There is no structured record
of applicants, no online review/scoring, and no system to manage the incubation lifecycle.

**The goal.** Build a production-grade **Incubation Management Platform** — the operating system of
the incubation centre — that (1) replaces the manual application flow with a fully online,
auto-saving, multi-step application; (2) gives staff a review/scoring/lifecycle portal; (3) gives
admins a no-code CMS + dynamic form engine so they never depend on developers; and (4) is
architected so future modules (community, co-founder matching, investor portal, etc.) slot in
without redesign. Long-term this can become a multi-tenant SaaS for incubators across India.

**Locked decisions (from user):**
- **Process:** Full documentation first, delivered phase-by-phase with an approval gate at each phase.
- **Stack:** Next.js (App Router, TypeScript) · PostgreSQL + Prisma · Tailwind + shadcn/ui.
- **Hosting:** Managed cloud (Vercel/Railway-class) + managed Postgres + S3-compatible object storage.

**How this document is used.** This plan holds the **Phase-3 SRS** plus the roadmap for Phases 4–15.
Approving it approves the direction and the SRS. After approval I leave plan mode and produce each
subsequent phase as its own reviewable file under `/docs`, pausing for your sign-off between phases.

---

## 1. SRS — Purpose & Scope

**Purpose.** Define what the platform must do (functional), how well it must do it (non-functional),
who uses it, and the boundaries of v1, so downstream design phases have a single source of truth.

**In scope for v1 (the "walking product"):**
1. Public website driven by a no-code CMS.
2. Unified account + authentication (register once, apply every cycle).
3. Application system: multi-step, auto-saving, category-aware, cycle-based.
4. Dynamic Form Engine (admin-defined fields, validation, ordering, conditional documents).
5. Structured Business Plan (online forms → auto-generated PDF), replacing Word uploads.
6. Configurable application lifecycle + Review/Scoring portal.
7. Incubation management (post-selection: mentor, office, milestones, 11-month tracking).
8. Public Startup Directory / Showcase.
9. Notifications (email + in-app), Reports/Dashboards, and Audit Logs.
10. RBAC across all roles.

**Explicitly deferred (designed-for, not built in v1):** newsletter platform, founder community &
profiles, co-founder matching, mentor matching, investor portal, marketplace, discussion forum,
resource library, jobs board, public event registration, external APIs, mobile app, AI evaluation,
document OCR, SMS. The **schema and module boundaries in Phases 8–10 will reserve seams** for each.

---

## 2. Stakeholders & Roles (RBAC subjects)

| Role | Core needs |
|------|-----------|
| Public Visitor | Browse site, view showcase, start an application (→ register). |
| Applicant | Register, pick cycle+category, fill/save/submit application, track status, respond to clarifications. |
| Student / Faculty / Staff (internal) | Same as Applicant + supervisor-recommendation flow; category-specific documents. |
| External Startup | Same as Applicant with external-category documents. |
| Reviewer | See assigned applications, read summary/docs/business-plan, score via scorecards, comment, recommend. |
| Mentor | View assigned incubatees, milestones, notes (limited scope). |
| Incubation Staff | Manage lifecycle transitions, mentor/office allocation, milestones, funding, publish showcase. |
| Administrator | Full CMS, form engine, cycles, scorecards, document config, user management, reports. |
| Super Administrator | Everything + role/permission management, audit, system config, future tenant management. |

RBAC model: **role → permission** mapping with resource-scoped checks (own-vs-any). Detailed
permission matrix is a Phase-9 deliverable. Design is future-multi-tenant-ready (an
`organization`/tenant boundary is reserved even though v1 is single-tenant).

---

## 3. Functional Requirements (by module)

**FR-A · Accounts & Auth.** Email+password registration; email verification; OTP verification;
forgot/reset password; single persistent account reused across cycles; session management; role
assignment. (Provider choice — e.g. Auth.js/NextAuth vs. managed — decided in Phase 10.)

**FR-B · CMS.** Admin-editable, versioned content for: Director message & photo, homepage, hero,
vision, mission, facilities, gallery, events, news, downloads, FAQ, startup showcase, partners,
footer, contact details, navigation, SEO metadata. Draft/publish workflow; media library; no code.

**FR-C · Application System.** Cycle- and category-aware, multi-step wizard (Applicant → Startup →
Founders → Technology → Innovation → Patent → Business Model → Market → Financials → Business Plan →
Documents → Review → Submit). **Auto-save** every step; resume later; never lose data; per-application
version history; status tracking visible to applicant.

**FR-D · Dynamic Form Engine.** Admins create/delete/reorder fields; set mandatory/optional;
configure validation, help text, dropdown option sets; conditional visibility. Forms are **data, not
code** — rendered generically and versioned so historical submissions stay valid.

**FR-E · Document Requirements.** Per-category required-document sets configured in admin (Student /
Faculty / Staff / External), enforced at submission. File type/size validation; virus-scan hook seam.

**FR-F · Business Plan.** Structured sections (Executive Summary, Company Description, Operations,
Market Analysis, Competition, Technology, Current Status, Financials, Cash Flow, Funding Requirement,
Milestones, Future Projection, Products, Customers) captured as forms; **auto-generate a branded PDF**.

**FR-G · Lifecycle.** Configurable state machine: Draft → Submitted → Screening → Under Review →
Presentation Scheduled → Interview → Selected/Rejected → Agreement Pending → Incubated → Monthly
Review → Graduated → Archived. Transitions are permissioned and logged.

**FR-H · Review Portal.** Per-application: summary, documents (inline, no bulk PDF download),
business plan, founder details, timeline, internal notes, comments, scores, recommendation, history.

**FR-I · Scoring.** Configurable scorecards (e.g. Innovation, Market, Technology, Team, Scalability,
Business Model, Financial Viability); weighted criteria; multi-reviewer; auto-aggregated totals.

**FR-J · Incubation Management.** Store incubation start/agreement dates, mentor, office allocation,
review schedule, funding, milestones, status. **Auto-detect 11-month completion** → notify startup +
staff → move to Graduated → optionally publish to showcase on approval.

**FR-K · Startup Directory.** Public showcase of graduated startups: logo, description, founder,
sector, website, funding, achievements, social links, gallery, videos.

**FR-L · Cycles/Cohorts.** Multiple annual cohorts (2026, 2027, …); accounts persist across years;
every application versioned; history never overwritten.

**FR-M · Notifications.** Email + in-app now; SMS seam later. Triggers: submission, approval,
clarification requested, interview, selection, agreement, milestones, graduation. Template-driven.

**FR-N · Reports.** Dashboards: applications, selection rate, startup categories, revenue, funding,
patent stats, graduated startups, incubation duration, reviewer performance, application trends.

**FR-O · Audit Logs.** Every significant action recorded (actor, action, target, before/after, time)
— CMS edits, approvals, score changes, uploads, lifecycle transitions. Traceable and queryable.

---

## 4. Non-Functional Requirements

- **Security:** RBAC everywhere, server-side authorization, hashed passwords, signed/expiring file
  URLs, input validation, rate-limiting on auth/OTP, audit trail, OWASP Top-10 discipline, PII care.
- **Scalability:** Modular monolith now, seams for microservice extraction later; stateless app tier;
  object storage for files; DB indexing + pagination; background job queue for PDF/email/scheduler.
- **Performance:** Server components + caching (page/data/CDN); target fast TTFB; lazy media.
- **Maintainability:** TypeScript end-to-end, clear module boundaries, Prisma schema as contract,
  linting/formatting, tests on critical paths (auth, form engine, lifecycle, scoring).
- **Usability/UX:** YC-inspired — minimal, premium, typography-first, generous whitespace, elegant
  forms, tasteful motion, excellent mobile, WCAG-AA accessibility.
- **Reliability:** Auto-save durability, idempotent submissions, DB backups, error monitoring.
- **Extensibility:** Form-as-data, config-driven lifecycle/scorecards, reserved tenant boundary,
  event/notification abstraction so future modules subscribe without core changes.

---

## 5. High-Level System Architecture (preview — detailed in Phases 9–10)

- **Modular monolith** on Next.js App Router: server components for reads, server actions/route
  handlers for writes, all authorization server-side.
- **Domain modules** (bounded contexts): `auth`, `cms`, `forms`, `applications`, `businessPlan`,
  `review`, `incubation`, `directory`, `notifications`, `reports`, `audit`, `admin`.
- **Data:** PostgreSQL via Prisma. JSONB for dynamic form values + versioned form definitions.
- **Files:** S3-compatible object storage, signed URLs, DB stores metadata only.
- **Async:** job queue for PDF generation, emails, and the scheduler (11-month detector, deadlines).
- **Cross-cutting:** RBAC guard, audit middleware, notification dispatcher, caching layer.

---

## 6. Documentation Roadmap (Phases 4–15) — each produced as a `/docs` file, approved before the next

- **Phase 4 — Personas** (`docs/04-personas.md`)
- **Phase 5 — User Journeys** (`docs/05-journeys.md`)
- **Phase 6 — Information Architecture** (`docs/06-ia.md`)
- **Phase 7 — Sitemap** (`docs/07-sitemap.md`)
- **Phase 8 — Database Design + ER diagrams** (`docs/08-database.md`, incl. Prisma schema draft)
- **Phase 9 — Backend Architecture + RBAC permission matrix + API-layer design** (`docs/09-backend.md`)
- **Phase 10 — Frontend Architecture** (`docs/10-frontend.md`)
- **Phase 11 — UI/UX Wireframes** (`docs/11-wireframes.md`)
- **Phase 12 — Component Library / Design System** (`docs/12-components.md`)
- **Phase 13 — API Specifications** (`docs/13-api.md`)
- **Phase 14 — Implementation Roadmap** (`docs/14-roadmap.md`, module-by-module build order)
- **Phase 15 — Implementation** begins, module by module, on approval.

**Proposed repo layout (created when we reach code):** `/app` (routes), `/modules/<domain>`
(server logic per bounded context), `/components/ui` (design system), `/lib` (auth, db, storage,
jobs, rbac, audit), `/prisma`, `/docs`, `/emails`, `/tests`.

---

## 7. Constraints & Assumptions

- Single-tenant in v1; tenant boundary reserved in schema for future SaaS.
- Content/branding sourced from stepiitkgp.org (logo, director, contacts) — to be supplied/confirmed.
- Payments/fees: none assumed in v1 (no application fee found); a payments seam is noted, not built.
- Exact current Word-form fields to be confirmed with staff to seed the initial form templates.

---

## 8. Verification / How each phase is validated

- **Docs phases (4–14):** reviewed against this SRS for coverage and against the brief's module list;
  you approve each file before I proceed. ER/schema (Phase 8) validated by walking every functional
  requirement through the tables. RBAC matrix (Phase 9) validated role-by-role against Section 2.
- **Implementation (15+):** each module ships with the app runnable locally (Next dev + Postgres via
  Docker), Prisma migrations applied, and tests on critical paths (auth, form engine, lifecycle,
  scoring, PDF). We verify end-to-end by executing the real user journeys from Phase 5.

---

## Immediate next step (on approval)

Exit plan mode, scaffold `/docs`, and produce **Phase 4 — Personas** for your review — then proceed
down the roadmap one approved phase at a time, ending with module-by-module implementation.
