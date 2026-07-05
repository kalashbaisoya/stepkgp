# Phase 12 — Component Library & Design System
### STEP IIT KGP Incubation Management Platform

> The design system: tokens, primitives, and composite components that render the wireframes
> (Phase 11) consistently. Built on **Tailwind + shadcn/ui (Radix)** so accessibility is a default,
> not an afterthought. Everything is typed, themeable, and documented.

---

## 1. Design tokens

```
Color (semantic, light/dark):
  --brand         deep IIT-KGP-aligned navy/indigo   (primary actions, links)
  --brand-accent  a single warm accent               (highlights, focus)
  --bg / --surface / --surface-2                      (page, card, raised)
  --fg / --fg-muted / --fg-subtle                     (text hierarchy)
  --border, --ring                                    (dividers, focus ring)
  status: --draft(gray) --info(blue) --progress(amber) --success(green)
          --danger(red) --selected(emerald) --archived(slate)   ← lifecycle badges

Typography (typography-first):
  font-sans: Inter / Geist ;  font-display for hero headings
  scale: xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36 · 5xl 48 · 6xl 60
  leading generous; measure ~65ch for prose

Spacing: 4-pt base (1..24) · generous whitespace defaults
Radius:  sm 6 · md 10 · lg 14 · xl 20 · full
Shadow:  subtle, low-elevation, premium (no heavy drop shadows)
Motion:  150–250ms ease-out; Framer Motion for micro-interactions; respects prefers-reduced-motion
Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536  (mobile-first)
```

Tokens live in `tailwind.config` + CSS variables → single source; dark mode via `class` strategy.

---

## 2. Primitive components (shadcn/ui-based)

`Button` (variants: primary/secondary/ghost/destructive/link; sizes; loading) · `Input`, `Textarea`,
`Select`, `Combobox`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `FileDropzone`, `Slider` ·
`Label`, `FormField` (label+control+help+error) · `Card`, `Badge`, `Avatar`, `Tabs`, `Accordion`,
`Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`, `Toast`/`Sonner`, `Table` (sortable,
paginated), `Pagination`, `Breadcrumb`, `Skeleton`, `Progress`, `Stepper`, `EmptyState`, `Alert`,
`Separator`, `ScrollArea`, `Command` (⌘K search).

All are keyboard-accessible, focus-visible, ARIA-correct (Radix), and theme-token-driven.

---

## 3. Composite / domain components

**Layout & shell**
- `PublicShell` (CMS nav + footer), `AppShell` (topbar + role sidebar + notifications),
  `AdminShell` (grouped sidebar + breadcrumb), `AuthCard`.
- `RoleSidebar` — renders items from the user's permission set.
- `NotificationCenter` — bell + unread badge + list + mark-read.
- `PageHeader` (title, actions, breadcrumb), `SectionCard`.

**Form Engine (the core)**
- `FormRenderer` (sections + fields from template JSON), `FieldRenderer` (switch on `FieldType`),
  `FieldRegistry` (extensible map type→component), `AutosaveIndicator`, `ValidationSummary`,
  `ConditionalWrapper`. Shared by the wizard, business-plan, and admin **FormBuilder** (parity).
- `FormBuilder` (admin): `FieldPalette`, `FieldEditor`, `SectionList` (drag-reorder), `OptionSetEditor`.

**CMS**
- `BlockRenderer` + block components: `HeroBlock`, `StatStrip`, `RichTextBlock`, `GalleryBlock`,
  `FacilitiesGrid`, `ShowcaseTeaser`, `DirectorMessage`, `PartnersBlock`, `FaqBlock`, `CtaBlock`.
- `CmsEditor` (block list, drag-reorder, draft/preview/publish), `MediaLibrary`, `NavigationBuilder`,
  `SeoEditor`, `VersionHistory`.

**Applications & review**
- `ApplicationCard` (status badge + progress), `StatusBadge` (lifecycle-colored),
  `WizardStepRail` / `MobileStepper`, `ReviewChecklist`, `SubmitPanel`.
- `ReviewPortalTabs`, `InlineDocViewer` (PDF/image), `ScorecardForm` (live total), `NotesPanel`,
  `CommentThread`, `TimelineView`, `RecommendationControl`.

**Staff / incubation**
- `LifecycleBoard` (Kanban, drag → transition), `LifecycleColumn`, `PipelineCard`,
  `IncubationSummary`, `MilestoneList`, `FundingTable`, `MonthCounter` (n/11), `PublishShowcaseDialog`.

**Directory & reports**
- `StartupCard`, `StartupProfile`, `SectorFilter`, `MetricCard`, `ChartCard` (Recharts/visx),
  `TrendChart`, `ExportMenu`, `AuditTable`.

---

## 4. Patterns & conventions

- **Status is never color-only** — `StatusBadge` pairs color + label + icon (a11y).
- **Every list has empty/loading/error states** (`EmptyState`, `Skeleton`, `Alert`).
- **Forms:** `FormField` composition (label/help/error), inline validation, disabled-until-valid submit.
- **Optimistic feedback** on autosave, scoring, Kanban moves.
- **Consistent density:** comfortable default, compact option for tables/admin.
- **Icon set:** Lucide (consistent, tree-shakeable).

---

## 5. Documentation & tooling

- Components colocated under `/components/ui` (primitives) and `/components/<domain>` (composites).
- Optional **Storybook** for primitives + Form Engine states.
- Each component: typed props, variant API (`cva`), a11y notes, usage example.
- Visual regression (Chromatic/Playwright screenshots) on critical composites — optional, Phase 15+.

---

## 6. Theming & white-label readiness (future SaaS)

- All brand color/logo/typography via tokens → a future tenant can theme without code changes.
- `ThemeProvider` reads tenant/org theme (reserved) → sets CSS variables.
- Logo, name, palette sourced from CMS/org settings, not hardcoded.

> **Next (Phase 13):** the API specification — server actions, route handlers, and the versioned
> public API contract that ties frontend to backend.
