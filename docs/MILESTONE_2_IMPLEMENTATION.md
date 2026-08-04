# Milestone 2 implementation report

## Summary

Milestone 2 implements the complete code path from teacher registration through institution membership, reviewed academic content, saved blueprint, persistent generation, immutable snapshot, and paper review/printing.

## Added modules and files

- `apps/api/prisma`: production model, initial migration, and seed
- `apps/api/src/common`: validation, request IDs, safe errors, JSON conversion
- `apps/api/src/config`: fail-fast environment validation
- `apps/api/src/prisma`: application-scoped Prisma lifecycle
- `apps/api/src/modules/auth`: registration/login/refresh/logout/me, guards, decorators, roles, tenant policy
- `apps/api/src/modules/institutions`: current institution, members, persisted dashboard
- `apps/api/src/modules/academic`: ordered taxonomy API
- `apps/api/src/modules/questions`: tenant-aware CRUD, review and versions
- `apps/api/src/modules/blueprints`: persistence, validation and generation transaction
- `apps/api/src/modules/papers`: immutable snapshot retrieval/projections and archive
- `apps/api/src/modules/papers/domain`: validation, scoring, generation, checksum/snapshot functions
- `apps/web/src/app`: eight production workflows plus shared shell/states/API client
- `database/rls-policies.sql`: prepared, inactive PostgreSQL policies
- API unit/security tests and Dockerfiles

## Database and seed

The migration creates users, refresh sessions, institutions, memberships, normalized taxonomy, questions, question versions/reviews, blueprints/sections, papers/snapshots/usages, and audit logs with generation and tenant indexes. Seed content provides one board, one syllabus, English medium, Classes 9 and 10, three Class 10 subjects, 22 chapters, 22 topics, 154 approved questions, two users, one institution, two memberships, and one 25-mark blueprint.

## Security and tenancy

Passwords use Argon2id. Access and refresh tokens are HTTP-only, SameSite=Lax cookies and become Secure in production. Refresh hashes—not raw tokens—are persisted and rotated. Replay revokes a token family. Authentication endpoints have temporary account and IP throttles. Helmet, a CORS allowlist, 1 MB request bodies, strict DTOs, soft deletion, audit logs, generic errors, request IDs, membership guards, and role guards are enabled.

Tenant queries use the validated institution ID. Global approved questions are readable; institution content must match the current tenant; private content is creator-only. Database RLS is deliberately prepared but inactive and is not claimed as runtime protection.

## Question review and snapshot behavior

Questions begin at `DRAFT`, creators submit to `PENDING_REVIEW`, and reviewer roles choose `APPROVED`, `CHANGES_REQUESTED`, or `REJECTED`. Rejection/change requests require comments. Pending records are locked. Updates require the current version; approved edits first save an immutable `QuestionVersion` and return the question to review.

Paper generation validates marks, distribution shapes, internal choices, and approved candidate pools. It scores difficulty target, prior usage, last-used age, source and deterministic seed jitter. One transaction creates the paper, exact snapshot, usages, usage updates, and audit entry. Historical retrieval uses only `PaperSnapshot`.

## Verification results

- Install: passed
- Prisma Client generation: passed
- Lint: passed
- Strict type check: passed
- Tests: 12 passed (3 prototype, 9 production/domain/security)
- Next.js production build: passed; 9 application routes plus not-found/root emitted
- NestJS production build: passed
- Initial migration SQL generated successfully from an empty datamodel
- `docker compose up -d postgres redis`: blocked because the `docker` command is not installed
- `pnpm db:migrate` and `pnpm db:seed`: attempted and failed with no database reachable at `localhost:5432`; the schema itself passed `prisma validate` and the initial SQL migration was generated from the validated datamodel
- API health and browser workflow: not run because the persistent API cannot start without PostgreSQL

## Known limitations

- Database-backed integration and Playwright tests need a PostgreSQL-capable CI/host; current automated tests cover domain, security, tenant-policy, snapshot and prototype behavior without external services.
- RLS policies are prepared but not enabled.
- Taxonomy mutations are temporarily limited to institution owner/admin development roles; a separate platform-admin identity is a later milestone.
- Member addition requires the invitee to have registered; outbound invitations/email verification are not included.
- Rate limiting is process-local; Redis-backed distributed limits are the next production hardening step.
- Server-rendered PDF/DOCX, manual paper editing, search indexing, and object storage are outside this milestone.

## Exact local commands

```powershell
pnpm install
Copy-Item .env.example .env
docker compose up -d postgres redis
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Recommended next milestone: database-backed CI and active RLS first, then manual paper editing and Playwright PDF/DOCX export.

## Runtime stabilization addendum — 2026-08-03

Milestone 3A rechecked the existing Milestone 2 code without adding product features. Docker Desktop is not installed on the verification host, and direct TCP probes found neither PostgreSQL on port 5432 nor Redis on port 6379. Following the runtime-only instructions, infrastructure startup was not retried and Docker was not installed automatically.

Prisma validation and client generation passed for the 20-model schema. Strict type checks, the 12-test suite, the NestJS build, and the Next.js production build passed. Database migration, seed/count verification, API health, browser authentication/question/blueprint/paper workflow, and persisted tenant-isolation requests are not claimed as verified. Exact continuation steps are in `docs/RUNTIME_VERIFICATION.md`.
