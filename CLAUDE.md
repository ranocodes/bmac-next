# CLAUDE.md — BMAC Next

Guidance for Claude when working on this repository.

## Project Overview

Full-stack Next.js 16 website for Brilliant Minds Ambassadors Club (BMAC) Jos — a youth empowerment NGO. Public-facing site (programs, events, gallery, news) + admin dashboard for content management with Clerk auth + Neon Postgres.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16.2.6 (App Router) | Framework — Turbopack dev, production builds with tsc |
| React 19.2.4, Node 24 | Runtime |
| Tailwind v4 (`@tailwindcss/postcss`) | Styling — `@theme` tokens in `globals.css` |
| Neon Postgres (`@neondatabase/serverless`) | Database — HTTP driver, NOT pg pool. IPv4 forced in `lib/db.ts` |
| Clerk v7 (`@clerk/nextjs`, `@clerk/ui`) | Admin auth — hosted pages, middleware in `proxy.ts` |
| Vitest v4.1.8 + jsdom + React Testing Library | Testing — `pool: "forks"` required |
| Tiptap (`@tiptap/react`) | Rich text editor for CMS content |
| Paystack | Payment gateway (inline.js loaded in root layout) |
| Resend | Transactional email |
| Framer Motion, Embla Carousel | Animations, carousels |
| Lucide React | Icons — mapped via `lib/iconMapper.ts` |
| Plus Jakarta Sans + Outfit (Google Fonts) | Body + display fonts via `next/font` |

---

## Commands

```bash
npm run dev        # Turbopack dev server (localhost:3000)
npm run build      # Production build (~3.5min compile + tsc)
npm run test       # vitest run
npm run test:watch # vitest watch
npx tsc --noEmit   # TypeScript check
npm run lint       # ESLint
```

---

## Architecture

```
src/
  app/
    (public_pages)/   # Route group — SSR public pages, fetch via lib/db
    admin/            # Clerk-protected dashboard pages
    layout.tsx        # Root: ClerkProvider + fonts + Paystack script
    globals.css       # Tailwind v4 @theme tokens + legacy utility classes
  components/
    layouts/PublicLayout.tsx   # Shared public layout (Navbar + Footer)
    admin/                     # Admin components — one Form + one Table per entity
    ui/                        # Reusable UI primitives
  actions/            # Server actions (crud.ts, admin-auth.ts, invitations, settings)
  lib/
    db.ts             # Neon HTTP driver helper — CRUD helpers + raw query
    auth/server.ts    # Clerk session helpers
    auth/admin-context.tsx  # React context for admin user
    iconMapper.ts     # Lucide icon name → component mapping
    utils.ts          # cn() utility (clsx + tailwind-merge)
  types/cms.ts        # Shared types (Program, Event, Partner, AdminUser, etc.)
  proxy.ts            # Clerk middleware (renamed from middleware.ts — Next.js 16 compat)
  __tests__/          # Tests with global Clerk mocks
scripts/seed.sql      # Full DB seed (TRUNCATE + INSERT for all 10+ tables)
```

**Data flow**: Server component fetches all data → passes `initial*` props → client component renders. Admin uses Form/Table pairs per entity. Server actions for mutations.

---

## Code Patterns

### Naming
- PascalCase for components and types
- camelCase for functions, variables, props
- kebab-case for DB column names (snake_case in SQL, camelCase in TypeScript interfaces)
- Client components use `"use client"` directive (no blank line before)

### Component patterns
- Admin forms: state per field, `handleSubmit()` validates + calls `createItem`/`updateItem` from `actions/crud.ts`
- Admin tables: `initialData` prop from server, client-side rendering
- Public pages: server component fetches data, client component receives `initial*` props
- PublicLayout accepts optional overrides (`logoText`, `navLinks`, `socialLinks`, `copyright`)

### DB conventions
- All queries use `public.` schema prefix
- `db.create()` auto-JSON.stringifys object/array values for `jsonb` columns
- `partner.url` is NOT NULL — pass empty string, not undefined
- Tables: programs, events, news_articles, testimonials, team_members, impact_stats, gallery_items, partners, site_settings, activity_logs, admin_users

### Auth
- **No** `middleware.ts` — renamed to `proxy.ts` (Next.js 16 breaks on `middleware.ts` with Clerk)
- Clerk middleware protects `/admin(.*)` via `auth.protect()`
- `admin/layout.tsx` uses `currentUser()` → looks up `admin_users` by email
- First admin auto-created as `super_admin` when `admin_users` table is empty
- Subsequent admins: invite-only + Clerk allowlist
- Admin permissions stored as string array in `admin_users.permissions` jsonb
- Admin context via `useAdmin()` hook from `lib/auth/admin-context.tsx`

### Styling
- Tailwind v4 utility classes + `@theme` tokens for brand colors/shadows/fonts
- Semantic color tokens: `bg-background`, `text-primary`, `border-border`, etc.
- Brand colors via `bg-green`, `text-gold`, `bg-deep`, `text-accent-green`
- Custom `cn()` for class merging
- Legacy CSS utility classes in `globals.css` (`.btn`, `.section-title`, `.page-hero`, `.nav`)

---

## Testing

- **Run**: `npm test` or `npx vitest run`
- **Single file**: `npx vitest run src/__tests__/HomeClient.test.tsx --reporter=verbose`
- **Location**: `src/__tests__/`
- **Setup**: `src/__tests__/setup.tsx` globally mocks Clerk modules
- **Each test file** imports `./mocks` for Next.js/framer-motion mocks
- **Gotchas**: `pool: "forks"` required (threads hangs on Node 24). `setup.tsx` must be `.tsx` (JSX). jsdom env takes ~17s to init.

---

## Validation

```bash
npx tsc --noEmit && npm run lint && npm test
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/db.ts` | Neon HTTP driver — CRUD helpers, IPv4 monkey-patch |
| `src/proxy.ts` | Clerk middleware (renamed from middleware.ts) |
| `src/types/cms.ts` | All shared TypeScript interfaces |
| `src/actions/crud.ts` | Generic `createItem`/`updateItem`/`deleteItem` server actions |
| `src/app/globals.css` | Tailwind v4 `@theme` tokens, brand colors, legacy utilities |
| `src/lib/auth/admin-context.tsx` | Admin user React context + `useAdmin()` hook |
| `scripts/seed.sql` | Complete DB seed — TRUNCATE + INSERT for all tables |

---

## On-Demand Context

| Topic | File |
|---|---|
| AGENTS.md (stack/patterns/gotchas) | `AGENTS.md` |
| PRD (requirements, phases) | `.agents/PRDs/PRD.md` |
| Stories (32 implementation stories) | `.agents/stories/STORIES.md` |
| Creator commands | `.claude/commands/` |
| Neon DB schema | `scripts/seed.sql` |
| Environment template | `.env.example` |

---

## Notes

- `force-dynamic` on public and admin layouts — no caching
- `@/` alias maps to `./src/`
- DNS IPv4 forced for Neon HTTP — do not remove monkey-patch in `lib/db.ts`
- Paystack inline.js loaded in root layout — `POST /api/paystack` for transaction verification
- Admin Form components have `min-h-[44px]` on interactive elements for touch targets
- Activity log columns: `id, user, action, resource, resource_id, details, timestamp`
