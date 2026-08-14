# Paid/Free Indicators + Paid-Registration Guard

## Overview

Public event surfaces never display the paid/free status correctly, and paid events can be
registered for free through the public event detail form.

Root cause: `db.getAll` returns raw snake_case rows (`src/lib/db.ts`). Programs clients
normalize `is_paid`/`price` (`ProgramsClient.tsx:30-32`, `ProgramDetailClient.tsx:33-34`),
but **event** clients do not (`EventsClient.tsx:33-38`, `EventDetailClient.tsx:30-35`), so
`event.isPaid` is always `undefined`:

- Events list badge (`EventsClient.tsx:108`) always renders "Free Entry".
- Event detail badge (`EventDetailClient.tsx:169`) always renders "Registration Open".
- `handleSubmit` (`EventDetailClient.tsx:117`) treats every event as free → routes paid
  events into `registerForEvent`, which has no `is_paid` guard (`events.ts:260`) → a
  **confirmed** pass with no payment. Revenue bypass.

Programs already work and need no changes.

## Files to Modify

- `src/app/(public_pages)/events/EventsClient.tsx` — add `is_paid`/`price` normalization.
- `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` — add `is_paid`/`price` normalization.
- `src/actions/events.ts` — add `is_paid` guard to `registerForEvent`.
- `src/__tests__/register-for-event.test.ts` — new vitest test for the guard.

## Implementation

### Task 1 — Events list mapping (`EventsClient.tsx`)

In the `initialEvents.map` at lines 33-38, add the same normalization ProgramsClient uses:

```ts
const [events] = useState<EventPass[]>(initialEvents.map(e => ({
  ...e,
  date: (e as any).event_date || e.date || "",
  desc: e.desc || (e as any).description || "",
  features: (e as any).features || [],
  isPaid: (e as any).is_paid ?? (e as any).isPaid ?? false,
  price: Number((e as any).price || 0),
})));
```

Badge at line 108 then correctly renders `₦{price.toLocaleString()}` or "Free Entry".

### Task 2 — Event detail mapping (`EventDetailClient.tsx`)

Same normalization in the map at lines 30-35:

```ts
const all = initialEvents.map(e => ({
  ...e,
  date: (e as any).event_date || e.date || "",
  desc: e.desc || (e as any).description || "",
  features: (e as any).features || [],
  isPaid: (e as any).is_paid ?? (e as any).isPaid ?? false,
  price: Number((e as any).price || 0),
}));
```

Badge at line 169 and the `if (event.isPaid)` branch at line 117 then behave correctly.

### Task 3 — Server-side guard (`src/actions/events.ts`)

`eventById` selects `*` (`events.ts:82-85`), so `event.is_paid` is available. Insert after
the status check (line 273), before `reserveCapacity` (line 275):

```ts
if (event.is_paid) return { error: "This event requires a paid pass — purchase your ticket instead." };
```

Mirrors the existing reverse guard in `createTicketOrder` (`tickets.ts:42`). Placing it before
`reserveCapacity` means no capacity is consumed on a rejected registration. Defense in depth —
correct regardless of any future client regression.

### Task 4 — Vitest test (`src/__tests__/register-for-event.test.ts`)

Follow the mock pattern in `src/__tests__/people.test.ts`. Mock:
- `@/lib/db` → `db.query` (drives `eventById`).
- `@/actions/people` → `findOrCreatePerson`, `ensurePersonRoles`, `upsertPersonRecord`.
- `@/lib/tickets` → `createTicket`, `reserveCapacity`, `releaseCapacity`, `passUrlFor`.
- `@/lib/workflows` → `createWorkflowRecord`.
- `@/lib/email` → `sendRegistrationConfirmedEmail`.
- `@/lib/notifications` → `createAdminNotification`, `getSuperAdminEmails`, `emailSuperAdmins`.

Cases:
1. **Paid event rejected**: `db.query` returns a row with `status: "published"`, `is_paid: true`,
   `price: 5000`. Assert result is `{ error: expect.stringContaining("paid pass") }`, and that
   `reserveCapacity` and `createTicket` were **not** called.
2. **Free event still registers** (regression): row with `is_paid: false`; `reserveCapacity`
   resolves `1`, `findOrCreatePerson` returns a person, `createTicket` returns a ticket. Assert
   no `error` and `createTicket` called with `status: "confirmed"`.

## Validation

```bash
npm run test
npm run lint
npm run build
```

Manual: with a paid event in the DB, `/events` card shows the price badge, the event detail
shows "Ticket: ₦X", and the free-registration form is not reachable (guard error). Free events
still register normally.

## Acceptance Criteria

- [ ] Events list badge shows price for paid events, "Free Entry" for free ones.
- [ ] Event detail badge shows "Ticket: ₦X" for paid events, "Registration Open" for free ones.
- [ ] `registerForEvent` returns an error for paid events; no ticket created, no capacity consumed.
- [ ] Free-event registration path unchanged.
- [ ] New vitest test passes; full suite, lint, and build green.
- [ ] No changes to programs (already correct) or the pass-download plan.
