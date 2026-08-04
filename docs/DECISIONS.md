# Architecture decisions

## ADR-001: Modular NestJS monolith

The API remains one deployable application with auth, institution, academic, question, blueprint, paper, and audit modules. Domain generation services have no HTTP dependency.

## ADR-002: Preserve the dependency-free prototype

The tested prototype remains a reference and demo. Production persistence is implemented separately without deleting it.

## ADR-003: Immutable paper snapshots

Generation copies exact question text, options, answers, solutions, order, source metadata, warnings, seed, and algorithm version into `paper_snapshots`. Retrieval never rebuilds historical papers from current questions. Canonical SHA-256 checksums detect changes.

## ADR-004: Shared-schema tenancy with mandatory service enforcement

Tenant records carry `institution_id`. `InstitutionGuard` validates the authenticated user's active membership before a controller runs; repository queries also include that validated ID. Prepared PostgreSQL policies are stored in `database/rls-policies.sql`, but RLS is not enabled until Prisma transactions set database session variables reliably.

## ADR-005: HTTP-only rotating JWT sessions

Access and refresh JWTs are cookies, never browser local storage. Only SHA-256 refresh-token hashes are stored. Every refresh revokes and replaces its predecessor; replay revokes the token family.

## ADR-006: Zod contracts and standardized failures

Shared Zod schemas validate strict request bodies. A global exception filter emits `{ error: { code, message, details, requestId } }` and hides internal errors.

## ADR-007: Original seeded content

The 154 seed questions are generated from original development templates and do not reproduce proprietary question-bank material.
