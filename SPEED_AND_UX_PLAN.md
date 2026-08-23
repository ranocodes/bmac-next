# SPEED_AND_UX_PLAN — Performance & Loading-UX Optimization

> Status: PLAN ONLY. No code changed yet. Execute top-down after approval.
> Scope: bmac-next (Next.js 16 App Router, React 19, Tailwind v4, Neon Postgres, Vercel).

---

## Phase 1 — Research & Best Practices

### Principles applied throughout this plan

| Principle | Rule of thumb | Application here |
|---|---|---|
| Response budget | <100ms: no indicator needed. 100ms–1s: inline indicator. >1s or page-level: skeleton matching final layout. | Drives every spinner replacement below |
| Skeletons over spinners | Spinners say "wait, unknown duration" (anxiety); skeletons say "content is arriving *here*" and pre-allocate space → zero CLS | All route-level `loading.tsx`, pass card, donor lookup |
| Optimistic UI for mutations | Apply the change instantly, roll back on failure. Best for high-success-rate actions | Newsletter subscribe, admin category rename/delete, check-in |
| Keep buttons honest | Submit buttons keep a small inline progress state + disabled guard; never remove feedback from payment actions (donations/tickets must NOT be optimistic — money) | Donate, ticket purchase, auth forms |
| CLS discipline | Reserve exact dimensions before data arrives (`aspect-*`, fixed heights, `min-h`); `next/image` with width/height everywhere; no content popping in above the fold | Pass card skeleton, event detail, all skeletons |
| Cognitive load | One status per region; no full-page overlays for local actions; preserve scroll position during loads | Replace UnsubscribeClient full-screen spinner, event purchase overlay |
| Streaming instead of blocking | `Suspense` boundaries let shell paint immediately, slow sections stream in | Public layout DB query, homepage stats |

---

## Phase 2 — Codebase Audit

### A. Performance bottlenecks (specific)

| # | Finding | Files | Impact |
|---|---|---|---|
| P1 | **`force-dynamic` on the entire public tree** — layout runs a `site_settings` query and each page re-queries DB on EVERY request. Zero static/ISR caching anywhere. TTFB = 1–2 Neon HTTP round-trips before first byte. Biggest LCP lever. | `src/app/(public_pages)/layout.tsx`, `src/app/(public_pages)/page.tsx`, `events/[slug]/page.tsx`, `news/[slug]/page.tsx`, `get-involved/[id]/page.tsx` | High |
| P2 | **Paystack inline.js loaded globally in `<head>`** on every page for every visitor (auth pages, gallery, news…). Only donate + ticket flows need it. `src/lib/paystack.ts` already lazy-loads it dynamically — the script tag is pure dead weight (~50KB + DNS/TLS to paystack.co). | `src/app/layout.tsx:20` | High |
| P3 | **No Suspense/streaming**: slow DB section blocks whole HTML response. Shell can't paint until all queries resolve. | same files as P1 | High |
| P4 | **Whole-page spinners as route UX**: `(public_pages)/loading.tsx` shows a centered spinner on every server-slow navigation → jarring blank→spinner→content swap, full CLS. Admin has 4 more. | `loading.tsx` ×5 | Medium-High |
| P5 | **react-markdown parsed client-side** on events + news detail (markdown lib ships to browser, parses at render time). Content is static per article — parse server-side instead. | `EventDetailClient.tsx`, `NewsDetailClient.tsx` | Medium |
| P6 | **Raw `<img>` without dimensions** on public pass page + shared UI components → CLS risk; bypasses AVIF/WebP optimizer. Admin tables low priority. | `pass/[token]/PassClient.tsx`, `cases-with-infinite-scroll.tsx`, `circular-testimonials.tsx`, `ImagePicker.tsx` | Medium |
| P7 | **framer-motion in 21 client files** + `FadeIn` wrapper on nearly every section. Already mitigated by `optimizePackageImports`; motion still hydrates on content that could animate via CSS. Long-term only. | site-wide | Low-Med |
| P8 | **Dead dependency `embla-carousel-react`** — zero imports found. Ships nothing but adds install weight; remove for hygiene. Also `react-icons` + `lucide-react` double icon libs (`react-icons` used only by `iconMapper.ts`). | `package.json`, `src/lib/iconMapper.ts` | Low |
| P9 | **sitemap.ts force-dynamic** → DB queries on every crawler hit. Fine, but should cache ~1h. | `src/app/sitemap.ts` | Low |

Non-findings (already good): fonts via `next/font` ✓, image formats avif/webp ✓, TrackView deferred+keepalive ✓, EventsClient receives SSR initialEvents (no client waterfall) ✓.

### B. Spinner inventory (complete)

Route-level:
1. `src/app/(public_pages)/loading.tsx` — centered border spinner
2. `src/app/admin/(admin)/loading.tsx`
3. `src/app/admin/(admin)/programs/loading.tsx`
4. `src/app/admin/(admin)/events/loading.tsx`
5. `src/app/admin/(admin)/settings/loading.tsx`

Public button/inline spinners:
6. `NewsletterModal.tsx:81` — Loader2 "Subscribing..."
7. `NewsDetailClient.tsx:240` — Loader2 newsletter submit
8. `DonorLookupClient.tsx:78` — Loader2 "Searching..."
9. `InvolvementDetailClient.tsx:444` — Loader2 donate submit
10. `EventDetailClient.tsx:535` — overlay spinner, ticket flow
11. `PassClient.tsx:156` — full-card spinner while pass renders
12. `UnsubscribeClient.tsx:70` — full-screen size-32 spinner
13. Auth form pattern ×7 (identical code): `login/LoginForm.tsx:76`, `forgot-password/ForgotPasswordClient.tsx:78`, public `reset-password/[token]/page.tsx:88`, admin `(public)/forgot-password:78`, admin `(public)/reset-password:88`, `CreateAdminForm.tsx:207`, `SetupForm.tsx:105`, plus `account/password/PasswordChangeForm.tsx:77`

Admin button/refresh spinners:
14. `CategoriesManager.tsx:93,113,175` — busy row spinners
15. `NewsletterClient.tsx:348,462` — add-subscriber / send-test
16. `CheckInClient.tsx:211` — check-in action
17. `DashboardClient.tsx:110`, `AnalyticsClient.tsx:128` — RefreshCw rotate while refreshing

---

## Phase 3 — Actionable Plan (ordered, low-risk first)

Each task ships independently; app stays green between tasks. Validate every task: `npx tsc --noEmit && npm test && npm run build`.

### Task 0 — Baseline (no risk)
Run Lighthouse/PageSpeed on prod home, /events, /events/[slug], /pass demo. Record LCP/TBT/CLS numbers into this file so improvements are measurable.

### Sprint A — Quick wins (pure removals, zero behavior change)

**Task A1: Remove global Paystack script.**
Delete `<script src=...paystack...>` from `layout.tsx`. `loadPaystack()` already injects it on demand where needed.
Verify: donate flow + ticket purchase still open Paystack iframe locally.

**Task A2: Delete dead dep.**
`npm uninstall embla-carousel-react`. Grep confirms zero usage.

**Task A3: sitemap cache.**
`sitemap.ts`: replace `force-dynamic` with `export const revalidate = 3600`.

### Sprint B — Route-level loading UX (skeletons)

**Task B4: Shared skeleton primitives.**
CREATE `src/components/ui/Skeleton.tsx`: `<Skeleton className>` base shimmer block + small composable parts (SkeletonCard, SkeletonRow, SkeletonText). Pure CSS animation (Tailwind `animate-pulse`), zero deps.

**Task B5: Public loading.tsx → layout-matching skeleton.**
Replace spinner with header-bar + grid-of-cards skeleton approximating real page shells (fixed min-heights → no CLS). Same treatment for the 4 admin loading.tsx using table-row skeletons.

**Task B6: Suspense boundary on public layout settings query.**
Move `site_settings` fetch into an async `SiteChrome` component wrapped in `<Suspense fallback={<StaticNavFallback/>}>` inside `(public_pages)/layout.tsx`. Nav renders instantly from static fallback (correct default links), swaps when settings land. Removes DB query from TTFB-critical path of EVERY public page.
Risk note: Navbar props become async-loaded; ensure no hydration mismatch (fallback and resolved markup differ → use `suppressHydrationWarning` or key the swap; test nav click-through).

**Task B7: Homepage ISR.**
`(public_pages)/page.tsx`: drop `force-dynamic`, add `export const revalidate = 60` (stats/programs are CMS-edited rarely; 60s staleness acceptable). Homepage becomes statically served → TTFB collapses.
Follow-up (same task): wrap `LiveImpactStats` counts in `unstable_cache` tag `impact-stats`.

**Task B8: ISR for detail pages.**
Same pattern for `get-involved/[id]`, `news/[slug]`, `programs/[id]` (+`revalidate = 300`). Events `[slug]` keeps dynamic BUT add `revalidate = 30` if registration state allows (verify capacity checks aren't stale-sensitive → if they are, leave dynamic and rely on B6/B7 wins). Add `revalidatePath` calls in the corresponding admin update actions so edits appear immediately.

### Sprint C — Spinner replacements (per-context judgment)

**Task C9: Auth forms → shared SubmitButton (dedupe ×8).**
CREATE `src/components/ui/SubmitButton.tsx`: props `{pending, label, pendingLabel}` rendering solid button with tiny 14px inline spinner + label ("Signing in…"). REPLACE the copy-pasted border-spinner span in all 8 auth/password forms. One component, consistent UX, −~70 lines.

**Task C10: Newsletter subscribe → optimistic.**
`NewsletterModal` + `NewsDetailClient` newsletter form: on submit, immediately flip button to "Subscribed ✓" pastel-green state + close modal after toast; revert to error state only on API failure. Success rate is ~99% (valid email enforced client-side) → optimism justified.

**Task C11: Donor lookup → results skeleton.**
`DonorLookupClient`: replace "Searching…" spinner with 3 `SkeletonRow`s appearing under the form (matches receipt-card layout height). Keeps context, no jump.

**Task C12: Donate button (keep spinner, restyle).**
Money flow — NO optimistic UI. Keep disabled + inline 14px spinner inside button ("Processing…" replaces arrow). Already closest to target pattern; minor restyle only.

**Task C13: Ticket purchase → staged progress copy.**
`EventDetailClient` purchase overlay: replace bare spinner with step indicator ("Reserving seat… → Confirming payment…") tied to existing flow states. Still blocking (money), but communicates progression instead of indeterminate wait.

**Task C14: Unsubscribe → state machine, no spinner.**
`UnsubscribeClient`: initial state renders informative card ("Confirming your unsubscribe…"), then success/error card. Spinner removed entirely.

**Task C15: Pass page → pass-shaped skeleton.**
`PassClient`: while QR/token resolves show skeleton with exact pass-card dimensions (fixed aspect ratio container → zero CLS), fade real card in.

**Task C16: Admin mutations → row-level pending + optimistic.**
- `CategoriesManager`: optimistic rename/delete (row dims + strikethrough on delete), revert on error w/ toast.
- `NewsletterClient` add/test-send: keep tiny inline spinner (server-side send latency unknown, not worth optimism).
- `CheckInClient`: keep spinner in button but add success/failure result banner state (partially exists).
- `Dashboard`/`Analytics` RefreshCw rotation: KEEP — subtle icon rotation during refresh is already a modern inline indicator. Document as intentional.

**Task C17: Server-render markdown.**
`EventDetailClient` + `NewsDetailClient`: move `react-markdown` parsing into the server page component; pass rendered elements as children/dangerouslySetInnerHTML-sanitized prop. Removes ~40KB JS + parse time from two high-traffic page types. Verify rich-text output parity (rehype-raw plugins move server-side too).

**Task C18: Fix raw `<img>` on public surfaces.**
`PassClient` logo img → `next/image` with explicit width/height. `circular-testimonials` avatar imgs → next/image + sizes. Admin tables left as-is (internal tool, low value).

### Sprint D — SEO hardening (from diggity on-page checklist + audit)

Already solid: metadata template + OG/twitter cards ✓, `opengraph-image.tsx` ✓, robots.ts + sitemap ref ✓, canonical alternates on audited pages ✓, SchemaOrg component exists ✓, HTTPS+HSTS ✓.

**Task D19: Canonical sweep.**
Grep every public `page.tsx` for `alternates: { canonical }`; add missing ones (privacy, terms, account pages → noindex instead).

**Task D20: Schema depth.**
Verify `SchemaOrg` covers: Organization + LocalBusiness sitewide, `Event` schema (name/date/location/offers) on event detail, `Article` + author on news detail. Extend where missing (JSON-LD, head-positioned).

**Task D21: Alt-text sweep.**
Audit `alt=` on all public `next/image` usages (home, programs, gallery, news). Empty/decorative alts set `alt=""` deliberately; descriptive alts elsewhere. Admin ImagePicker: make alt field required-ish (helper text).

**Task D22: H1 audit.**
One H1 per page; get-involved redesign already compliant; spot-check remaining templates (page-hero h1 pattern exists in globals.css — confirm single instance per page).

**Task D23: Internal linking.**
Footer/nav already dense. Add contextual links: news articles → related programs/events (cheap win, 1 component edit).

### Explicitly out of scope (documented)
- Replacing framer-motion sitewide with CSS reveals (P7): high regression surface vs modest gain — revisit post-Sprint C if TBT still poor on mobile.
- Consolidating react-icons→lucide in iconMapper: touches CMS icon resolution; do only if bundle analysis shows meaningful weight.
- Admin table `<img>` migration.

---

## Execution order & validation

```
A1 → A2 → A3            (trivial, ship same day)
B4 → B5 → B6 → B7 → B8  (one PR per task or grouped A+B)
C9 → C10..C16           (grouped per area: public CTA / auth / admin)
C17 → C18
D19..D23                (any order, independent)
```

Every task: `npx tsc --noEmit && npm test && npm run build` green before commit. Conventional commits (`perf(...)`, `feat(ux)`, `fix(seo)`). Push to `production` → PR → merge → Vercel verify (per established flow).

## Acceptance criteria
- [ ] No global Paystack script; payments verified working
- [ ] No centered-spinners-only loading.tsx anywhere; skeletons match final layouts (no visible CLS on navigation)
- [ ] Public layout settings query off critical path; homepage served from ISR
- [ ] Every spinner from inventory table either replaced per mapping or documented as intentional (RefreshCw, donate processing)
- [ ] Event/news markdown rendered server-side
- [ ] SEO sweep tasks checked; schema validated in Rich Results Test
