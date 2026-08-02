# Plan: Complete Public and Admin Mobile QA Fixes (BMAC-6)

## Summary

Fix the mobile-specific layout defects found in a fresh 375px/768px audit of the
public and admin surfaces. The audit (this plan's Phase 2 EXPLORE) found the codebase
is largely fluid, but flagged systemic gaps: markdown-rendered content can overflow
horizontally, the navbar/scroll-lock can clobber modal state, one admin table
(Partners) clips its actions off-screen, sticky form save bars can stack two rows
tall on small phones, toasts clip at 375px, and there is no explicit viewport meta.
Each fix is small, pattern-conforming, and verified with browser screenshots
(before/after) per the Jira AC requiring documentation.

## User Story

As a mobile user (field staff, event attendee, or visitor on a phone)
I want public and admin pages to render without horizontal overflow and keep every
control reachable
So that BMAC works for field operations and public visitors on small screens.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX |
| Complexity | MEDIUM |
| Systems Affected | public pages, admin pages, globals.css, layout.tsx |
| Jira Issue | BMAC-6 |

---

## Patterns to Follow

### Naming / mobile table subtitle (re-present hidden cols under primary cell)
```
// SOURCE: src/components/admin/NewsTable.tsx:82
<p className="text-xs text-muted-foreground mt-0.5 sm:hidden">{a.date} · {a.category}</p>
```

### Touch targets / inputs
```
// SOURCE: src/components/admin/EventForm.tsx (inputs)
className="w-full min-h-[44px] ..."
```

### Single-row sticky save bar (reference that already fits 375px)
```
// SOURCE: src/components/admin/ProgramForm.tsx:117-129
<div className="sticky top-0 z-40 bg-background border-b -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 -mt-2">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
    ...buttons flex-1 ... max-w-[280px] sm:max-w-none
```

### Client component + framer motion (nav)
```
// SOURCE: src/components/Navbar.tsx:1,43-50,110-167
"use client"; ... const toggleMenu = (open: boolean) => { ... };
```

### Admin table wrapper (works elsewhere)
```
// SOURCE: src/components/admin/NewsTable.tsx:66
<div className="overflow-x-auto rounded-xl border border-border/50">
  <table className="w-full ...">
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/app/globals.css` | UPDATE | global `overflow-x: clip`, markdown overflow wrapping |
| `src/app/layout.tsx` | UPDATE | explicit `viewport` export |
| `src/lib/scroll-lock.ts` | CREATE | counter-based body scroll lock |
| `src/components/Navbar.tsx` | UPDATE | use scroll-lock util (fix `"unset"` clobber) |
| `src/components/Modal.tsx` | UPDATE | use scroll-lock util |
| `src/app/(public_pages)/news/[id]/NewsDetailClient.tsx` | UPDATE | markdown overflow wrapper + mobile back link |
| `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | UPDATE | markdown overflow wrapper |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | mobile back link |
| `src/app/(public_pages)/events/EventsClient.tsx` | UPDATE | section overflow + venue truncation |
| `src/components/admin/PartnerTable.tsx` | UPDATE | overflow-x-auto wrapper + mobile URL subtitle |
| `src/components/admin/GalleryForm.tsx` | UPDATE | compact sticky save bar |
| `src/components/admin/StatsForm.tsx` | UPDATE | compact sticky save bar |
| `src/components/admin/TeamForm.tsx` | UPDATE | compact sticky save bar |
| `src/components/admin/TestimonialForm.tsx` | UPDATE | compact sticky save bar |
| `src/components/admin/Toast.tsx` | UPDATE | full-width safe on mobile |
| `.agents/reports/bmac-6-mobile-qa/before/*.png` | CREATE | baseline evidence |
| `.agents/reports/bmac-6-mobile-qa/after/*.png` | CREATE | post-fix evidence |
| `.agents/reports/bmac-6-mobile-qa-report.md` | CREATE | before/after notes |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Baseline mobile screenshots (before)

- **File**: `.agents/reports/bmac-6-mobile-qa/before/*.png`
- **Action**: CREATE (artifacts)
- **Implement**: Load the `agent-browser` skill. Ensure dev server running (`npm run dev`, port 3000). At **375px** viewport capture: `/`, `/events`, `/news/events/{id}` (a live event), `/news/{id}` (a live article), `/contact`, `/admin` (dashboard), `/admin/partners`, `/admin/news`, one admin edit form (`/admin/news/{id}/edit`). Repeat key captures at **768px**. Save as `before/01-home-375.png` etc. If browser/skill unavailable, note it and proceed (text notes satisfy AC4).
- **Mirror**: `.claude/skills/agent-browser/SKILL.md`
- **Validate**: files exist in `before/`.

### Task 2: Global overflow guard + explicit viewport

- **File**: `src/app/globals.css`, `src/app/layout.tsx`
- **Action**: UPDATE
- **Implement**: In `globals.css` body block (L85-88) add `html, body { overflow-x: clip; }` — **use `clip`, not `hidden`** (hidden on body makes body a scroll container and breaks `lg:sticky lg:top-32` booking card + admin save-bar stickiness). In `src/app/layout.tsx` add `import type { Viewport } from "next"` and `export const viewport: Viewport = { width: "device-width", initialScale: 1 };`.
- **Validate**: `npm run build`; rendered `<meta name="viewport">` present.

### Task 3: Markdown overflow wrappers

- **File**: `src/app/(public_pages)/news/[id]/NewsDetailClient.tsx:126-133`, `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx:159-166`
- **Action**: UPDATE
- **Implement**: Wrap each `<ReactMarkdown>` in `<div className="overflow-x-auto">`. In `globals.css` add `.prose :where(p, li, a, h1, h2, h3, h4, h5, h6) { overflow-wrap: break-word; }` and `.prose pre { overflow-x: auto; }`. Prevents CMS tables, `<pre>`, and long unbroken URLs from pushing the page wide.
- **Validate**: `npm run build`; browser check a markdown-heavy article/event at 375px (Task 10).

### Task 4: Scroll-lock utility + Navbar/Modal refactor

- **File**: `src/lib/scroll-lock.ts` (CREATE), `src/components/Navbar.tsx:43-50`, `src/components/Modal.tsx:14-20`
- **Action**: CREATE + UPDATE
- **Implement**: `scroll-lock.ts` — module counter; `lockScroll()` increments + sets `document.body.style.overflow = "hidden"`; `unlockScroll()` decrements, sets `""` at zero. Refactor Navbar `toggleMenu` and Modal open/close to call these. Fixes the `"unset"` clobber where closing one overlay resets the other's lock.
- **Mirror**: `src/components/Navbar.tsx:43-50`, `src/components/Modal.tsx:14-20`
- **Validate**: `npm test` (existing suites) + `npm run build`.

### Task 5: Events list overflow + venue truncation

- **File**: `src/app/(public_pages)/events/EventsClient.tsx:64`, `:131`
- **Action**: UPDATE
- **Implement**: Add `overflow-hidden` (or `overflow-x-clip`) to the list `<section>` (L64) so the ghost date numeral (L75-77, `-left-3`) never bleeds. Change venue line 131 to `truncate sm:max-w-[160px]` (drop the mobile cap so venue names show fully on phones).
- **Validate**: `npm run build`.

### Task 6: PartnerTable overflow wrapper

- **File**: `src/components/admin/PartnerTable.tsx:93-94`
- **Action**: UPDATE
- **Implement**: Replace the card's `overflow-hidden` with `overflow-x-auto` around the `<table>` (matches NewsTable.tsx:66 pattern). Add `sm:hidden` mobile subtitle under the Partner cell showing URL/status, mirroring NewsTable.tsx:82, so hidden columns stay readable at 375px.
- **Mirror**: `src/components/admin/NewsTable.tsx:66,82`
- **Validate**: `npm run build`.

### Task 7: Compact sticky save bars to one row at 375px

- **File**: `src/components/admin/GalleryForm.tsx:68`, `src/components/admin/StatsForm.tsx:70`, `src/components/admin/TeamForm.tsx:59`, `src/components/admin/TestimonialForm.tsx:60`
- **Action**: UPDATE
- **Implement**: In each sticky save bar, force single-row on mobile: `flex-nowrap` on the button row, compact button styling at base (`px-3 py-2 text-sm`), `gap-2`, and `overflow-x-auto` on the row as a last-resort so actions never clip. Keep the `sticky top-0 z-40` full-bleed structure (`-mx-4 sm:-mx-6 px-4 sm:px-6`). Reference ProgramForm.tsx:117-129 which already fits.
- **Mirror**: `src/components/admin/ProgramForm.tsx:117-129`
- **Validate**: `npm run build`; Task 10 screenshot at 375px shows one-row bar.

### Task 8: Toast positioning at 375px

- **File**: `src/components/admin/Toast.tsx:84`
- **Action**: UPDATE
- **Implement**: Change `bottom-6 right-6 max-w-sm w-full` to `bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm sm:w-auto` so toasts span the viewport safely instead of clipping their left edge at 375px.
- **Validate**: `npm run build`.

### Task 9: Mobile back links on detail pages

- **File**: `src/app/(public_pages)/news/[id]/NewsDetailClient.tsx:91`, `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx:59`
- **Action**: UPDATE
- **Implement**: The current back control is `hidden lg:inline-flex`. Add a mobile variant (`lg:hidden`) above the hero on both pages so phone users get an in-page back affordance (browser-back is the only option today).
- **Validate**: `npm run build`.

### Task 10: After screenshots + report

- **File**: `.agents/reports/bmac-6-mobile-qa/after/*.png`, `.agents/reports/bmac-6-mobile-qa-report.md`
- **Action**: CREATE
- **Implement**: Repeat Task 1 captures at 375px/768px into `after/`. Write the report: per-fix before/after notes (or screenshots), page list, viewport widths tested, deviations. Confirm ACs: no horizontal overflow on public pages, admin tables/forms/sidenav usable, sticky controls don't block core actions.
- **Validate**: report exists; screenshots committed.

---

## Validation

```bash
npm run build
npm test
npm run lint   # expect only pre-existing repo-wide errors, none new
```

Browser QA (Tasks 1/10): agent-browser at 375px + 768px, pages per Task 1.

## Risks

| Risk | Mitigation |
|------|------------|
| `overflow-x: hidden` on body breaks sticky | Use `clip`, which doesn't create a scroll container |
| Markdown wrapper scrolls vertically | Wrapper height is auto — no vertical scrollbar; `overflow-x: auto` only |
| Browser/agent-browser unavailable for screenshots | AC4 allows "notes or screenshots"; record text notes instead |
| Dev server not running during implement | Start `npm run dev` in background (port 3000) before Task 1 |

---

## Acceptance Criteria

- [ ] Public pages at 375px: navigation, forms, content overflow-free horizontally
- [ ] Admin at 375px: tables (incl. Partners), forms, side nav usable; actions reachable
- [ ] Sticky save bars/headers never block core actions on mobile
- [ ] Critical fixes documented with before/after notes or screenshots
- [ ] All tasks completed, build + tests pass, follows existing patterns
