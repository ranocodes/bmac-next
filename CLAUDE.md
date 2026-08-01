# CLAUDE.md — BMAC Next

Guidance for Claude when working on this repository.

## Project Overview

Full-stack Next.js 16 website for Brilliant Minds Ambassadors Club (BMAC) Jos — a youth empowerment NGO. Public-facing site (programs, events, gallery, news) + admin dashboard for content management with custom session auth (Express backend) + Neon Postgres.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16.2.6 (App Router) | Framework — Turbopack dev, production builds with tsc |
| React 19.2.4, Node 24 | Runtime |
| Tailwind v4 (`@tailwindcss/postcss`) | Styling — `@theme` tokens in `globals.css` |
| Neon Postgres (`@neondatabase/serverless`) | Database — HTTP driver, NOT pg pool. IPv4 forced in `lib/db.ts` |
| Express backend (`bmac-express-server`) | Admin auth + admin email — HMAC-signed cookie sessions, bcrypt admins, Nodemailer SMTP |
| Vitest v4.1.8 + jsdom + React Testing Library | Testing — `pool: "forks"` required |
| Tiptap (`@tiptap/react`) | Rich text editor for CMS content |
| Paystack | Payment gateway (inline.js loaded in root layout) |
| Nodemailer SMTP (via Express) | Admin credentials/reset/security email |
| Resend | Public contact form email only |
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
    admin/            # Custom-session protected dashboard pages (Express-backed auth)
    layout.tsx        # Root: fonts + Paystack script
    globals.css       # Tailwind v4 @theme tokens + legacy utility classes
  components/
    layouts/PublicLayout.tsx   # Shared public layout (Navbar + Footer)
    admin/                     # Admin components — one Form + one Table per entity
    ui/                        # Reusable UI primitives
  actions/            # Server actions (crud.ts, admin-auth.ts, invitations, settings)
  lib/
    db.ts             # Neon HTTP driver helper — CRUD helpers + raw query
    auth/super-admin.ts  # HMAC session cookie sign/verify (bmac_admin_session)
    auth/client.ts    # Express backend client (login, create-admin, resend, reset)
    auth/server.ts    # Session/permission helpers (requirePermission)
    auth/admin-context.tsx  # React context for admin user
    iconMapper.ts     # Lucide icon name → component mapping
    utils.ts          # cn() utility (clsx + tailwind-merge)
  types/cms.ts        # Shared types (Program, Event, Partner, AdminUser, etc.)
  proxy.ts            # Session guard — allowlists public admin routes, protects the rest (Next.js 16 renamed from middleware.ts)
  __tests__/          # Tests with global auth/session mocks
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
- **No** `middleware.ts` — renamed to `proxy.ts` (Next.js 16 compatibility)
- `proxy.ts` is a session guard: allowlists public admin routes (`/admin/login`, `/admin/setup`, `/admin/forgot-password`, `/admin/reset-password/*`), protects everything else, verifies the `bmac_admin_session` HMAC cookie
- Auth backend is the **bmac-express-server** repo (Express, Vercel): `/api/auth/login`, `create-admin`, `update-admin`, `resend-credentials`, `request-password-reset`, `reset-password`, and `/send` (email). All endpoints require the shared `EMAIL_SERVICE_API_KEY`
- Next calls it via `src/lib/auth/client.ts`, then sets the HMAC session cookie (`super-admin.ts`) and logs activity
- Admins stored in `admin_users` (role, permissions) + `super_admins` (bcrypt `password_hash`) via the Express backend — no external identity provider
- First admin auto-created as `super_admin` via `/admin/setup` when `admin_users` is empty
- Subsequent admins created from the Admins page; credentials emailed by the Express backend (Nodemailer SMTP)
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
- **Setup**: `src/__tests__/setup.tsx` globally mocks auth/session modules
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
| `src/proxy.ts` | Session guard (renamed from middleware.ts — Next.js 16) |
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
