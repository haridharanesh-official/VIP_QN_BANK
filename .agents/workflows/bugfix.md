---
description: Structured Bugfix Workflow for reproducing, isolating, and fixing bugs in VIP Maths
---

// Bugfix Workflow for VIP Maths

1. **Reproduce Issue**: Establish clear steps to reproduce the issue locally.
2. **Record Expected vs Actual Behavior**: Document the exact bug behavior and root cause hypothesis.
3. **Inspect Failure Traceback**: Read full, untruncated error logs and stack traces.
4. **Isolate Root Cause**: Identify the underlying contract or logic error without speculative broad refactoring.
5. **Implement Minimal Fix**: Apply the smallest cohesive fix addressing the verified root cause.
6. **Add Regression Test**: Create a regression test preventing future occurrences of the bug.
7. **Verify Reproduction Scenario**: Re-run the reproduction steps to confirm the bug is resolved.
8. **Run Monorepo Quality Gates**:
   ```powershell
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
9. **Inspect Git Diff**: Run `git diff` to ensure no unintended side effects or debug code were introduced.
10. **Report Root Cause & Fix**: Summarize the cause, fix, and verification evidence.
