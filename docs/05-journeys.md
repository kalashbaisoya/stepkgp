# Phase 5 — User Journeys
### STEP IIT KGP Incubation Management Platform

> Journeys trace each persona (Phase 4) through the system end-to-end, exposing every **screen**,
> **state transition**, **notification**, and **system automation** we must design. Each journey lists
> steps, the system's response, and the emitted events (which drive notifications + audit logs).
> Screens surfaced here become the sitemap (Phase 7) and wireframes (Phase 11).

Legend: 🧑 user action · ⚙️ system action · 🔔 notification · 🗂️ audit event · 🟦 state change

---

## J1 · Visitor → Applicant conversion (P9 Ravi → P1 Ananya)

1. 🧑 Lands on homepage (CMS-driven) → browses Showcase, Facilities, Director's message.
2. 🧑 Clicks **Apply** → sees current open cycle + eligibility (or "applications closed" if none open).
3. 🧑 Chooses "Create account" → registers (email + password).
4. ⚙️ Sends verification email + OTP. 🔔 Email: "Verify your account." 🗂️ `user.registered`
5. 🧑 Verifies via link/OTP → 🟦 account `active`. 🗂️ `user.verified`
6. ⚙️ Redirect to **Applicant Dashboard** (empty state → "Start your application").
7. 🧑 Picks **cycle + category** (Student/Faculty/Staff/External).
8. ⚙️ Creates a `draft` application bound to that cycle + category's form template + document set.
   🟦 application `draft`. 🗂️ `application.created`

**Failure/edge:** no open cycle → CTA disabled with "Notify me" capture; already-registered → login;
unverified login → resend verification.

---

## J2 · The Application Wizard (P1/P2/P3) — the core flow

Multi-step, category-aware, **auto-saving**. Steps rendered from the **form template** (data, not code):
`Applicant → Startup → Founders → Technology → Innovation → Patent → Business Model → Market →
Financials → Business Plan → Documents → Review → Submit`.

1. 🧑 Fills a step's fields (rendered by the Form Engine from the versioned template).
2. ⚙️ **Auto-saves** on change/blur + step navigation (debounced). Progress % updates. 🗂️ `application.autosaved`
3. 🧑 Leaves and returns days later → ⚙️ resumes exactly where left off (no data loss).
4. 🧑 Reaches **Business Plan** → completes structured sections (Exec Summary … Customers) as forms.
5. 🧑 Reaches **Documents** → uploads category-required files; ⚙️ validates type/size, stores to
   object storage, saves metadata. 🗂️ `document.uploaded`
6. (Internal categories) 🧑 triggers **supervisor recommendation** → ⚙️ emails supervisor a scoped link.
   🔔 Supervisor email. 🗂️ `recommendation.requested`
7. 🧑 Reaches **Review** → sees a full read-only summary + validation checklist (missing required
   fields/documents flagged, submit disabled until complete).
8. 🧑 Clicks **Submit** → ⚙️ idempotent submit; snapshots a **versioned** submission; generates the
   **Business Plan PDF**; 🟦 `draft → submitted`. 🔔 "Application received." 🗂️ `application.submitted`

**Edge:** browser crash → last autosave intact; validation fails → inline errors, no state change;
re-submit click → idempotent (no duplicate).

---

## J3 · Applicant status tracking & clarification loop (P1/P2/P3)

1. 🧑 Opens dashboard → sees a **status tracker** reflecting the lifecycle state (§FR-G).
2. ⚙️ Staff requests clarification → 🟦 flagged "Clarification requested." 🔔 Email + in-app. 🗂️ `application.clarification_requested`
3. 🧑 Responds (edits allowed fields / uploads / replies) → ⚙️ re-locks. 🗂️ `application.clarification_answered`
4. ⚙️ Staff schedules **presentation/interview** → 🟦 state + date. 🔔 "Interview scheduled: <when/where>."
5. ⚙️ Decision recorded → 🟦 `Selected`/`Rejected`. 🔔 outcome email + in-app. 🗂️ `application.decided`
6. (If selected) 🟦 `Agreement Pending` → 🔔 "Next steps: agreement."

---

## J4 · Reviewer scoring loop (P4 Sabari)

1. 🧑 Logs in → **Reviewer dashboard** lists only **assigned** applications (RBAC-scoped) with status.
2. 🧑 Opens an application → **Review Portal** one-screen view: summary · documents (inline viewer,
   no bulk download) · business plan · founders · timeline · internal notes · comments · history.
3. 🧑 Scores via the **configurable scorecard** (weighted criteria). ⚙️ auto-computes total. 🗂️ `score.submitted`
4. 🧑 Adds internal notes/comments (not visible to applicant) + a **recommendation**. 🗂️ `review.recommended`
5. ⚙️ Aggregates multi-reviewer scores for staff. 🟦 (staff-driven) `Under Review → …`.

**Edge:** reviewer opens unassigned app → 403 (RBAC); edits score → versioned + audited.

---

## J5 · Staff pipeline & lifecycle management (P6 Arjun)

1. 🧑 Opens **Lifecycle Board** (Kanban by state) for the active cycle.
2. 🧑 Assigns reviewers/mentors; moves cards through permissioned transitions. 🟦 + 🗂️ per transition.
3. 🧑 On selection → records decision → 🟦 `Selected → Agreement Pending`. 🔔 applicant.
4. 🧑 On agreement signed → creates **Incubation record**: start date, agreement date, mentor,
   office allocation, review schedule, funding, milestones. 🟦 `Incubated`. 🗂️ `incubation.started`
5. ⚙️ Enforces required-document / decision gates before allowing a transition.

---

## J6 · Incubation → 11-month graduation automation (P6 + ⚙️ scheduler)

1. ⚙️ Nightly **scheduler** scans incubation records for `start_date + 11 months` approaching/reached.
2. ⚙️ At threshold → 🔔 notifies **startup + staff** ("Incubation completing"). 🗂️ `incubation.milestone_11m`
3. 🧑 Staff reviews → moves to 🟦 `Graduated`. 🗂️ `incubation.graduated`
4. 🧑 (Optional) approves **publish to Showcase** → ⚙️ creates/updates public directory entry.
   🟦 showcase `published`. 🗂️ `showcase.published`
5. ⚙️ Archives after graduation window → 🟦 `Archived` (history preserved, never overwritten).

---

## J7 · Mentor engagement (P5 Meera)

1. 🧑 Logs in → **Mentor dashboard**: only assigned incubatees.
2. 🧑 Views each mentee's milestones + review schedule; adds guidance notes. 🗂️ `mentor.note_added`
3. 🔔 Receives milestone/review reminders. (No access to unrelated data — least privilege.)

---

## J8 · Administrator no-code operations (P7 Kavita) — the differentiator

**A. CMS content edit**
1. 🧑 Opens **CMS** → edits Director message/photo, homepage, hero, facilities, gallery, events, news,
   downloads, FAQ, partners, footer, contact, navigation, SEO — in a rich editor + media library.
2. 🧑 Saves **draft** → previews → **publishes**. 🟦 content version published. 🗂️ `cms.published`

**B. Form Engine**
1. 🧑 Opens **Form Builder** for a cycle/category template → adds/deletes/reorders fields, sets
   mandatory/validation/help text, defines dropdown option sets, conditional visibility.
2. ⚙️ Saves as a **new template version** (historical submissions stay valid). 🗂️ `form.template_versioned`

**C. Document requirements** — 🧑 configures required documents per category. 🗂️ `documents.config_changed`

**D. Cycle management** — 🧑 opens the **2027 cohort** (dates, template, scorecard, documents) →
🟦 cycle `open`. 🗂️ `cycle.opened`

**E. Scorecard builder** — 🧑 defines criteria + weights. 🗂️ `scorecard.configured`

---

## J9 · Director oversight (P8 Prof. Das)

1. 🧑 Opens **Reports** → dashboards: applications, selection rate, sectors, funding, patents,
   graduated startups, incubation duration, reviewer performance, trends. Filters by cycle.
2. 🧑 Exports for DST/partner reporting.
3. 🧑 Manages **roles/permissions**; reviews **audit log** (full traceability). 🗂️ `rbac.changed`

---

## J10 · Authentication & account lifecycle (all authenticated personas)

Register → verify (email + OTP) → login → (forgot password → reset) → session → logout.
Persistent account reused across cycles; role assigned/updated by admin; rate-limited auth/OTP.
🗂️ `user.login`, `user.password_reset`, `user.role_changed`.

---

## Journey → surface & event summary (feeds Phases 6–13)

**Screens surfaced:** Public site (home, showcase, facilities, apply/eligibility, contact) ·
Auth (register, verify/OTP, login, forgot/reset) · Applicant (dashboard, wizard steps, business-plan
forms, document upload, review/submit, status tracker) · Reviewer (dashboard, review portal,
scorecard) · Mentor (dashboard, mentee/milestones) · Staff (lifecycle board, incubation record,
assignments) · Admin (CMS, form builder, document config, cycle manager, scorecard builder,
user/role management) · Director (reports/dashboards, audit log).

**Notification triggers (FR-M):** registration/verify, submission, clarification, interview/
presentation, decision, agreement, incubation milestones (incl. 11-month), graduation.

**Automations (⚙️ scheduler/jobs):** debounced auto-save, PDF generation on submit, 11-month
detector, deadline/cycle reminders, notification dispatch.

**Audit events (FR-O):** every 🗂️ above — actor, action, target, before/after, timestamp.

> **Next (Phase 6):** organize these surfaces into a coherent Information Architecture — the app's
> navigational and content structure per role.
