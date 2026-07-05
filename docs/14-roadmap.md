# Phase 14 — Implementation Roadmap
### STEP IIT KGP Incubation Management Platform

> The build order. Modules are sequenced so each milestone is **independently runnable and testable**,
> foundations come before features, and the highest-value differentiators (Form Engine, Application
> flow, CMS) land as soon as their dependencies exist. Each module has a **Definition of Done (DoD)**.
> Verification uses the Phase-5 journeys as end-to-end acceptance tests.

---

## Guiding principles
- **Walking skeleton first** — a deployable app with auth before any feature.
- **Vertical slices** — each module ships DB + service + API + UI + tests together.
- **Config before content** — lifecycle/roles/cycles seed data exists before applications flow.
- **Every module: RBAC-guarded + audited + validated** from day one (not retrofitted).

---

## Milestone 0 — Foundations (walking skeleton)
**Scope:** Next.js + TS + Tailwind + shadcn scaffold · Prisma + Postgres (Docker) · env/config ·
design tokens + primitives · `AppShell`/`PublicShell`/`AuthShell` · CI (lint/typecheck/test) ·
`/_health` · error/loading boundaries · seed script skeleton.
**DoD:** app builds, runs locally, deploys to managed cloud, health check green, one styled page.

## Milestone 1 — Identity, Auth & RBAC  *(deps: M0)*
**Scope:** User/Session/Role/Permission models · register · email verify · OTP · login · forgot/reset ·
session middleware · `requirePermission` guard + permission catalog · seed roles+permissions+admin ·
audit wrapper · rate limiting.
**DoD:** all auth journeys (J1, J10) pass E2E; RBAC guard blocks unauthorized; audit rows written.

## Milestone 2 — CMS + Public Website  *(deps: M0, M1)*
**Scope:** Page/ContentBlock/Collection/Media/Navigation/Seo/ContentVersion · `BlockRenderer` +
core blocks · CMS editor (draft/preview/publish + versions) · media library · public site (home,
about, programs, facilities, news, events, faq, contact) · tag-based revalidation · SEO/sitemap.xml.
**DoD:** admin edits + publishes content with zero code (J8-A); public pages render, cache-revalidate
on publish; Lighthouse/a11y pass. **This kills the developer-dependency problem.**

## Milestone 3 — Form Engine  *(deps: M1)*
**Scope:** FormTemplate/Version/Section/Field/OptionSet · `FormRenderer`/`FieldRenderer`/registry ·
validation compiler (→ Zod) · conditional visibility · admin `FormBuilder` (CRUD, reorder, options,
validation) · version-on-publish.
**DoD:** admin builds/reorders/validates a form with no code (J8-B); renderer + builder share the
field registry (parity); historical versions preserved.

## Milestone 4 — Cycles, Categories & Documents  *(deps: M3)*
**Scope:** Cycle/Category/Sector/DocumentRequirement · cycle manager (open/close, bind template +
scorecard + documents) · per-category document config · taxonomy admin.
**DoD:** admin opens a cohort and configures required docs per category (J8-C/D); open cycle surfaces
on `/apply`.

## Milestone 5 — Application System  *(deps: M3, M4)*  ★ core
**Scope:** Application/FieldValue/Version · multi-step wizard (Form-Engine-rendered) · **autosave** ·
resume · document upload (presign → confirm, type/size validation, scan seam) · supervisor
recommendation flow · review checklist · **idempotent submit** + versioned snapshot · applicant
dashboard + status tracker.
**DoD:** full apply→save→resume→submit journey (J1–J3) passes E2E on desktop + mobile; zero data
loss on crash; re-submit idempotent. **This eliminates the Word→scan→email workflow.**

## Milestone 6 — Business Plan → PDF  *(deps: M5)*
**Scope:** BusinessPlan/Section structured forms · section navigation/progress · **branded PDF
generation** job on submit/update · store `pdfKey`.
**DoD:** applicant completes BP as forms (no Word); PDF auto-generated + retrievable (J2 step). (FR-F)

## Milestone 7 — Lifecycle + Review & Scoring  *(deps: M5)*
**Scope:** LifecycleState/Transition/History (configurable, seeded) · staff **Kanban pipeline** ·
permissioned transitions · reviewer assignment · **Review Portal** (tabs, inline doc viewer) ·
configurable **Scorecards** + weighted scoring + aggregation · notes/comments/recommendation.
**DoD:** reviewer scores via rubric with auto-total (J4); staff moves apps through states (J5);
transitions audited; unassigned access blocked.

## Milestone 8 — Incubation Management + Scheduler  *(deps: M7)*
**Scope:** Incubation/Milestone/Funding/Office/Mentor/ReviewSchedule · incubation record UI ·
mentor portal (scoped) · **nightly 11-month scheduler** → notify + graduate flow · showcase publish.
**DoD:** staff records incubation, system auto-alerts at 11 months, graduates + publishes (J6, J7);
mentor sees only assigned (least privilege).

## Milestone 9 — Startup Directory (Showcase)  *(deps: M2, M8)*
**Scope:** ShowcaseEntry · publish/approve flow · public `/startups` list + `/startups/[slug]`
profile (logo, founders, sector, funding, gallery, videos, socials).
**DoD:** graduated startup published from incubation appears publicly (J6 tail); filterable; fast.

## Milestone 10 — Notifications  *(cross-cutting; incremental from M1)*
**Scope:** NotificationTemplate/Notification/Preference · event dispatcher · email adapter · in-app
notification center · admin templates · SMS adapter seam.
**DoD:** all FR-M triggers fire email + in-app; preferences respected; templates editable.
*(Wired incrementally as each module emits events; finalized here.)*

## Milestone 11 — Reports & Dashboards  *(deps: M5–M9)*
**Scope:** aggregation queries + `MetricCard`/`ChartCard` · dashboards (applications, selection rate,
sectors, funding, patents, graduated, duration, reviewer performance, trends) · exports.
**DoD:** director dashboards render per cycle with export (J9); numbers reconcile with source data.

## Milestone 12 — Audit, Admin polish & Hardening  *(deps: all)*
**Scope:** audit log viewer (queryable) · users/roles admin · settings · security review (OWASP) ·
performance pass (caching, indexes) · a11y audit (WCAG-AA) · backups + monitoring · docs.
**DoD:** every significant action traceable (FR-O); security + a11y + perf checks pass; backup/restore
verified; runbook written.

---

## Sequenced timeline (relative)

```
M0 Foundations        ▓▓
M1 Auth + RBAC          ▓▓▓
M2 CMS + Public            ▓▓▓▓         ← removes dev dependency
M3 Form Engine               ▓▓▓        ← differentiator
M4 Cycles/Docs                 ▓▓
M5 Applications ★                ▓▓▓▓▓  ← removes manual workflow
M6 Business Plan/PDF                 ▓▓
M7 Lifecycle+Review+Scoring            ▓▓▓▓
M8 Incubation+Scheduler                    ▓▓▓
M9 Showcase                                  ▓▓
M10 Notifications  (incremental) ····································▓
M11 Reports                                      ▓▓
M12 Audit/Hardening                                ▓▓▓
```

**MVP line** = M0–M5 (+ incremental M10 notifications): a public CMS site + register-once accounts +
fully online, auto-saving application. That alone retires both pain points (developer dependency +
manual application). M6–M12 complete the incubation OS.

---

## Definition of Done — global checklist (every module)
- [ ] Prisma models + migration + seed
- [ ] Service layer (Zod-validated, RBAC-guarded, audited)
- [ ] API (server actions / route handlers per Phase 13)
- [ ] UI (design-system components, responsive, a11y, empty/loading/error states)
- [ ] Tests: unit (logic) + E2E (relevant Phase-5 journey)
- [ ] Docs updated

---

## Cross-cutting tracks (run alongside)
- **Security:** authz-by-default, signed URLs, rate limits, secrets, OWASP review at M12.
- **Testing/CI:** lint+typecheck+unit on every PR; E2E on journeys; preview deploys.
- **Observability:** structured logs, error monitoring, health, uptime.
- **Data:** migrations forward-only; backups; seed idempotent.
- **Future seams (built as reserved, not implemented):** tenant scoping, `/api/v1`, notifications/PDF/
  reports as extractable services, SMS adapter, search, AI evaluation, OCR — per SRS "designed-for."

> **Next (Phase 15):** implementation begins at **Milestone 0 — Foundations**, then module by module,
> verifying each against its journey before advancing.
