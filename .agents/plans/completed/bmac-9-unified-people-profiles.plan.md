# Plan: Unified People Profile Data Model (BMAC-9)

## Summary

Build a `people`-centric data layer so every person (by email/phone/name) has ONE profile across events, donations, programs, and volunteering. Add a `people` table (identity + role tags) and a unified `person_records` link table; wire the existing Paystack webhook and every public form (event registration, donate, join/volunteer/partner, contact) to find-or-create a person and attach a typed record. Add an admin People area (list + detail with role badges and linked records) and a permission-guarded CSV export of core profile fields. All persistence lives in the Next app (server actions + `src/lib/db.ts`); the Express backend is untouched.

## User Story

As an Admin Lead
I want one profile per person across events, donations, programs, and volunteering
So that BMAC can understand each person's full relationship with the organization.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | HIGH |
| Systems Affected | bmac-next, Neon DB (BMAC project) |
| Jira Issue | BMAC-9 |

---

## Patterns to Follow

### Naming / action structure
```
// SOURCE: src/actions/newsletter.ts:1-20  +  src/actions/crud.ts:1-16
"use server";
import { db } from "@/lib/db";
import { requireAdmin / requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
// server action: validate input -> guard -> db -> logActivity -> return result / { error }
```

### Error handling
```
// SOURCE: src/actions/newsletter.ts:6-21
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Valid email required" };
try { ... } catch (err: any) { console.error(...); return { error: "Something went wrong. Try again." }; }
// Guards throw: src/lib/auth/server.ts:42-45 requirePermission(p) throws "Forbidden: insufficient permissions"
```

### DB write (raw Neon SQL, wrapper in src/lib/db.ts)
```
// SOURCE: src/lib/db.ts:111-114  +  src/actions/newsletter.ts:12-14
db.query("INSERT INTO public.people (id, first_name, email, roles) VALUES ($1,$2,$3,$4)
          ON CONFLICT ((lower(email))) DO NOTHING", [id, name, email.toLowerCase(), JSON.stringify(roles)]);
```

### Admin page / table component
```
// SOURCE: src/app/admin/(admin)/payments/page.tsx:1-7 + src/components/admin/PaymentsTable.tsx:1-12
// page: export default async function Page() { const rows = await action(); return <Table initialData={rows} />; }
// table: "use client"; useState from initialData in useEffect; search filter; admin theme tokens (bg-card, border-border, text-secondary, text-muted-foreground)
```

### Tests (vitest mocks)
```
// SOURCE: src/__tests__/admin-users.test.ts:1-20
vi.mock("@/lib/auth/server", () => ({ requirePermission: vi.fn(async () => ({ email: "a@b.c", role: "super_admin", permissions: ALL })) }));
vi.mock("@/lib/auth/client", ...); vi.mock("@/actions/activity-logs", ...); vi.mock("@/lib/db", ...);
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `(Neon DB — schema)` | UPDATE | create `people` + `person_records` tables + indexes |
| `src/types/cms.ts` | UPDATE | `Person`, `PersonRole`, `PersonRecord`, record kinds |
| `src/actions/people.ts` | CREATE | find-or-create person, upsert record, list/detail/export (guarded) |
| `src/app/api/webhooks/paystack/route.ts` | UPDATE | link payer → person, insert `person_records`, auto role tags |
| `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | UPDATE | persist free-event registration |
| `src/app/(public_pages)/get-involved/page.tsx` | UPDATE | wire join/volunteer/partner (+ donate → Paystack) |
| `src/app/(public_pages)/contact/actions.ts` | UPDATE | persist contact message + person |
| `src/actions/newsletter.ts` | UPDATE | create person on subscribe (email-only) |
| `src/components/admin/AdminLayout.tsx` | UPDATE | People nav item + route permission |
| `src/app/admin/(admin)/people/page.tsx` | CREATE | people list page |
| `src/app/admin/(admin)/people/[id]/page.tsx` | CREATE | person detail page |
| `src/components/admin/PeopleTable.tsx` | CREATE | list + search + role badges + export button |
| `src/components/admin/PersonDetail.tsx` | CREATE | profile view: roles + linked records grouped |
| `src/__tests__/people.test.ts` | CREATE | action unit tests |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Schema migration (people + person_records)

- **File**: Neon DB `neondb` (project `curly-mode-43198823`)
- **Action**: UPDATE (DDL via Neon MCP — `prepare_database_migration` on a temp branch, verify, then `complete_database_migration`)
- **Implement**: run DDL (below), idempotent (`IF NOT EXISTS`), then backfill task
```sql
CREATE TABLE IF NOT EXISTS public.people (
  id text PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS people_email_lower_idx ON public.people ((lower(email))) WHERE email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS people_phone_idx ON public.people (phone) WHERE phone <> '';

CREATE TABLE IF NOT EXISTS public.person_records (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  kind text NOT NULL,               -- event_registration | donation | member | volunteer | partner | program | contact | admin
  ref_id text NOT NULL DEFAULT '',  -- event id / payment reference / program id / ''
  ref_title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS person_records_person_idx ON public.person_records (person_id);
CREATE INDEX IF NOT EXISTS person_records_kind_idx ON public.person_records (kind);
```
- **Backfill**: one-off script (task 10) — insert `people` + `person_records(kind=donation|event_registration)` from existing `paystack_payments` rows (dedupe by `payer_email`). Run via Neon after main migration.
- **Validate**: `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` shows both tables; unique index works (duplicate lower(email) insert rejected).

### Task 2: Types

- **File**: `src/types/cms.ts`
- **Action**: UPDATE
- **Implement**: add near `PaymentRecord` (cms.ts:124):
```ts
export type PersonRole = "attendee" | "donor" | "applicant" | "volunteer" | "partner contact" | "member" | "admin";
export type PersonRecordKind = "event_registration" | "donation" | "member" | "volunteer" | "partner" | "program" | "contact" | "admin";
export interface Person { id: string; firstName: string; lastName: string; email: string; phone: string; roles: PersonRole[]; notes: string; createdAt: string; updatedAt: string; }
export interface PersonRecord { id: string; personId: string; kind: PersonRecordKind; refId: string; refTitle: string; status: string; meta: Record<string, unknown>; createdAt: string; }
export type PersonRow = Person & { recordCount: number };
```
- **Mirror**: `src/types/cms.ts:104-137`
- **Validate**: `npm run build`

### Task 3: People action module

- **File**: `src/actions/people.ts`
- **Action**: CREATE
- **Implement** (all `"use server"`, error pattern from `newsletter.ts`):
  - `findOrCreatePerson({ firstName, lastName, email, phone }): Promise<Person>` — resolve by `lower(email)` (primary), then `phone` (secondary), then normalized full name (last resort); `INSERT ... ON CONFLICT ((lower(email))) DO NOTHING` then `SELECT`; merge latest known name/phone into existing row (`db.query UPDATE`), `logActivity`.
  - `upsertPersonRecord(personId, kind, opts: { refId?, refTitle?, status?, meta? })` — insert row, return it.
  - `ensurePersonRoles(personId, roles: PersonRole[])` — `roles = array_union` of existing + new (idempotent).
  - `getPeople(): Promise<PersonRow[]>` — `requirePermission("manage_users")`; `SELECT p.*, COUNT(pr.id) AS record_count FROM people p LEFT JOIN person_records pr ON pr.person_id=p.id GROUP BY p.id ORDER BY p.created_at DESC`; add `admin` role tag via `LEFT JOIN admin_users ON lower(email)=lower(admin_users.email)` when present.
  - `getPerson(id): Promise<{ person: Person; records: PersonRecord[]; isAdmin: boolean } | null>` — guarded, `person_records` joined by person_id ordered newest first.
  - `exportPeople(): Promise<PersonRow[]>` — `requirePermission("manage_users")`; returns all people (core fields + roles + record count) for CSV.
- **Mirror**: `src/actions/newsletter.ts:6-21`, `src/actions/admin-users.ts:7-16`
- **Validate**: unit tests (Task 10) + `npm run build`

### Task 4: Paystack webhook → person link

- **File**: `src/app/api/webhooks/paystack/route.ts`
- **Action**: UPDATE
- **Implement**: after dedupe check (route.ts:29-36), on `charge.success`:
  - `findOrCreatePerson({ firstName: metadata.payer_name, email: customer.email })`
  - `ensurePersonRoles(person.id, metadata.source_type === "donation" ? ["donor"] : ["attendee"])`
  - `upsertPersonRecord(person.id, metadata.source_type === "donation" ? "donation" : "event_registration", { refId: reference, refTitle: metadata.source_type === "donation" ? "Donation" : (metadata.custom_fields?.[0]?.value || ""), status: "completed", meta: { amount, currency, reference } })`
- **Mirror**: existing `db.create` usage route.ts:39-50
- **Validate**: `npm run build`; webhook tests still pass

### Task 5: Free event registration persistence

- **File**: `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: on free-event submit (EventDetailClient.tsx:84-87), call `registerForFreeEvent({ eventId, eventTitle, name, email })` server action (add to `src/actions/people.ts`) → `findOrCreatePerson` + `ensurePersonRoles(..., ["attendee"])` + `upsertPersonRecord("event_registration", { refId: eventId, refTitle: eventTitle, status: "confirmed" })`; then set `isReserved`.
- **Mirror**: existing form submit flow EventDetailClient.tsx:76-88
- **Validate**: `npm run build`; manual smoke on `/events/[id]` free event

### Task 6: Get-involved forms (join / volunteer / partner / donate)

- **File**: `src/app/(public_pages)/get-involved/page.tsx`
- **Action**: UPDATE
- **Implement**: replace stub submit (page.tsx:235-248 + handleDonate 69-73):
  - Add `name`/`email` state (currently uncontrolled inputs) + submitting/error state.
  - `join` → `applyAsPerson({ kind: "member", ... })` action → person + `["member"]` role + `person_records("member")`.
  - `volunteer` → same, `["volunteer"]` role, kind `volunteer`.
  - `partner` → same, `["partner contact"]` role, kind `partner`.
  - `school` → `["applicant"]` role, kind `program` (chapter application).
  - `donate` → open `window.PaystackPop` (mirror EventDetailClient.tsx:39-74) with `metadata: { source_type: "donation", payer_name, source_id: "get-involved" }`; webhook (Task 4) does the rest.
  - Replace the fake "Initiating Paystack payment" path; show real success/error states.
- **Mirror**: EventDetailClient.tsx:39-88
- **Validate**: `npm run build`; form smoke on `/get-involved`

### Task 7: Contact form persistence

- **File**: `src/app/(public_pages)/contact/actions.ts`
- **Action**: UPDATE
- **Implement**: after Resend send succeeds, call `findOrCreatePerson({ firstName: name, email })` + `upsertPersonRecord("contact", { status: "received", meta: { message: message.slice(0, 500) } })`. Keep `logActivity`. Non-fatal on DB error (contact email already sent).
- **Mirror**: existing contact action structure actions.ts:1-40
- **Validate**: `npm run build`

### Task 8: Newsletter → person

- **File**: `src/actions/newsletter.ts`
- **Action**: UPDATE
- **Implement**: in `subscribeToNewsletter`, after insert, `findOrCreatePerson({ email })` (no role tag). Keep `ON CONFLICT (email) DO NOTHING` on subscribers.
- **Validate**: `npm run build`; existing newsletter tests pass

### Task 9: Admin People area (nav, list, detail, export)

- **File**: multiple (CREATE/UPDATE)
- **Action**: CREATE `src/app/admin/(admin)/people/page.tsx` + `src/app/admin/(admin)/people/[id]/page.tsx`; CREATE `src/components/admin/PeopleTable.tsx` + `src/components/admin/PersonDetail.tsx`; UPDATE `src/components/admin/AdminLayout.tsx`
- **Implement**:
  - `AdminLayout.tsx`: add `{ label: "People", href: "/admin/people", icon: Users, permission: "manage_users" }` to System nav group (AdminLayout.tsx:61-69); add `"/admin/people": "manage_users"` to `routePermissions` (AdminLayout.tsx:81-96).
  - `PeopleTable.tsx`: search by name/email/phone/roles; columns Name, Email, Phone, Role badges (color-coded chips), Records count, Created; row links to `/admin/people/{id}`; **Export CSV button** (`exportPeople()` action → build CSV client-side from returned rows, `Blob` download `bmac-people.csv`); admin theme tokens (mirror `PaymentsTable.tsx`).
  - `PersonDetail.tsx`: header with name + role badge chips + admin tag; sections per `person_records` kind showing refTitle/refId/status/date, grouped (Events, Donations, Volunteering, Applications, Contact); empty state.
  - Pages: server components calling `getPeople()` / `getPerson(id)` (mirror `payments/page.tsx`).
- **Mirror**: `PaymentsTable.tsx:34-115`, `payments/page.tsx:1-7`
- **Validate**: `npm run build`; navigate `/admin/people` + detail

### Task 10: Backfill + tests

- **File**: `src/__tests__/people.test.ts` (CREATE); backfill SQL via Neon
- **Action**: CREATE
- **Implement** tests (mock `@/lib/db`, `@/lib/auth/server`, `@/actions/activity-logs` per admin-users.test.ts pattern):
  1. `findOrCreatePerson` creates on new email (lowercased, dedupe by unique index)
  2. `findOrCreatePerson` returns existing when email matches
  3. `findOrCreatePerson` falls back to phone match when email empty
  4. `ensurePersonRoles` is idempotent (no dupes)
  5. `getPeople` requires `manage_users` (403 throw when missing)
  6. `getPerson` returns records newest-first
  7. `exportPeople` requires permission + returns core fields
  8. webhook inserts `person_records` + donor/attendee role on `charge.success` (new test in `PaystackWebhook` or people.test.ts)
- **Backfill** (Neon, after Task 1 main migration): insert people/person_records from existing `paystack_payments` (one person per `payer_email`, records kind by `source_type`, `donation` → donor, else attendee).
- **Validate**: `npm test`

---

## Validation

```bash
# Type check + build
npm run build

# Lint (changed files only — keep baseline identical)
npx eslint src/actions/people.ts src/app/api/webhooks/paystack/route.ts src/components/admin/PeopleTable.tsx src/components/admin/PersonDetail.tsx src/actions/newsletter.ts src/app/\(public_pages\)/contact/actions.ts src/app/\(public_pages\)/get-involved/page.tsx "src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx" src/components/admin/AdminLayout.tsx

# Tests
npm test

# Schema (Neon)
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('people','person_records');
```

---

## Acceptance Criteria

- [ ] Public form submission (event reg, donate, volunteer, join, partner, contact) creates or links a person profile (`findOrCreatePerson` by email, then phone, then name)
- [ ] Same email across multiple workflows links to the same `people` row (`ON CONFLICT (lower(email))`)
- [ ] Person profiles expose role tags: attendee, donor, applicant, volunteer, partner contact, member, admin (admin derived from `admin_users` join)
- [ ] Authorized admins (`manage_users`) can export core profile fields (CSV via `exportPeople`)
- [ ] All tasks completed; build, lint, tests pass; schema verified in Neon
- [ ] Follows existing patterns (db wrapper, guarded actions, table components, vitest mocks)

## Risks

| Risk | Mitigation |
|------|------------|
| Email-keyed dedupe fails for email-less submissions | Fallback keys: phone (unique index), then normalized full-name match; name-only creates a new person when no match |
| Race between two concurrent webhook inserts for same payer | `ON CONFLICT ((lower(email))) DO NOTHING` + unique index guarantees one `people` row; re-SELECT after insert |
| Backfill touches production data | Run after migration on a temp Neon branch first, verify counts, then complete to main; idempotent (check `people` empty) |
| `manage_users` is coarse for People | Matches existing Admins/Logs/Payments gating; adding a new `manage_people` permission would ripple into backend `ALL_PERMISSIONS` — deferred |
| No program-apply form exists today | Data model + `applicant` role + `program` kind are ready; wiring a future program form is a no-op slot |
