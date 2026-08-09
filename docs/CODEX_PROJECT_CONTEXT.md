# VIP Maths — Codex Project Context

## Product purpose

VIP Maths is a commercial, multi-tenant SaaS platform for teachers and educational institutions. Its primary workflow is: question bank → review → blueprint → deterministic paper generation → immutable paper snapshots → print/export.

The current focus is the teacher/institution product. Student features, billing, AI generation, storage, native PDF/DOCX, and deployment closure are deferred.

## Architecture

- Monorepo managed with pnpm workspaces.
- `apps/web`: Next.js 16, React 19, TypeScript App Router UI.
- `apps/api`: NestJS 11 REST API; controllers delegate to services and domain services.
- `packages/shared`: framework-neutral contracts and Zod schemas.
- `apps/prototype`: dependency-free reference paper-generator prototype.
- PostgreSQL/Supabase is accessed only through Prisma in `apps/api`.

## Core domains

- Institutions, users, memberships, roles, and active institution context.
- Academic taxonomy: boards, syllabi, media, standards, subjects, chapters, topics.
- Questions: ownership scope, review state, versions, audit history, soft deletion.
- Blueprints and sections: marks, difficulty, Bloom, candidate-pool constraints.
- Papers: deterministic selection, question usage, immutable checksummed snapshots.

## Authentication and tenancy

- Supabase Auth is selected with `AUTH_PROVIDER=supabase`; legacy JWT auth remains an explicit compatibility mode.
- The API derives the application user from verified identity, then enforces active membership through `X-Institution-Id`.
- Tenant controllers use `AuthGuard`, `InstitutionGuard`, and `RolesGuard`.
- Database access to tenant records must include institution scope; UI hiding is never authorization.

## Working rules

- Work only on a non-main branch; current branch is `test`.
- Preserve unrelated dirty work. Never use reset/clean or destructive database commands without explicit approval.
- Keep controllers thin; place domain logic in its owning API module and shared contracts only when both applications need them.
- Use the centralized web API client and design tokens. Do not hardcode tenant IDs, secrets, URLs, permissions, or business configuration.
- Make Prisma/Supabase changes additive, migration-backed, reviewed, and tenant-aware. Never use `prisma db push` for hosted environments.
- Do not claim native PDF/DOCX: current exports are intentionally HTML for print and plain text, respectively.

## Quality gates

```powershell
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd db:generate
```

Run browser QA for user-facing changes when database runtime is available. Test risky behavior at the right layer: domain, API/security, then browser workflow.

## Known verified state (2026-08-09)

- Lint, typecheck, 19 tests, and production builds pass.
- The web test emits a Node module-type warning for its TypeScript test file; it is not a failing test.
- Supabase database runtime is not verified in this workspace because root `.env` targets unreachable `localhost:5432` (see `docs/RUNTIME_VERIFICATION.md`).
- Institution print-branding fields are persisted in browser `localStorage`, not the API/database. This is a Phase 2 product gap; local storage is acceptable only for device-local preferences.
- RLS enablement migration exists but database-backed verification remains pending.

## Immediate objective

Replace institution branding’s local-only persistence with a typed, tenant-scoped API and Prisma-backed configuration, with authorization and persistence tests. Then verify it against an available Supabase/PostgreSQL runtime before expanding to other Phase 2 gaps.

## Definition of done

A change is small, cohesive, tenant-safe, fully persisted where required, covered by proportionate tests, and passes all relevant quality gates. Source code and current migrations are authoritative over this document.
