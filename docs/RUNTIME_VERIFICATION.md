# VIP Maths runtime verification

Date: 2026-08-04

The Supabase database baseline contains 20 public application tables, 154 approved questions, one institution, two legacy users, and one paper blueprint. Migration `add_supabase_auth_user_link` is applied and present in migration history.

Phase 2A static verification passed: Prisma Client generation, lint, typecheck, 19 tests, and both production builds. The frontend starts and an unauthenticated `/dashboard` request redirects to `/login`; signup reaches the email-confirmation state.

Database-backed runtime closure remains blocked because the actual root `.env` still points Prisma to `localhost:5432`, which returns `P1001`. API health, callback bootstrap, linked login, dashboard/question-bank access, and live tenant checks must be rerun after the Session Pooler URL is saved to that file.
