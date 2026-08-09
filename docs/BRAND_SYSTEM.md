# VIP Maths — Official Brand System

## Official Logo Assets

The official VIP Maths logo is a protected brand asset featuring a green dynamic figure standing on a curved green swoosh, equipped with warm orange backpack straps, accompanied by the slogan **"Inspiration is not a word"** in rich wine magenta.

### Directory Structure

```text
apps/web/public/brand/
├── original/
│   └── vip-maths-original.png        # Master source asset (1024x1024 RGBA)
├── logo/
│   ├── vip-maths-full.png            # High-resolution PNG logo
│   └── vip-maths-full-optimized.webp # Web-optimized WebP logo
├── icon/
│   ├── vip-maths-icon-512.png        # High-res app icon
│   ├── vip-maths-icon-192.png        # PWA / mobile icon
│   └── vip-maths-icon-64.png         # Compact favicon mark
└── social/
    └── vip-maths-og.png              # OpenGraph social share card (1200x630)
```

## Brand Color Palette

| Token | Hex Code | RGB | Role |
| :--- | :--- | :--- | :--- |
| `--brand-primary` | `#046d35` | `(4, 109, 53)` | Primary brand green (Figure & Swoosh) |
| `--brand-orange` | `#fd8b07` | `(253, 139, 7)` | Accent orange (Backpack & Straps) |
| `--brand-magenta` | `#a50c49` | `(165, 12, 73)` | Secondary accent (Slogan text) |
| `--surface-sidebar`| `#062615` | `(6, 38, 21)` | Deep green-navy app sidebar background |

## Usage Guidelines

1. **Full Logo (`<BrandLogo />`)**:
   Used on login, registration, splash screens, documentation, and marketing layouts.
2. **Compact Mark (`<BrandMark />`)**:
   Used in sidebar headers, top navigation bars, mobile drawers, and browser tab icons. Never shrink the full slogan image into small 24px/32px navigation slots.
3. **Typography & Slogan**:
   Official slogan wording: **"Inspiration is not a word"**. Never alter slogan geometry, color, or text.
