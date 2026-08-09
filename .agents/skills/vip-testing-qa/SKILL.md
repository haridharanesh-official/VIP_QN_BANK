---
name: vip-testing-qa
description: Testing strategy and QA verification skill for VIP Maths. Use when adding tests, verifying features, or selecting quality gates.
---

# VIP Testing & QA Skill

## Purpose
Guide the selection and execution of proportional automated and manual verification steps for VIP Maths.

## Testing Hierarchy

| Test Level | Target Scope | Execution Command |
| :--- | :--- | :--- |
| **Unit Tests** | Pure functions, paper algorithms, DTO validation | `pnpm test` |
| **API & Service Tests** | NestJS endpoints, auth guards, tenant policies | `pnpm --filter @vip/api test` |
| **Frontend Tests** | Route policies, client component state | `pnpm --filter @vip/web test` |
| **Type Integrity** | TypeScript strict mode compilation across monorepo | `pnpm typecheck` |
| **Lint & Code Style** | Code style, syntax rules across monorepo | `pnpm lint` |
| **Full Build Gate** | Production Next.js and NestJS bundle compilation | `pnpm build` |

## QA Verification Protocol
1. Execute the relevant test command after completing code modifications.
2. Confirm 100% pass rate before completing the task.
3. If an environment dependency prevents running a specific test level, document the exact blocker clearly.
