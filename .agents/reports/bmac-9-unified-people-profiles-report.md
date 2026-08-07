# Implementation Report

**Plan**: `.agents/plans/bmac-9-unified-people-profiles.plan.md`
**Branch**: `test`
**Status**: COMPLETE

## Summary

Implemented the unified people profile data model (BMAC-9): a `people` + `person_records` schema on Neon, a `people` action module linking all touchpoints (free/paid event registration, donations, membership/volunteer/partner/school applications, contact messages, newsletter), an admin People area with search, role badges, detail view, and CSV export. Also discovered and fixed a pre-existing production defect where the `paystack_payments` table was never created in the database, silently breaking the payment pipeline.

## Tasks Completed

| # | Task | File | Status |
|---|------|------|--------|
| 1 | Schema migration (`people` + `person_records` + indexes) | Neon `br-cold-heart-apcgi6sy` | ✅ |
| 2 | Types (Person, PersonRecord, PersonRole, PersonRecordKind, PersonRow) | `src/types/cms.ts` | ✅ |
| 3 | People action module | `src/actions/people.ts` | ✅ |
| 4 | Paystack webhook → person link | `src/app/api/webhooks/paystack/route.ts` | ✅ |
| 5 | Free event registration persistence | `.../events/[id]/EventDetailClient.tsx` | ✅ |
| 6 | Get-involved forms (join/volunteer/partner/school/donate) | `src/app/(public_pages)/get-involved/page.tsx` | ✅ |
| 7 | Contact form persistence | `src/app/(public_pages)/contact/actions.ts` | ✅ |
| 8 | Newsletter → person | `src/actions/newsletter.ts` | ✅ |
| 9 | Admin People area (nav, list, detail, export) | `src/components/admin/*`, `src/app/admin/(admin)/people/*` | ✅ |
| 10 | Backfill + tests | `src/__tests__/people.test.ts`, `src/__tests__/PaystackWebhook.test.tsx` | ✅ |

## Validation Results

| Check | Result |
|-------|--------|
| Type check (`pnpm run build`) | ✅ |
| Lint (changed/new files) | ✅ |
| Tests (`pnpm test`) | ✅ 59 passed (11 files) |
| E2E smoke (browser → server actions → production Neon) | ✅ free event registration, get-involved join, contact form all persisted real rows |

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `src/actions/people.ts` | CREATE | +314 |
| `src/__tests__/people.test.ts` | CREATE | +151 |
| `src/components/admin/PeopleTable.tsx` | CREATE | +140 |
| `src/components/admin/PersonDetail.tsx` | CREATE | +123 |
| `src/app/admin/(admin)/people/page.tsx` | CREATE | +9 |
| `src/app/admin/(admin)/people/[id]/page.tsx` | CREATE | +19 |
| `src/types/cms.ts` | UPDATE | +44 |
| `src/app/api/webhooks/paystack/route.ts` | UPDATE | +19 |
| `src/app/(public_pages)/get-involved/page.tsx` | UPDATE | +102/-8 |
| `src/__tests__/PaystackWebhook.test.tsx` | UPDATE | +70/-4 |
| `.../events/[id]/EventDetailClient.tsx` | UPDATE | +25/-3 |
| `src/app/(public_pages)/contact/actions.ts` | UPDATE | +14 |
| `src/components/admin/AdminLayout.tsx` | UPDATE | +2 |
| `src/actions/newsletter.ts` | UPDATE | +2 |

## Deviations from Plan

1. **Missing `paystack_payments` table (pre-existing bug)**: the table DDL existed only in `scripts/seed.sql:1-14` and was never applied to the production DB — the webhook's payment insert silently failed, so paid registrations/donations never persisted. Added a second migration creating the table on `br-cold-heart-apcgi6sy`. The payment table was empty, so the Task 10 backfill was a no-op. The `people` + `person_records` schema was also missing from the repo's schema source of truth — added both tables + indexes to `scripts/seed.sql` (mirrors the live schema; validated idempotent on prod) so a fresh reseed produces a working schema.
2. **`ON CONFLICT` vs partial unique index**: the plan's `ON CONFLICT ((lower(email)))` insert cannot work — Postgres can't infer the unique index because it is partial (`WHERE email <> ''`). `findOrCreatePerson` now inserts in a try/catch and re-selects (race-safe without `ON CONFLICT`).
3. **Webhook person linking guarded**: `findOrCreatePerson` is only called when a payer email exists, preventing junk empty person rows from email-less payments.

## Tests Written

| Test File | Test Cases |
|-----------|------------|
| `src/__tests__/people.test.ts` | findOrCreatePerson create (lowercased email)/existing/phone fallback; ensurePersonRoles idempotent + union; getPeople permission guard; getPerson newest-first + admin flag + not-found; exportPeople permission + fields |
| `src/__tests__/PaystackWebhook.test.tsx` | person+role+record link on charge.success; skip person link when no customer email |
