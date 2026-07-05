# Phase 13 — API Specifications
### STEP IIT KGP Incubation Management Platform

> The contract between frontend and backend. Two mechanisms: **Server Actions** (first-party, typed
> mutations) and **Route Handlers** (`/api/*` for uploads, webhooks, exports, health, and the
> versioned **public API** `/api/v1/*` for future mobile/integrations). Every endpoint states its
> auth, permission (Phase 9), inputs (Zod), outputs, and emitted events (→ notifications + audit).

Conventions: JSON; `cuid` ids; ISO-8601 dates; errors `{ error: { code, message, details? } }`;
pagination `?cursor=&limit=`; all mutations authorized server-side + audited.

---

## 1. Auth
| Action / Route | Method | Auth | Input → Output | Events |
|---|---|---|---|---|
| `registerUser` | action | public | {email,password,name} → {userId} | user.registered, send verify |
| `POST /api/auth/verify` | POST | public | {token}\|{otp} → {ok} | user.verified |
| `requestOtp` | action | public | {email} → {ok} | otp sent (rate-limited) |
| `login` | action | public | {email,password,otp?} → session cookie | user.login |
| `forgotPassword` | action | public | {email} → {ok} | reset token sent |
| `resetPassword` | action | public | {token,password} → {ok} | user.password_reset |
| `logout` | action | auth | — → {ok} | — |
| `GET /api/auth/session` | GET | auth | — → {user,roles,permissions} | — |

---

## 2. Applications (applicant)
| Action / Route | Auth (perm) | Input → Output | Events |
|---|---|---|---|
| `createApplication` | application:create | {cycleId,categoryId} → {application} | application.created |
| `getApplication` | read_own/any | {id} → {application, template, values} | — |
| `saveFieldValues` (autosave) | read_own | {id, values[]} → {progress} | application.autosaved |
| `saveBusinessPlanSection` | read_own | {id,sectionKey,content} → {ok} | — |
| `POST /api/applications/:id/documents/presign` | read_own | {fileName,mimeType,size,requirementId} → {url,key} | — |
| `confirmDocument` | read_own | {id,key,meta} → {document} | document.uploaded |
| `requestRecommendation` | read_own | {id,supervisorEmail} → {ok} | recommendation.requested |
| `submitApplication` (idempotent) | application:submit | {id} → {version} | application.submitted, pdf job |
| `respondClarification` | read_own | {id, values/docs} → {ok} | application.clarification_answered |
| `listMyApplications` | read_own | — → {applications[]} | — |

Validation: `submitApplication` runs the compiled template validation + required-document check;
returns `{error: VALIDATION, details:[…]}` if incomplete (no state change).

---

## 3. Review & scoring (reviewer)
| Action / Route | Auth (perm) | Input → Output | Events |
|---|---|---|---|
| `listAssignedReviews` | application:review | — → {assignments[]} | — |
| `getReviewPortal` | review (assigned) | {applicationId} → {summary,docs,bp,founders,timeline,history} | — |
| `submitScores` | application:score | {assignmentId, scores[]} → {total} | score.submitted |
| `addReviewNote` | application:review | {applicationId,body,internal} → {note} | review.note_added |
| `addComment` | application:comment | {applicationId,body} → {comment} | — |
| `setRecommendation` | application:recommend | {assignmentId,decision,rationale} → {ok} | review.recommended |

Documents served via short-lived presigned GET; no bulk download endpoint (by design).

---

## 4. Lifecycle & staff
| Action / Route | Auth (perm) | Input → Output | Events |
|---|---|---|---|
| `getPipeline` | application:read_any | {cycleId} → {byState:{state:apps[]}} | — |
| `transitionApplication` | lifecycle:transition | {id,toStateId,note?} → {state} | application.state_changed |
| `assignReviewers` | application:read_any | {id, reviewerIds[]} → {assignments} | review.assigned |
| `requestClarification` | application:clarify | {id, message} → {ok} | application.clarification_requested |
| `recordDecision` | lifecycle:transition | {id, decision} → {state} | application.decided |

`transitionApplication` validates the move against `LifecycleTransition` + required permission; writes
`ApplicationStateHistory`; emits notifications per state.

---

## 5. Incubation (staff/mentor)
| Action / Route | Auth (perm) | Input → Output | Events |
|---|---|---|---|
| `createIncubation` | incubation:manage | {applicationId,startDate,agreementDate,…} → {incubation} | incubation.started |
| `updateIncubation` | incubation:manage | {id, fields} → {incubation} | — |
| `addMilestone`/`updateMilestone` | incubation:manage | {incubationId,…} → {milestone} | — |
| `addFunding` | incubation:manage | {incubationId,source,amount,date} → {record} | — |
| `assignMentor` | incubation:manage | {incubationId,mentorId} → {ok} | mentor.assigned |
| `getMentees` | mentor:read_assigned | — → {incubations[]} | — |
| `addMentorNote` | mentor:note | {incubationId,body} → {note} | mentor.note_added |
| `publishShowcase` | showcase:publish | {incubationId, entry} → {showcaseEntry} | showcase.published |
| `graduate` | lifecycle:transition | {incubationId} → {state} | incubation.graduated |

**Scheduler (internal, not public):** nightly job → `incubation.milestone_11m` when
`startDate + 11mo` reached → notify startup+staff → flag for graduation.

---

## 6. CMS (admin)
| Action / Route | Auth (perm) | Input → Output | Events |
|---|---|---|---|
| `getPage`/`listCollections`/`getCollectionItem` | cms:read | … → content | — |
| `savePageDraft` | cms:write | {key, blocks} → {version} | — |
| `publishPage` | cms:publish | {key} → {published} | cms.published (revalidate tags) |
| `upsertCollectionItem` | cms:write | {type, item} → {item} | — |
| `POST /api/media/presign` + `confirmMedia` | cms:write | file → {asset} | media.uploaded |
| `saveNavigation`/`saveFooter`/`saveSeo` | cms:write | … → {ok} | — |

Publishing calls `revalidateTag` for affected public routes (Phase 9 caching).

---

## 7. Form Engine & config (admin)
| Action / Route | Auth (perm) | Input → Output | Events |
|---|---|---|---|
| `getFormTemplate` | form:manage | {templateId} → {version, sections, fields} | — |
| `saveFormDraft` | form:manage | {templateId, sections/fields} → {ok} | — |
| `publishFormVersion` | form:manage | {templateId} → {version} | form.template_versioned |
| `upsertOptionSet` | form:manage | {key, values[]} → {optionSet} | — |
| `saveDocumentRequirements` | document:configure | {categoryId, reqs[]} → {ok} | documents.config_changed |
| `upsertCycle` | cycle:manage | {year,name,dates,templateId,scorecardId,docs} → {cycle} | cycle.upserted |
| `openCycle`/`closeCycle` | cycle:manage | {id} → {status} | cycle.opened/closed |
| `upsertScorecard` | scorecard:manage | {name, criteria[]} → {scorecard} | scorecard.configured |
| `configureLifecycle` | lifecycle:configure (super) | {states,transitions} → {ok} | lifecycle.configured |

---

## 8. Users, roles, reports, audit, settings
| Action / Route | Auth (perm) | Input → Output |
|---|---|---|
| `listUsers`/`getUser` | user:manage | filters → users |
| `assignRole`/`revokeRole` | user:manage (role:manage for admin roles) | {userId,roleKey} → {ok} (rbac.changed) |
| `upsertRolePermissions` | role:manage (super) | {roleKey, permissions[]} → {ok} |
| `getReport` | report:view | {report, cycleId?, range?} → {data} |
| `GET /api/reports/:report/export` | report:view | → CSV/PDF |
| `queryAuditLog` | audit:view | {filters, cursor} → {entries[]} |
| `saveSetting`/`saveNotificationTemplate` | settings:manage | … → {ok} |

---

## 9. Public read API (unauthenticated, cached)
```
GET /api/public/pages/:key           → published page blocks
GET /api/public/showcase             → published startups (filter: sector, cohort)
GET /api/public/showcase/:slug       → startup profile
GET /api/public/collections/:type    → news/events/faq/facilities/partners (published)
GET /api/public/cycles/open          → currently open cycle + eligibility
```
(Primarily consumed via RSC; exposed as endpoints for future headless/mobile use.)

---

## 10. Versioned public API (future — reserved)
`/api/v1/*` — authenticated via API keys/OAuth for the **mobile app + integrations**: applications,
showcase, cycles. Contract-first (OpenAPI). Not built in v1; namespace reserved so it can ship
without breaking first-party routes.

---

## 11. Cross-cutting API rules
- **AuthZ**: every non-public endpoint runs `requirePermission` with resource scope.
- **Validation**: Zod at the boundary; shared with client forms.
- **Idempotency**: submit/graduate/publish keyed to prevent duplicates.
- **Audit**: mutations wrapped with `withAudit`.
- **Rate limiting**: auth/OTP/reset + upload presign.
- **Errors**: typed codes (`UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION`, `NOT_FOUND`, `CONFLICT`,
  `RATE_LIMITED`, `INTERNAL`).

> **Next (Phase 14):** the implementation roadmap — build order, milestones, and definition of done
> per module.
