# BMAC-6: Public and Admin Mobile QA Fixes

Status: Complete · Date: 2026-08-02 · Branch: `test` (bmac-next)

## Summary

Horizontal-overflow guardrails for the whole app (public + admin), plus targeted
375px fixes: admin tables/forms/save-bars, toast positioning, mobile back links,
and scroll-lock hardening. Verified headless-Chromium at 375px on all 11 public
routes; admin pages verified via code review only (session auth blocks headless
browser access).

## Changes

- `src/app/globals.css` — `html`/`body` `overflow-x: clip` (page-wide guard; `clip`
  instead of `hidden` so the `lg:sticky` booking card and admin sticky save bars
  keep working — `hidden` would turn body into a scroll container and break
  sticky). Also `.prose` hard-break rules (`overflow-wrap: break-word` on
  p/li/a/h1-h6) + `.prose pre { overflow-x: auto }`.
- `src/app/layout.tsx` — explicit `export const viewport: Viewport = { width:
  "device-width", initialScale: 1 }` (removes implicit-MVP dependence).
- `NewsDetailClient.tsx` — markdown wrapper `overflow-x-auto`; added `lg:hidden`
  mobile back link (mirrors the existing `hidden lg:inline-flex` one).
- `EventDetailClient.tsx` — markdown wrapper `overflow-x-auto`.
- `ProgramDetailClient.tsx` — added `lg:hidden` mobile back link.
- `src/lib/scroll-lock.ts` (new) — counter-based `lockScroll()`/`unlockScroll()`.
  Replaces direct `document.body.style.overflow` writes in `Navbar.tsx`
  (`toggleMenu`) and `Modal.tsx` (useEffect), which used `"unset"` and could
  clobber a nested scroll-lock.
- `EventsClient.tsx` — list section `overflow-x-clip`; venue line
  `truncate sm:max-w-[160px]`.
- `PartnerTable.tsx` — card `overflow-hidden` → `overflow-x-auto`; `sm:hidden`
  URL subtitle row under partner name on mobile.
- `GalleryForm.tsx` / `StatsForm.tsx` / `TeamForm.tsx` / `TestimonialForm.tsx` —
  save-button row `flex-wrap` → `flex-nowrap overflow-x-auto` (single-row mobile
  bar, matches EventsForm/GalleryConfigForm pattern).
- `src/components/ui/Toast.tsx` — container `bottom-6 right-6 max-w-sm w-full` →
  `bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm sm:w-auto`
  (toast no longer pinned off-screen / edge-trimmed at 375px).

## Validation

- `npm run build` — passes (0 errors).
- `npm test` — 25/25 across 5 files (incl. new `src/__tests__/scroll-lock.test.ts`:
  lock/unlock, nested stacking, no negative counter).
- `npm run lint` (changed files) — only pre-existing repo-wide categories
  (`no-explicit-any`, unescaped entities, unused vars); scroll-lock.ts, layout,
  Navbar, Modal, Toast lint-clean.
- Headless Chromium 375×812, all 11 public routes (before/after screenshots in
  `.agents/reports/bmac-6-mobile-qa/`):
  - Seed content: no horizontal overflow on any route (post-fix and pre-fix alike).
  - Stress probe (900px-wide element injected into news-detail):
    - PRE-fix (simulated `overflow-x: visible`): wheel-horizontal scroll works,
      scrollX 0 → 300 — overflow reachable by user.
    - POST-fix (`overflow-x: clip`): wheel-horizontal scroll blocked, scrollX
      stays 0, no scrollbar rendered. Contained.
  - Note: `documentElement.scrollWidth` still reports injected content width even
    when `clip` hides it — scrollWidth alone is a false-positive metric; the
    wheel/scrollbar checks are the user-relevant ones.

## Deviations

- Admin pages not browser-verified (session auth); verified by build, lint, and
  code review of each change.
- `overflow-x: clip` used instead of the plan's `overflow-x: hidden` wording for
  sticky preservation (public booking card + admin save bars).
- Dev-server route first-compile can detach the navigation frame in headless
  Chromium; rerun of the probe on the warm route succeeds (no code impact).
