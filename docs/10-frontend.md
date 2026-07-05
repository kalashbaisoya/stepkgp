# Phase 10 — Frontend Architecture
### STEP IIT KGP Incubation Management Platform

> How the client is built: rendering strategy, routing, data flow, state management, the **Form Engine
> renderer**, the CMS block renderer, forms/validation, and the design-system foundation. Stack:
> Next.js App Router + TypeScript + Tailwind + shadcn/ui, aiming for a YC/Linear-grade experience.

---

## 1. Rendering strategy

| Zone | Strategy | Why |
|------|----------|-----|
| Public (`/`) | **Server Components + static/ISR** with tag revalidation | SEO, speed, CMS-driven |
| Auth (`/auth`) | Server-rendered + minimal client islands | security, simplicity |
| App portals (`/app`) | Server Components for reads + **Client islands** for interactive bits | fast loads, rich UX |
| Admin (`/admin`) | Mostly client-interactive (builders) over server data | editing-heavy |

Default to **React Server Components**; drop to Client Components only for interactivity (wizard,
form builder, Kanban, uploads, notification center). Mutations via **Server Actions**; uploads +
webhooks via route handlers.

---

## 2. Routing & layout tree

```
app/
  (public)/           layout: public shell (CMS nav + footer)
    page.tsx, about, programs, startups/[slug], news/[slug], events, faq, contact, apply
  (auth)/             layout: minimal centered card
    login, register, verify, forgot, reset, recommendation/[token]
  app/                layout: authenticated shell (top bar + role sidebar + notifications)
    page.tsx (applicant dashboard)
    applications/[id]/[step], .../business-plan/[section], .../documents, .../review
    review/, review/[applicationId]
    mentor/, mentor/[incubationId]
    staff/pipeline, staff/applications/[id], staff/incubation/[id]
    notifications, profile
  admin/              layout: admin shell (grouped sidebar + breadcrumb)
    cms/*, forms/*, cycles/*, scorecards/*, documents, applications/*, users/*, roles,
    reports/*, audit, settings/*
  api/                route handlers
```

Role-aware navigation is **derived from permissions** (Phase 9), rendered server-side so users never
see links they can't use. `loading.tsx`/`error.tsx`/`not-found.tsx` per segment.

---

## 3. Data flow & state

- **Server data:** fetched in Server Components via module read-services (typed, cached with tags).
- **Mutations:** Server Actions return typed results; UI uses `useOptimistic` + `useTransition` for
  snappy feedback (autosave, scoring, Kanban moves).
- **Client state:** minimal and local. Wizard/builder use React state + a light store (Zustand) only
  where cross-component coordination is needed; **no global Redux**.
- **Server-state caching:** Next's cache + `revalidateTag`; React Query considered only for the
  future public API/mobile, not needed for RSC-first app.
- **Forms:** `react-hook-form` + **Zod** resolvers; the same Zod schemas are shared with the server
  (single source of truth).

---

## 4. The Form Engine renderer (core)

The killer capability: forms are **data**, rendered generically.

```
FormTemplateVersion (JSON from API)
   → <FormRenderer sections=… values=… onChange=autosave />
        → <FieldRenderer> switches on FieldType →
             TEXT|TEXTAREA|NUMBER|EMAIL|PHONE|DATE|SELECT|MULTISELECT|RADIO|
             CHECKBOX|FILE|CURRENCY|URL|RICHTEXT
        → validation compiled from field.validation (Zod)
        → conditional visibility evaluated from field.conditional
```

- **Autosave:** debounced `onChange` → Server Action `saveFieldValues(applicationId, values)`;
  optimistic progress bar; offline-safe (retry on reconnect).
- **One renderer, many contexts:** wizard steps, business-plan sections, and (mirror) the admin
  **Form Builder** all use the same field type registry → guaranteed parity between build & fill.
- **Extensible:** adding a field type = one registry entry + one component; no engine rewrite.

The **CMS Block renderer** works the same way for public content: `ContentBlock.type` → block
component (hero, richtext, gallery, facilities-grid, showcase-teaser, cta, faq, partners…).

---

## 5. Key interactive surfaces

- **Application Wizard:** step rail, per-step FormRenderer, autosave indicator, resume, review
  checklist, idempotent submit.
- **Review Portal:** tabbed layout, inline document viewer (PDF/image, no bulk download), scorecard
  form with live total, notes/comments.
- **Lifecycle Kanban (staff):** drag between permissioned columns → Server Action transition (optimistic).
- **Admin builders:** Form Builder (drag-reorder fields, edit validation/options), CMS editor
  (draft/preview/publish), Scorecard builder, Cycle manager.
- **Notification center:** in-app list, unread badges, mark-read.
- **Reports:** dashboard cards + charts (Recharts/visx), filters, export.

---

## 6. Design system integration

- **Tailwind** tokens + **shadcn/ui** primitives (Radix under the hood → accessible by default).
- **Design tokens:** color, spacing, radius, typography scale, motion — centralized (Phase 12).
- **Typography-first, generous whitespace**, restrained palette, tasteful motion (Framer Motion for
  micro-interactions), dark-mode ready.
- **Responsive**: mobile-first; the applicant wizard is fully usable on a phone (P1).
- **Accessibility:** WCAG-AA — semantic HTML, focus management, keyboard nav, ARIA via Radix,
  color-contrast tokens, reduced-motion support.

---

## 7. Performance

- RSC streaming + Suspense; route-level code splitting; `next/image` for media; font optimization.
- Skeleton/loading states per segment; optimistic UI on mutations.
- Minimal client JS (islands); heavy builders lazy-loaded in admin only.
- Tag-based cache keeps public pages near-static despite CMS dynamism.

---

## 8. Frontend quality & tooling

- TypeScript strict; ESLint + Prettier; component-driven (Storybook optional in Phase 12).
- Testing: unit (Vitest) for form-engine logic + utils; component tests (Testing Library);
  E2E (Playwright) for the critical journeys from Phase 5 (apply→submit, review→score, publish).
- i18n-ready structure (English v1; Hindi/regional later) — strings externalized.

> **Next (Phase 11):** low-fidelity wireframes for every key surface, establishing layout and content
> hierarchy before the component library is specified.
