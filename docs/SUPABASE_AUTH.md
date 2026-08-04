# Supabase Auth

Project: `uslbsxgustdhzfxbpout`

Required runtime values are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `AUTH_PROVIDER=supabase`. Never expose a service-role key, database password, JWT signing secret, or user access token in browser configuration.

New registrations use Supabase email/password Auth. After an immediate session or email confirmation callback, the API verifies the signed access token, links the Auth subject to `public.users.auth_user_id`, and creates one institution and OWNER membership when needed. Retries reuse the existing user, institution, and membership.

Seeded application users remain legacy records until each matching email signs in through a Supabase identity and is linked. Switching `AUTH_PROVIDER=legacy` restores the previous endpoints without removing `password_hash`.
