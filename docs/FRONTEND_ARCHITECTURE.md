# VIP Maths — Frontend Architecture

## Overview

The VIP Maths frontend is built with Next.js 16 (App Router), React 19, and TypeScript 5.8 using a pure Vanilla CSS design-token system. It provides a production-grade application shell, responsive layout, accessible UI primitives, and immutable paper rendering.

## Architecture Layers

```
apps/web/src/
├── app/                  # Next.js App Router (pages & server layouts)
│   ├── (auth)/           # Login & Registration pages
│   ├── dashboard/        # Overview workspace
│   ├── questions/        # Question bank & CRUD
│   ├── blueprints/       # Blueprint designer & generator
│   └── papers/           # Generated paper detail & print projections
│
├── components/           # Reusable UI component hierarchy
│   ├── brand/            # Brand assets (BrandLogo, BrandMark)
│   ├── layout/           # AppShell, Sidebar, TopBar, PageContainer
│   └── ui/               # Atomic primitives (Button, Input, Select, Card, Badge, Alert, Skeleton, EmptyState, ErrorState)
│
└── lib/                  # Auth policies, API fetchers, Supabase SSR client
```

## Design Tokens & Styling Strategy

Styling relies strictly on CSS Custom Properties declared in `apps/web/src/app/globals.css`.
No heavy third-party UI frameworks (such as Tailwind or shadcn) are imported, ensuring minimal JavaScript bundle sizes and maximum rendering speed.

### Tokens Overview:
* **Brand Colors**: Derived directly from the official VIP Maths logo (`--brand-primary`: `#046d35`, `--brand-orange`: `#fd8b07`, `--brand-magenta`: `#a50c49`).
* **Typography**: Self-hosted `Inter` via `next/font/google` eliminating layout shifts and external CDN calls.
* **Spacing Scale**: 4px base (`--space-1` through `--space-16`).
* **Breakpoints**: Desktop (`>1024px`), Tablet (`768px - 1024px`), Mobile (`<768px`).

## Application Shell & Navigation

1. **Desktop Shell**: Sticky dark forest green sidebar with active route indicator, institution badge, and user action footer.
2. **Mobile Drawer**: Slide-out responsive navigation with backdrop overlay and keyboard-accessible toggle.
3. **Top Bar**: Sticky header containing contextual page branding and quick account actions.

## Accessibility (WCAG 2.2 Level AA)

* **Keyboard Navigation**: Native focus outlines (`:focus-visible`), focus trapping on mobile drawers.
* **Contrast Ratios**: Body text on white exceeds 6.2:1 (exceeding AA requirement of 4.5:1).
* **Non-Drag Reordering**: Section reordering in blueprints provides explicit "Move up" / "Move down" button controls alongside any touch/drag controls.
* **Skip Link**: Accessible `#main-content` skip link rendered at the top of every page.
