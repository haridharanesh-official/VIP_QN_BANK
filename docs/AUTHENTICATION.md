# Authentication and authorization

`AUTH_PROVIDER=supabase` enables the current browser flow. `AUTH_PROVIDER=legacy` restores the existing application JWT endpoints for rollback.

## Supabase registration

The web app uses `@supabase/ssr` cookies for email/password sessions. Registration sends profile-only metadata, and `POST /auth/supabase/bootstrap` verifies the bearer token before linking `auth.users.id` to `public.users.auth_user_id`. The API chooses the user ID, OWNER role, and institution relationship in one idempotent transaction; these values are never accepted from the browser.

Confirmation links return through `/auth/callback`, which exchanges the PKCE code and retries bootstrap safely. Supabase access tokens are not copied into local or session storage.

## Registration

`POST /auth/register` validates and normalizes input, hashes the password with Argon2id, then creates user, institution, owner membership and audit log in one PostgreSQL transaction. A session is issued only after commit.

## Session design

In Supabase mode, the Next.js proxy calls `getClaims()` and the Nest API verifies the project JWT signature, issuer, audience, expiry, subject, and email against the project JWKS. Application API requests carry the Supabase access token as Bearer plus the active `X-Institution-Id`.

The following session design applies when `AUTH_PROVIDER=legacy`:

- Access JWT: default 15 minutes, HTTP-only `edugen_access` cookie
- Refresh JWT: default 7 days, HTTP-only path-scoped `edugen_refresh` cookie
- Cookies: SameSite=Lax; Secure is required in production
- Storage: only SHA-256 refresh hashes, family ID, expiry and revocation metadata
- Rotation: refresh revokes the presented token and persists its replacement atomically
- Replay: a revoked/invalid stored token revokes all active tokens in that family
- Logout: revokes the stored refresh session and clears both cookies

Do not put tokens in local storage. The frontend stores only the non-secret selected institution ID there.

## Institution and role resolution

After `AuthGuard` verifies the access token and active user, `InstitutionGuard` resolves `X-Institution-Id` to an active membership and institution. `RolesGuard` enforces metadata from the centralized role map.

- OWNER: all institution content and member operations
- ADMIN: member/content administration
- HOD: review and paper generation
- TEACHER: create/submit questions, blueprints and papers
- CONTENT_REVIEWER: review and generation, without ownership management

## Hardening

Registration/login use account and IP windows, password/token values are never audited, request bodies are capped at 1 MB, Helmet headers and a strict CORS origin are active, and public errors hide stack traces, SQL and Prisma details. Use unique 32+ character JWT secrets in every deployed environment.
