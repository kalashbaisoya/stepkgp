# STEP IIT KGP — Incubation Management Platform

The operating system of the Science & Technology Entrepreneurs' Park, IIT Kharagpur:
public website (no-code CMS), online applications, review & scoring, incubation management,
and a public startup directory — with RBAC, audit, and a roadmap toward a multi-incubator SaaS.

> Design & architecture live in [`docs/`](docs/README.md). Build order is in
> [`docs/14-roadmap.md`](docs/14-roadmap.md). This repository is at **Milestone 0 — Foundations**.

## Stack
- **Next.js** (App Router, TypeScript) · React 19
- **PostgreSQL** + **Prisma**
- **Tailwind CSS v4** + design tokens (shadcn/ui-style primitives)
- Managed cloud hosting + S3-compatible object storage

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp .env.example .env        # adjust as needed

# 3. Start Postgres (Docker)
pnpm db:up

# 4. Create schema + generate client + seed roles/permissions/admin
pnpm db:push
pnpm db:seed

# 5. Run the app
pnpm dev                    # http://localhost:3000
```

Health check: `GET /health` → `{ "status": "ok", "db": "up" }`.

## Scripts
| Script | Purpose |
|--------|---------|
| `pnpm dev` / `build` / `start` | Next.js dev / production build / serve |
| `pnpm typecheck` / `lint` / `format` | TS check · ESLint · Prettier |
| `pnpm db:up` / `db:down` | Start/stop local Postgres (Docker) |
| `pnpm db:push` / `db:migrate` | Sync / migrate schema |
| `pnpm db:seed` | Seed roles, permissions, org, admin |
| `pnpm db:studio` | Prisma Studio |

## Project structure
```
src/
  app/            App Router routes (public / auth / app / admin — added per milestone)
  components/ui/  Design-system primitives
  lib/            db (Prisma), utils, and cross-cutting helpers
  modules/        Domain modules (auth, cms, forms, applications, …) — added per milestone
prisma/           schema.prisma + seed
docs/             Architecture & design documents (Phases 3–14)
```

## Roadmap (see docs/14)
M0 Foundations · M1 Auth+RBAC · M2 CMS+Public · M3 Form Engine · M4 Cycles/Docs ·
M5 Applications · M6 Business Plan/PDF · M7 Lifecycle+Review · M8 Incubation+Scheduler ·
M9 Showcase · M10 Notifications · M11 Reports · M12 Audit/Hardening.
