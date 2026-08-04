# VIP Maths implementation progress

## Milestone 2 completed in code

- Prisma schema, initial PostgreSQL migration, indexes, development seed, and prepared RLS policies
- Transactional registration, institution and owner membership creation
- Login, short access token, rotating/revocable refresh sessions, secure cookies, and auth throttling
- Tenant and role guards plus centralized permission groups
- Academic taxonomy reads and development-admin writes
- Tenant-aware question CRUD, review history, approved-question versioning, and optimistic concurrency
- Blueprint CRUD, validation, candidate-pool checks, and deterministic production generation
- Transactional papers, immutable snapshots, checksums, usage statistics, and audit events
- Dashboard, auth, question, blueprint, paper, answer-key, and print frontend flows
- Dockerfiles, Compose health dependencies, strict type checks, domain/security tests, and documentation

## Verification on 2026-08-03

- `pnpm install`: passed
- `pnpm db:generate`: passed
- `pnpm lint`: passed
- `pnpm typecheck`: passed
- `pnpm test`: passed (12 tests total)
- `pnpm build`: passed (Next.js and NestJS)
- `docker compose up -d postgres redis`: not run; Docker is not installed in the execution environment
- `pnpm db:migrate`: attempted with the documented local URL; failed because no server is reachable at `localhost:5432`
- `pnpm db:seed`: attempted; failed with `Can't reach database server at localhost:5432`
- API health and end-to-end browser workflow: not run because the API cannot start without PostgreSQL

## Milestone 3A stabilization check — 2026-08-03

- Scope remained Milestone 2 runtime verification only; no new product modules were added.
- Docker Desktop is unavailable (`docker` is not recognized), so Docker commands were stopped as required.
- TCP checks confirmed no PostgreSQL listener on `localhost:5432` and no Redis listener on `localhost:6379`.
- Prisma schema validation passed, Prisma Client generation passed, and the schema still contains 20 models.
- `pnpm lint` and `pnpm typecheck` passed for shared, API, and web projects.
- `pnpm test` passed: 9 API/domain/security and 3 prototype tests (12 total).
- `pnpm build` passed for NestJS and Next.js 16; the web build emitted the existing Milestone 2 routes only.
- Migration, seed, persisted record counts, API/browser workflow, and live two-tenant API checks remain blocked by the missing Docker/PostgreSQL/Redis runtime. See `docs/RUNTIME_VERIFICATION.md`.

## Next milestone

Run database-backed integration and Playwright suites in CI, activate transaction-scoped PostgreSQL RLS, add invitations/email verification, manual paper editing, and server-side PDF/DOCX export.

## Supabase Auth Phase 2A — 2026-08-04

- Added the nullable unique `public.users.auth_user_id` link through migration `add_supabase_auth_user_link`.
- Added cookie-based Supabase registration, confirmation callback, login, logout, and verified route protection.
- Added server-side ES256/RS256 JWKS verification, idempotent legacy-email linking, and transactional institution/OWNER bootstrap.
- Existing tenant and role guards remain authoritative after Supabase identity resolution; legacy auth remains available behind `AUTH_PROVIDER=legacy`.

## Supabase integration and rebrand — 2026-08-03

- Visible product branding is now VIP Maths; technical package names, cookie names, algorithm identifiers, migration history, and repository paths remain stable intentionally.
- Prisma hosted migration commands use `migrate deploy`; local disposable development retains a separate `db:migrate:dev` command.
- Prisma CLI configuration loads the root `.env` and prefers `DIRECT_URL` for migrations while runtime Prisma continues to use `DATABASE_URL`.
- Redis is optional in development with one concise warning and no reconnect loop when `REDIS_REQUIRED=false`; required mode remains startup-fatal.
- Supabase runtime migration and seed verification are blocked until the required project connection values are added to `.env`.
