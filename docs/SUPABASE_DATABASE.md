# VIP Maths on Supabase PostgreSQL

VIP Maths uses Supabase only as hosted PostgreSQL. NestJS continues to use Prisma directly, and existing custom authentication and institution tenancy are unchanged.

## Credentials

From Supabase Dashboard → Project → Connect → ORMs → Prisma, copy the Supavisor Session Pooler URL ending in port 5432 into `DATABASE_URL`. Put the direct URL in `DIRECT_URL` only when the host is reachable; on IPv4-only networks use the Session Pooler URL for both variables.

Percent-encode reserved password characters and include `sslmode=require`. Never commit `.env`, expose database credentials through `NEXT_PUBLIC_` variables, or add a service-role key to browser code.

## Migration and seed

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:seed
```

`db:migrate` runs `prisma migrate deploy`. The second seed verifies idempotency. Never use `prisma migrate reset` against the hosted project.

## Troubleshooting

- `P1001`: verify the project is active, the hostname/project ref is correct, TLS is enabled, and the password is percent-encoded. If a direct IPv6 host is unreachable, use the Session Pooler on port 5432.
- Pool timeout/max clients: reduce concurrent Prisma processes and review the Supavisor Session Pool Size in Database Settings.
- Migration history mismatch: inspect `prisma migrate status`; do not reset a hosted database.

## Security

VIP Maths tables remain in `public`, but the application does not use the Supabase Data API. RLS is deferred to a focused milestone; NestJS guards and explicit tenant predicates remain authoritative for now.
