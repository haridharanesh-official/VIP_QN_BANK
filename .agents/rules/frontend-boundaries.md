---
description: Frontend architectural rules, React/Next.js standards, and UI component boundaries for apps/web
globs: "apps/web/**"
alwaysApply: false
---

# Frontend Engineering Boundaries (`apps/web`)

## 1. Next.js 16 App Router & Server Components
- Default to **React Server Components (RSC)** for data fetching and layout structure.
- Use `"use client"` **ONLY** on leaf components that require browser interactivity, event handlers, or React state (`useState`, `useEffect`).
- Do not convert top-level pages or entire subtrees into client components unnecessarily.

## 2. API Communication & Data Fetching
- Use typed API wrappers/clients centralized in `apps/web/src/lib/api`.
- Do not duplicate raw `fetch` calls with inline header assembly across pages.
- Handle error boundaries, loading states, empty states, and success states explicitly for all async operations.
- Never display fake or fabricated dashboard statistics. If real backend data is loading or empty, display appropriate loading spinners, empty states, or fallback notices.

## 3. UI, Accessibility & Design Tokens
- Use semantic HTML tags (`<main>`, `<header>`, `<nav>`, `<article>`, `<section>`, `<button>`, `<label>`).
- Ensure accessible form inputs (`htmlFor`, `id`, `aria-describedby`, error state accessibility).
- Support full keyboard navigation and clear focus rings.
- Do not rely on drag-only user interactions; provide accessible button/keyboard fallbacks.
- Use centralized design tokens and CSS variables. Do not insert arbitrary inline hex colors or custom utility values when design tokens exist.
- Use `next/image` for image assets and `next/font` for web typography.
- Preserve Supabase SSR auth cookies and active tenant header (`X-Institution-Id`) propagation.
