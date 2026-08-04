# VIP Maths

VIP Maths is an original, clean-room educational question-bank and paper-generation platform. Milestone 2 adds a production-oriented Next.js 16 + NestJS 11 + Prisma/PostgreSQL vertical slice while preserving the dependency-free prototype.

## Implemented

- Teacher registration and login with Argon2id, HTTP-only JWT cookies, rotating hashed refresh tokens, revocation, throttling, and security headers
- Institution creation, active membership validation through `X-Institution-Id`, centralized role permissions, member addition, and tenant isolation
- Versioned academic taxonomy and 154 original approved development questions
- Question CRUD, pagination/filtering, review transitions, optimistic concurrency, approved-revision snapshots, and soft deletion
- Persistent blueprints, structured validation, deterministic reuse-aware selection, paper usage tracking, and audit logs
- Immutable paper snapshots with SHA-256 checksums and question/answer/combined projections
- Production pages for registration, login, dashboard, questions, blueprints, papers, and browser printing

## Supabase startup

```powershell
corepack enable
pnpm install
Copy-Item .env.example .env
# Add the Supabase Session Pooler DATABASE_URL and migration DIRECT_URL.
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`. API health is `http://localhost:4000/api/v1/health`.

Development seed accounts (same password for both):

- `owner@vip-maths.local` / `VIPMathsDev2026!`
- `reviewer@vip-maths.local` / `VIPMathsDev2026!`

Never use these credentials outside local development.

## Verification

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:generate
```

See [Milestone 2 implementation](docs/MILESTONE_2_IMPLEMENTATION.md), [API](docs/API.md), [database](docs/DATABASE.md), and [authentication](docs/AUTHENTICATION.md).

The reference prototype remains available with `pnpm prototype` at `http://localhost:4173`.
