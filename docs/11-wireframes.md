# Phase 11 — UI/UX Wireframes (Low-Fidelity)
### STEP IIT KGP Incubation Management Platform

> ASCII/low-fi wireframes establish **layout, hierarchy, and content priority** for the key surfaces
> from the sitemap (Phase 7) before we specify components (Phase 12). Style intent: minimal, premium,
> typography-first, generous whitespace, YC-inspired. These are structural, not pixel-perfect.

---

## 1. Public — Home `/`

```
┌───────────────────────────────────────────────────────────────┐
│ [STEP·IIT-KGP logo]     About  Startups  Programs  News   [Apply▸]│  ← CMS nav, sticky
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│        Building deep-tech ventures since 1986.                  │  ← Hero (CMS), large type
│        India's pioneering technology incubator at IIT KGP.      │
│                     [ Apply to the 2026 Cohort ▸ ]              │  ← primary CTA
│                                                                 │
├───────────────────────────────────────────────────────────────┤
│  100+ startups · ₹XX funded · N patents        (stat strip)     │
├───────────────────────────────────────────────────────────────┤
│  Featured Startups   [card][card][card]  → View all startups →  │  ← showcase teaser
├───────────────────────────────────────────────────────────────┤
│  Why STEP    ◻ Facilities  ◻ Mentorship  ◻ Funding  ◻ Network   │
├───────────────────────────────────────────────────────────────┤
│  Director's message  [photo]  "…"  — Prof. Siddhartha Das       │
├───────────────────────────────────────────────────────────────┤
│  Footer: quick links · contact · partners · social              │  ← CMS footer
└───────────────────────────────────────────────────────────────┘
```

## 2. Public — Startup Showcase `/startups` and detail `/startups/[slug]`

```
List:  Filters [Sector ▾][Cohort ▾]      Search[…]
       ┌──────┐┌──────┐┌──────┐┌──────┐   ← responsive card grid
       │ logo ││ logo ││ logo ││ logo │     name · sector · one-liner
       └──────┘└──────┘└──────┘└──────┘

Detail: [logo]  Name                         [Visit site ▸]
        Sector · Cohort · Funding
        ── About ──────────────  Founders [avatars]
        Achievements · Gallery [▢▢▢] · Videos · Socials
```

## 3. Apply landing `/apply`

```
┌───────────────────────────────────────────────┐
│  Applications for 2026 Cohort are OPEN          │  (or: "Closed — notify me [email▸]")
│  Eligibility: Student · Faculty · Staff · External
│  What you'll need: … (category-aware checklist)  │
│         [ Create account & apply ▸ ]  [ Log in ] │
└───────────────────────────────────────────────┘
```

## 4. Auth `/auth/*`

```
        ┌───────────────────────┐
        │   STEP · IIT-KGP        │
        │  Create your account    │
        │  Email [___________]    │
        │  Password [________]    │
        │        [ Continue ▸ ]   │
        │  ─ or ─  Already? Log in│
        └───────────────────────┘
Verify: "Enter the 6-digit code sent to you"  [_ _ _ _ _ _]  [Verify]
```

## 5. Applicant Dashboard `/app`

```
┌ Top bar: STEP · [search] ·············· [🔔3] [Ananya ▾] ┐
├ sidebar ┬───────────────────────────────────────────────┤
│ Dash    │  Your applications                              │
│ Apps    │  ┌───────────────────────────────────────────┐ │
│ Notifs  │  │ 2026 Cohort · Student      ● Under Review  │ │
│ Profile │  │ Progress ▓▓▓▓▓▓▓▓▓▓ 100%   [View]          │ │
│         │  └───────────────────────────────────────────┘ │
│         │  ┌───────────────────────────────────────────┐ │
│         │  │ 2026 Cohort · (draft)      ○ Draft 40%     │ │
│         │  │ Progress ▓▓▓▓░░░░░░       [Resume ▸]       │ │
│         │  └───────────────────────────────────────────┘ │
│         │              [ + Start new application ]        │
└─────────┴───────────────────────────────────────────────┘
```

## 6. Application Wizard `/app/applications/[id]/[step]`

```
┌ Step rail (left) ───┬────────────────────────────────────────┐
│ ✓ Applicant         │  Startup Details                        │
│ ● Startup           │  (fields rendered by Form Engine)        │
│ ○ Founders          │  Company name [________________]         │
│ ○ Technology        │  Sector       [ Select ▾ ]               │
│ ○ Innovation        │  Stage        ( )Idea ( )Prototype …     │
│ ○ Patent            │  Description   [ …textarea… ]  ⓘ help     │
│ ○ Business Model    │                                          │
│ ○ Market            │  ⟳ Saved just now       [ Back ] [ Next ▸]│
│ ○ Financials        │                                          │
│ ○ Business Plan     │                                          │
│ ○ Documents         │                                          │
│ ○ Review & Submit   │                                          │
└─────────────────────┴────────────────────────────────────────┘
      autosave indicator ↑   ·   mobile: rail collapses to a stepper
```

## 7. Business Plan section & Documents

```
BP index: Exec Summary ✓ · Company ✓ · Operations ● · Market ○ · … (progress per section)
Section:  [ Rich structured fields ]  ⟳ autosaved   [Prev][Next]

Documents:  Required for Student
   �+ Pitch deck        (pdf, ≤10MB)   [ Upload ]  ✓ deck.pdf
   �+ Supervisor rec.   (pending)      [ Request from supervisor ▸ ]
   �+ ID proof                          [ Upload ]  ⧗ scanning…
```

## 8. Review & Submit

```
┌───────────────────────────────────────────────┐
│  Review your application                        │
│  ✓ Applicant  ✓ Startup  ✓ Founders … ✓ Docs    │
│  ⚠ Missing: Financials → Revenue (required)     │  ← blocks submit
│  [ Edit section ]                               │
│  ─────────────────────────────────────────────  │
│  Business Plan PDF will be generated on submit.  │
│        [ Submit application ▸ ]  (disabled until valid)
└───────────────────────────────────────────────┘
```

## 9. Reviewer — Review Portal `/app/review/[id]`

```
┌ App #1042 · Acme Robotics · Student · 2026 ─────────────────────┐
│ [Summary][Documents][Business Plan][Founders][Timeline][Notes][Score][History]
├─────────────────────────────────────────────┬──────────────────┤
│  (tab body: inline doc viewer / BP / etc.)    │  Scorecard        │
│                                               │  Innovation  [8]/10│
│   ┌ PDF / content viewer ───────────────┐     │  Market      [7]/10│
│   │                                      │     │  Technology  [9]/10│
│   │                                      │     │  Team        [8]/10│
│   └──────────────────────────────────────┘     │  ───────────────  │
│                                               │  Total: 80/100    │
│                                               │  Recommend: �˅     │
│                                               │  [ Submit review ]│
└───────────────────────────────────────────────┴──────────────────┘
```

## 10. Staff — Lifecycle Kanban `/app/staff/pipeline`

```
Cycle: 2026 ▾           [ + Assign reviewers ]        search[…]
┌ Submitted ┐┌ Screening ┐┌ Under Review ┐┌ Interview ┐┌ Selected ┐┌ Incubated ┐
│ [card]    ││ [card]    ││ [card]       ││ [card]    ││ [card]   ││ [card]    │
│ [card]    ││           ││ [card]       ││           ││          ││ [card]    │
└───────────┘└───────────┘└──────────────┘└───────────┘└──────────┘└───────────┘
   drag card → permissioned transition (audited)   card: name·category·score·avatar
```

## 11. Staff — Incubation record `/app/staff/incubation/[id]`

```
Acme Robotics — Incubated                        Status: Active ● (month 7/11)
Start: 2025-12-01   Agreement: 2025-12-15   Mentor: Meera Iyer
── Office ── B-204   ── Funding ── ₹… (3 records)   ── Review schedule ── monthly
── Milestones ──  ✓ MVP  ● Pilot  ○ Revenue         [ + Add milestone ]
⚠ Auto-alert at month 11 → graduation                [ Publish to showcase ▸ ]
```

## 12. Admin — CMS editor `/admin/cms/pages/[key]`

```
┌ Pages | Collections | Media | Navigation | SEO ─────────────────┐
│ Editing: Home            Status: Draft ●     [Preview] [Publish] │
│ Blocks:                                                         │
│  ▤ Hero          [edit]  ↕                                      │
│  ▤ Stat strip    [edit]  ↕                                      │
│  ▤ Showcase teaser[edit] ↕            + Add block ▾             │
│  ▤ Director msg   [edit] ↕                                      │
│  Version history: v5 (current) · v4 · v3 …                      │
└────────────────────────────────────────────────────────────────┘
```

## 13. Admin — Form Builder `/admin/forms/[templateId]`

```
Template: Student Application (v3 draft)              [Publish version]
┌ Sections ────────┬ Field editor ─────────────────────────────────┐
│ Applicant     ↕  │ Field: "Company name"                          │
│ Startup       ↕  │ Type [ Text ▾ ]  Required [✓]                  │
│  · Company name  │ Label [Company name]  Help [ … ]               │
│  · Sector        │ Validation: min[2] max[120] pattern[…]         │
│  + Add field     │ Conditional: show if [ Stage = Prototype ]     │
│ Founders      ↕  │                       [ Save field ]          │
└──────────────────┴───────────────────────────────────────────────┘
```

## 14. Admin — Cycle manager & Reports

```
Cycles:  2026 ● Open  (opens 01-Jun closes 31-Jul) [Edit][Close]
         2027 ○ Draft                              [Configure]
Configure: dates · form template ▾ · scorecard ▾ · documents ▾ · categories

Reports dashboard:
 ┌ Applications ┐┌ Selection rate ┐┌ Sectors ┐┌ Funding ┐
 │   248        ││     22%         ││ [pie]   ││ ₹… [bar]│
 └──────────────┘└─────────────────┘└─────────┘└─────────┘
 Trends [line chart over cohorts]              [ Export ▾ ]
```

## 15. Responsive & accessibility notes

- **Mobile:** sidebars → bottom/hamburger; wizard rail → top stepper; Kanban → horizontal scroll;
  tables → stacked cards. Applicant flow is fully phone-usable (P1).
- **A11y:** visible focus, keyboard-navigable wizard/Kanban, ARIA labels, contrast-safe status
  colors (never color-only — pair with text/icon), reduced-motion honoring.
- **Empty/loading/error** states designed for every surface (skeletons, friendly empties).

> **Next (Phase 12):** turn these layouts into a concrete component library + design tokens.
