---
description: Global engineering guardrails and behavior rules for all VIP Maths tasks
globs: "**/*"
alwaysApply: true
---

# VIP Maths — Project Guardrails & Commercial Engineering Rules

## 1. Commercial Product Standards
VIP Maths is a commercial educational SaaS product designed for multi-tenant institutional deployment. It is NOT a prototype, college exercise, or toy application. All future code must prioritize:
- Production readiness & security
- Multi-tenant isolation
- Clean architecture & low coupling
- Reusable components & centralized configuration
- Testability & clear maintainability

## 2. Mandatory Workflow Before Editing Code
Before modifying any source code in this repository:
1. Inspect existing implementations in relevant modules (`apps/web`, `apps/api`, `packages/shared`).
2. Identify reusable components, services, and validation schemas.
3. Assess tenancy impact (`X-Institution-Id` header & database scoping).
4. Check security boundaries (authentication, RBAC, input validation).
5. Determine required verification steps (unit, integration, API, or browser tests).

## 3. Strict Negative Directives (NEVER DO)
- **NEVER** fabricate test success, claim unexecuted quality gates passed, or claim browser verification without execution.
- **NEVER** leave requested functionality as `TODO` or unhandled stubs.
- **NEVER** silently bypass validation or weaken security guards/policies.
- **NEVER** perform broad unrelated refactoring while working on a single feature or bugfix.
- **NEVER** copy proprietary third-party code or content.
- **NEVER** expose secrets, API keys, or database credentials in client code or version control.
- **NEVER** alter Git history without explicit user instruction.

## 4. Minimum Cohesive Changes
Always prefer the smallest, most cohesive implementation that fully satisfies the task requirements without collateral complexity.
