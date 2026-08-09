---
description: Safe Database & Schema Change Workflow for Supabase and Prisma
---

// Database Change Workflow for VIP Maths

1. **Inspect Authoritative Prisma Schema**: Review `apps/api/prisma/schema.prisma`.
2. **Inspect Migration History**: Review existing migrations under `apps/api/prisma/migrations/`.
3. **Inspect Live Database State**: Query Supabase database state via Supabase MCP if required.
4. **Evaluate Migration Backwards Compatibility**: Ensure schema changes are additive and non-destructive.
5. **Evaluate Tenant & Security Impact**: Ensure all new entity tables include `institutionId` and appropriate indexes.
6. **Generate Migration DDL**: Run `pnpm db:generate` and create an additive migration.
7. **Review Migration SQL**: Thoroughly review generated SQL for destructive DDL operations (`DROP COLUMN`, `ALTER TYPE`).
8. **Apply Migration Safely**: Execute `pnpm db:migrate`.
9. **Verify Database State**: Inspect modified tables, foreign key constraints, and indexes.
10. **Verify Seed Idempotency**: Execute `pnpm db:seed` and verify clean idempotency.
11. **Execute Tests**: Run unit and integration tests (`pnpm test`).
12. **Report Migration Result**: Summarize schema changes and verification status.
