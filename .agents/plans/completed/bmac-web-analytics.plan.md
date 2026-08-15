# Plan: Web Analytics — Neon Postgres Tracking + Bklit Charts

## Summary

Add website analytics to BMAC Next using the **existing Neon Postgres stack only** — no external SaaS providers. Core is self-hosted tracking: fix the never-created `page_views` table, add an `analytics_events` table, and fire business conversion events from existing server actions. The admin Analytics page is upgraded to use **Bklit UI chart components** (shadcn registry) for all graphs — traffic, conversion, and the existing operational metrics — keeping the current page structure.

**Current state (verified)**: `page_views` is inserted by `src/app/api/track/route.ts` and queried by `src/actions/analytics.ts` (`getVisitorStats`, `getDailyViews`) but the table exists in **no migration and no seed** — every insert/query silently fails (`.catch(() => [])`). `TrackView` is already mounted in the root layout. `AnalyticsClient` shows operational metrics only, no charts. Bklit requires shadcn (`components.json` with the `@bklit` registry) — not currently set up.

## User Story

As a **BMAC admin**, I want to see public-site traffic (page views, unique visitors, top pages, referrers, devices) and conversion counts (donations, event registrations, program applications, form submissions) charted alongside the existing operational metrics in the admin Analytics page — so that **I can measure what content and campaigns drive engagement and giving without leaving the dashboard or relying on third-party services**.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | HIGH |
| Systems Affected | `page_views`, `analytics_events` (new tables), `/api/track`, `/api/track-event` (new), `TrackView`, `actions/analytics.ts`, `actions/donations.ts`, `actions/events.ts`, `actions/programs.ts`, `actions/workflows.ts`, admin Analytics page, `components.json` (new) |
| Jira Issue | N/A |

---

## Patterns to Follow

### Naming
```
// SOURCE: src/types/cms.ts (PascalCase interfaces, camelCase fields, snake_case DB cols)
// SOURCE: src/actions/analytics.ts:101-172 (getOperationalAnalytics)
// Pattern: server action returns plain object of grouped metrics; queries use db.query<T> with public. prefix; every query wrapped in .catch(() => default)
```

### DB / Migration
```
// SOURCE: scripts/migrations/014-phase0-phase1.sql:1-53
// Pattern: CREATE TABLE IF NOT EXISTS public.x (id text PRIMARY KEY, ..., created_at timestamptz NOT NULL DEFAULT now());
// CREATE INDEX IF NOT EXISTS ... ON public.x (cols);
// Idempotent, safe to re-apply.
```

### Tracking / API route
```
// SOURCE: src/app/api/track/route.ts:1-33
// Pattern: POST, read JSON body, cookies() for session id (visitor_sid), db.query INSERT, Set-Cookie response header, try/catch → 400/500.
// SOURCE: src/components/TrackView.tsx:1-25
// Pattern: "use client", usePathname, skip /admin, setTimeout 500ms, fetch POST keepalive:true, .catch(() => {})
```

### Error Handling
```
// SOURCE: src/actions/*.ts — server actions return { error?: string; data?: T } and wrap DB in try/catch
// SOURCE: src/app/api/admin/analytics/route.ts:5-11 — requirePermission("view_analytics") in try/catch → 403
// Tracking is fire-and-forget — never throws, never blocks render
```

### Tests
```
// SOURCE: src/__tests__/ (vitest + RTL). Each file imports ./mocks (next/navigation, framer-motion).
// Pattern: mock fetch for route tests; mock actions/admin-context for component tests; fireEvent.click + waitFor assertions.
// Gotcha: pool: "forks" required (vitest.config.ts already set).
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `scripts/migrations/015-web-analytics.sql` | CREATE | `page_views` (missing) + `analytics_events` tables + indexes |
| `scripts/seed.sql` | UPDATE | Add same table DDL (idempotent) so fresh seeds include them |
| `src/app/api/track/route.ts` | UPDATE | Parse UTM params + device/browser from UA; keep existing columns |
| `src/components/TrackView.tsx` | UPDATE | Send `utm_*` from URL + referrer + device/browser data |
| `src/lib/analytics/track.ts` | CREATE | Client helpers `trackEvent(name, properties)` + `getUtmFromSearch` + `detectDevice` + `detectBrowser` |
| `src/lib/analytics/record.ts` | CREATE | Server helper `recordEvent(input)` — insert into `analytics_events`, never throws |
| `src/app/api/track-event/route.ts` | CREATE | Business event beacon (same cookie/session pattern as `/api/track`) |
| `src/actions/donations.ts` | UPDATE | `recordEvent("donation_completed")` after Paystack verify |
| `src/actions/events.ts` | UPDATE | `recordEvent("event_registered")` after successful registration |
| `src/actions/programs.ts` | UPDATE | `recordEvent("program_applied")` after `submitApplication` |
| `src/actions/workflows.ts` | UPDATE | `recordEvent("contact_submitted" | "member_joined" | "volunteer_submitted" | "partner_submitted")` in form-submission path |
| `src/actions/analytics.ts` | UPDATE | Traffic + conversion queries (`getTrafficOverview`, `getDailyViewsSeries`, `getTopPages`, `getReferrers`, `getDeviceBreakdown`, `getConversionFunnels`) |
| `src/app/api/admin/analytics/route.ts` | UPDATE | Serve traffic + conversion data alongside operational |
| `src/components/admin/AnalyticsClient.tsx` | UPDATE | Add traffic/conversion sections, render Bklit charts, keep existing operational cards |
| `src/components/admin/AnalyticsCharts.tsx` | CREATE | Bklit chart components — AreaChart (daily views), BarChart (top pages), PieChart (devices), RingChart (referrers), FunnelChart (conversions) |
| `components.json` | CREATE | shadcn config with `@bklit` registry |
| `src/__tests__/TrackView.test.tsx` | CREATE | TrackView skips `/admin`, posts path+utm |
| `src/__tests__/track-api.test.ts` | CREATE | `/api/track` + `/api/track-event` insert shape + cookie set |
| `src/__tests__/analytics-actions.test.ts` | CREATE | Traffic/conversion action queries (mocked db) |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: DB migration — `page_views` + `analytics_events`

- **File**: `scripts/migrations/015-web-analytics.sql`
- **Action**: CREATE
- **Implement**:
  - `public.page_views`:
    - Keep existing insert columns exactly: `path text NOT NULL`, `referrer text NOT NULL DEFAULT ''`, `user_agent text NOT NULL DEFAULT ''`, `session_id text NOT NULL DEFAULT ''`, `view_date date NOT NULL DEFAULT CURRENT_DATE` (existing `/api/track` insert uses these 5 — don't break it).
    - Add: `id text PRIMARY KEY DEFAULT gen_random_uuid()`, `utm_source text NOT NULL DEFAULT ''`, `utm_medium text NOT NULL DEFAULT ''`, `utm_campaign text NOT NULL DEFAULT ''`, `device_type text NOT NULL DEFAULT ''`, `browser text NOT NULL DEFAULT ''`, `created_at timestamptz NOT NULL DEFAULT now()`.
    - Indexes: `page_views_date_idx (view_date)`, `page_views_path_date_idx (path, view_date)`, `page_views_session_idx (session_id)`, `page_views_referrer_idx (referrer)`.
  - `public.analytics_events`:
    - `id text PRIMARY KEY DEFAULT gen_random_uuid()`, `name text NOT NULL`, `path text NOT NULL DEFAULT ''`, `referrer text NOT NULL DEFAULT ''`, `utm_source/utm_medium/utm_campaign text NOT NULL DEFAULT ''`, `properties jsonb NOT NULL DEFAULT '{}'::jsonb`, `session_id text NOT NULL DEFAULT ''`, `created_at timestamptz NOT NULL DEFAULT now()`.
    - Indexes: `analytics_events_name_date_idx (name, created_at)`, `analytics_events_created_idx (created_at)`.
- **Mirror**: `scripts/migrations/014-phase0-phase1.sql:4-40` (CREATE TABLE IF NOT EXISTS + CREATE INDEX IF NOT EXISTS, idempotent, `public.` prefix).
- **Validate**: `npx tsc --noEmit` (no code refs yet) + review SQL.

### Task 2: Seed schema

- **File**: `scripts/seed.sql`
- **Action**: UPDATE
- **Implement**: Add the two `CREATE TABLE IF NOT EXISTS` blocks + indexes (same DDL as Task 1) at the top of `seed.sql` so a fresh seed creates them.
- **Mirror**: `scripts/seed.sql:1-44` (existing table DDL style).
- **Validate**: `npm run build` (seed is not compiled — visual review; optionally run against a scratch DB).

### Task 3: Upgrade `/api/track` + `TrackView`

- **File**: `src/app/api/track/route.ts`
- **Action**: UPDATE
- **Implement**: Extend POST body to accept `utmSource`, `utmMedium`, `utmCampaign`, `deviceType`, `browser` (all optional strings, default `""`). Insert them into `page_views`. Keep `path` validation, cookie logic, and response shape unchanged.
- **Mirror**: existing `src/app/api/track/route.ts:4-33`.
- **Validate**: `npx tsc --noEmit`.

- **File**: `src/components/TrackView.tsx`
- **Action**: UPDATE
- **Implement**: After pathname guard + before fetch, use the shared helpers from `src/lib/analytics/track.ts` — `getUtmFromSearch(window.location.search)`, `detectDevice(navigator)`, `detectBrowser(navigator.userAgent)`. Include all fields in the POST body. Keep the 500ms debounce + `keepalive`.
- **Mirror**: `src/components/TrackView.tsx:1-25`.
- **Validate**: `npx tsc --noEmit`.

### Task 4: Event tracking core — record + track-event + client helpers

- **File**: `src/lib/analytics/record.ts`
- **Action**: CREATE
- **Implement**: `export async function recordEvent(input: { name: string; path?: string; referrer?: string; sessionId?: string; utm?: { source?; medium?; campaign? }; properties?: Record<string, unknown> }): Promise<void>` — builds `INSERT INTO public.analytics_events (...)` via `db.query`, wraps in try/catch, never throws (fire-and-forget).
- **Mirror**: `src/app/api/track/route.ts:20-23` insert pattern; `src/actions/analytics.ts:69-92` error swallowing.
- **Validate**: `npx tsc --noEmit`.

- **File**: `src/app/api/track-event/route.ts`
- **Action**: CREATE
- **Implement**: POST handler mirroring `/api/track`: read `{ name, properties }`, validate `name` (string, max ~80 chars, `^[a-z0-9_]+$`), reuse `visitor_sid` cookie logic (create if missing, set cookie), call `recordEvent` with `path` from referrer/current page, return `{ ok: true }` + Set-Cookie.
- **Mirror**: `src/app/api/track/route.ts:1-33` + `src/lib/analytics/record.ts`.
- **Validate**: `npx tsc --noEmit`.

- **File**: `src/lib/analytics/track.ts`
- **Action**: CREATE
- **Implement**: Client-side `trackEvent(name, properties?)` — `fetch("/api/track-event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, properties }), keepalive: true }).catch(() => {})`. Export shared `getUtmFromSearch`, `detectDevice`, `detectBrowser` helpers; import them from `TrackView` (single source of truth).
- **Mirror**: `src/components/TrackView.tsx:12-19` fetch shape.
- **Validate**: `npx tsc --noEmit`.

### Task 5: Wire conversion events into existing server actions

- **Files**: `src/actions/donations.ts`, `src/actions/events.ts`, `src/actions/programs.ts`, `src/actions/workflows.ts`
- **Action**: UPDATE
- **Implement** (each: import `recordEvent` from `@/lib/analytics/record`, call after the successful mutation — fire-and-forget, pass `properties` with ids/titles already available, and `sessionId` from cookies via `next/headers`):
  - `donations.ts`: after Paystack charge verification marks a donation completed → `recordEvent({ name: "donation_completed", properties: { reference, amount } })`.
  - `events.ts`: end of successful `registerForEvent` → `recordEvent({ name: "event_registered", properties: { eventId, eventTitle, reference } })`.
  - `programs.ts`: end of successful `submitApplication` → `recordEvent({ name: "program_applied", properties: { programId, programTitle, applicationId } })`.
  - `workflows.ts`: in `createWorkflowRecord` (or the public form action that calls it) → map kind → event name (`contact`→`contact_submitted`, `member`→`member_joined`, `volunteer`→`volunteer_submitted`, `partner`→`partner_submitted`, `program`→`program_applied`, `donation`→`donation_completed`, `event_registration`→`event_registered`, else `form_submitted`).
- **Mirror**: existing action return conventions (`src/actions/events.ts:268-368`, `src/actions/programs.ts:28-150`, `src/actions/workflows.ts`).
- **Validate**: `npx tsc --noEmit && npm run lint`.

### Task 6: Traffic + conversion queries in `actions/analytics.ts`

- **File**: `src/actions/analytics.ts`
- **Action**: UPDATE
- **Implement** (all with `.catch(() => default)`; `db.query` + `public.` prefix; `rangeDays` param default 30):
  - `getTrafficOverview(rangeDays?)` → `{ totalViews, uniqueVisitors, todayViews, avgDailyViews }`.
  - `getDailyViewsSeries(rangeDays?)` → `[{ date, views, visitors }]` (upgrade existing `getDailyViews`; update the single caller `/api/admin/stats` if its shape changes).
  - `getTopPages(rangeDays?, limit = 10)` → `[{ path, views }]`.
  - `getReferrers(rangeDays?, limit = 10)` → `[{ host, views }]` (parse host from `referrer` column; empty referrer → `"(direct)"`).
  - `getDeviceBreakdown(rangeDays?)` → `[{ type, count }]`.
  - `getConversionFunnels(rangeDays?)` → `{ eventCounts: [{ name, count }], funnel: [{ step, count, rate }] }` where funnel steps: `page_view → event_registered` and `page_view → donation_completed` (rates computed in JS).
- **Mirror**: `src/actions/analytics.ts:69-92` (getVisitorStats/getDailyViews patterns), `src/actions/analytics.ts:101-172` (Promise.all grouping style).
- **Validate**: `npx tsc --noEmit`.

### Task 7: Extend `/api/admin/analytics` payload

- **File**: `src/app/api/admin/analytics/route.ts`
- **Action**: UPDATE
- **Implement**: Parallel-call `getOperationalAnalytics()` + new traffic/conversion actions; return `{ operational, traffic, conversions }` (keep `operational` shape identical to today so the existing refresh path stays compatible).
- **Mirror**: `src/actions/analytics.ts:6-43` Promise.all pattern.
- **Validate**: `npx tsc --noEmit`.

### Task 8: Bklit / shadcn setup

- **File**: `components.json`
- **Action**: CREATE
- **Implement** (do **NOT** run `npx shadcn init` — it overwrites existing hand-written `src/components/ui/*`): create `components.json` manually:
  ```json
  {
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": true,
    "tsx": true,
    "tailwind": { "config": "", "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true },
    "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
    "iconLibrary": "lucide",
    "registries": { "@bklit": "https://ui.bklit.com/r/{name}.json" }
  }
  ```
  Then `npx shadcn@latest add @bklit/area-chart @bklit/bar-chart @bklit/pie-chart @bklit/ring-chart @bklit/funnel-chart`. Review generated files — if the CLI still requires `shadcn init` first, run it with `-y --base-color neutral` and **git-diff after** to confirm no existing `src/components/ui/*` files were overwritten; restore any that were. Verify installed chart deps (expect `recharts`) land in `package.json`.
- **Mirror**: Bklit install docs (registry namespace `@bklit`, `npx shadcn@latest add @bklit/<chart>`).
- **Validate**: `npm run build` — charts compile under Next 16/React 19; fix any recharts version pinning issues in `package.json`.

### Task 9: Analytics page — Bklit charts

- **File**: `src/components/admin/AnalyticsCharts.tsx`
- **Action**: CREATE
- **Implement**: One client component per chart, sourced from the Bklit chart files under `src/components/ui/`:
  - `DailyViewsAreaChart({ data })` — AreaChart, x = date, y = views/visitors.
  - `TopPagesBarChart({ data })` — BarChart, x = path, y = views.
  - `DevicePieChart({ data })` — PieChart, device type counts.
  - `ReferrersRingChart({ data })` — RingChart, referrer host counts.
  - `ConversionFunnelChart({ data })` — FunnelChart, funnel steps.
- **Mirror**: installed Bklit chart component APIs under `src/components/ui/` (props/data shape comes from the downloaded source).
- **Validate**: `npx tsc --noEmit`.

- **File**: `src/components/admin/AnalyticsClient.tsx`
- **Action**: UPDATE
- **Implement**: Update the `AnalyticsData` interface to `{ operational, traffic, conversions }`. Keep header + Refresh button + `/api/admin/analytics` fetch. Add two sections above the existing operational grid:
  - Traffic section: stat cards (total views, unique visitors, today, avg daily) + `DailyViewsAreaChart` + `TopPagesBarChart` + `DevicePieChart` + `ReferrersRingChart`. Empty state: "No traffic yet — visit the public site to start collecting data."
  - Conversions section: `ConversionFunnelChart` + event count rows. Labels map: `event_registered` → "Event registrations", `donation_completed` → "Donations", `program_applied` → "Program applications", `contact_submitted` → "Contact forms", `member_joined` → "Members", `volunteer_submitted` → "Volunteers", `partner_submitted` → "Partnerships".
  - Existing operational stat cards + `BarRow` sections unchanged (bottom of page).
- **Mirror**: `src/components/admin/AnalyticsClient.tsx:34-176` (refresh + stat cards + BarRow), `src/components/admin/AnalyticsCharts.tsx`.
- **Validate**: `npx tsc --noEmit && npm run lint`.

### Task 10: Tests

- **Files**: `src/__tests__/TrackView.test.tsx`, `src/__tests__/track-api.test.ts`, `src/__tests__/analytics-actions.test.ts`
- **Action**: CREATE
- **Implement**:
  - `TrackView`: mock `next/navigation` `usePathname` + global `fetch`; assert `/admin` path fires no request; public path fires POST with path + utm fields; 500ms timer (use fake timers).
  - `track-api` + `track-event`: mock `next/headers` `cookies()` and `db`; POST valid/invalid bodies; assert INSERT SQL shape, 400 on bad input, Set-Cookie header.
  - `analytics-actions`: mock `@/lib/db`; assert `getTrafficOverview`/`getConversionFunnels` return computed shapes and swallow DB errors.
- **Mirror**: `src/__tests__/mocks` (Next.js mocks), `src/__tests__/setup.tsx`, `src/__tests__/AdminLayout.test.tsx` patterns.
- **Validate**: `npx vitest run src/__tests__/TrackView.test.tsx src/__tests__/track-api.test.ts src/__tests__/analytics-actions.test.ts --reporter=verbose`.

---

## Risks

| Risk | Mitigation |
|------|------------|
| `page_views` table missing today → existing queries silently return 0 | Migration Task 1 is first; queries already swallow errors so no crash window |
| `npx shadcn init` overwrites hand-written `src/components/ui/*` | Manual `components.json` first; git-diff after any CLI run; restore conflicts |
| Bklit charts pull `recharts` — React 19 / Next 16 compat | Pin compatible recharts version in Task 8; `npm run build` gate |
| Double-counting conversions (client beacon + server `recordEvent`) | Server-side `recordEvent` is the source of truth; client `trackEvent` used only where no server action exists |
| `/api/track` breaks existing column list | Task 3 keeps original 5 columns untouched, only adds optional columns |
| Page size grows from `analytics_events` over years | Add monthly cleanup note in plan review; indexes keep query cost low; revisit after data volume is known |

---

## Validation

```bash
npx tsc --noEmit && npm run lint && npm test
npm run build   # ~3.5 min; confirms Bklit/recharts compile under Next 16
```

Manual: run migration against Neon, visit a public page twice, confirm rows appear in `page_views`; complete a donation/registration and confirm `analytics_events` row; check `/admin/analytics` renders traffic + conversion Bklit charts; refresh button updates data.

---

## Acceptance Criteria

- [ ] Migration `015` creates `page_views` + `analytics_events`; seed.sql matches
- [ ] `/api/track` persists UTM + device + browser; `TrackView` sends them
- [ ] `trackEvent` client helper + `/api/track-event` route + `recordEvent` server helper work
- [ ] Conversion events fire from donations, events, programs, and workflow forms
- [ ] Traffic + conversion queries return correct shapes with range support
- [ ] Bklit chart components installed via `@bklit` registry; no existing `src/components/ui/*` files overwritten
- [ ] Admin Analytics page shows traffic + conversion sections with Bklit charts; operational metrics unchanged
- [ ] Type check, lint, and tests pass
- [ ] Follows existing patterns (actions, migrations, admin UI, tests)
