---
name: vip-nextjs-frontend
description: Frontend implementation standards for VIP Maths using Next.js 16 App Router, React 19, Supabase SSR Auth, and accessible UI components. Use when building or modifying web pages, routes, or components.
---

# VIP Next.js Frontend Development Skill

## Purpose
Enforce production-grade frontend practices for `apps/web` adhering to Next.js 16 App Router conventions, React Server Components, Supabase SSR authentication, design system tokens, and accessible UI layouts.

## Core Architectural Patterns

### 1. Server vs Client Components
- **Server Components (Default)**: Fetch data, render initial HTML layout, keep dependencies on server.
- **Client Components (`"use client"`)**: Scope strictly to interactive controls (form handlers, modal toggles, interactive paper builders). Keep client boundaries as deep down the tree as possible.

### 2. Typed API Communications
- Use centralized API wrappers from `apps/web/src/lib/api`.
- Always pass `X-Institution-Id` header for tenant-scoped operations.
- Handle responses through structured return types:
  ```typescript
  type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };
  ```

### 3. Comprehensive Component States
Every asynchronous feature UI must explicitly account for:
- ⏳ **Loading state**: Skeleton placeholders or spinners.
- 📭 **Empty state**: Informative message with actionable primary button.
- ❌ **Error state**: User-friendly error message with retry mechanism.
- ✅ **Success state**: Clear visual feedback upon completion.

### 4. Accessibility & Layout Responsiveness
- Semantic HTML tags (`<main>`, `<section>`, `<article>`, `<header>`, `<nav>`).
- Full keyboard focus management (`tabIndex`, `onKeyDown` handlers where needed).
- Responsive viewports: Verify layout at `1440x900`, `1024x768`, `768x1024`, and `390x844`.
