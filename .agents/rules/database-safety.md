---
description: Database migration safety, schema protection, and Supabase database rules
globs: "apps/api/prisma/**,database/**"
alwaysApply: false
---

# Database Safety & Schema Governance

## 1. Strictly Forbidden Database Commands
- **NEVER** run `prisma migrate reset` against hosted Supabase environments.
- **NEVER** execute destructive `DROP TABLE`, `DROP DATABASE`, or force-reset operations without explicit written user approval.
- **NEVER** directly modify Supabase-managed internal schemas (`auth`, `storage`, `realtime`, `vault`, `extensions`).
- **NEVER** insert user records directly into `auth.users` via SQL unless explicitly required by an official, tested migration script.

## 2. Safe Database Change Workflow
Before making any database or schema modification:
1. Inspect the authoritative Prisma schema (`apps/api/prisma/schema.prisma`).
2. Inspect existing SQL migration files (`apps/api/prisma/migrations/`).
3. Query live Supabase database state using Supabase MCP tools if available.
4. Ensure schema changes are **additive** and **backwards-compatible**.
5. Generate migration SQL via `pnpm db:generate` / `prisma migrate dev --create-only`.
6. Carefully review the generated migration SQL for destructive DDL operations (`DROP COLUMN`, `ALTER TYPE`).
7. Apply migration safely and verify database constraints and indexes.
8. Ensure seeds (`apps/api/prisma/seed.ts`) remain strictly **idempotent**.

## 3. Credentials & Connection String Security
- Database credentials, `DATABASE_URL`, and `DIRECT_URL` must remain in `.env` files only.
- Never commit database passwords, pooled credentials, or raw connection strings into git.
