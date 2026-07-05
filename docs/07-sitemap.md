# Phase 7 — Sitemap
### STEP IIT KGP Incubation Management Platform

> Concrete page tree derived from the IA (Phase 6). Each route lists its **access level** and notable
> **states/variants**. This is the routing contract for the Next.js App Router (Phase 10) and the
> surface list for wireframes (Phase 11). Access legend: 🌐 public · 🔒 authenticated · 🎫 role-gated.

---

## 1. Public zone `/`

```
🌐 /                         Home (CMS: hero, highlights, showcase teaser, CTA)
🌐 /about                    Vision, Mission, Director's message + photo, history
🌐 /programs                 Incubation programs / Phase-II model / what STEP offers
🌐 /facilities               Infrastructure & facilities (CMS collection)
🌐 /startups                 Public Showcase / Directory (filter by sector) 
🌐 /startups/[slug]          Startup detail (logo, founders, sector, funding, gallery, videos, links)
🌐 /news                     News list  →  /news/[slug]
🌐 /events                   Events list →  /events/[slug]  (view-only in v1; registration = future)
🌐 /resources               Downloads / resource library (CMS)
🌐 /faq                      FAQ (CMS)
🌐 /contact                  Contact details + form (CMS)
🌐 /apply                    Apply landing: open cycle + eligibility → CTA (register/login)
🌐 /legal/privacy, /legal/terms
```
Variants: `/apply` shows **open cycle** vs **closed / notify-me**; `/startups` empty vs populated.

---

## 2. Auth zone `/auth`

```
🌐 /auth/register            Email + password registration
🌐 /auth/verify              Email verification + OTP entry
🌐 /auth/login               Login (email/password, OTP option)
🌐 /auth/forgot              Request password reset
🌐 /auth/reset               Reset via token
🌐 /auth/recommendation/[token]   Supervisor recommendation (scoped, tokenized, no account)
```
States: unverified, verified, locked (rate-limited), token expired/invalid.

---

## 3. App zone `/app` (role portals) 🔒

### Applicant
```
🔒 /app                                   Applicant dashboard: applications × cycles, status tracker
🔒 /app/applications/new                  Start application: choose cycle + category
🔒 /app/applications/[id]                 Application overview (progress, resume)
🔒 /app/applications/[id]/[step]          Wizard step (Form-Engine-rendered; e.g. applicant, startup,
                                          founders, technology, innovation, patent, business-model,
                                          market, financials)
🔒 /app/applications/[id]/business-plan               Business Plan section index
🔒 /app/applications/[id]/business-plan/[section]     Structured BP section form
🔒 /app/applications/[id]/documents       Category-required document upload
🔒 /app/applications/[id]/review          Review & Submit (validation checklist, submit)
🔒 /app/applications/[id]/status          Status tracker + clarification responses
🔒 /app/notifications                     In-app notification center
🔒 /app/profile                           Profile & account settings
```
States per application: draft (resumable) · submitted · clarification-requested · scheduled ·
decided · read-only-after-submit (versioned snapshot).

### Reviewer 🎫
```
🎫 /app/review                            Assigned queue (status, due)
🎫 /app/review/[applicationId]            Review Portal (tabs below)
       ?tab=summary | documents | business-plan | founders | timeline | notes | score | history
```

### Mentor 🎫
```
🎫 /app/mentor                            Assigned incubatees
🎫 /app/mentor/[incubationId]             Milestones, review schedule, notes
```

### Incubation Staff 🎫
```
🎫 /app/staff/pipeline                    Lifecycle Kanban board (per cycle)
🎫 /app/staff/applications/[id]           Staff application view (+ transitions, assign, clarify)
🎫 /app/staff/incubation/[id]             Incubation record (mentor, office, funding, milestones)
🎫 /app/staff/assignments                 Assign reviewers / mentors
🎫 /app/staff/showcase                    Publish graduates to public showcase
```

---

## 4. Admin console `/admin` 🎫 (Administrator / Super Admin)

```
🎫 /admin                                 Admin dashboard (ops overview + reports entry)

  Content (CMS)
🎫 /admin/cms/pages                       Singletons: Home, About, Director, Vision/Mission, Contact
🎫 /admin/cms/pages/[key]                 Page editor (draft/preview/publish, versions)
🎫 /admin/cms/collections/[type]          Collections: events, news, facilities, gallery, downloads,
                                          faq, partners  (+ /[id] item editor)
🎫 /admin/cms/showcase                    Showcase entries (approve/publish graduated startups)
🎫 /admin/cms/media                       Media library
🎫 /admin/cms/navigation                  Primary nav + footer builder
🎫 /admin/cms/seo                         Per-page SEO metadata

  Application configuration
🎫 /admin/forms                           Form templates list (per cycle × category)
🎫 /admin/forms/[templateId]              Form builder: fields, order, validation, help, conditions
🎫 /admin/forms/option-sets               Reusable dropdown option sets
🎫 /admin/documents                       Required-document sets per category
🎫 /admin/cycles                          Cohorts list
🎫 /admin/cycles/[id]                      Cycle editor (dates, template, scorecard, documents, open/close)
🎫 /admin/scorecards                      Scorecards list
🎫 /admin/scorecards/[id]                 Scorecard builder (criteria + weights)
🎫 /admin/applications                    All applications (filters, bulk, lifecycle config)
🎫 /admin/applications/lifecycle          Lifecycle state/transition configuration

  People & System
🎫 /admin/users                           Users (search, roles, status)
🎫 /admin/users/[id]                       User detail (role assignment, activity)
🎫 /admin/roles                           Roles & permissions (Super Admin)  — RBAC matrix
🎫 /admin/reports                         Dashboards (FR-N) + exports
🎫 /admin/reports/[report]                Specific report (applications, selection-rate, funding, …)
🎫 /admin/audit                           Audit log (queryable, filterable) (FR-O)
🎫 /admin/settings                        System config, notification templates
🎫 /admin/settings/notifications          Email/in-app templates (SMS seam)
   (future) /admin/tenants                Multi-tenant management (reserved)
```

---

## 5. System / utility routes

```
   /api/*            Route handlers (server) — see Phase 13 API spec
   /api/webhooks/*   Inbound webhooks (email delivery, future payments) — reserved
   /_health          Health check (uptime/monitoring)
   /robots.txt, /sitemap.xml     SEO (generated from published CMS content)
   404 / 500 / 403   Error boundaries (per zone styling)
   /offline          (PWA seam — future)
```

---

## 6. Route access matrix (summary)

| Route group | Visitor | Applicant | Reviewer | Mentor | Staff | Admin | SuperAdmin |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/` public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/app` (applicant) | — | ✅ | ✅* | ✅* | ✅* | ✅* | ✅* |
| `/app/review/*` | — | — | ✅ | — | ✅ | ✅ | ✅ |
| `/app/mentor/*` | — | — | — | ✅ | ✅ | ✅ | ✅ |
| `/app/staff/*` | — | — | — | — | ✅ | ✅ | ✅ |
| `/admin/*` | — | — | — | — | partial† | ✅ | ✅ |
| `/admin/roles`, `/admin/tenants` | — | — | — | — | — | — | ✅ |

\* Higher roles can also *be* applicants (own applications).  † Staff may get scoped admin (e.g. reports) via permissions.
Exact permissions per route are formalized in the **Phase 9 RBAC matrix**.

> **Next (Phase 8):** the database design + ER model + Prisma schema draft that backs every route above.
