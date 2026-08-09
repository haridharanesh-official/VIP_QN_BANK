---
name: vip-security-review
description: Security review checklist and tenant isolation audit skill for VIP Maths. Use when reviewing authentication, authorization, multi-tenancy, or input sanitization.
---

# VIP Security Review Skill

## Purpose
Provide a comprehensive security review checklist for verifying tenant isolation, role-based access control, input validation, and secret protection in VIP Maths.

## Security Audit Checklist

### 1. Multi-Tenant Isolation
- [ ] Is `X-Institution-Id` extracted from the authenticated user request?
- [ ] Is institution membership and role verified against the database?
- [ ] Are all database operations scoped with `institutionId` filter conditions?
- [ ] Are cross-tenant data access attempts rejected with HTTP 403 Forbidden?

### 2. Authorization & Privilege Escalation
- [ ] Are user roles checked against server-managed database roles (`OWNER`, `MANAGER`, `REVIEWER`, `TEACHER`)?
- [ ] Is role escalation blocked (e.g. `TEACHER` cannot grant `OWNER` status)?
- [ ] Are administrative API endpoints protected by authorization guards?

### 3. IDOR / BOLA Prevention
- [ ] Are entity IDs (questions, blueprints, papers, audit logs) validated for tenant ownership before returning details or applying mutations?

### 4. Input Sanitization & Secret Safeguards
- [ ] Are incoming payload DTOs validated using strict Zod schemas?
- [ ] Are secret keys (`JWT_SECRET`, service-role keys) excluded from frontend bundles?
- [ ] Are passwords hashed using Argon2id with secure cost parameters?
- [ ] Are sensitive details omitted from production logs?
