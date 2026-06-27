# BMAC Next — Agent Hand-off

Generated: 2026-06-20
Branch: `test` (origin/test)

---

## 1. Current Project Status

### What's Built
Full-featured admin dashboard + public-facing website for Brilliant Minds Ambassadors Club (BMAC), a youth empowerment NGO in Jos, Nigeria.

### Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6, Turbopack (dev), React 19 |
| Database | Neon Postgres via `@neondatabase/serverless` HTTP driver |
| Auth | Clerk v7 (`@clerk/nextjs` + `@clerk/ui` bundled UI) — hosted pages |
| Styling | Tailwind v4 (`@tailwindcss/postcss`), `@theme` tokens in globals.css |
| Fonts | Plus Jakarta Sans (body), Outfit (display) |
| Testing | Vitest v4.1.8 + jsdom + React Testing Library |
| CI | Neon branch-per-PR via GitHub Actions |
| Payments | Paystack (inline.js) |

### Working Features
- **Public pages**: Programs, Events, News, Gallery, About, Contact, Get Involved — all server-rendered with data from Neon
- **Admin dashboard**: 15 CRUD pages (programs, events, news, gallery, team, testimonials, partners, stats, categories, users, settings, logs, invites)
- **Auth**: Clerk hosted sign-in/sign-up for `/admin(.*)`
- **First-time setup**: Auto-creates `super_admin` in `admin_users` when first Clerk user signs up and table is empty
- **Invite flow**: Admin invites users → email added to Clerk allowlist → recipient creates account or accepts with existing Clerk session
- **Admin roles/permissions**: RBAC via `admin_users.role` and `admin_users.permissions` (jsonb)
- **Activity logging**: 15 seeded entries viewable in admin logs
- **13 passing unit tests**: `PublicLayout.test.tsx` (7 tests) + `HomeClient.test.tsx` (6 tests)

---

## 2. Pending Tasks

### P1 — End-to-end Auth Flow Verification
Test the complete flow manually:
1. First-time setup → Clerk sign-up → auto super_admin → admin dashboard renders
2. Create invite for second admin → email added to Clerk allowlist
3. Second admin clicks invite link → "Accept Invite" button (if signed in) or sign-up form
4. Second admin accepts → `admin_users` record created → can access admin dashboard

**Check**: `admin/layout.tsx:currentUser()` does NOT throw `ClerkAPIResponseError` after clean install.

### P2 — Clean Uncommitted Changes & Ship
Current branch `test` has uncommitted changes (13 modified/added files). Should be reviewed and committed:
- Core: middleware → proxy.ts rename, Clerk UI bundling, auth fixes
- Vitest: pool config, setup.tsx
- Invitations: acceptExistingUserInvite action
- AGENTS.md + agent_handoff.md

### P3 — Vitest `pool: "forks"` Speed Optimization
Tests work but jsdom environment takes ~17-25s per run. Consider:
- Parallelization tuning (currently serial per file)
- Pool warm-up strategy
- Investigating if `node --experimental-vm-modules` helps threads pool work on Node 24

### P4 — Mobile Responsiveness QA
No responsive design testing has been done. The admin panels and public pages should be checked on mobile viewports.

### P5 — Production Deployment Prep
- Set up Vercel project (or alternative host)
- Configure Neon production DB
- Configure Clerk production keys
- Set up Paystack live keys
- Configure custom domain

---

## 3. Known Issues & Blockers

### 🔴 CRITICAL: `currentUser()` may throw `ClerkAPIResponseError` (v7.5.2)
**Symptom**: `admin/layout.tsx:34` — `currentUser()` throws after page loads.
**Root cause**: Initially was incomplete CJS dist (`@clerk/nextjs` CJS `client-boundary/` directory missing). After clean reinstall, issue may be resolved — **NOT YET VERIFIED**.
**Fix**: Verify by running dev server, visiting `/admin`, checking console. If error persists:
- Check `node_modules/@clerk/nextjs/dist/cjs/client-boundary/` exists with files
- Try `npm install @clerk/nextjs@7.5.1` (pin to known-working version)
- Try `npm install @clerk/nextjs@latest` to get newest

### 🔴 CRITICAL: Vitest fork pool required on Node 24
**Symptom**: `pool: "threads"` → "Timeout waiting for worker to respond"
**Root cause**: Node v24 + Vitest v4.1.8 threads pool incompatibility.
**Fix**: `vitest.config.ts` must use `pool: "forks"`. Verified working.

### 🟡 Neon HTTP unreachable from this machine (IPv6)
**Symptom**: `db.ts` queries hang/timeout when connecting to Neon.
**Root cause**: `ep-billowing-dew-ap5h5wau.c-7.us-east-1.aws.neon.tech` resolves to IPv6 which is unreachable.
**Fix**: `db.ts` monkey-patches `dns.lookup` to force IPv4. This works in production/some environments but the patch itself may fail on machines without IPv4 access to Neon.
**Workaround**: Neon MCP tools (via `api.neon.tech`) work — use for DB operations when HTTP driver fails.

### 🟡 CSS brand colors not shown in test warnings (cosmetic)
HomeClient tests show console warnings about non-boolean attributes (`fill`, `priority`, `whileInView`, etc.) — these are from `next/image` and `framer-motion` mocks in `mocks.tsx`. Harmless, but could be fixed by updating mocks to filter out known framer-motion/next.js-specific props.

---

## 4. Codebase Dependencies & Setup

### Required Environment Variables (`.env.local`)
```env
# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_a925188d79b3438160a0c803e9bc5b674646a01c
PAYSTACK_SECRET_KEY=sk_test_7ce0965e0adb1207f79a8ecfdf24b69151101353

# Neon Postgres
NEON_DB_URL=postgresql://neondb_owner:npg_tjqr8eoWiK0V@ep-billowing-dew-ap5h5wau.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_PROJECT_ID=curly-mode-43198823

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2tpbGxlZC12aXBlci05OC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_GBv2WmqKt3bl4a2h2QXp24xKyhGLyvQirvAsJyZVI6
```

### Key npm Scripts
```bash
npm run dev          # Turbopack dev (localhost:3000)
npm run build        # Production build (compiles ~3.5min, then tsc)
npm test             # All tests (vitest run)
npm run test:watch   # Watch mode
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check
```

### Critical File Map
| File | Purpose |
|---|---|
| `src/proxy.ts` | Clerk middleware (was `middleware.ts` — renamed for Next.js 16 compat) |
| `src/lib/db.ts` | Neon HTTP helper with IPv4 dns.lookup patch |
| `src/lib/auth/server.ts` | Clerk session helper — wraps `currentUser()` |
| `src/app/layout.tsx` | Root layout — ClerkProvider + fonts + Paystack script |
| `src/app/admin/layout.tsx` | Admin layout — `currentUser()` → `admin_users` lookup + auto super_admin |
| `src/actions/invitations.ts` | Invite CRUD + Clerk allowlist management |
| `src/components/admin/AcceptInviteForm.tsx` | Two-path invite acceptance (new user / existing Clerk user) |
| `scripts/seed.sql` | Full DB seed (all tables TRUNCATE + INSERT) |
| `vitest.config.ts` | `pool: "forks"`, jsdom, Clerk mocks in setup.tsx |

### Neon DB Schema (from seed.sql)
Tables: `programs`, `events`, `news_articles`, `testimonials`, `team_members`, `impact_stats`, `gallery_items`, `partners`, `site_settings`, `activity_logs`, `admin_users`, `invitations`, `categories`
All queries use `public.` schema prefix.

### DB creation caveats
- `db.create()` auto-JSON.stringifys object/array values for `jsonb` columns
- `partners.url` is NOT NULL — pass empty string `""` not `undefined`
- `db.update()` previously had wrong WHERE clause (`WHERE id = $1` when `id` was invite `code`) — use raw `db.query()` for non-id lookups

---

## 5. Architecture Overview

```
src/
  app/
    (public_pages)/     # Public site — SSR with Neon data, force-dynamic
      page.tsx          # Home (hero + programs + testimonials + stats + partners)
      programs/         # Programs listing
      events/           # Events listing
      news/             # News articles
      gallery/          # Gallery
      about/            # About page
      contact/          # Contact form
      get-involved/     # Get involved page
      layout.tsx        # Fetches site_settings, wraps in PublicLayout
    admin/              # Clerk-protected admin panel
      layout.tsx        # currentUser() → admin_users lookup, permissions check
      page.tsx          # Dashboard with counts + recent activity
      login/            # Clerk SignInButton / SignUpButton
      accept-invite/    # Two-path invite acceptance
      programs/         # Program CRUD
      events/           # Event CRUD
      news/             # News CRUD
      gallery/          # Gallery CRUD
      team/             # Team CRUD
      testimonials/     # Testimonials CRUD
      partners/         # Partners CRUD
      stats/            # Impact stats CRUD
      categories/       # Categories CRUD
      users/            # Admin users list
      settings/         # Site settings editor
      invite/           # Create invite
      logs/             # Activity log viewer
    layout.tsx          # Root: ClerkProvider + fonts + Paystack
    globals.css         # Tailwind v4 @theme tokens + CSS vars
  components/
    layouts/PublicLayout.tsx  # Shared navbar + footer
    admin/                    # 24 admin components (one per entity + AdminLayout, DashboardClient)
    ui/                       # Reusable UI components (carousel, digital pass, etc.)
  actions/              # Server actions (CRUD, invitations, settings, admin auth)
  lib/
    db.ts               # Neon HTTP driver w/ IPv4 patch
    auth/server.ts      # Clerk session wrapper
    iconMapper.ts       # Lucide icon name → component
  proxy.ts              # Clerk middleware
  types/cms.ts          # Shared types
```

---

## 6. Testing Details

### Test setup
- Global Clerk mocks in `src/__tests__/setup.tsx` (must be `.tsx` — contains JSX)
- Additional mocks (next/image, next/link, framer-motion) in `src/__tests__/mocks.tsx` — imported by each test file
- Vitest pool: `forks` on Node 24 (threads crashes)

### Running specific tests
```bash
npx vitest run src/__tests__/PublicLayout.test.tsx --reporter=verbose
npx vitest run src/__tests__/HomeClient.test.tsx --reporter=verbose
```

### Test files
| File | Tests | Coverage |
|---|---|---|
| `PublicLayout.test.tsx` | 7 | Layout rendering, logo, nav, footer, social links |
| `HomeClient.test.tsx` | 6 | Hero, programs (DigitalPass), testimonials, stats, partners, empty state |

### Common test warnings (cosmetic)
- Non-boolean attribute warnings for `fill`, `priority` — from `next/image` mock
- `whileInView`, `whileHover`, `whileTap` DOM prop warnings — from `framer-motion` mock
These are harmless and expected with the mock implementations.

---

## 7. Auth Flow Reference

### First-time setup
1. User visits `/admin` → Clerk redirects to hosted sign-up
2. `admin/layout.tsx`: `currentUser()` returns user → `admin_users` COUNT = 0
3. `createDefaultAdmin()` creates `super_admin` record
4. Clerk allowlist restriction enabled
5. Admin dashboard renders with full permissions

### Subsequent admin (invite)
1. Existing admin sends invite via `/admin/invite`
2. `createInvite` → inserts `invitations` row + adds email to Clerk allowlist
3. Recipient clicks invite link → `/admin/accept-invite?code=xxx`
4. **Path A (new Clerk user)**: Fills form → `clerk.client.signUp.create()` → Clerk account created → `acceptInviteAction` creates `admin_users`
5. **Path B (existing Clerk session)**: "Accept Invite" button → `acceptExistingUserInvite` creates `admin_users` (skips sign-up)

### Admin access check
```ts
currentUser() → get admin_users WHERE email = user.primaryEmailAddress
if null AND admin_users COUNT == 0 → auto-create super_admin
else if null → not authorized (render children without AdminLayout user prop)
else → render AdminLayout with user's role + permissions
```

---

## 8. Recent Key Fixes (for context)

| Fix | Description |
|---|---|
| **middleware → proxy** | Renamed because Next.js 16 breaks on `middleware.ts` with Clerk |
| **Clerk CDN → bundled UI** | Replaced CDN `<script>` with `@clerk/ui` package + `ui={ui}` prop |
| **Double super_admin** | Added `COUNT(*) = 0` check before auto-creating super_admin |
| **Hydration mismatch** | `InviteUserForm.tsx` — replaced `typeof window` with `useEffect` + `origin` state |
| **db.update WHERE bug** | `acceptInviteAction` used `db.update("invitations", code, ...)` which did `WHERE id = code` — fixed to raw SQL with `WHERE code = $2` |
| **setup.ts → setup.tsx** | JSX in `.ts` rejected by `vite:oxc` parser on Node 24 |
| **pool: threads → forks** | Threads pool hangs indefinitely on Node 24 in Vitest v4 |
| **AcceptInviteForm signed-in** | Two-path: detects `useUser().isSignedIn` → skips Clerk sign-up |

---

## 9. Files Changed (uncommitted)

```
new:    AGENTS.md
new:    src/__tests__/setup.tsx       (setup.ts renamed .tsx for JSX)
new:    src/proxy.ts                  (replaces middleware.ts)
del:    src/__tests__/setup.ts
del:    src/middleware.ts
mod:    package.json                  (@clerk/nextjs, @clerk/ui added)
mod:    package-lock.json
mod:    scripts/seed.sql              (activity_logs + partner.url fix)
mod:    src/__tests__/mocks.tsx        (added Clerk + framer-motion mocks)
mod:    src/actions/invitations.ts     (acceptExistingUserInvite, db.update fix)
mod:    src/app/admin/layout.tsx       (COUNT check, allowlist move)
mod:    src/app/layout.tsx             (ClerkProvider ui={ui})
mod:    src/components/admin/AcceptInviteForm.tsx (two-path invite flow)
mod:    src/components/admin/AdminLayout.tsx (SignOutButton)
mod:    src/components/admin/InviteUserForm.tsx (hydration fix)
mod:    vitest.config.ts               (pool: forks, setup.tsx)
```
