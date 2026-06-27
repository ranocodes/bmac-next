# BMAC Next — Agent Instructions

## Core Rules
1. **Clarification First:** Never start building or writing any code for a task when it is initially assigned. 
2. **Verification Threshold:** Do not proceed with any work until you are 99.9% certain you understand the exact requirements and my goals.
3. **Tool Usage:** You must always use the `AskUserQuestion` tool to clarify requirements or ask for missing details before beginning any development.
4. **Execution:** Once you have full clarity and are confident in the plan, proceed to close out questions and build the feature.

The goal is to maximize accuracy and prevent wasted time.

## Stack
- Next.js 16.2.6, Turbopack dev, Node 24, React 19
- Tailwind v4 (`@tailwindcss/postcss`), `@theme` tokens in `globals.css`
- Neon Postgres (`@neondatabase/serverless` HTTP driver — NOT pg pool)
- Clerk v7 (`@clerk/nextjs`, `@clerk/ui`) — hosted pages for admin auth
- Vitest v4.1.8 + jsdom + React Testing Library
- Fonts: Plus Jakarta Sans (body), Outfit (display)

## Commands
```
npm run dev          # Turbopack dev server (localhost:3000)
npm run build        # Production build (compiles ~3.5min, then tsc — may appear hung)
npm test             # vitest run
npm run test:watch   # vitest watch
npx tsc --noEmit     # TypeScript check
npx vitest run src/__tests__/HomeClient.test.tsx --reporter=verbose  # single test
```

## Project Structure
```
src/
  app/
    (public_pages)/   # Route group — public site, SSR via lib/db
    admin/            # Clerk-protected dashboard
    layout.tsx        # Root: ClerkProvider + fonts + Paystack script
  components/
    layouts/PublicLayout.tsx   # Shared public layout
    admin/                     # Admin components (24 files, one per entity)
  actions/            # Server actions (invitations, CRUD, auth, settings)
  lib/
    db.ts             # Neon HTTP helper — force dns.lookup IPv4
    auth/server.ts    # Clerk session helper
    iconMapper.ts     # Lucide icon name → component
    utils.ts          # Shared utilities
  proxy.ts            # Clerk middleware (renamed from middleware.ts for Next.js 16)
  types/cms.ts        # Shared types (Program, Event, AdminUser, etc.)
scripts/seed.sql      # Full DB seed (TRUNCATE + INSERT for all tables)
```

## Testing Gotchas
- Vitest `pool: "forks"` required — `"threads"` hangs on Node 24
- `setup.tsx` must be `.tsx` (contains JSX) — `.ts` fails with `vite:oxc` parser
- Tests globally mock Clerk modules via `src/__tests__/setup.tsx`
- Each test file also imports `./mocks` for Next.js/framer-motion mocks
- jsdom env takes ~17s to initialize per run (tests are slow)

## Auth / Middleware
- **No `middleware.ts`** — renamed to `proxy.ts` (Next.js 16 breaks on `middleware.ts` with Clerk)
- Clerk middleware protects `/admin(.*)` via `auth.protect()`
- `admin/layout.tsx` uses `currentUser()` → looks up `admin_users` by email
- Auto-creates `super_admin` only when `admin_users` table is empty (`SELECT COUNT(*) = 0`)
- First admin = Clerk sign-up → auto super_admin. Subsequent admins = invite only + Clerk allowlist.

## DB Gotchas
- `db.ts` monkey-patches `dns.lookup` → force IPv4 (Neon HTTP unreachable over IPv6 on this machine)
- `db.create()` auto-JSON.stringifys object/array values for `jsonb` columns
- All queries use `public.` schema prefix
- `partners.url` column is NOT NULL — pass empty string, not undefined

## Key Conventions
- `@/` path alias maps to `./src/`
- Server components fetch all data; client components receive `initial*` props
- `force-dynamic` on public and admin layouts (no caching)
- Admin permissions defined as string array in `admin_users.permissions` jsonb
- Activity logs use columns: `id, user, action, resource, resource_id, details, timestamp`

## Invite Flow
- `AcceptInviteForm.tsx` detects `useUser().isSignedIn` — two paths:
  - **New user**: Clerk sign-up via `clerk.client.signUp.create()` + `acceptInviteAction`
  - **Existing user**: `acceptExistingUserInvite` directly (skips Clerk sign-up)
- `createInvite` adds email to Clerk allowlist automatically
