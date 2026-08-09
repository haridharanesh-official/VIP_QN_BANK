---
description: Strict policy preventing hardcoded secrets, database IDs, tenant IDs, URLs, and business constants
globs: "**/*"
alwaysApply: true
---

# No-Hardcoding Policy & Centralized Configuration

## 1. Strictly Prohibited Hardcoded Values
Future code additions or refactors must **NEVER** hardcode:
- Database IDs, Institution IDs, User IDs, or UUIDs
- API host URLs, backend ports, or production domain names
- Passwords, JWT secrets, session secrets, or encryption keys
- Supabase secret keys or service-role keys
- Academic taxonomy values (curricula, grades, subjects, topics) scattered in UI/backend handlers
- Product plan limits, business pricing, or feature entitlement flags
- Repetitive hex brand colors (must use design tokens / CSS variables)
- Authorization rules or role permission maps scattered inline
- Storage bucket names or CDN URLs
- Magic numbers without clear contextual constants

## 2. Standard Configuration Sources
Values must be sourced from appropriate centralized modules:
- **Environment & Runtime Secrets**: Validated NestJS config module (`apps/api/src/config`) or Next.js environment (`apps/web`).
- **Brand & Theme Styling**: CSS variables / Tailwind tokens defined in `@vip/web` styling foundation.
- **Permissions & Roles**: Centralized permission map in `@vip/shared` or `@vip/api` auth module.
- **Academic Taxonomy**: Database records populated via idempotent migrations and seeds.
- **API Endpoints**: Centralized API client service / contract definitions.
- **Domain Limits & Thresholds**: Centralized constants/config files per domain module with explicit, self-describing identifiers.

## 3. Balance Rule
Avoid extreme over-engineering: do not abstract a standard local constant used once in a single utility file. Abstract values when they represent configuration, business logic thresholds, cross-cutting tokens, or environment-dependent state.
