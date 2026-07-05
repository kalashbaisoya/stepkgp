# Phase 9 — Backend Architecture
### STEP IIT KGP Incubation Management Platform

> How the server is structured: the modular-monolith layout, the request→authorization→service→data
> flow, the **full RBAC permission matrix**, background jobs/scheduler, file storage, caching, and
> cross-cutting concerns (audit, notifications, error handling). Built on Next.js App Router server
> code + Prisma; designed so any module can later be extracted into a service.

---

## 1. Architectural style

**Modular monolith.** One deployable Next.js app; internally split into **domain modules** with
explicit boundaries. Modules talk through typed service functions, never by reaching into each
other's tables. This gives monolith simplicity now and a clean seam to extract high-load modules
(e.g. notifications, PDF, reports) into separate services later.

```
Request (RSC load / Server Action / Route Handler)
   │
   ├─ 1. Authentication      (session → current user + roles)
   ├─ 2. Authorization       (RBAC guard: permission + resource scope)
   ├─ 3. Validation          (Zod schema at the boundary)
   ├─ 4. Service (module)     (business logic; the only layer touching Prisma)
   │        ├─ emits domain events  → Notification dispatcher
   │        └─ writes AuditLog       (via audit wrapper)
   ├─ 5. Data                 (Prisma repository functions)
   └─ 6. Response / revalidate cache
```

---

## 2. Folder structure (server)

```
/modules
  /auth          (register, verify, otp, login, reset, session, rbac-assign)
  /rbac          (permission catalog, guard, hasPermission, scope checks)
  /cms           (pages, collections, media, navigation, seo, publish)
  /forms         (template versioning, field CRUD, render schema, validation compile)
  /cycles        (cohorts, categories, document requirements)
  /applications  (create, autosave, submit, versioning, field values)
  /businessPlan  (sections, pdf generation trigger)
  /review        (assignments, scoring, notes, comments, recommendation, aggregation)
  /lifecycle     (state machine, transitions, history)
  /incubation    (records, milestones, funding, office, mentors, 11-month detector)
  /directory     (showcase publish)
  /notifications (templates, dispatch, in-app + email adapters)
  /reports       (aggregation queries, exports)
  /audit         (write + query)
  /admin         (thin orchestration over cms/forms/cycles/rbac)
/lib
  /db            (Prisma client singleton)
  /storage       (S3 adapter: put, signedGet, delete)
  /jobs          (queue + worker + scheduler registration)
  /email         (provider adapter + templates)
  /auth          (session helpers, password hashing, otp)
  /validation    (shared Zod schemas)
  /rbac          (guard middleware, requirePermission)
  /audit         (withAudit wrapper)
  /cache         (tag-based revalidation helpers)
```

Each module exposes `service.ts` (public API), `repo.ts` (Prisma), `schema.ts` (Zod), and optional
`events.ts`. Route handlers / server actions are thin — they call services.

---

## 3. Authentication & session

- Email+password (hashed with argon2/bcrypt), email verification, **OTP** (TOTP or emailed code),
  forgot/reset via short-lived `VerificationToken`.
- Session strategy: secure, httpOnly cookies (Auth.js/NextAuth **or** a lean custom session over the
  `Session` table — decided at Phase 15 kickoff; schema supports both).
- **Rate limiting** on login/OTP/reset (per-IP + per-account) via cache layer.
- Supervisor recommendation uses a tokenized, account-less scoped link.

---

## 4. Authorization — RBAC

**Model:** `User → Role(s) → Permission(s)`; permissions are `resource:action`; **resource scope**
(`own` vs `any`) enforced in services. A single guard is used everywhere:

```ts
await requirePermission(user, "application:review", { scope: "assigned", resource: application })
```

### 4.1 Permission catalog (representative)
`user:*`, `role:manage`, `cms:read|write|publish`, `form:manage`, `cycle:manage`,
`document:configure`, `scorecard:manage`, `application:create|read_own|read_any|submit|clarify`,
`application:review|score|comment|recommend`, `lifecycle:transition`,
`incubation:manage|read`, `mentor:read_assigned|note`, `showcase:publish`,
`report:view`, `audit:view`, `settings:manage`.

### 4.2 RBAC permission matrix (role → key permissions)

| Permission | Visitor | Applicant | Reviewer | Mentor | Staff | Admin | SuperAdmin |
|------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Browse public / showcase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register / manage own account | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| application:create / read_own / submit | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| application:read_any | — | — | assigned | — | ✅ | ✅ | ✅ |
| application:review / score / recommend | — | — | ✅ (assigned) | — | ✅ | ✅ | ✅ |
| application:clarify (request) | — | — | — | — | ✅ | ✅ | ✅ |
| lifecycle:transition | — | — | — | — | ✅ | ✅ | ✅ |
| incubation:manage | — | — | — | — | ✅ | ✅ | ✅ |
| mentor:read_assigned / note | — | — | — | ✅ | ✅ | ✅ | ✅ |
| showcase:publish | — | — | — | — | ✅ | ✅ | ✅ |
| cms:read/write/publish | — | — | — | — | — | ✅ | ✅ |
| form:manage / document:configure | — | — | — | — | — | ✅ | ✅ |
| cycle:manage / scorecard:manage | — | — | — | — | — | ✅ | ✅ |
| report:view | — | — | — | — | scoped | ✅ | ✅ |
| user:manage | — | — | — | — | — | ✅ | ✅ |
| role:manage / lifecycle:configure | — | — | — | — | — | — | ✅ |
| audit:view | — | — | — | — | — | ✅ | ✅ |
| settings:manage / tenants | — | — | — | — | — | partial | ✅ |

*Higher roles inherit applicant abilities for their own applications. "assigned/scoped" = resource-scope check in service.*

---

## 5. Background jobs & scheduler

A queue (`Job` table + worker; upgradeable to BullMQ/Redis or a managed queue) handles async work:

- **PDF generation** — on `application.submitted` / business-plan update → render branded PDF → store → `pdfKey`.
- **Notification dispatch** — email + in-app fan-out from domain events.
- **Scheduler (cron):**
  - Nightly **11-month incubation scan** (`Incubation.startDate + 11mo`) → notify + flag for graduation.
  - Cycle open/close reminders; deadline nudges; review-schedule reminders.
- **Retries** with backoff + attempt cap; failed jobs surfaced to admin.

Jobs are idempotent (keyed) so re-runs never double-send or double-graduate.

---

## 6. File storage

- **S3-compatible** object storage (R2/S3). App holds only keys + metadata (`MediaAsset`,
  `ApplicationDocument`).
- **Uploads:** presigned PUT (client → storage), then server records metadata after validation
  (type/size); **virus-scan hook seam** before marking usable.
- **Reads:** short-lived presigned GET; documents never publicly listable. Public showcase media
  served via CDN with cache headers.

---

## 7. Caching strategy

- **Public pages:** RSC + Next cache with **tag-based revalidation** — publishing CMS content
  invalidates only affected tags (`cms:page:home`, `showcase`).
- **Data cache:** memoized read services per request; `revalidateTag` on writes.
- **CDN:** static assets + public pages at the edge.
- **Rate-limit / OTP / session counters:** in-memory now, Redis-ready seam for horizontal scale.
- Authenticated portal data is dynamic (no shared caching of PII).

---

## 8. Notifications engine

- **Event-driven:** services emit typed domain events; a dispatcher maps events →
  `NotificationTemplate` → channels (in-app row + email now; **SMS adapter seam**).
- **Preferences** per user/channel respected. Templates editable in Admin (FR-M).
- In-app notifications stored in `Notification`, surfaced in the notification center.

---

## 9. Cross-cutting concerns

- **Audit (FR-O):** a `withAudit(action, target)` wrapper on every mutating service writes an
  `AuditLog` row (actor, before/after, ip, ts). Non-negotiable on CMS publish, lifecycle transitions,
  scoring, uploads, RBAC changes.
- **Validation:** Zod at every boundary; form-engine validation compiled from `FormField.validation`.
- **Error handling:** typed domain errors → consistent HTTP + user messages; never leak internals.
- **Observability:** structured logging, error monitoring (Sentry-class), `/_health`, request tracing.
- **Security:** server-side authz always; signed URLs; CSRF protection on actions; secrets via env;
  input sanitization; OWASP Top-10 discipline; least-privilege DB user.

---

## 10. API surface

Two complementary mechanisms (detailed in Phase 13):
- **Server Actions** for first-party mutations (wizard autosave, submit, scoring, CMS edits) — typed,
  colocated, CSRF-safe.
- **Route Handlers** (`/api/*`) for uploads (presign), webhooks, health, exports, and the **future
  public API** (versioned `/api/v1/*`) enabling the mobile app + integrations without redesign.

---

## 11. Scalability & future microservice extraction

- Stateless app tier → horizontal scale behind the platform's load balancer.
- DB read scaling via indexes + pagination; heavy reports can move to read replicas.
- Extraction candidates (clean module boundaries already in place): **notifications**, **PDF/render**,
  **reports/analytics**, **search** (future). Each communicates via events/HTTP when split out.
- **Tenant seam** (`organizationId`) enables multi-tenant SaaS with row-level scoping + per-tenant
  config, no schema restructuring.

> **Next (Phase 10):** frontend architecture — rendering strategy, state, the Form Engine renderer,
> design-system integration, and routing/data-loading patterns.
