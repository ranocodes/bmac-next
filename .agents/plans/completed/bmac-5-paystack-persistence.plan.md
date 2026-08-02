# Plan: Add Paystack Payment Persistence Baseline

## Summary

Paystack `charge.success` webhooks already persist a `paystack_payments` row with
signature verification and reference-based idempotency, but the persistence is not
yet a reliable baseline: payment IDs use collision-prone `pay-${Date.now()}`, the
frontend never sends `source_type`/`source_id` metadata so payments can't be linked
to an event (all stored as `"unknown"`/`""`), and nothing reads the table back — no
admin view satisfies "admins or later features can query reference, amount, email,
status, timestamp". This plan hardens the webhook, links the Paystack popup metadata
to the event, and adds a read-only admin payments page. Also fixes a
related admin-management bug: deleting a moderator (or a super admin)
does not email the other administrators — notification currently only
fires for super_admin targets, and only to other super_admins
(`src/actions/admin-users.ts:52-56`).

## User Story

As an Admin
I want Paystack webhook success events to be persisted instead of only logged
So that later event and donation features can rely on verified payment state.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | LOW |
| Systems Affected | bmac-next (webhook route, event checkout, admin UI, admin-users action, tests) |
| Jira Issue | BMAC-5 |
| Branch | `test` (bmac-next) |

---

## Verified Current State (source of truth)

- Webhook `src/app/api/webhooks/paystack/route.ts` (60 lines): HMAC sha512 signature check `:14-18`, only handles `charge.success` `:22`, dedups via `SELECT id ... WHERE reference = $1` `:26-33`, persists `paystack_payments` `:35-47`, writes `activity_logs` `:49-56`.
- `paystack_payments` table exists (`scripts/seed.sql:1-14`): `id TEXT PK`, `reference TEXT UNIQUE NOT NULL`, `source_type TEXT NOT NULL`, `source_id TEXT NOT NULL`, `amount INTEGER NOT NULL`, `currency TEXT DEFAULT 'NGN'`, `payer_email TEXT NOT NULL`, `payer_name TEXT DEFAULT ''`, `status TEXT DEFAULT 'pending'`, `metadata JSONB DEFAULT '{}'`, `created_at`/`updated_at TIMESTAMPTZ DEFAULT NOW()`.
- Frontend `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx:39-71`: inline PaystackPop setup with `metadata.custom_fields` only (event_title, attendee_name); no `source_type`/`source_id`/`payer_name`; `callback` is client-only (`console.log` + `setIsReserved(true)`), no server call.
- `PaymentRecord` type `src/types/cms.ts:122-137` exists but is unused by any page.
- Admin page pattern: server page calls `db.getAll(table)` → passes `initialData` to a client table component (e.g. `src/app/admin/(admin)/logs/page.tsx:4-6` → `ActivityLogTable`).
- Admin nav `src/components/admin/AdminLayout.tsx:40-68` (navGroups) + `:79-93` (routePermissions) + `:95-101` (checkRouteAccess, default-allows unlisted routes).
- Admin route auth: `src/proxy.ts:49-63` guards `/admin/*` behind `bmac_admin_session` cookie — new `/admin/payments` is automatically covered.
- DB layer `src/lib/db.ts`: raw SQL via Neon HTTP; `db.getAll` `:55-60` (ORDER BY whitelist `:27-30` includes `created_at`), `db.create` `:68-79` (JSON.stringify on object values), `db.query` `:111-114`.
- Tests: `src/__tests__/PaystackWebhook.test.tsx` (vitest, mocks `@/lib/db`). Fixture already sends `source_type: "event_registration"`, `source_id: "event-1"` `:65-68`.

### Gaps
1. `id: pay-${Date.now()}` `route.ts:35` (and `log-pay-${Date.now()}` `:50`) collide under concurrent webhooks → PK violation.
2. Signature compared with `!==` `route.ts:16` (timing-unsafe; still returns 401).
3. Frontend sends no `source_type`/`source_id`/`payer_name` metadata `EventDetailClient.tsx:48-61` → webhook stores `"unknown"`/`""` for every payment.
4. Nothing reads `paystack_payments` — no admin surface, no dashboard count (grep confirms only webhook/test/type).

---

## Patterns to Follow

### Naming
```
// SOURCE: src/lib/db.ts:55-60 (server page data fetch)
const logs = await db.getAll<any>("activity_logs").catch(() => []);
return <ActivityLogTable initialData={logs} />;
```

### Component
```
// SOURCE: src/components/admin/ActivityLogTable.tsx:9-18 (client table w/ initialData + search)
export default function ActivityLogTable({ initialData }: { initialData: any[] }) {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { setLogs([...initialData].reverse()); }, [initialData]);
```

### Errors
```
// SOURCE: src/app/api/webhooks/paystack/route.ts:10-18 (401 on missing/invalid signature)
if (!secret || !signature) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (hash !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
```

### Tests
```
// SOURCE: src/__tests__/PaystackWebhook.test.tsx:54-89 (mock db, sign payload, assert create called)
mockQuery.mockResolvedValue([]);
mockCreate.mockResolvedValue({ id: "pay-123" });
expect(mockCreate).toHaveBeenCalledWith("paystack_payments", expect.objectContaining({...}));
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/webhooks/paystack/route.ts` | UPDATE | collision-safe ids, timing-safe signature compare |
| `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | UPDATE | send `source_type`/`source_id`/`payer_name` in Paystack metadata |
| `src/app/admin/(admin)/payments/page.tsx` | CREATE | admin payments list (AC4 query surface) |
| `src/components/admin/PaymentsTable.tsx` | CREATE | read-only table: reference, source, amount, currency, email, status, timestamp |
| `src/components/admin/AdminLayout.tsx` | UPDATE | nav entry + route permission for `/admin/payments` |
| `src/actions/admin-users.ts` | UPDATE | notify remaining admins on any admin delete |
| `src/__tests__/PaystackWebhook.test.tsx` | UPDATE | assert new id format + source metadata persisted |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Harden webhook persistence

- **File**: `src/app/api/webhooks/paystack/route.ts`
- **Action**: UPDATE
- **Implement**:
  - Replace `const paymentId = \`pay-${Date.now()}\`` with `crypto.randomUUID()` (`pay-${crypto.randomUUID()}` or plain `crypto.randomUUID()`).
  - Same for the activity log id (`log-pay-${Date.now()}`).
  - Replace `hash !== signature` with constant-time compare using `crypto.timingSafeEqual` over equal-length Buffers (keep 401 on mismatch; keep the missing-secret/signature 401).
  - Keep reference-based dedup (`db.query` + `already_processed`) and the `charge.success`-only branch.
- **Validate**: `npm test` — existing 5 webhook tests still pass.

### Task 2: Link checkout metadata to the event

- **File**: `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: in `handlePaystackPayment` `metadata` (lines 48-61), add top-level fields alongside `custom_fields`:
  - `source_type: "event_registration"`
  - `source_id: event.id`
  - `payer_name: formData.name`
  (The webhook already reads `metadata?.source_type`/`metadata?.source_id`/`metadata?.payer_name` at `route.ts:39-44` — no webhook change needed for the link.)
- **Validate**: `grep "source_type" EventDetailClient.tsx` returns the new line; webhook test fixture shape now matches the real frontend payload.

### Task 3: Add read-only admin payments page

- **File**: `src/app/admin/(admin)/payments/page.tsx`
- **Action**: CREATE
- **Implement**: mirror `src/app/admin/(admin)/logs/page.tsx`:
  ```tsx
  import { db } from "@/lib/db";
  import PaymentsTable from "@/components/admin/PaymentsTable";

  export default async function PaymentsPage() {
    const payments = await db.getAll<any>("paystack_payments").catch(() => []);
    return <PaymentsTable initialData={payments} />;
  }
  ```
- **File**: `src/components/admin/PaymentsTable.tsx`
- **Action**: CREATE
- **Implement**: mirror `ActivityLogTable`/`EventTable` structure (client component, `useState` from `initialData`, search input). Read-only — no delete/edit buttons. Columns:
  - reference, source (`source_type` + `source_id`), amount (kobo→naira: `(amount/100).toLocaleString()`), currency, payer email, status (badge), created_at (reuse the `formatTime` pattern from `ActivityLogTable.tsx:20-24`).
  - Handle `metadata` returned as JSON string (Neon HTTP returns JSONB as string) defensively — only display fields that exist.
- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: add `{ label: "Payments", href: "/admin/payments", icon: CreditCard, permission: "manage_users" }` under the **System** group (`navGroups`, lines 60-67); add `"/admin/payments": "manage_users"` to `routePermissions` (lines 79-93). Import `CreditCard` from `lucide-react` (existing import block lines 6-11).
- **Validate**: `npm run build` passes; visit `/admin/payments` in dev.

### Task 4: Update webhook tests

- **File**: `src/__tests__/PaystackWebhook.test.tsx`
- **Action**: UPDATE
- **Implement**:
  - In the valid `charge.success` test, assert the create call passes `source_type: "event_registration"` and `source_id` through (fixture already sends them) and that the id is not `pay-${Date.now()}` format (assert `expect.stringMatching(/^pay-|^[0-9a-f-]{36}$/)` or `expect.any(String)` + not containing `Date.now` — pick stable assertion: assert `id` matches `crypto.randomUUID()` pattern).
  - Add one test: webhook stores `"unknown"`/`""` when metadata lacks `source_type`/`source_id` (guards Task 2 default behavior).
- **Validate**: `npm test` — all webhook + suite tests pass.

### Task 5: Notify remaining admins when any admin is deleted

- **File**: `src/actions/admin-users.ts`
- **Action**: UPDATE
- **Implement**: in `deleteAdminUser`, replace the `if (isSuper)` notification block (lines 52-56) with a unified notification that fires after **every** successful delete:
  ```ts
  const remaining = await db.query<{ email: string }>(
    "SELECT email FROM public.admin_users WHERE LOWER(email) NOT IN (LOWER($1), LOWER($2))",
    [target.email, admin.email]
  );
  Promise.allSettled(remaining.map(r => sendAdminDeletedNotification(r.email, target.email, admin.email)));
  ```
  - Keep the `if (isSuper) { DELETE FROM super_admins ... }` cleanup (line 46-48) untouched.
  - `admin_users` contains both super admins and moderators, so this covers moderator deletes (previously zero notifications) and super admin deletes (previously only other super admins).
  - Backend already supports the `admin-deleted` email type (`backend/server.js:641`) — no backend change.
- **Validate**: `npm run build`; `npm test`. Manual: delete a moderator → confirm super admins + other moderators receive the email.

---

## Validation

```bash
npm run lint
npm run build
npm test
# manual: seed a payment via test webhook fixture, confirm row + admin /admin/payments
```

No DB migration needed — `paystack_payments` table already exists in `scripts/seed.sql:1-14`.

---

## Acceptance Criteria

- [ ] Valid `charge.success` persists reference + full metadata (now linked to event via `source_type`/`source_id`).
- [ ] Duplicate delivery returns `already_processed`, creates nothing (idempotent).
- [ ] Missing/invalid signature returns 401, creates nothing.
- [ ] `/admin/payments` lists reference, source, amount (naira), email, status, timestamp for stored payments.
- [ ] No `pay-${Date.now()}` collision risk; signature compare is constant-time.
- [ ] Deleting any admin (super or moderator) emails the remaining administrators; self-delete alert retained.
- [ ] Tests updated + passing (`npm test`).
