---
description: Architectural layer boundaries for Next.js web, NestJS API, and shared packages
globs: "apps/**,packages/**"
alwaysApply: false
---

# Architecture Boundaries & Layer Isolation

## 1. Monorepo Layer Responsibilities
- **`apps/web` (Frontend)**: Next.js 16 App Router UI application. Handles user interface, client interaction, and presentation rendering.
- **`apps/api` (Backend)**: NestJS 11 REST API application. Handles business logic, domain rules, Prisma ORM database access, role authorization, tenant isolation, and audit logging.
- **`packages/shared` (Shared)**: Pure TypeScript contracts, Zod validation DTO schemas, domain enums, and utility functions shared between `web` and `api`.

## 2. Hard Boundaries
- **Frontend (`apps/web`) MUST NOT**:
  - Direct query Prisma or import `@prisma/client`.
  - Access database connection strings or server secrets.
  - Make authorization or tenant isolation decisions on behalf of the backend.
- **Backend (`apps/api`) MUST NOT**:
  - Mix presentation/HTML rendering into NestJS controllers.
  - Leak Prisma database persistence objects directly into HTTP response contracts without validation/serialization.
  - Place heavy business workflows or algorithm selection logic inside controller methods.
- **Shared (`packages/shared`) MUST NOT**:
  - Import DOM/browser packages or Node server-specific dependencies (e.g., Prisma, Express, FS).
  - Become a generic dumping ground for single-use utilities or UI components.

## 3. Module Cohesion & Coupling
- Avoid circular imports across modules or packages.
- Domain logic must reside strictly inside the owning NestJS module or shared domain contract.
- Re-export public interfaces at module boundaries (`index.ts`); do not reach deep into private internal module paths.
