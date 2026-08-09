---
name: vip-supabase-prisma
description: Database architecture skill for Supabase PostgreSQL and Prisma ORM in VIP Maths. Use when performing schema changes, writing migrations, or querying database state.
---

# VIP Supabase & Prisma Database Skill

## Purpose
Guide safe schema evolution, migration generation, Prisma ORM querying, and Supabase database interactions for VIP Maths.

## Migration & Schema Workflow

1. **Schema Modifications**: Edit `apps/api/prisma/schema.prisma`.
2. **Migration Generation**:
   - Run `pnpm db:generate` to refresh Prisma Client.
   - For dev schema changes, run `prisma migrate dev --create-only --name <descriptive_name>`.
3. **Migration Review**: Inspect generated SQL under `apps/api/prisma/migrations/`.
   - Ensure DDL operations are non-destructive and additive where possible.
   - Verify index additions for foreign keys and `institutionId` columns.
4. **Migration Application**: Run `pnpm db:migrate`.
5. **Seed Verification**: Ensure `apps/api/prisma/seed.ts` runs cleanly and idempotently (`pnpm db:seed`).

## Supabase Verification Protocols
- Use Supabase MCP tools when live state inspection is required.
- Do NOT touch Supabase internal schemas (`auth`, `storage`, `realtime`).
- Protect against pooler connection starvation by using transaction pooler settings for short queries and direct connection URLs for migrations.
