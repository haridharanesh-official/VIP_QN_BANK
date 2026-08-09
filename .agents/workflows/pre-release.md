---
description: Pre-Release Verification Workflow for auditing workspace readiness before commit or release
---

// Pre-Release Workflow for VIP Maths

1. **Inspect Git Status**: Run `git status` to identify modified and untracked files.
2. **Scan for Secrets & Credentials**: Ensure `.env`, private keys, passwords, or service-role keys are NOT committed.
3. **Scan for Temporary Artifacts**: Verify no temporary debug code (`console.log`, `debugger`, `fit()`, scratch files) exists.
4. **Run Code Linting**: `pnpm lint`
5. **Run Strict Type Check**: `pnpm typecheck`
6. **Run Full Test Suite**: `pnpm test`
7. **Run Production Build**: `pnpm build`
8. **Verify Database State**: Check Prisma migration status (`pnpm db:generate`).
9. **Check Console Warnings**: Confirm no critical warnings or unhandled promise rejections.
10. **Produce Release Readiness Summary**: Present clean quality gate results and diff summary.
11. **Do NOT Deploy or Push**: Stop and wait for explicit user instruction before pushing to GitHub or deploying.
