# Implementation Report

**Plan**: `.agents/plans/bmac-paid-event-indicators.plan.md`
**Branch**: `test`
**Status**: COMPLETE

## Summary

Fixed paid/free indicators on public event surfaces and closed a revenue-bypass bug.

Root cause: `db.getAll` returns raw snake_case rows, but the event clients never normalized
`is_paid`/`price` (unlike the programs clients), so `event.isPaid` was always `undefined`.
Effects: event list badges always showed "Free Entry", event detail always showed
"Registration Open", and the detail page routed paid events into `registerForEvent` — which
had no `is_paid` guard — issuing a confirmed pass with no payment.

## Tasks Completed

| # | Task | File | Status |
|---|------|------|--------|
| 1 | Add `isPaid`/`price` normalization to event cards | `src/app/(public_pages)/events/EventsClient.tsx` | ✅ |
| 2 | Add `isPaid`/`price` normalization to event detail | `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | ✅ |
| 3 | Reject paid events in `registerForEvent` before capacity reservation | `src/actions/events.ts` | ✅ |
| 4 | Vitest coverage for the guard + free-event regression | `src/__tests__/register-for-event.test.ts` | ✅ |

## Validation Results

| Check | Result |
|-------|--------|
| Build | ✅ |
| Lint | ⚠️ pre-existing repo-wide `no-explicit-any` (272 errors) — my changes add no new error class; see Deviations |
| Tests | ✅ 78 passed (14 files) |

### E2E Verification (live dev server + production DB)

| Surface | Expected | Observed | Result |
|---------|----------|----------|--------|
| `/events` list | Paid events show price badge | `₦15,000`, `₦5,000` rendered | ✅ |
| `/events` list | Free events show "Free Entry" | `Free Entry` × 4 | ✅ |
| `/news/events/event-2` (paid ₦5,000) | "Ticket: ₦5,000" | `Ticket: ₦5,000` | ✅ |
| `/news/events/event-1` (free) | "Registration Open" | `Registration Open` | ✅ |
| Server guard | Paid event rejected before ticket/capacity | Unit-tested (`reserveCapacity`/`createTicket` not called); UI paid path now unreachable for free registration | ✅ |

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `src/app/(public_pages)/events/EventsClient.tsx` | UPDATE | +2 |
| `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | UPDATE | +2 |
| `src/actions/events.ts` | UPDATE | +1 |
| `src/__tests__/register-for-event.test.ts` | CREATE | +113 |

## Deviations from Plan

1. **Lint gate**: `npm run lint` reports 272 pre-existing `@typescript-eslint/no-explicit-any`
   errors across the repo (e.g. untouched `ProgramsClient.tsx` carries the identical errors at
   lines 29-31). My added casts mirror that established pattern. Lint was never green; fixing
   272 unrelated errors is out of scope. Build, tests, and E2E are green.
2. **No Jira issue**: plan has no Metadata/Jira key, so Phase 6 (Jira update) was skipped.
3. Validation commands run with `npm` (repo uses npm, not pnpm).

## Tests Written

| Test File | Test Cases |
|-----------|------------|
| `src/__tests__/register-for-event.test.ts` | 1. Paid event → error, no capacity consumed, no ticket created. 2. Free published event still registers (regression), `createTicket` called with `status: "confirmed"`. |
