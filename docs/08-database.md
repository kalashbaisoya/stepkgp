# Phase 8 — Database Design (ER Model + Prisma Schema Draft)
### STEP IIT KGP Incubation Management Platform

> The data model is the contract every other layer depends on. This phase delivers the domain model,
> an ER overview, design decisions (especially **form-as-data**, **versioning**, **RBAC**, and the
> **reserved tenant boundary**), and a first-pass **Prisma schema**. PostgreSQL is the store; JSONB
> carries dynamic form values and definitions. IDs are `cuid`. Timestamps + soft-delete + audit are
> cross-cutting. This is a design draft — the authoritative schema lands in `/prisma/schema.prisma`
> during implementation (Phase 15).

---

## 1. Domain map (bounded contexts → tables)

- **Identity & Access:** `Organization` (tenant seam), `User`, `Role`, `Permission`, `RolePermission`,
  `UserRole`, `Session`, `VerificationToken`.
- **CMS:** `Page`, `ContentBlock`, `Collection`, `CollectionItem`, `MediaAsset`, `NavigationItem`,
  `SeoMeta`, `ContentVersion`.
- **Form Engine:** `FormTemplate`, `FormTemplateVersion`, `FormSection`, `FormField`, `OptionSet`,
  `OptionValue`, `ValidationRule`, `ConditionalRule`.
- **Cycles & Taxonomy:** `Cycle`, `Category`, `Sector`, `DocumentRequirement`.
- **Applications:** `Application`, `ApplicationVersion`, `ApplicationFieldValue`, `BusinessPlan`,
  `BusinessPlanSection`, `ApplicationDocument`, `RecommendationRequest`.
- **Review & Scoring:** `Scorecard`, `ScorecardCriterion`, `ReviewAssignment`, `Score`,
  `ReviewNote`, `Comment`, `Recommendation`.
- **Lifecycle:** `LifecycleState`, `LifecycleTransition`, `ApplicationStateHistory`.
- **Incubation:** `Incubation`, `Milestone`, `OfficeAllocation`, `FundingRecord`, `MentorAssignment`,
  `ReviewSchedule`.
- **Directory:** `ShowcaseEntry` (+ media via `MediaAsset`).
- **Notifications:** `NotificationTemplate`, `Notification`, `NotificationPreference`.
- **Audit & Ops:** `AuditLog`, `Job` (queue seam), `Setting`.

---

## 2. Key design decisions

1. **Form-as-data (FR-D).** Forms are never hardcoded. A `FormTemplate` has immutable
   **versions** (`FormTemplateVersion`) composed of `FormSection` → `FormField`. Submitted answers
   live in `ApplicationFieldValue` **keyed by field + captured template version**, so editing a form
   later never invalidates historical submissions. Values stored typed + as JSONB for flexibility.

2. **Everything versioned (FR-C, FR-L, FR-B).** `Application` keeps `ApplicationVersion` snapshots
   (immutable JSONB of the full submission at each submit). CMS content keeps `ContentVersion`.
   History is append-only — **never overwritten**.

3. **Cycle-scoped, account-persistent (FR-L).** A `User` persists across years; each `Application`
   binds a user to one `Cycle` + `Category`. Re-applying = new `Application`, never a mutation.

4. **Configurable lifecycle (FR-G).** States and transitions are **rows** (`LifecycleState`,
   `LifecycleTransition`), not an enum, so admins reconfigure the workflow. `ApplicationStateHistory`
   records every move (actor, from, to, at) — feeds timeline + audit.

5. **RBAC as data (§SRS 2).** `Role`↔`Permission` many-to-many; `User`↔`Role`. Permissions are
   `resource:action` strings (e.g. `application:review`, `cms:publish`). Resource-scope (own/any)
   enforced in the service layer (Phase 9).

6. **Tenant seam (future SaaS).** Every top-level table carries a nullable `organizationId`. v1 runs
   one org; multi-tenant later needs no restructuring, only enforcement + backfill.

7. **Files by reference.** `MediaAsset` / `ApplicationDocument` store object-storage keys + metadata;
   binaries never touch the DB. Signed URLs generated on read.

8. **Soft delete + timestamps everywhere.** `createdAt`, `updatedAt`, nullable `deletedAt`.

---

## 3. ER overview (textual)

```
Organization 1─* User *─* Role *─* Permission          (RBAC)
User 1─* Application *─1 Cycle ; Application *─1 Category
Cycle 1─* Application ; Cycle *─1 FormTemplate ; Cycle *─1 Scorecard ; Cycle *─* DocumentRequirement
FormTemplate 1─* FormTemplateVersion 1─* FormSection 1─* FormField *─1 OptionSet 1─* OptionValue
Application 1─* ApplicationFieldValue *─1 FormField
Application 1─1 BusinessPlan 1─* BusinessPlanSection
Application 1─* ApplicationDocument *─1 DocumentRequirement
Application 1─* ApplicationVersion (immutable snapshots)
Application 1─* ApplicationStateHistory *─1 LifecycleState
Application *─* User via ReviewAssignment ; ReviewAssignment 1─* Score *─1 ScorecardCriterion
Scorecard 1─* ScorecardCriterion
Application 1─1 Incubation 1─* Milestone ; Incubation 1─* FundingRecord ; Incubation 1─1 OfficeAllocation
Incubation *─1 User (mentor via MentorAssignment) ; Incubation 1─* ReviewSchedule
Incubation 1─1 ShowcaseEntry (on publish)
User 1─* Notification ; NotificationTemplate 1─* Notification
* 1─* AuditLog (polymorphic target)
```

---

## 4. Prisma schema draft (representative — not exhaustive)

```prisma
// datasource + generator omitted for brevity (PostgreSQL, prisma-client-js)

// ---------- Identity & Access ----------
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}

model User {
  id             String    @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  email          String    @unique
  passwordHash   String
  emailVerified  DateTime?
  name           String?
  phone          String?
  status         UserStatus @default(PENDING)
  roles          UserRole[]
  applications   Application[]
  sessions       Session[]
  notifications  Notification[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
  @@index([organizationId])
}
enum UserStatus { PENDING ACTIVE SUSPENDED }

model Role {
  id          String  @id @default(cuid())
  key         String  @unique          // applicant, reviewer, mentor, staff, admin, super_admin ...
  name        String
  permissions RolePermission[]
  users       UserRole[]
}
model Permission {
  id    String @id @default(cuid())
  key   String @unique                 // "application:review", "cms:publish", ...
  roles RolePermission[]
}
model RolePermission { roleId String; permissionId String
  role Role @relation(fields:[roleId], references:[id]); permission Permission @relation(fields:[permissionId], references:[id])
  @@id([roleId, permissionId]) }
model UserRole { userId String; roleId String
  user User @relation(fields:[userId], references:[id]); role Role @relation(fields:[roleId], references:[id])
  @@id([userId, roleId]) }

model Session { id String @id @default(cuid()); userId String; user User @relation(fields:[userId], references:[id])
  expiresAt DateTime; createdAt DateTime @default(now()) }
model VerificationToken { id String @id @default(cuid()); identifier String; token String @unique
  type TokenType; expiresAt DateTime }
enum TokenType { EMAIL_VERIFY OTP PASSWORD_RESET RECOMMENDATION }

// ---------- Cycles & Taxonomy ----------
model Cycle {
  id             String @id @default(cuid())
  organizationId String?
  year           Int
  name           String                 // "2026 Cohort"
  status         CycleStatus @default(DRAFT)
  opensAt        DateTime?
  closesAt       DateTime?
  formTemplateId String?
  scorecardId    String?
  applications   Application[]
  documentReqs   DocumentRequirement[]
  @@index([organizationId, year])
}
enum CycleStatus { DRAFT OPEN CLOSED ARCHIVED }

model Category { id String @id @default(cuid()); key String @unique; name String  // student/faculty/staff/external
  documentReqs DocumentRequirement[]; applications Application[] }
model Sector  { id String @id @default(cuid()); key String @unique; name String }
model DocumentRequirement { id String @id @default(cuid()); cycleId String?; categoryId String
  key String; label String; required Boolean @default(true); allowedTypes String[]; maxSizeMb Int @default(10)
  category Category @relation(fields:[categoryId], references:[id]); cycle Cycle? @relation(fields:[cycleId], references:[id]) }

// ---------- Form Engine ----------
model FormTemplate { id String @id @default(cuid()); key String; name String
  versions FormTemplateVersion[] }
model FormTemplateVersion { id String @id @default(cuid()); templateId String; version Int
  template FormTemplate @relation(fields:[templateId], references:[id]); sections FormSection[]
  publishedAt DateTime?; @@unique([templateId, version]) }
model FormSection { id String @id @default(cuid()); versionId String; key String; title String; order Int
  version FormTemplateVersion @relation(fields:[versionId], references:[id]); fields FormField[] }
model FormField {
  id String @id @default(cuid()); sectionId String; key String; label String
  type FieldType; required Boolean @default(false); order Int; helpText String?
  validation Json?                         // rules as JSON
  conditional Json?                        // visibility conditions
  optionSetId String?
  section FormSection @relation(fields:[sectionId], references:[id])
  optionSet OptionSet? @relation(fields:[optionSetId], references:[id])
}
enum FieldType { TEXT TEXTAREA NUMBER EMAIL PHONE DATE SELECT MULTISELECT RADIO CHECKBOX FILE CURRENCY URL RICHTEXT }
model OptionSet { id String @id @default(cuid()); key String @unique; name String; values OptionValue[]; fields FormField[] }
model OptionValue { id String @id @default(cuid()); optionSetId String; value String; label String; order Int
  optionSet OptionSet @relation(fields:[optionSetId], references:[id]) }

// ---------- Applications ----------
model Application {
  id             String @id @default(cuid())
  organizationId String?
  userId         String
  cycleId        String
  categoryId     String
  templateVersionId String
  currentStateId String
  progress       Int      @default(0)     // 0..100
  submittedAt    DateTime?
  user           User     @relation(fields:[userId], references:[id])
  cycle          Cycle    @relation(fields:[cycleId], references:[id])
  category       Category @relation(fields:[categoryId], references:[id])
  fieldValues    ApplicationFieldValue[]
  businessPlan   BusinessPlan?
  documents      ApplicationDocument[]
  versions       ApplicationVersion[]
  stateHistory   ApplicationStateHistory[]
  assignments    ReviewAssignment[]
  incubation     Incubation?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?
  @@index([userId]); @@index([cycleId, currentStateId])
}
model ApplicationFieldValue { id String @id @default(cuid()); applicationId String; fieldId String
  value Json                                   // typed value in JSONB
  application Application @relation(fields:[applicationId], references:[id])
  @@unique([applicationId, fieldId]) }
model ApplicationVersion { id String @id @default(cuid()); applicationId String; version Int
  snapshot Json; pdfKey String?; createdAt DateTime @default(now())
  application Application @relation(fields:[applicationId], references:[id]); @@unique([applicationId, version]) }
model BusinessPlan { id String @id @default(cuid()); applicationId String @unique
  application Application @relation(fields:[applicationId], references:[id]); sections BusinessPlanSection[]; pdfKey String? }
model BusinessPlanSection { id String @id @default(cuid()); businessPlanId String; key String; title String; order Int
  content Json; businessPlan BusinessPlan @relation(fields:[businessPlanId], references:[id]) }
model ApplicationDocument { id String @id @default(cuid()); applicationId String; requirementId String?
  storageKey String; fileName String; mimeType String; sizeBytes Int; uploadedAt DateTime @default(now())
  application Application @relation(fields:[applicationId], references:[id]) }
model RecommendationRequest { id String @id @default(cuid()); applicationId String; supervisorEmail String
  token String @unique; status String @default("pending"); respondedAt DateTime? }

// ---------- Lifecycle ----------
model LifecycleState { id String @id @default(cuid()); key String @unique; name String; order Int; isTerminal Boolean @default(false)
  fromTransitions LifecycleTransition[] @relation("from"); toTransitions LifecycleTransition[] @relation("to") }
model LifecycleTransition { id String @id @default(cuid()); fromStateId String; toStateId String; requiredPermission String?
  fromState LifecycleState @relation("from", fields:[fromStateId], references:[id])
  toState   LifecycleState @relation("to",   fields:[toStateId],   references:[id]) }
model ApplicationStateHistory { id String @id @default(cuid()); applicationId String; stateId String; actorId String?
  note String?; createdAt DateTime @default(now())
  application Application @relation(fields:[applicationId], references:[id]) }

// ---------- Review & Scoring ----------
model Scorecard { id String @id @default(cuid()); name String; criteria ScorecardCriterion[] }
model ScorecardCriterion { id String @id @default(cuid()); scorecardId String; name String; weight Float; maxScore Int @default(10); order Int
  scorecard Scorecard @relation(fields:[scorecardId], references:[id]); scores Score[] }
model ReviewAssignment { id String @id @default(cuid()); applicationId String; reviewerId String; status String @default("pending")
  application Application @relation(fields:[applicationId], references:[id]); scores Score[]; recommendation Recommendation?
  @@unique([applicationId, reviewerId]) }
model Score { id String @id @default(cuid()); assignmentId String; criterionId String; value Float
  assignment ReviewAssignment @relation(fields:[assignmentId], references:[id]); criterion ScorecardCriterion @relation(fields:[criterionId], references:[id])
  @@unique([assignmentId, criterionId]) }
model ReviewNote { id String @id @default(cuid()); applicationId String; authorId String; body String; internal Boolean @default(true); createdAt DateTime @default(now()) }
model Comment { id String @id @default(cuid()); applicationId String; authorId String; body String; createdAt DateTime @default(now()) }
model Recommendation { id String @id @default(cuid()); assignmentId String @unique; decision String; rationale String? }

// ---------- Incubation ----------
model Incubation { id String @id @default(cuid()); applicationId String @unique; organizationId String?
  startDate DateTime; agreementDate DateTime?; status String @default("active")
  application Application @relation(fields:[applicationId], references:[id])
  milestones Milestone[]; funding FundingRecord[]; office OfficeAllocation?; mentors MentorAssignment[]
  reviews ReviewSchedule[]; showcase ShowcaseEntry?
  @@index([startDate]) }        // index supports the 11-month scheduler scan
model Milestone { id String @id @default(cuid()); incubationId String; title String; dueDate DateTime?; status String @default("pending")
  incubation Incubation @relation(fields:[incubationId], references:[id]) }
model OfficeAllocation { id String @id @default(cuid()); incubationId String @unique; space String; fromDate DateTime; toDate DateTime? }
model FundingRecord { id String @id @default(cuid()); incubationId String; source String; amount Decimal; date DateTime; notes String? }
model MentorAssignment { id String @id @default(cuid()); incubationId String; mentorId String; @@unique([incubationId, mentorId]) }
model ReviewSchedule { id String @id @default(cuid()); incubationId String; scheduledFor DateTime; type String @default("monthly"); status String @default("scheduled") }

// ---------- Directory ----------
model ShowcaseEntry { id String @id @default(cuid()); incubationId String? @unique; slug String @unique
  name String; description String; sector String?; website String?; founders Json; funding Json?
  achievements Json?; socials Json?; gallery Json?; videos Json?; published Boolean @default(false)
  incubation Incubation? @relation(fields:[incubationId], references:[id]) }

// ---------- CMS ----------
model Page { id String @id @default(cuid()); key String @unique; title String; status ContentStatus @default(DRAFT)
  blocks ContentBlock[]; seo SeoMeta?; versions ContentVersion[] }
model ContentBlock { id String @id @default(cuid()); pageId String; type String; data Json; order Int
  page Page @relation(fields:[pageId], references:[id]) }
model Collection { id String @id @default(cuid()); key String @unique; name String; items CollectionItem[] }
model CollectionItem { id String @id @default(cuid()); collectionId String; slug String; data Json; status ContentStatus @default(DRAFT); order Int
  collection Collection @relation(fields:[collectionId], references:[id]); @@unique([collectionId, slug]) }
model MediaAsset { id String @id @default(cuid()); storageKey String; fileName String; mimeType String; sizeBytes Int; alt String?; createdAt DateTime @default(now()) }
model NavigationItem { id String @id @default(cuid()); location String; label String; href String; order Int; parentId String? }
model SeoMeta { id String @id @default(cuid()); pageId String @unique; title String?; description String?; ogImage String?; page Page @relation(fields:[pageId], references:[id]) }
model ContentVersion { id String @id @default(cuid()); pageId String; version Int; snapshot Json; publishedAt DateTime?; page Page @relation(fields:[pageId], references:[id]); @@unique([pageId, version]) }
enum ContentStatus { DRAFT PUBLISHED ARCHIVED }

// ---------- Notifications / Audit / Ops ----------
model NotificationTemplate { id String @id @default(cuid()); key String @unique; channel String; subject String?; body String }
model Notification { id String @id @default(cuid()); userId String; templateKey String; channel String
  payload Json; readAt DateTime?; sentAt DateTime?; createdAt DateTime @default(now())
  user User @relation(fields:[userId], references:[id]); @@index([userId, readAt]) }
model NotificationPreference { id String @id @default(cuid()); userId String; channel String; enabled Boolean @default(true) }
model AuditLog { id String @id @default(cuid()); organizationId String?; actorId String?; action String
  targetType String; targetId String?; before Json?; after Json?; ip String?; createdAt DateTime @default(now())
  @@index([targetType, targetId]); @@index([actorId]); @@index([createdAt]) }
model Job { id String @id @default(cuid()); type String; payload Json; status String @default("queued"); runAt DateTime?; attempts Int @default(0); createdAt DateTime @default(now()) }
model Setting { id String @id @default(cuid()); key String @unique; value Json }
```

---

## 5. Indexing, integrity & performance notes

- **Hot paths indexed:** `Application(cycleId,currentStateId)` (pipeline board), `Incubation(startDate)`
  (11-month scan), `Notification(userId,readAt)`, `AuditLog(targetType,targetId)`, unique constraints
  prevent duplicate field values / scores / assignments.
- **Referential integrity** via FKs; soft-delete via `deletedAt` (filtered in queries).
- **JSONB** for form values, snapshots, and flexible showcase/CMS data — queryable with GIN indexes
  where needed (e.g. reporting).
- **Migrations** managed by Prisma Migrate; seed script provisions default roles, permissions,
  lifecycle states, categories, and an initial admin.

---

## 6. Requirement → table traceability (spot-check)

| SRS FR | Backed by |
|--------|-----------|
| FR-A Auth | User, Session, VerificationToken, Role/Permission |
| FR-B CMS | Page, ContentBlock, Collection*, Media, Navigation, SeoMeta, ContentVersion |
| FR-C Application/autosave/versioning | Application, ApplicationFieldValue, ApplicationVersion |
| FR-D Form Engine | FormTemplate*, FormSection, FormField, OptionSet* |
| FR-E Documents | DocumentRequirement, ApplicationDocument |
| FR-F Business Plan | BusinessPlan, BusinessPlanSection (+pdfKey) |
| FR-G Lifecycle | LifecycleState/Transition, ApplicationStateHistory |
| FR-H/I Review/Scoring | ReviewAssignment, Score, Scorecard*, Note, Comment, Recommendation |
| FR-J Incubation + 11-month | Incubation(+startDate index), Milestone, Funding, Office, Mentor, ReviewSchedule |
| FR-K Directory | ShowcaseEntry |
| FR-L Cycles | Cycle, Category, versioned Application |
| FR-M Notifications | NotificationTemplate, Notification, Preference |
| FR-N Reports | derived (queries over above) |
| FR-O Audit | AuditLog |

> **Next (Phase 9):** backend architecture — module boundaries, the service/authorization layer, the
> full RBAC permission matrix, background jobs/scheduler, storage, and caching.
