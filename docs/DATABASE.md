# VIP Maths database

The canonical model is `apps/api/prisma/schema.prisma`; the production migration is `apps/api/prisma/migrations/20260803120000_milestone_2/migration.sql`. VIP Maths uses Supabase strictly as hosted PostgreSQL through Prisma. It does not use the Supabase Data API, Auth, or Storage.

## Connection modes

- `DATABASE_URL`: Supavisor Session Pooler URL on port 5432 for the persistent NestJS application.
- `DIRECT_URL`: direct database URL when reachable, otherwise the same Session Pooler URL, used by Prisma migration commands.
- Both URLs require TLS and a percent-encoded password.

Obtain both values from Supabase Dashboard → Project → Connect → ORMs → Prisma. Never commit or log them.

## Commands

```powershell
pnpm db:generate
pnpm db:migrate          # production-safe prisma migrate deploy
pnpm db:migrate:dev      # disposable local databases only
pnpm db:seed
```

Never run `prisma migrate reset` or a force reset against Supabase. The migration creates only VIP Maths objects in `public`; it must not modify the managed `auth`, `storage`, `realtime`, or `extensions` schemas.

## Entity groups

- Identity: `users`, `refresh_tokens`
- Tenancy: `institutions`, `institution_members`
- Taxonomy: `boards`, `syllabus_versions`, `mediums`, `standards`, `subjects`, `chapters`, `topics`
- Content: `questions`, `question_versions`, `question_reviews`
- Generation: `paper_blueprints`, `blueprint_sections`, `question_papers`, `paper_snapshots`, `paper_question_usages`
- Compliance: `audit_logs`

## RLS status

Supabase RLS is intentionally not enabled in this integration task. NestJS membership/role guards and tenant predicates remain authoritative. A later focused milestone must activate transaction-scoped RLS without breaking Prisma workers or seeds.
