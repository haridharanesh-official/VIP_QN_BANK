# VIP Maths — Start here

## Production application

1. Install Node.js 20.9+.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env`, replace the JWT secrets, and add the Supabase Prisma connection strings from the project Connect panel.
4. Run `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:seed`.
5. Run `pnpm dev`.
6. Open `http://localhost:3000` and use the development credentials in `README.md`.

The browser sends authentication only in HTTP-only cookies. The selected membership is sent as `X-Institution-Id`; the API verifies it on every tenant endpoint.

The application uses Supabase strictly as hosted PostgreSQL through Prisma. Custom NestJS authentication remains authoritative. Redis is optional when `REDIS_REQUIRED=false` in development.

## Reference prototype

Run `pnpm prototype` and open `http://localhost:4173`. Run its tests with `pnpm prototype:test`.

## Before contributing

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. Never commit `.env` or production credentials.
