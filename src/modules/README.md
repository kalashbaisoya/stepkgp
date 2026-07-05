# Domain modules

Each bounded context (Phase 9) lives here as a self-contained module exposing:

- `service.ts` — public API (Zod-validated, RBAC-guarded, audited); the only layer touching Prisma via `repo`.
- `repo.ts` — Prisma data access.
- `schema.ts` — Zod schemas (shared with client forms where applicable).
- `events.ts` — domain events emitted for notifications + audit (optional).

Planned modules (added per `docs/14-roadmap.md`):
`auth`, `rbac`, `cms`, `forms`, `cycles`, `applications`, `businessPlan`, `review`,
`lifecycle`, `incubation`, `directory`, `notifications`, `reports`, `audit`, `admin`.
