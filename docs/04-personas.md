# Phase 4 — User Personas
### STEP IIT KGP Incubation Management Platform

> Personas translate the 11 RBAC roles from the SRS (§2) into concrete humans with goals,
> frustrations, and success criteria. They are the yardstick for every design decision in
> Phases 5–14: a feature that no persona needs is scope creep; a journey that fails a persona's
> goal is a bug in the design. Each persona below maps to one or more roles.

---

## Persona index

| # | Persona | Maps to role(s) | Primary surface |
|---|---------|-----------------|-----------------|
| P1 | Ananya — the Student Founder | Applicant, Student | Application wizard, applicant dashboard |
| P2 | Dr. Rakesh — the Faculty Innovator | Applicant, Faculty | Application wizard + supervisor flow |
| P3 | Priya — the External Startup Founder | Applicant, External Startup | Application wizard, business plan |
| P4 | Sabari — the Reviewer / Domain Expert | Reviewer | Review portal, scorecards |
| P5 | Meera — the Mentor | Mentor | Mentor view, milestones |
| P6 | Arjun — the Incubation Staff / Manager | Incubation Staff | Lifecycle board, incubation records |
| P7 | Kavita — the Administrator (Comms/Ops) | Administrator | CMS, form engine, cycles |
| P8 | Prof. Das — the Director / Super Admin | Super Administrator | Reports, oversight, config |
| P9 | Ravi — the Public Visitor | Public Visitor | Public website, showcase |

---

## P1 · Ananya Sen — the Student Founder
**Role:** Applicant (Student) · **Age:** 22 · **Context:** Final-year B.Tech, building a hardware IoT prototype with two classmates.

- **Goals:** Apply to the current cohort without printing/scanning anything; save progress between
  classes; get her supervisor's recommendation attached; know exactly where her application stands.
- **Frustrations (today):** The Word→pen→scan→PDF→email flow is humiliating and error-prone; she
  never knows if her email was received; unclear what documents are needed for a *student*.
- **Tech comfort:** High (mobile-first, expects Linear/Notion-grade UX).
- **Needs from platform:** Mobile-friendly wizard, auto-save, category = Student → correct document
  checklist, clarity on supervisor recommendation, real-time status, in-app + email notifications.
- **Success:** "I applied from my phone between lectures, my guide signed off, and I can see I'm in 'Under Review.'"
- **Design implications:** Excellent mobile experience; per-category document config (FR-E);
  supervisor-recommendation sub-flow; visible status tracker (FR-C, FR-G).

---

## P2 · Dr. Rakesh Menon — the Faculty Innovator
**Role:** Applicant (Faculty) · **Age:** 41 · **Context:** Associate Professor commercialising lab research; time-poor.

- **Goals:** Convert a funded research output into a startup; complete a serious business plan without
  fighting formatting; reuse his profile next cycle instead of re-entering everything.
- **Frustrations:** Repetitive data entry; uploading a Word business plan that gets reformatted;
  no single record of his prior submissions.
- **Tech comfort:** Medium — values structure and clarity over flashiness.
- **Needs:** Structured business-plan forms (FR-F) that produce a clean branded PDF; persistent
  account across cycles (FR-L); faculty-specific document set; ability to delegate data entry.
- **Success:** "The system built my business-plan PDF for me, and next year I just started a new application."
- **Design implications:** Business-plan-as-forms → auto PDF; account persistence + application
  versioning; faculty category documents; save-and-resume.

---

## P3 · Priya Nair — the External Startup Founder
**Role:** Applicant (External Startup) · **Age:** 33 · **Context:** Non-IIT founder, small team, seeking Phase-II incubation, office space, and mentor access.

- **Goals:** Present her company credibly; upload incorporation/IP documents; understand eligibility
  and what incubation offers; not lose two weeks of form-filling to a browser crash.
- **Frustrations:** Opaque external process; unclear document requirements for non-students;
  fear of losing entered data.
- **Tech comfort:** Medium-high.
- **Needs:** External-category document set (FR-E); durable auto-save (FR-C, NFR reliability);
  transparent lifecycle; notifications for interview/presentation scheduling (FR-M).
- **Success:** "I completed a long application over a week with zero data loss and got interview details by email + in-app."
- **Design implications:** Robust auto-save/idempotency; external document config; scheduling
  notifications; clear eligibility content on the public site (CMS).

---

## P4 · Sabari Krishnan — the Reviewer / Domain Expert
**Role:** Reviewer · **Age:** 45 · **Context:** Industry expert on a review panel; reviews 15–30 applications per cycle, often on weekends.

- **Goals:** Evaluate assigned applications efficiently; read everything in one place; score
  consistently; leave a recommendation.
- **Frustrations (today):** Receiving a ZIP of 30 PDFs by email; no standard scoring; can't see other
  reviewers' context; no history.
- **Tech comfort:** Medium.
- **Needs:** Review portal (FR-H) — summary, inline documents (no bulk download), business plan,
  founder details, timeline, notes, comments; configurable scorecard (FR-I) with auto-totals;
  only sees *assigned* applications (RBAC).
- **Success:** "Everything for each startup was on one screen; I scored via the rubric and my totals computed automatically."
- **Design implications:** Inline document viewer; assignment-scoped access; weighted scorecards +
  aggregation; internal notes/comments separated from applicant view.

---

## P5 · Meera Iyer — the Mentor
**Role:** Mentor · **Age:** 38 · **Context:** Serial entrepreneur mentoring 3–4 incubatees; only wants what's relevant to her mentees.

- **Goals:** Track her mentees' milestones and progress; add notes; know review schedule.
- **Frustrations:** No visibility into mentee status; everything over WhatsApp/email today.
- **Tech comfort:** Medium-high.
- **Needs:** Scoped mentor view (FR-J) — assigned incubatees, milestones, review schedule, notes;
  no access to unrelated applicants or admin surfaces (RBAC least-privilege).
- **Success:** "I can see my four startups' milestones and add guidance notes in one place."
- **Design implications:** Narrow, least-privilege mentor surface; milestone model shared with
  incubation management; note permissions.

---

## P6 · Arjun Bose — the Incubation Staff / Manager
**Role:** Incubation Staff · **Age:** 35 · **Context:** Runs day-to-day operations; owns the pipeline from submission to graduation.

- **Goals:** Move applications through the lifecycle; assign reviewers/mentors; allocate office space;
  record agreements, funding, milestones; be alerted at the 11-month mark; publish graduates to the showcase.
- **Frustrations (today):** Tracking everything in spreadsheets and email; missing the 11-month
  graduation trigger; no audit trail of who did what.
- **Tech comfort:** Medium.
- **Needs:** Lifecycle board with permissioned transitions (FR-G); incubation records — mentor,
  office, review schedule, funding, milestones (FR-J); **auto 11-month detection → notify → graduate**;
  one-click publish to showcase (FR-K); audit trail (FR-O).
- **Success:** "The system told me a startup hit 11 months, I graduated it, and published it to the showcase in two clicks."
- **Design implications:** Kanban-style lifecycle; scheduler/background job for 11-month detection;
  incubation entity; showcase publish flow gated on approval; every action audited.

---

## P7 · Kavita Rao — the Administrator (Comms & Ops)
**Role:** Administrator · **Age:** 30 · **Context:** Manages the website and application setup; *not* a developer, and shouldn't need one.

- **Goals:** Edit any website content herself; open/close application cycles; define the forms,
  fields, validations, dropdowns, and required documents per category; configure scorecards.
- **Frustrations (today):** Every content tweak requires emailing a developer and waiting days;
  forms are hardcoded; can't launch a new cohort without help.
- **Tech comfort:** Medium — comfortable with Notion/WordPress-style editors, not with code.
- **Needs:** No-code CMS with draft/publish + media library (FR-B); **Form Engine** to create/reorder/
  validate fields without code (FR-D); per-category document config (FR-E); cycle management (FR-L);
  scorecard builder (FR-I).
- **Success:** "I launched the 2027 cohort, edited the Director's message, and added a new form field — all before lunch, no developer."
- **Design implications:** This persona is the *raison d'être* of the CMS + Form Engine. Everything
  she touches must be data-driven, versioned, and safe (draft/publish, validation, audit).

---

## P8 · Prof. Siddhartha Das — the Director / Super Admin
**Role:** Super Administrator · **Context:** Managing Director; wants oversight, insight, and control without micromanaging.

- **Goals:** See the health of the incubator at a glance; ensure accountability; manage roles and
  system configuration; trust the numbers for DST/partner reporting.
- **Frustrations (today):** No dashboards; reporting is manual; no traceability of decisions.
- **Tech comfort:** Medium — wants clarity, not clutter.
- **Needs:** Reports/dashboards (FR-N) — applications, selection rate, sectors, funding, patents,
  graduated startups, incubation duration, reviewer performance, trends; role/permission management;
  full audit visibility (FR-O); future tenant/config control.
- **Success:** "I opened one dashboard and had the whole cohort's story — and could prove every decision."
- **Design implications:** Executive dashboards; RBAC admin; comprehensive, queryable audit log;
  export for reporting.

---

## P9 · Ravi Kumar — the Public Visitor
**Role:** Public Visitor · **Age:** 26 · **Context:** Prospective founder / student / partner exploring STEP for the first time.

- **Goals:** Understand what STEP is and offers; see credible graduated startups; find contact info;
  start an application easily.
- **Frustrations (today):** Static, dated site; unclear how to apply; no living proof of success.
- **Tech comfort:** High — judges credibility by the site's polish.
- **Needs:** Premium, fast, mobile-first public site (CMS-driven, FR-B); rich startup showcase
  (FR-K); frictionless "Apply" CTA → register → wizard; clear contact/eligibility content.
- **Success:** "The site felt like a top startup's — I understood STEP in a minute and started applying in one click."
- **Design implications:** YC-grade public UX; showcase as a trust engine; seamless
  visitor → applicant conversion; SEO metadata managed in CMS.

---

## Cross-cutting persona insights (inputs to Phase 5 journeys)

1. **Register once, apply forever** matters most to P1/P2/P3 — the account is the spine (FR-A, FR-L).
2. **No-code control** (P7, P8) is the platform's core differentiator — CMS + Form Engine are not
   "nice to have," they are the reason developers stop being a bottleneck.
3. **One-screen review** (P4) and **one-board lifecycle** (P6) are the staff-efficiency wins.
4. **Least-privilege scoping** (P4, P5) drives the RBAC matrix in Phase 9.
5. **Trust through polish + proof** (P9) ties the public CMS to the showcase and the apply funnel.
6. **Automation as a teammate** (P6) — the 11-month scheduler is a recurring "the system did it for me" moment.

> **Next (Phase 5):** map each persona through end-to-end journeys — Visitor→Applicant conversion,
> the full application lifecycle, the reviewer's scoring loop, and the staff incubation-to-graduation
> flow — surfacing every screen and state we must design.
