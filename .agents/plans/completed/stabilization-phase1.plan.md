# Plan: Phase 1 — Stabilization & Production Readiness

## Summary

Fix and harden existing platform before adding operational features. Covers: Clerk admin auth verification, Paystack payment persistence, mobile QA, test expansion, documentation alignment, and production deployment prep. 7 stories (S001-S007).

## User Story

As a Super Admin
I want the existing platform to work reliably from clean install through production
So that BMAC can confidently operate events, programs, and donations without data loss or auth failures

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX / TASK |
| Complexity | MEDIUM |
| Systems Affected | Clerk auth, Paystack webhook, Neon DB, tests, docs, deployment config |
| Jira Issue | BMAC-1 |

---

## Patterns to Follow

### Naming
```
// SOURCE: src/actions/crud.ts:1-15
export async function createItem(table: string, data: Record<string, unknown>) {
  return db.create(table, data);
}
```

### Error Handling
```
// SOURCE: src/actions/invitations.ts:55-73
export async function acceptInviteAction(params: { ... }) {
  const existing = await db.query<any>("SELECT id FROM public.admin_users WHERE email = $1", [email]);
  if (existing.length > 0) return { error: "Account already exists for this email" };
  // ...
  return { success: true, adminId };
}
```

### DB Queries
```
// SOURCE: src/lib/db.ts:100-103
async query<T>(queryStr: string, params?: any[]): Promise<T[]> {
  const sql = getSql();
  return (await sql.query(queryStr, params ?? [])) as unknown as T[];
}
```

### Tests
```
// SOURCE: src/__tests__/HomeClient.test.tsx:1-161
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "./mocks";
// Mocks imported per-test-file. Globals in setup.tsx mock Clerk.
```

### Admin Components
```
// SOURCE: src/components/admin/EventForm.tsx:1-308
"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createItem, updateItem } from "@/actions/crud";
// State per field, handleSubmit validates + calls createItem/updateItem
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/app/admin/layout.tsx` | UPDATE | Improve admin auth error handling |
| `src/actions/invitations.ts` | UPDATE | Fix invite acceptance for new vs existing Clerk users |
| `src/app/api/webhooks/paystack/route.ts` | UPDATE | Persist payment records instead of just logging |
| `scripts/seed.sql` | UPDATE | Add paystack_payments table schema |
| `src/types/cms.ts` | UPDATE | Add payment-related types |
| `src/__tests__/setup.tsx` | UPDATE | Improve Clerk mocks for auth tests |
| `src/__tests__/AdminLayout.test.tsx` | CREATE | Test admin auth bootstrap flow |
| `src/__tests__/PaystackWebhook.test.tsx` | CREATE | Test webhook signature verification and persistence |
| `SETUP.md` | UPDATE | Remove stale Neon Auth/Supabase/GitHub OAuth references |
| `.env.example` | UPDATE | Complete env list matching current stack |

---

## Tasks

### Task 1: Verify & Fix Admin Auth Bootstrap

- **Files**: `src/app/admin/layout.tsx`, `src/actions/invitations.ts`
- **Action**: UPDATE
- **Implement**:
  - Add try/catch around `currentUser()` in admin layout — if it throws, render a clear error state instead of crashing
  - Verify first-admin creation works when `admin_users` table is empty
  - Fix `acceptInviteAction` and `acceptExistingUserInvite` to handle Clerk allowlist edge cases (duplicate entries, expired codes)
  - Move Clerk allowlist restriction (`allowlist: true`) to a one-time setup, not every layout render
- **Mirror**: `src/actions/invitations.ts:55-73` — error return pattern
- **Validate**: `npx tsc --noEmit && npm run lint`

### Task 2: Add Paystack Payment Persistence

- **Files**: `src/app/api/webhooks/paystack/route.ts`, `scripts/seed.sql`, `src/types/cms.ts`
- **Action**: UPDATE
- **Implement**:
  - Add `paystack_payments` table to seed.sql: `id, reference, event_id, registration_id, donation_id, amount, currency, status, payer_email, payer_name, metadata, created_at, updated_at`
  - Add `PaymentRecord` type in `src/types/cms.ts`
  - Update webhook handler to insert/update payment records idempotently
  - Log audit trail on payment verification
- **Mirror**: `src/app/api/webhooks/paystack/route.ts:4-32` — existing webhook structure
- **Validate**: `npm test && npx tsc --noEmit`

### Task 3: Add Payment & Auth Tests

- **Files**: `src/__tests__/AdminLayout.test.tsx` (CREATE), `src/__tests__/PaystackWebhook.test.tsx` (CREATE), `src/__tests__/setup.tsx` (UPDATE)
- **Action**: CREATE / UPDATE
- **Implement**:
  - AdminLayout test: renders when `currentUser()` returns valid user, renders error when `currentUser()` throws/null
  - PaystackWebhook test: valid signature passes, invalid signature returns 401, successful payment creates DB record
  - Update `setup.tsx` mocks to support these test scenarios
- **Mirror**: `src/__tests__/HomeClient.test.tsx:1-30` — mock + render pattern
- **Validate**: `npm test`

### Task 4: Mobile QA & Responsiveness Fixes

- **Files**: TBD from manual QA pass
- **Action**: UPDATE
- **Implement**:
  - Audit all public pages at 375px width
  - Audit all admin CRUD pages at 375px width
  - Fix: overflowing tables (horizontal scroll wrapper), touch target sizes (min-h-[44px]), stacked layouts
  - Target pages: admin tables, public event list, admin forms
- **Validate**: Visual check at 375px/768px widths

### Task 5: Align Documentation & Environment Config

- **Files**: `SETUP.md`, `.env.example`
- **Action**: UPDATE
- **Implement**:
  - Remove all Neon Auth, Supabase, GitHub OAuth references from SETUP.md
  - Replace with current Clerk v7 + Neon HTTP + Paystack + Resend instructions
  - Complete `.env.example` with all required vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEON_DB_URL`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`
- **Validate**: `cat SETUP.md` — no stale references

### Task 6: Production Deployment Prep

- **Files**: `README.md` (UPDATE)
- **Action**: UPDATE
- **Implement**:
  - Add production checklist section: Vercel project config, Neon DB setup, Clerk app setup, Paystack keys, Resend domain verification, custom domain DNS
  - Document required environment variables per platform
- **Validate**: Reviewed

---

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
```

## Acceptance Criteria

- [ ] Clean install: first Clerk user creates `super_admin` record and accesses `/admin`
- [ ] Invite flow works for new and existing Clerk users
- [ ] Paystack webhook persists payment records idempotently
- [ ] All public and admin pages render correctly at 375px
- [ ] Setup docs match current Clerk/Neon/Paystack/Resend stack
- [ ] `.env.example` covers all required variables
- [ ] Type check, lint, and tests pass
