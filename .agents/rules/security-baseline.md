---
description: Commercial SaaS security checklist, multi-tenant isolation, and authorization baseline
globs: "**/*"
alwaysApply: false
---

# VIP Maths Commercial Security Baseline

## 1. Multi-Tenant Isolation Protection
VIP Maths serves multiple educational institutions on a shared database platform. Every tenant-scoped request **MUST**:
- Extract institution context from verified auth tokens / `X-Institution-Id` headers.
- Verify user membership and role permissions within that specific institution.
- Enforce explicit `where: { institutionId }` clauses on all database queries and mutations.
- Block cross-tenant access with HTTP 403 Forbidden.

## 2. Authentication & Authorization Baseline
- **Never derive role authorization from client-provided input**: Client metadata, `user_metadata`, or request body parameters must NEVER be trusted for role assignments.
- Roles (`OWNER`, `MANAGER`, `REVIEWER`, `TEACHER`) must strictly originate from trusted application database records.
- Protect against **IDOR / BOLA** (Indirect Object Reference / Broken Object-Level Authorization) by checking object ownership before returning or mutating questions, blueprints, or papers.
- Input validation: All incoming request bodies must be strictly validated against Zod DTO schemas before reaching domain handlers.

## 3. Secret Protection & Secure Defaults
- `NEXT_PUBLIC_*` environment variables in `apps/web` must strictly contain non-sensitive public configuration.
- **NEVER** expose Supabase service-role keys, Argon2 secrets, or JWT signing keys in frontend bundles.
- Password hashing must use Argon2id with secure memory/time cost settings.
- HTTP cookies for authentication must set `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` flags.
