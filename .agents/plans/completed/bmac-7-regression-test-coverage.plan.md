# Plan: Add Stabilization Regression Test Coverage (BMAC-7)

## Summary

Harden the Vitest suite for the Phase-1 stabilization core: (1) lock the Vitest
`pool: "forks"` setting (required on Node 24) with a regression test, (2) cover
first-admin bootstrap and unauthorized admin states using mocked auth helpers,
(3) extend Paystack webhook coverage to the remaining valid/invalid/duplicate
edges, and (4) eliminate avoidable DOM warnings from UI tests by tightening mocks
and jsdom polyfills — without weakening any existing assertion.

## User Story

As a developer
I want regression tests for stabilized auth, forms, and payment behavior
So that foundational issues do not reappear.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | vitest config, `src/__tests__` (tests + mocks + setup), admin auth (actions/`AdminLayout`/`LoginForm`/setup page), Paystack webhook route |
| Jira Issue | BMAC-7 |

---

## Patterns to Follow

### DB mock (webhook)
```
// SOURCE: src/__tests__/PaystackWebhook.test.tsx:4-12
const mockQuery = vi.fn();
const mockCreate = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { query: (...a: any[]) => mockQuery(...a), create: (...a: any[]) => mockCreate(...a) },
}));
```

### Auth-client / server-action mocking (use for first-admin tests)
```
// SOURCE: src/__tests__/AdminLayout.test.tsx:6-18 (module-mock shape to mirror)
vi.mock("@/lib/auth/admin-context", () => ({ AdminProvider: ({ children }: any) => <>{children}</>, useAdmin: () => ({}) }));
vi.mock("@/actions/admin-auth", () => ({ logoutAdmin: vi.fn(() => Promise.resolve()) }));
```
New: `vi.mock("@/lib/auth/client", ...)`, `vi.mock("@/lib/auth/super-admin", ...)`, `vi.mock("@/actions/activity-logs", ...)` with the **full export surface** of each module (namespace import shape) so the imported action module binds real fns.

### Next/router mocks (shared)
```
// SOURCE: src/__tests__/mocks.tsx:17-23
const mockUsePathname = vi.fn().mockReturnValue("/");
vi.mock("next/navigation", () => ({
  usePathname: (...a: any[]) => mockUsePathname(...a),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
export { mockUsePathname };
```
Add `redirect: vi.fn()` to this mock for the setup-page gate test.

### Server-action test shape (env/assert style)
```
// SOURCE: src/__tests__/PaystackWebhook.test.tsx:17-33,54-95
signPayload / postWebhook helpers; beforeEach(() => vi.clearAllMocks());
expect(res.status).toBe(200); expect(mockCreate).toHaveBeenCalledWith("paystack_payments", expect.objectContaining({...}));
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/__tests__/vitest-setup.test.ts` | CREATE | AC1 regression: assert config `pool: "forks"` + Node ≥ 24 |
| `src/__tests__/AdminLayout.test.tsx` | UPDATE | AC2: unauthorized "Access Denied" + permitted-child states |
| `src/__tests__/LoginForm.test.tsx` | CREATE | AC2: first-admin link toggle (`hasAdmins`) + login submit flow |
| `src/__tests__/admin-auth.test.ts` | CREATE | AC2: `registerFirstAdminAction` with mocked auth helpers |
| `src/__tests__/SetupPage.test.tsx` | CREATE | AC2: setup-page gate (redirect to login when admins exist) |
| `src/__tests__/mocks.tsx` | UPDATE | Add `redirect` to `next/navigation` mock; extra motion tags if AC4 needs |
| `src/__tests__/setup.tsx` | UPDATE | AC4: jsdom polyfills (matchMedia/ResizeObserver/scrollTo) only if needed |
| `src/__tests__/PaystackWebhook.test.tsx` | UPDATE | AC3: missing-secret, malformed JSON, DB-error, currency/`verified_at` edges |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Lock Vitest `pool: "forks"` regression test

- **File**: `src/__tests__/vitest-setup.test.ts`
- **Action**: CREATE
- **Implement**: `pool: "forks"` already lives in `vitest.config.ts:12` — lock it so it can't regress (Vitest 4 defaults differ on Node 24). Importing `vitest.config.ts` in a test is unsafe (`__dirname` is undefined in ESM), so read the file:
  ```ts
  import { describe, it, expect } from "vitest";
  import { readFileSync } from "node:fs";
  import { resolve } from "node:path";
  describe("vitest setup", () => {
    it("uses pool: forks (required on Node 24)", () => {
      const cfg = readFileSync(resolve(process.cwd(), "vitest.config.ts"), "utf8");
      expect(cfg).toMatch(/pool:\s*"forks"/);
    });
    it("runs on Node >= 24", () => {
      const major = Number(process.version.match(/^v(\d+)/)?.[1]);
      expect(major).toBeGreaterThanOrEqual(24);
    });
  });
  ```
- **Mirror**: `src/__tests__/scroll-lock.test.ts:1-3` (plain vitest, no RTL)
- **Validate**: `npm test -- --run src/__tests__/vitest-setup.test.ts` → 2 passing

### Task 2: AdminLayout unauthorized (Access Denied) coverage

- **File**: `src/__tests__/AdminLayout.test.tsx`
- **Action**: UPDATE
- **Implement**: extend the existing describe (keep the 3 current tests intact):
  1. `denied route renders Access Denied and not children` — `mockUsePathname.mockReturnValue("/admin/settings")`; render with `user={{ email, firstName, role: "super_admin", permissions: [] }}`; assert `screen.getByRole("heading", { name: "Access Denied" })`, `screen.getByText(/required permissions/)`, and `queryByText("dashboard content")` null.
  2. `permitted route renders children` — same user but `permissions: ["access_settings"]`; assert children rendered, `queryByRole("heading", { name: "Access Denied" })` null.
  - Keep existing `vi.mock` set; `AdminProvider` mock already passes children through.
- **Mirror**: `AdminLayout.tsx:143,280-290` (denied branch) + existing `AdminLayout.test.tsx:26-35`
- **Validate**: `npm test -- --run src/__tests__/AdminLayout.test.tsx` → 5 passing

### Task 3: LoginForm first-admin link + login flow

- **File**: `src/__tests__/LoginForm.test.tsx`
- **Action**: CREATE
- **Implement**: `import "./mocks"` (for `useRouter`), then
  ```ts
  const mockLogin = vi.fn();
  vi.mock("@/actions/admin-auth", () => ({ loginAdmin: (...a: any[]) => mockLogin(...a) }));
  ```
  1. `hasAdmins={false}` → `screen.getByRole("link", { name: /Create Super Administrator/i })` with `getAttribute("href") === "/admin/setup"`.
  2. `hasAdmins={true}` → `queryByRole("link", { name: /Create Super Administrator/i })` null.
  3. submit flow: `mockLogin.mockResolvedValue({ error: "Invalid email or password" })`; type email/password via `fireEvent.change`, `fireEvent.click` submit; `await screen.findByText(/Invalid email or password/)`; assert `mockLogin` called with `("admin@example.org", "secret")`.
  4. success: `mockLogin.mockResolvedValue({})`; assert `useRouter` push — read push off the mocked router: capture via `mockUseRouter` export if added, or assert no error text and rely on 1-3. Keep 1-3 as the core; 4 optional.
- **Mirror**: `src/components/admin/LoginForm.tsx:25-36,87-95`; fireEvent pattern (no user-event in repo today)
- **Validate**: `npm test -- --run src/__tests__/LoginForm.test.tsx`

### Task 4: registerFirstAdminAction (mocked auth helpers)

- **File**: `src/__tests__/admin-auth.test.ts`
- **Action**: CREATE
- **Implement**:
  ```ts
  const mockRegister = vi.fn();
  const mockSetSession = vi.fn();
  const mockLog = vi.fn();
  vi.mock("@/lib/auth/client", () => ({ registerFirstAdmin: (...a: any[]) => mockRegister(...a) }));
  vi.mock("@/lib/auth/super-admin", () => ({
    setSuperAdminSession: (...a: any[]) => mockSetSession(...a),
    getSuperAdminSession: vi.fn(),
    clearSuperAdminSession: vi.fn(),
  }));
  vi.mock("@/actions/activity-logs", () => ({ logActivity: (...a: any[]) => mockLog(...a) }));
  ```
  1. success: `mockRegister.mockResolvedValue({ email: "a@b.com", firstName: "Alice", role: "super_admin", permissions: ["manage_users"], error: undefined })`; `await registerFirstAdminAction("a@b.com", "password123", "Alice")` → resolves `{}`; `mockSetSession` called with `("a@b.com", "Alice", [...], "super_admin")`; `mockLog` called with `(_, "register", "auth", ...)`.
  2. error passthrough: `mockRegister.mockResolvedValue({ error: "First admin already exists" })` → returns `{ error: "First admin already exists" }`; `mockSetSession` NOT called.
  - Note: `"use server"` directive is inert in vitest; the module exports plain async fns.
- **Mirror**: `src/actions/admin-auth.ts:30-40`
- **Validate**: `npm test -- --run src/__tests__/admin-auth.test.ts`

### Task 5: Setup page first-admin gate

- **File**: `src/__tests__/SetupPage.test.tsx`
- **Action**: CREATE
- **Implement**: add `redirect: vi.fn()` to the `next/navigation` mock in `mocks.tsx` first (Task 5a, same file). Then:
  ```ts
  const mockCount = vi.fn();
  vi.mock("@/lib/auth/client", () => ({ getAdminsCount: () => mockCount() }));
  vi.mock("@/components/admin/SetupForm", () => ({ default: () => <div data-testid="setup-form" /> }));
  import { redirect } from "next/navigation";
  import SetupPage from "@/app/admin/(public)/setup/page";
  ```
  1. `mockCount.mockResolvedValue(1)` → `await SetupPage()` throws (or `redirect` mock invoked) → assert `redirect` was called with `"/admin/login"`.
  2. `mockCount.mockResolvedValue(0)` → `render(await SetupPage())` → `screen.getByTestId("setup-form")` present, `redirect` not called.
- **Mirror**: `src/app/admin/(public)/setup/page.tsx:7-11`
- **Validate**: `npm test -- --run src/__tests__/SetupPage.test.tsx`

### Task 6: Paystack webhook edge coverage

- **File**: `src/__tests__/PaystackWebhook.test.tsx`
- **Action**: UPDATE
- **Implement**: keep all 6 existing tests; add 4 (reuse `signPayload`/`postWebhook`; `beforeEach` stays `vi.clearAllMocks()`; add `afterEach(() => vi.unstubAllEnvs())` only if stubEnv used):
  1. `returns 401 when PAYSTACK_SECRET_KEY is unset` — `vi.stubEnv("PAYSTACK_SECRET_KEY", "")`; `postWebhook({ event: "charge.success" })` (no header) → 401, `json.error === "Unauthorized"`.
  2. `rejects on malformed JSON body` — body `"not-json{"`, `signPayload(body)` → `await expect(postWebhook(..., sig)).rejects.toThrow()` (route has no try/catch; prod surfaces 500 — document in a code comment).
  3. `rejects when dedup query fails` — `mockQuery.mockRejectedValue(new Error("db down"))`; valid charge.success → `await expect(postWebhook(...)).rejects.toThrow("db down")`; `mockCreate` not called.
  4. `defaults currency and stamps verified_at` — valid charge.success WITHOUT `data.currency`; assert `mockCreate` called with `objectContaining({ currency: "NGN" })` and `metadata` containing `verified_at` (any ISO string: `expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)`).
- **Mirror**: existing cases at `PaystackWebhook.test.tsx:40-151`; route behavior `route.ts:8-12,23,29-36`
- **Validate**: `npm test -- --run src/__tests__/PaystackWebhook.test.tsx` → 10 passing

### Task 7: Reduce avoidable DOM warnings

- **File**: `src/__tests__/setup.tsx`, `src/__tests__/mocks.tsx`, (possibly component test files)
- **Action**: UPDATE
- **Implement**:
  1. First **measure**: `npx vitest run 2>&1 | tee /tmp/bmac-warnings-before.log`, then `grep -iE "warning|act\(|prop does not match|getComputedStyle|matchMedia|ResizeObserver" /tmp/bmac-warnings-before.log` to list current categories.
  2. Add to `setup.tsx` (guarded, so they don't mask real assertions):
     ```ts
     if (!window.matchMedia) window.matchMedia = (q: string) => ({ matches: false, media: q, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }) as MediaQueryList;
     if (!("scrollTo" in window)) window.scrollTo = () => {};
     if (!window.ResizeObserver) window.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
     ```
     Only add the ones the log actually shows (do not pre-emptively pad).
  3. Extend `framer-motion` mock in `mocks.tsx` with any tag the log reports as "not implemented" (e.g. `motion.img`, `motion.a`, `useInView`, `useScroll` → `{ ref: null }` / `0`), and add `redirect` to `next/navigation` mock here if Task 5 didn't already.
  4. **Re-measure**: `npx vitest run 2>&1 | tee /tmp/bmac-warnings-after.log`; the before/after diff must show the warning count reduced (or zeroed) — this is the AC4 proof. Do NOT add blanket `console.error` silencing; assertions stay unchanged.
- **Mirror**: `src/__tests__/setup.tsx:1` (current single jest-dom import)
- **Validate**: warning count `after` < `before`; `npm test` still green (25 + new ≈ 33)

---

## Validation

```bash
# Full suite (Node 24, pool: forks)
npm test

# Lint changed test files
npx eslint src/__tests__/

# Build still green (config untouched, but confirm)
npm run build
```

## Acceptance Criteria

- [ ] AC1: `vitest-setup.test.ts` asserts `pool: "forks"` and Node ≥ 24
- [ ] AC2: AdminLayout Access-Denied + permitted states; LoginForm first-admin link; `registerFirstAdminAction` success/error; setup-page gate — all with auth helpers mocked
- [ ] AC3: webhook suite covers valid, invalid (missing header/signature/secret), duplicate, malformed, DB-error, and currency/`verified_at` defaults
- [ ] AC4: avoidable DOM warnings reduced between the before/after `npm test` runs; no assertions weakened; no blanket console silencing
- [ ] Full `npm test` green; lint clean on `src/__tests__/`
