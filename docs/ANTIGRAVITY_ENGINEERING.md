# VIP Maths — Antigravity Engineering Handbook

## Overview & Governance Purpose
VIP Maths is a commercial multi-tenant educational question-bank and paper-generation SaaS platform. To ensure production quality, maintainability, tenant security, and architectural consistency across all future AI agent invocations, this repository configures Antigravity workspace rules, skills, and workflows.

---

## 1. Antigravity Workspace Rules (`.agents/rules/`)

| Rule Name | Activation Mode | Target Purpose |
| :--- | :--- | :--- |
| **`vip-project-guardrails.md`** | ALWAYS ON | Global engineering standards, SaaS quality, no untested claims. |
| **`no-hardcoding.md`** | ALWAYS ON | Strict prohibition of hardcoded IDs, secrets, URLs, and constants. |
| **`architecture-boundaries.md`** | `apps/**,packages/**` | Monorepo layer isolation (`web`, `api`, `shared`). |
| **`frontend-boundaries.md`** | `apps/web/**` | Next.js 16 App Router, RSC defaults, typed API, accessibility. |
| **`backend-boundaries.md`** | `apps/api/**` | NestJS 11 Controller -> Service -> Domain -> Prisma layering. |
| **`database-safety.md`** | Database tasks | Migration safety, forbidding reset on hosted Supabase. |
| **`security-baseline.md`** | Auth/Tenant tasks | Multi-tenant isolation (`X-Institution-Id`), RBAC, IDOR protection. |
| **`test-before-complete.md`** | ALWAYS ON | Mandatory execution of quality gates before completion. |

---

## 2. Antigravity Workspace Skills (`.agents/skills/`)

- **`vip-architecture-guardian`**: Code placement, modularity, preventing duplicate helpers or circular imports.
- **`vip-nextjs-frontend`**: Next.js 16 / React 19 App Router standards, loading/empty/error UI states.
- **`vip-nestjs-backend`**: NestJS module structure, application services, domain algorithms, error handling.
- **`vip-supabase-prisma`**: Database migrations, schema DDL inspection, Prisma queries, seed safety.
- **`vip-design-system`**: Brand visual identity (Green, Orange, Magenta accents), CSS variables, clean typography.
- **`vip-security-review`**: Multi-tenancy audit checklist, RBAC verification, input sanitization.
- **`vip-testing-qa`**: Selecting and executing proportional automated test gates.
- **`vip-release-check`**: Pre-release verification, git diff audit, secret scanning.

---

## 3. External Vendor Skills (`.agents/skills/`)

- **`vercel-react-best-practices`**: React 19 and Next.js 16 performance, waterfall elimination, bundle size optimization, and RSC rendering patterns from Vercel Engineering.
- **`supabase`**: Current Supabase platform behaviors covering Auth, `@supabase/ssr`, RLS policies, Storage, CLI tools, and MCP server configuration.
- **`supabase-postgres-best-practices`**: PostgreSQL query optimization, indexing strategy, EXPLAIN analysis, connection pooling, and lock diagnosis.
- **`playwright-cli`**: Browser QA automation, responsive rendering verification, visual debugging, and end-to-end flow reproduction via Playwright CLI.

> [!IMPORTANT]
> **VIP Maths Project Rules & Skills Remain Authoritative**: External vendor guidance supplements performance and platform knowledge but NEVER overrides VIP Maths tenant isolation, database migration safety, role permissions, or monorepo boundaries. See [EXTERNAL_AGENT_SKILLS.md](file:///d:/Projects/VIP_QN_BANK/docs/EXTERNAL_AGENT_SKILLS.md) for detailed priority matrices.

---

## 4. Workflows (`.agents/workflows/`)

- **`/feature-delivery`**: 14-step workflow for end-to-end scoped feature delivery.
- **`/database-change`**: 13-step additive and safe schema migration workflow.
- **`/bugfix`**: 10-step reproduction, root cause analysis, and regression testing workflow.
- **`/pre-release`**: 13-step release readiness audit workflow.

---

## 5. Operational Best Practices

### Planning Mode & Artifact Review
Non-trivial architectural changes, database modifications, or major feature additions MUST use **Planning Mode** to produce an `implementation_plan.md` artifact for user review before execution.

### Supabase MCP & Safety Policy
Supabase MCP is available for inspecting live schema state, migrations, and performance advisors. Destructive SQL execution (`DROP TABLE`, `prisma migrate reset`) against hosted Supabase is strictly forbidden.

### Quality Gate Expectations
Every significant code modification must pass:
```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
