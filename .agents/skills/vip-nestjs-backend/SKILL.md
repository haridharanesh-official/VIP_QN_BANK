---
name: vip-nestjs-backend
description: NestJS 11 backend development skill for VIP Maths covering controllers, application services, domain algorithms, Prisma transactions, and DTO validation. Use when modifying apps/api logic.
---

# VIP NestJS Backend Development Skill

## Purpose
Maintain clean modular architecture in `apps/api` using NestJS 11, Express 5, Prisma ORM, and Zod DTO validation.

## Architectural Layering & Execution Flow

```
HTTP Request
   │
   ▼
[Controller] ──────────► Validates payload DTO & route guards (Auth/Roles/Tenant)
   │
   ▼
[App Service] ─────────► Orchestrates workflow, transaction boundaries, audit log
   │
   ▼
[Domain Service] ──────► Pure domain logic (Question selection algorithm, blueprint scoring)
   │
   ▼
[Prisma / DB] ─────────► Idempotent persistence & tenant-isolated queries
```

## Implementation Guidelines

### 1. Controller Design
- Keep controller handlers thin (<20 lines).
- Inject application services via standard NestJS dependency injection.
- Use explicit HTTP status codes (`@HttpStatus`) and response serialization DTOs.

### 2. Transaction Boundaries
For multi-step write operations (e.g. generating a paper snapshot and updating question usage counts):
```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Create paper record
  // 2. Increment question usage counts
  // 3. Create audit log record
});
```

### 3. Error Handling & Exception Filters
- Throw typed NestJS HTTP exceptions (`BadRequestException`, `ForbiddenException`, `NotFoundException`).
- Do not let unhandled raw Prisma errors (`PrismaClientKnownRequestError`) escape directly to clients.
