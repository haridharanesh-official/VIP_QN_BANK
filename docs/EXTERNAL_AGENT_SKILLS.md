# VIP Maths — External Agent Skills Registry

This document records all third-party vendor agent skills installed in `.agents/skills/`.

---

## Skill Inventory & Security Review

| Skill Name | Vendor / Repository | Installed Path | Activation Trigger | Priority / Hierarchy | Security Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`vercel-react-best-practices`** | Vercel (`vercel-labs/agent-skills`) | `.agents/skills/vercel-react-best-practices` | React 19 / Next.js 16 rendering, data fetching, bundle optimization, RSC performance. | Subordinate to `vip-nextjs-frontend` and `vip-architecture-guardian`. | **SAFE** — Static performance rule guidance. |
| **`supabase`** | Supabase (`supabase/agent-skills`) | `.agents/skills/supabase` | Any task involving Supabase Auth, @supabase/ssr, RLS policies, Storage, CLI/MCP. | Subordinate to `vip-supabase-prisma`. VIP skill determines architecture; Supabase skill determines platform APIs. | **SAFE** — Standard platform guidance with strict security warnings. |
| **`supabase-postgres-best-practices`** | Supabase (`supabase/agent-skills`) | `.agents/skills/supabase-postgres-best-practices` | PostgreSQL query optimization, indexing, connection pooling, EXPLAIN analysis, locking. | Subordinate to `vip-supabase-prisma` and `database-safety` rule. Advisory only. | **SAFE** — Pure SQL optimization patterns. |
| **`playwright-cli`** | Microsoft (`microsoft/playwright-cli`) | `.agents/skills/playwright-cli` | Browser E2E verification, responsive QA, workflow testing, console/network inspection. | Subordinate to `vip-testing-qa` and `vip-release-check`. | **SAFE** — Browser automation CLI tool. |

---

## Authority & Conflict Resolution Matrix

When guidance from an external vendor skill overlaps with VIP Maths project rules, the **VIP Maths project rules always take precedence**:

```
VIP Maths Workspace Rules (ALWAYS ON / Database Safety / Security Baseline)
        ↓
VIP Maths Project Skills (vip-architecture-guardian, vip-supabase-prisma, etc.)
        ↓
Official Vendor External Skills (Vercel, Supabase, Microsoft)
        ↓
Vendor Online Documentation
```

### Detailed Overlap Rules

| External Skill | Overlapping VIP Skill / Rule | Authority & Precedence |
| :--- | :--- | :--- |
| **`vercel-react-best-practices`** | `vip-nextjs-frontend`, `vip-architecture-guardian` | **VIP Architecture Wins**. Vercel performance rules supplement component performance without overriding project file structures or tenant headers. |
| **`supabase`** | `vip-supabase-prisma`, `security-baseline` | **VIP Project Architecture Wins**. `vip-supabase-prisma` dictates NestJS Prisma access patterns and tenant filtering. `supabase` provides platform API details. |
| **`supabase-postgres-best-practices`** | `vip-supabase-prisma`, `database-safety` rule, `/database-change` workflow | **VIP Migration Safety Wins**. External Postgres index/query recommendations are advisory. No schema change or index addition may occur outside `/database-change`. |
| **`playwright-cli`** | `vip-testing-qa`, `vip-release-check` | **VIP Testing Strategy Wins**. Playwright CLI is used for browser QA verification. Existing project test structures must be preserved. Secrets must never be logged or committed. |
