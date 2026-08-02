# BMAC-5: Add Paystack Payment Persistence Baseline

Status: Complete · Date: 2026-08-02 · Branch: `test` (bmac-next) · Commit `53bb4da`

## Summary

Hardened the Paystack webhook persistence, linked checkout metadata to events, added
a read-only admin payments view, and fixed the admin-delete notification bug (folded
into this plan per user request).

## Changes

- `src/app/api/webhooks/paystack/route.ts` — payment + activity log ids now use `crypto.randomUUID()` (`pay-${Date.now()}` collision removed); signature compare switched to `crypto.timingSafeEqual` (still 401 on mismatch); dedup + `charge.success`-only branch retained.
- `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` — Paystack popup metadata now sends `source_type: "event_registration"`, `source_id: event.id`, `payer_name` so webhook no longer stores `"unknown"`/`""`.
- `src/app/admin/(admin)/payments/page.tsx` (new) + `src/components/admin/PaymentsTable.tsx` (new) — read-only table: reference, source, amount (kobo→naira), currency, payer email, status badge, timestamp; search + empty state; mirrors ActivityLogTable/EventTable patterns.
- `src/components/admin/AdminLayout.tsx` — `Payments` nav item in System group + `routePermissions["/admin/payments"] = "manage_users"`; `/admin/payments` already covered by `proxy.ts`.
- `src/actions/admin-users.ts` — `deleteAdminUser` now notifies **all remaining admin_users** (super + moderator) on any delete, excluding deleted target and actor. Previously only super_admin targets were notified, and only to other super admins; moderator deletes emailed nobody. Self-delete alert and last-super-admin guard retained. Backend `/send` already supported `admin-deleted` (`server.js:641`).
- `src/__tests__/PaystackWebhook.test.tsx` — assert id format + source metadata persisted; new test for `"unknown"`/`""` fallback when metadata lacks source fields. Suite 5→6 tests.

## Validation

- `npm test` — 22/22 pass (4 files).
- `npm run build` — passes; `/admin/payments` route generated.
- `npm run lint` — my files introduce no new lint categories; remaining `no-explicit-any`/`set-state-in-effect` errors mirror the existing repo-wide table pattern (ActivityLogTable/EventTable) and pre-existing AdminLayout lines.

## Deviations

- Admin-delete notification bug folded into this plan per user request (originally a separate finding).
- No DB migration — `paystack_payments` table already existed (`scripts/seed.sql:1-14`).
- Webhook idempotency + 401 behavior pre-existed; only hardened (Task 1).
