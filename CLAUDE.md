# CLAUDE.md — CropwayGIS Frontend

> This file gives AI coding agents the context needed to work correctly in this codebase.
> Read before making any changes. Keep this file updated as the project evolves.

---

## Project Overview

**CropwayGIS** is the GIS-first agricultural planning workspace for the Cropway platform.
It is a Next.js 15 frontend served as a standalone product tab within the larger Cropway suite.

The product is structured as a multi-module GIS shell. Each module is a focused domain slice
(Crop Planning, Monitoring & Detection, Land Intelligence, etc.) rendered inside a persistent
sidebar navigation shell.

Backend API: Django + DRF, running at `NEXT_PUBLIC_API_BASE_URL` (default: `http://127.0.0.1:8000`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + custom CSS variables |
| Data Fetching | TanStack Query v5 (`@tanstack/react-query`) |
| Validation | Zod v4 |
| Icons | lucide-react |
| Class Merging | `clsx` + `tailwind-merge` via `cn()` util |
| Package Manager | **pnpm only** |
| Testing | Jest + Testing Library |

---

## Folder Architecture

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── globals.css         # ← DESIGN SYSTEM: all CSS variables defined here
│   ├── layout.tsx          # Root layout (fonts, providers)
│   └── [route]/page.tsx    # Page entry points (thin — just import Client component)
│
├── features/               # Domain feature slices (one folder per module)
│   ├── shell/              # GIS shell (nav, hero, icons, route config)
│   ├── crop-planning/      # Crop Planning module (active V1 feature)
│   ├── monitoring-detection/
│   ├── land-intelligence/
│   └── auth/
│
├── components/
│   ├── ui/                 # Shared primitive components (Button, Input, etc.)
│   └── providers/          # React context providers (AppProviders)
│
└── lib/
    ├── api/
    │   ├── client.ts       # Base apiFetch() — wraps fetch with error handling
    │   └── crop-planning.ts # Domain API functions (used by TanStack Query)
    └── utils.ts            # cn(), formatInr()
```

---

## Module Roadmap

| Module | Route | Status |
|---|---|---|
| Home | `/home` | Scaffolded (shell stats only) |
| **Crop Planning** | `/crop-planning` | **Active — V1 implemented** |
| Monitoring & Detection | `/monitoring-detection` | Scaffolded (UI mockup exists) |
| Land Intelligence | `/land-intelligence` | Scaffolded (UI mockup exists) |
| Climate & Risk | `/climate-risk` | Scaffolded (placeholder) |
| Supply Chain & Logistics | `/supply-chain-logistics` | Scaffolded (placeholder) |
| Carbon & Sustainability | `/carbon-sustainability` | Scaffolded (placeholder) |

---

## Design System

### Single source of truth: two files

1. **`src/app/globals.css`** — declares all CSS custom properties (`:root { ... }`)
2. **`tailwind.config.ts`** — maps every CSS var to a Tailwind token

If a color or token doesn't exist in these files, **add it there first**, then use it.

### Color token groups

| Group | CSS Var Prefix | Tailwind Prefix | Example |
|---|---|---|---|
| Surface/Structure | `--canvas`, `--panel`, `--surface`, `--white` | `bg-canvas`, `bg-surface` | Page bg, inputs |
| Borders | `--line`, `--line-light`, `--line-soft` | `border-line` | Dividers |
| Ink (Text) | `--ink`, `--ink-base`, `--ink-dark`, `--muted` | `text-ink`, `text-muted` | Text |
| Brand Green | `--green-*`, `--moss*` | `bg-greenNormal`, `text-moss` | Buttons, accents |
| Accent Green | `--green-muted`, `--green-pale` | `stroke-greenMuted` | Charts, maps |
| Brand Yellow | `--yellow-*`, `--wheat` | `bg-yellowNormal` | Highlights |
| Semantic | `--warning` | `fill-warning` | Alert icons |
| Neutral UI | `--icon-neutral` | `bg-iconNeutral` | Avatar bg |

### Typography system

Four font families are loaded via `next/font/google` in `layout.tsx`:

| Variable | Family | Use case |
|---|---|---|
| `font-sans` / `--font-plus-jakarta` | Plus Jakarta Sans | Default body, prose |
| `font-montserrat` / `--font-montserrat` | Montserrat | Labels, buttons, headings |
| `font-poppins` / `--font-poppins` | Poppins | Form fields, date pickers |
| `font-inter` / `--font-inter` | Inter | Data tables, chart axes |

Always use the Tailwind font utility (`font-montserrat`, `font-poppins`, etc.) — never hardcode `fontFamily` in inline styles unless inside SVG chart elements with no Tailwind support.

---

## State Management

Crop Planning uses a **local-first draft** pattern:

- `useReducer` + `reducer.ts` (`cropPlanReducer`) manages all in-session changes
- `storage.ts` persists the draft to `localStorage` under key `cropwaygis.crop-planning.v1`
- TanStack Query fetches reference data (seasons, crops, units, calculations) from the API
- The draft is **never sent to the server** — the API is stateless and receives the full selection on demand

---

## API Layer Pattern

```
lib/api/client.ts          → apiFetch<T>(path, init?) — base fetch wrapper
lib/api/crop-planning.ts   → domain functions (fetchCrops, fetchUnits, postCalculation, etc.)
features/*/Client.tsx      → useQuery / useMutation hooks consume the domain functions
```

- All API functions return typed responses (validated manually or via Zod where applied)
- Backend base URL: `NEXT_PUBLIC_API_BASE_URL` (env var), defaults to `http://127.0.0.1:8000`
- All responses follow `ApiEnvelope<T> = { data: T; meta?: Record<string, string> }`

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Feature Client | `[Feature]Client.tsx` | `CropPlanningClient.tsx` |
| Shared UI | `kebab-case.tsx` | `map-scale-bar.tsx` |
| Types file | `types.ts` per feature | `features/crop-planning/types.ts` |
| API functions | camelCase verb+noun | `fetchCrops()`, `postCalculation()` |
| CSS tokens | `--kebab-case` | `--green-dark-hover` |
| Tailwind tokens | `camelCase` | `greenDarkHover` |
| Reducer actions | `{ type: 'camelCase' }` | `{ type: 'addCrop' }` |

---

## Shell Navigation

Configured in `features/shell/config.tsx`:
- `gisNavItems` — sidebar nav (Home, Crop Planning, Monitoring, Land Intelligence, Climate, Supply Chain, Carbon)
- `productTabs` — top bar product switcher (Cropway, GIS, Seller Studio, Market Place)
- `placeholderCopy` — text for scaffolded/coming-soon module routes

---

## Key Utilities

- `cn(...classes)` — merge Tailwind classes safely (`clsx` + `tailwind-merge`)
- `formatInr(value)` — format a number as Indian Rupee string (no ₹ symbol, no decimals)

---

## What NOT to Do

- ❌ Do not hardcode hex values (`#fff`, `#222`, `rgba(0,0,0,0.1)`) in components
- ❌ Do not use arbitrary Tailwind color values (`text-[#1E1E1E]`, `bg-[#F4F7FA]`)
- ❌ Do not use `npm` or `yarn` — only `pnpm`
- ❌ Do not put business logic in page files (`app/*/page.tsx`) — they are thin wrappers
- ❌ Do not add new shared UI to `features/` — shared primitives belong in `components/ui/`
- ❌ Do not introduce new dependencies without noting them in a comment or PR description
