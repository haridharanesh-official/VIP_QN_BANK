---
description: Mandatory task completion rule requiring execution of proportional verification quality gates
globs: "**/*"
alwaysApply: true
---

# Test-Before-Complete & Quality Gate Enforcement

## 1. Zero Untested Claims Policy
- Code modification is **NEVER** complete simply because TypeScript compiles.
- An agent must **NEVER** claim a task is completed, a bug is fixed, or a feature works without executing actual empirical verification.
- **NEVER** represent unexecuted tests as passed. If a test or command fails or cannot run, report the exact error traceback and environment blocker.

## 2. Proportional Verification Strategy
Select appropriate verification steps based on the scope of the change:
- **Pure Utility / Domain Algorithm**: Run unit tests (`pnpm test`).
- **Backend API / Auth / Tenant Change**: Run backend unit/integration tests and typechecks (`pnpm typecheck`, `pnpm test`).
- **Frontend Component / Route Change**: Run frontend typechecks and verify responsive layout/render stability (`pnpm typecheck`, `pnpm build`).
- **Repository-Wide Feature or Refactor**: Execute all full monorepo quality gates:
  ```powershell
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  ```

## 3. Handling Blocker Failures
If an external service or missing environment variable prevents running a specific test step:
- State the exact blocker clearly to the user.
- Do not bypass tests or comment out failing assertions.
