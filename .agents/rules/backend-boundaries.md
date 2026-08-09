---
description: Backend architectural rules, NestJS conventions, service boundaries, and Prisma usage for apps/api
globs: "apps/api/**"
alwaysApply: false
---

# Backend Engineering Boundaries (`apps/api`)

## 1. Layered NestJS Architecture
Every NestJS feature module must enforce strict single-responsibility layering:
```
Controller (HTTP/DTO Validation/Routing/Serialization)
    ↓
Application Service (Orchestration/Use Case Workflow)
    ↓
Domain Service (Core Algorithms, Paper Selection, Blueprint Scoring)
    ↓
Infrastructure / Prisma ORM (Data Access, Database Transactions)
```

## 2. Controller Responsibilities
NestJS controllers must **ONLY**:
1. Receive incoming HTTP requests and validate payload DTOs via Zod/pipes.
2. Verify route authorization guards (AuthGuard, RolesGuard, TenantGuard).
3. Delegate business execution to application services.
4. Serialize and return structured HTTP response payloads.

Controllers must **NOT**:
- Contain paper-generation or blueprint selection algorithms.
- Execute multi-table database transactions directly.
- Implement inline tenant verification logic per method.

## 3. Transactions & Error Handling
- Use atomic Prisma transactions (`prisma.$transaction`) for multi-step mutations (e.g. paper snapshot generation + usage counters + audit log).
- Standardize domain errors using NestJS HTTP exceptions (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`).
- **NEVER** expose raw Prisma database exceptions, SQL error traces, filesystem paths, password hashes, or session tokens in public API error responses.
