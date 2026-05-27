# AGENTS.md — CropwayGIS Frontend

> Strict execution rules for AI coding agents working in this repository.
> Follow every rule here line-by-line. When in doubt, read CLAUDE.md for context.

---

## Package Manager

- Use **pnpm only**
- Never use `npm` or `yarn`
- Install packages: `pnpm add <package>`
- Dev server: `pnpm dev`
- Lint: `pnpm lint`
- Tests: `pnpm test`
- Build: `pnpm build` (only when explicitly requested)

---

## Design System — Colors

**Rule: Never use raw color values anywhere in source code.**

Allowed:
```tsx
// ✅ CSS variable in inline style
style={{ color: 'var(--ink-base)' }}

// ✅ Tailwind token class
className="text-inkBase bg-surface border-line"
```

Not allowed:
```tsx
// ❌ Hardcoded hex
style={{ color: '#1E1E1E' }}

// ❌ Arbitrary Tailwind color
className="text-[#1E1E1E] bg-[#F4F7FA]"

// ❌ Raw rgb/rgba
style={{ background: 'rgba(0,0,0,0.06)' }}
```

If a color is missing from the design system:
1. Add the CSS variable to `src/app/globals.css` inside `:root { }`
2. Add the Tailwind token to `tailwind.config.ts` inside `theme.extend.colors`
3. Then use the token — never the raw value

All current tokens: see `src/app/globals.css` and `tailwind.config.ts`.

---

## Design System — Typography

Use Tailwind font utilities only:
- `font-sans` (Plus Jakarta Sans) — default
- `font-montserrat` — labels, buttons, headings
- `font-poppins` — form fields, date pickers
- `font-inter` — data tables, chart labels

Exception: SVG/canvas elements with no Tailwind support may use inline `fontFamily`.
In that case, reference the CSS variable: `fontFamily: 'var(--font-inter), sans-serif'`.

---

## Component Rules

- Shared primitive components → `src/components/ui/`
- Feature-specific components → `src/features/[feature]/`
- Page files (`app/*/page.tsx`) are thin — they only import and render the Client component
- Always use `cn()` from `@/lib/utils` to merge Tailwind class strings
- Never use `style=` for values that exist as a Tailwind token (colors, common spacing, etc.)

---

## SVG Icons

- Reusable icons must use `currentColor` for `stroke` and `fill`
- Never hardcode a hex value inside a reusable icon component
- Illustration-only / static SVG artwork (e.g. HomeHero map polygon) may use hardcoded colors
  only if those colors are already registered CSS variables — reference `var(--token)` where possible

---

## TypeScript

- Strict mode is enabled — no `any` types
- All API response shapes must be typed (use types from `features/*/types.ts` or `lib/api/`)
- Use `zod` for runtime validation of external data when correctness is critical
- Prefer explicit return types on exported functions

---

## API & Data Fetching

- All HTTP calls go through `lib/api/client.ts` → `apiFetch<T>()`
- Domain-level API functions live in `lib/api/[feature].ts`
- Components consume API via TanStack Query (`useQuery` / `useMutation`) — no raw `fetch` in components
- Backend base URL comes from `NEXT_PUBLIC_API_BASE_URL` env var (default: `http://127.0.0.1:8000`)
- All responses follow `ApiEnvelope<T> = { data: T; meta?: ... }`

---

## State Management

- Feature-level draft state: `useReducer` + localStorage persistence via `storage.ts`
- Do not store draft state in a global store — keep it feature-local
- Draft storage key format: `cropwaygis.[feature].v[version]`

---

## File & Naming Rules

| Thing | Rule |
|---|---|
| Feature Client files | `[Feature]Client.tsx` |
| Shared UI | `kebab-case.tsx` in `components/ui/` |
| Types | `types.ts` per feature folder |
| API functions | camelCase verb-noun: `fetchCrops`, `postCalculation` |
| CSS variables | `--kebab-case` |
| Tailwind tokens | `camelCase` |

---

## Git

- Work on feature branches — never commit directly to `main`
- Commit messages: imperative, descriptive (`Add surface token to design system`)
- Do not force push

---

## Dependencies

- Do not add new dependencies without a clear reason
- If a dependency is added, note it in your commit message or a comment
- Prefer utilities already in the project (`cn`, `formatInr`, `zod`, `lucide-react`) before reaching for new packages

---

## Testing

- Test files live in `src/__tests__/`
- Run tests: `pnpm test`
- Do not break existing tests when making changes
- Write tests for new utility functions in `lib/`
