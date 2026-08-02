# Implementation Report

**Plan**: `.agents/plans/bmac-7-regression-test-coverage.plan.md`
**Branch**: `test`
**Status**: COMPLETE

## Summary

Hardened the Vitest suite for Phase-1 stabilization: locked the `pool: "forks"` requirement (Node 24) with a regression test; added first-admin and unauthorized admin coverage via mocked auth helpers (AdminLayout Access-Denied, LoginForm first-admin link, `registerFirstAdminAction`, setup-page gate); extended the Paystack webhook suite with missing-secret, malformed-JSON, DB-error, and currency/`verified_at` defaults; eliminated all DOM warnings by tightening the `next/image` and `framer-motion` mocks (5 warnings → 0). No runtime code changed.

## Tasks Completed

| # | Task | File | Status |
|---|------|------|--------|
| 1 | Lock `pool: "forks"` + Node ≥ 24 regression | `src/__tests__/vitest-setup.test.ts` | ✅ |
| 2 | AdminLayout Access Denied + permitted states | `src/__tests__/AdminLayout.test.tsx` | ✅ |
| 3 | LoginForm first-admin link + login flow | `src/__tests__/LoginForm.test.tsx` | ✅ |
| 4 | `registerFirstAdminAction` success/error | `src/__tests__/admin-auth.test.ts` | ✅ |
| 5 | Setup-page gate (redirect + form) | `src/__tests__/SetupPage.test.tsx` | ✅ |
| 6 | Paystack webhook edge coverage (4 new) | `src/__tests__/PaystackWebhook.test.tsx` | ✅ |
| 7 | Reduce avoidable DOM warnings | `src/__tests__/mocks.tsx` | ✅ |

## Validation Results

| Check | Result |
|-------|--------|
| Tests (`npm test`) | ✅ 41 passed (was 25) |
| Build (`npm run build`) | ✅ compiled in 42s |
| DOM warnings | ✅ 5 → 0 (HomeClient `fill`/`priority`/`while*`) |
| Lint (`npx eslint src/__tests__/`) | ⚠️ 18 pre-existing `no-explicit-any` (baseline 23) |

### Lint note

`src/__tests__` fails `@typescript-eslint/no-explicit-any` at HEAD (23 errors across `HomeClient`, `AdminLayout`, `PaystackWebhook`, `mocks`); the whole repo has 238 such errors. The `(...args: any[])` / `({ children }: any)` pattern is the established convention in every test file and is required for JSX-prop spreading in the shared mocks. New code avoided adding new error *categories* (non-JSX mocks use `unknown[]`; unused-var and display-name issues introduced by the Task-7 mock rewrite were fixed). No new warnings. Full lint cleanup of pre-existing test files is out of scope.

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `src/__tests__/vitest-setup.test.ts` | CREATE | +15 |
| `src/__tests__/LoginForm.test.tsx` | CREATE | +62 |
| `src/__tests__/admin-auth.test.ts` | CREATE | +53 |
| `src/__tests__/SetupPage.test.tsx` | CREATE | +37 |
| `src/__tests__/AdminLayout.test.tsx` | UPDATE | +27 |
| `src/__tests__/PaystackWebhook.test.tsx` | UPDATE | +71/-3 |
| `src/__tests__/mocks.tsx` | UPDATE | +56/-12 |

## Deviations from Plan

- **`setup.tsx` polyfills skipped**: the before-measurement log showed no `matchMedia`/`ResizeObserver`/`scrollTo` warnings, so the conditional polyfills in Task 7.2 were not added (plan said "only if needed").
- **`framer-motion` mock**: extended beyond reported tags (added button/img/a/ul/li/circle/g/path/rect/text) and all motion tags now strip motion-only props (`while*`, `animate`, `transition`, etc.) — this is what removed the `whileInView`/`whileHover`/`whileTap` warnings.
- **`next/image` mock**: `fill`/`priority` now stripped from the DOM (`void`ed) instead of spreading, removing the non-boolean-attribute warnings.
- **LoginForm success test (Task 3.4)**: implemented via `mockUseRouter` export added to `mocks.tsx`.
- **Malformed-JSON test**: `postWebhook` refactored to accept a raw body (`postRaw` helper) so a literal invalid body can be signed and posted.

## Tests Written

| Test File | Test Cases |
|-----------|------------|
| `vitest-setup.test.ts` | uses `pool: "forks"`; Node ≥ 24 |
| `AdminLayout.test.tsx` | denied route renders Access Denied; permitted route renders children |
| `LoginForm.test.tsx` | first-admin link when no admins; hidden when admins exist; submit shows error + calls `loginAdmin`; success pushes `/admin` |
| `admin-auth.test.ts` | first-admin registers + starts session + logs; error passthrough, no session |
| `SetupPage.test.tsx` | redirects to login when admins exist; renders form when none |
| `PaystackWebhook.test.tsx` | 401 when secret unset; rejects malformed JSON; rejects on dedup DB error; defaults currency to NGN + stamps `verified_at` |

**Suite**: 9 files, 41 tests passing (25 baseline + 16 new).
