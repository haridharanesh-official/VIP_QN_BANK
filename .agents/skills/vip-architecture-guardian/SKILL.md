---
name: vip-architecture-guardian
description: Guides monorepo architectural decisions, module location, code reuse, and preventing structural degradation in VIP Maths. Use when adding new features, placing files, or reviewing monorepo boundaries.
---

# VIP Maths Architecture Guardian Skill

## Purpose
Maintain clean monorepo architecture, prevent code duplication, enforce module boundaries, and guide file placement decisions across `apps/web`, `apps/api`, and `packages/shared`.

## Decision Tree for Code Placement

When adding new code or features to VIP Maths:

1. **Does equivalent functionality already exist?**
   - Check `packages/shared/src` for DTOs, enums, validation schemas.
   - Check `apps/web/src/components` and `apps/web/src/lib` for frontend UI and API wrappers.
   - Check `apps/api/src/modules` for NestJS services and domain models.
   - **If YES**: Reuse or extend the existing component/service.
   - **If NO**: Proceed to step 2.

2. **Is the functionality specific to one application or feature?**
   - **Frontend Only**: Place in `apps/web/src/app/(routes)` or `apps/web/src/components`.
   - **Backend Only**: Place in `apps/api/src/modules/<domain>`.
   - **Shared Contract (DTO, Schema, Enum)**: Place in `packages/shared/src`.

3. **Is it a candidate for `packages/shared`?**
   - Must be required by BOTH `web` and `api` (e.g., Zod schema for blueprint validation, role permission enum).
   - Must have zero browser or server framework dependencies.
   - **Do NOT** place single-app helpers in `packages/shared`.

## Anti-Pattern Checklist
- 🚫 Duplicate fetch clients scattered in page components.
- 🚫 Direct database access from Next.js web code.
- 🚫 Deep relative imports reaching into internal module folders (use barrel exports).
- 🚫 God components containing UI, state, API calls, and validation logic in one 800-line file.
- 🚫 Circular dependencies between NestJS modules.
