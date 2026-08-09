---
name: vip-release-check
description: Pre-release readiness checklist and git sanitization skill for VIP Maths. Use before finalizing tasks, staging commits, or preparing pull requests.
---

# VIP Release Readiness & Check Skill

## Purpose
Enforce pre-release readiness, git diff review, secret scanning, and build verification before staging commits or finalizing changes.

## Pre-Release Review Checklist

1. **Git Repository Status**:
   - Run `git status` to verify modified files.
   - Run `git diff` to ensure no temporary debug lines (`console.log`, `debugger`, `fit()`, `only()`) remain.
2. **Secret Protection**:
   - Ensure `.env` or sensitive credentials are NOT staged in git.
   - Verify no private keys, passwords, or service tokens are embedded in source code.
3. **Monorepo Quality Gates**:
   - Execute:
     ```powershell
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
4. **Documentation**:
   - Ensure relevant documentation (`docs/`) is updated if public contracts or workflows changed.
5. **No Unrequested Push**:
   - Do NOT push to remote GitHub repositories or execute deployment scripts unless explicitly requested by the user.
