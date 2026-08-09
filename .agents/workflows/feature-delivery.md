---
description: Feature Delivery Workflow for implementing single scoped VIP Maths product features
---

// Feature Delivery Workflow for VIP Maths

1. **Understand Requested Outcome**: Read requirements carefully and confirm scope boundaries.
2. **Inspect Codebase Architecture**: Inspect affected modules in `apps/web`, `apps/api`, or `packages/shared`.
3. **Activate Relevant Skills**: Activate `vip-architecture-guardian`, `vip-nextjs-frontend`, `vip-nestjs-backend`, or `vip-design-system`.
4. **Check Code Reuse**: Identify existing utilities, components, validation schemas, or API clients to extend.
5. **Evaluate Security & Tenancy**: Verify `X-Institution-Id` tenant isolation, RBAC role permissions, and input validation.
6. **Formulate Implementation Plan**: Use Planning Mode to produce `implementation_plan.md` for user approval when changes are non-trivial.
7. **Implement Cohesive Solution**: Write minimum cohesive code respecting layer boundaries.
8. **Add/Update Automated Tests**: Create or update unit/integration tests for new behavior.
9. **Execute Quality Gates**:
   ```powershell
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
10. **Review Git Status & Diff**: Run `git status` and `git diff` to verify clean changes.
11. **Report Completion**: Summarize implemented changes and verification outcomes.
