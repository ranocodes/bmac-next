# Plan: Events & Workflows Phase (BMAC-11 → BMAC-20)

## Summary

Ship the operational phase of the BMAC platform: persisted public workflows (contact, join, volunteer, school, partner, program, event registration, donation), consent/privacy capture, an admin workflow queue, transactional email, event operations (capacity, deadlines), free + paid public registration backed by Paystack verification, QR passes, and mobile check-in. This is the "real operations" layer the PRD §7.3/§7.6/§7.7 require — currently most flows are front-end-only success states. Approach: one shared data model (`workflow_records`, `event_tickets`, `people.consent`, extended `events`) built incrementally story-by-story, reusing the existing `db`/`person_records`/Paystack-webhook/email patterns.

## User Story

As an Event Coordinator and admin team
I want persisted workflow records, capacity-aware registration, verified paid tickets, QR passes, and mobile check-in
So that BMAC can run real events and follow-ups from the platform instead of spreadsheets and front-end-only success states.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY (multi-story) |
| Complexity | HIGH |
| Systems Affected | DB schema (Neon), admin pages/nav, permission system, public event/get-involved/contact forms, Paystack webhook, email service contract, client paystack init |
| Jira Issues | BMAC-11 … BMAC-20 |
| PRD | `.agents/PRDs/PRD.md` §7.3, §7.6, §7.7, §10 |

---

## Current State (verified)

- **`person_records`** is the people-linked history hub (`src/actions/people.ts:191-208`): `upsertPersonRecord(personId, kind, {refId, refTitle, status, meta})` with kinds `event_registration | donation | member | volunteer | partner | program | contact | admin` (`src/types/cms.ts:167-175`). Existing workflows already persist here.
- **No workflow queue table.** `admin_notifications` (`src/lib/notifications.ts:45-61`) is a flat notification list, not a managed queue (no status/assignee/notes).
- **Contact form** (`src/app/(public_pages)/contact/actions.ts:22-54`): sends via Resend FIRST, then persists person inside a `try/catch`. If Resend throws, **no record is created at all**. No consent, no auto-reply, no queue item.
- **Get-involved** (`get-involved/page.tsx` → `applyAsPerson`, `src/actions/people.ts:307-383`): persists person + record, sends Google-forms-link email, admin alert, notification. No consent, no queue item. Donation branch opens Paystack with client-generated ref (`BMAC-${random}`, `get-involved/page.tsx:124`) and only shows "Payment Initiated" — no polling, no ticket.
- **Event detail public page** (`src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx:42-107`): free → `registerForFreeEvent` (no capacity, no email, no consent, no pass); paid → Paystack with client ref, `source_type: "event_registration"`, and the callback just flips `isReserved` — **no verification, no ticket, fake "BMAC-2026-XXX" entry ID** (`:282`).
- **Webhook** (`src/app/api/webhooks/paystack/route.ts`): HMAC-verified `charge.success`, dedupes by reference, creates `paystack_payments`, branches only `donation` vs "everything else as `event_registration`" (`:64-81`). Paid ticket verification must be added here — never trust the client callback.
- **Events table** (`events`): `id, date, title, venue, time, category, description, long_desc, is_paid, price, features, status, created_at, updated_at`. No capacity, no deadline, no registration controls.
- **Permissions** (BMAC-10 done): 16 module perms in `Permission` (`src/types/cms.ts:94-110`), `PERMISSION_LABELS`/`ALL_PERMISSION_KEYS`/`ROLE_DEFAULT_PERMISSIONS` (`src/lib/auth/permissions.ts`), `ALL_PERMISSIONS` (`src/lib/auth/super-admin.ts:7-12`), client nav + `routePermissions` (`src/components/admin/AdminLayout.tsx:41-98`). PRD §9 needs `manage_workflows` and `check_in_attendees` — not present yet.
- **Email**: `email.ts` posts `{type, ...vars}` to `EMAIL_SERVICE_URL/send` with `x-api-key` (`src/lib/email.ts:6-25`). Templates live in `DEFAULT_EMAIL_TEMPLATES` + `EmailTemplateKey` union (`src/lib/email-templates.ts:7-16,96`); migration 008 added DB-backed `site_settings.email_templates` jsonb. **The Express email service (`bmac-express-server`, separate repo) renders templates and must know any new `type`** — external dependency.
- **Paystack init**: `loadPaystack()` (`src/lib/paystack.ts`) loads `https://js.paystack.co/v1/inline.js`; keys in `.env` (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`). `NEXT_PUBLIC_APP_URL=https://bmac-next.vercel.app/` (trailing slash — strip when building URLs).
- **DB driver**: `@neondatabase/serverless` HTTP driver (`src/lib/db.ts`) — **no SQL transactions** (`sql.begin` unavailable). Use single atomic conditional statements for capacity checks.
- **No QR library** in `package.json`; **no camera scanner** dependency. `vitest` v4 + RTL, `vi.mock("@/lib/...")` pattern (`src/__tests__/PaystackWebhook.test.tsx:10-20`).
- Existing admin table pattern: `src/app/admin/(admin)/events/page.tsx` (server page, `requirePage`, `db.getAll`, client `EventTable`). Event form: `src/components/admin/EventForm.tsx`. Dashboard: `src/app/admin/(admin)/page.tsx`.

---

## Design Decisions

1. **`workflow_records` = the admin queue; `person_records` stays as the people-linked history.** Every public submission writes BOTH: `person_records` (existing People module history, no regression) and `workflow_records` (queue item with status/assignee/priority/notes/outcome). `workflow_records.ref_id` points at the `person_records.id` (or payment/ticket id).
2. **Queue statuses**: `open | in_progress | resolved | closed`. Auto-confirmed flows (free event registration, donation) still write a record but with status `resolved` + outcome (audit trail); the queue's default view filters to `open/in_progress`. Contact, applications, tickets pending verification → `open`.
3. **Consent stored on `people.consent` (jsonb) + mirrored into the `person_records.meta`** of each submission. A shared `recordConsent` helper stamps `{marketing, contact, privacy, acceptedAt, source, ip}`. Forms REQUIRE the privacy checkbox (hard error otherwise); marketing opt-in is optional. Minor-sensitive note: consent is personal data — do not log full values.
4. **Capacity = atomic conditional UPDATE** (HTTP driver has no transactions):
   `UPDATE events SET capacity_used = capacity_used + $1 WHERE id = $2 AND (capacity IS NULL OR capacity_used + $1 <= capacity) RETURNING capacity_used;`
   Zero rows → sold out. Free registration and paid verification both reserve capacity exactly once (paid reserves at order creation, confirmed on webhook).
5. **Paid tickets = `event_tickets` rows, verified ONLY by webhook.** Checkout action creates a `pending` ticket + server-generated reference + `qr_token`, returns `{reference, amountKobo, ticketId}`; client opens Paystack with that reference + `metadata.source_type: "event_ticket"`, `metadata.ticket_id`. Webhook marks `confirmed`, increments capacity, emails the pass. Client callback only polls status — never confirms (PRD §9 Security).
6. **One pass per ticket** (`qr_token` = `crypto.randomBytes(24).toString("base64url")`, unique). Pass URL: `${NEXT_PUBLIC_APP_URL.replace(/\/+$/,"")}/pass/${qr_token}`. Public route, token acts as capability (no auth). QR rendered server-side with `qrcode` pkg → data URL.
7. **Check-in**: admin page gated by new `check_in_attendees` permission; `html5-qrcode` for mobile camera scan + manual token/reference/email search fallback (PRD "manual search fallback" is an AC). `checkInTicket` is idempotent: second scan returns already-checked-in state, never errors the flow.
8. **Email**: add template keys to the `EmailTemplateKey` union + defaults + labels in this repo; add admin template editor writing `site_settings.email_templates`; new `email.ts` senders use the same `sendRequest` contract. **External dependency:** the Express email service catalog must accept the new types — if it 4xx's on unknown type, log and continue (registration/payment must not fail because email failed). Coordinated update to `bmac-express-server` is out of this repo's scope but must be tracked in the Jira comment.
9. **Two new permissions**: `manage_workflows` (queue pages + actions) and `check_in_attendees` (check-in page + action). Added to `Permission` union, `PERMISSION_LABELS`, `ALL_PERMISSIONS`, nav, `routePermissions`, and role defaults (administrator gets both; moderator gets `manage_workflows`). Super admin implicit-all already covers the owner (`src/lib/auth/server.ts:45`).
10. **Deployments**: migrations are idempotent (mirror `scripts/migrations/008-*.sql`); applied via Neon on deploy. Story order = dependency order (BMAC-11 model first, BMAC-20 check-in last).

---

## Data Model

### Migration `scripts/migrations/009-workflow-records-consent.sql` (BMAC-11/12/13)

```sql
CREATE TABLE IF NOT EXISTS public.workflow_records (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'contact',
  ref_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assignee_email text NOT NULL DEFAULT '',
  submitter_name text NOT NULL DEFAULT '',
  submitter_email text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  outcome text NOT NULL DEFAULT '',
  last_contacted_at timestamptz,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS workflow_records_status_idx ON public.workflow_records (status);
CREATE INDEX IF NOT EXISTS workflow_records_kind_status_idx ON public.workflow_records (kind, status);
CREATE INDEX IF NOT EXISTS workflow_records_created_idx ON public.workflow_records (created_at DESC);
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS consent jsonb NOT NULL DEFAULT '{}'::jsonb;
```

### Migration `scripts/migrations/010-event-operations.sql` (BMAC-16/17)

```sql
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS capacity_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registration_deadline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS max_per_person integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS allow_public_registration boolean NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS reminders_enabled boolean NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.event_tickets (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  event_id text NOT NULL,
  person_id text NOT NULL,
  payer_name text NOT NULL DEFAULT '',
  payer_email text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'pending',
  qr_token text UNIQUE,
  checked_in boolean NOT NULL DEFAULT FALSE,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_tickets_event_idx ON public.event_tickets (event_id);
CREATE INDEX IF NOT EXISTS event_tickets_person_idx ON public.event_tickets (person_id);
CREATE INDEX IF NOT EXISTS event_tickets_status_idx ON public.event_tickets (status);
```

### New types (`src/types/cms.ts`)

```ts
export type WorkflowStatus = "open" | "in_progress" | "resolved" | "closed";
export type WorkflowKind = "contact" | "member" | "volunteer" | "partner" | "program" | "event_registration" | "donation" | "ticket";
export type WorkflowPriority = "low" | "normal" | "high" | "urgent";
export interface WorkflowRecord {
  id: string; kind: WorkflowKind; refId: string; title: string; summary: string;
  status: WorkflowStatus; priority: WorkflowPriority; assigneeEmail: string;
  submitterName: string; submitterEmail: string; source: string;
  details: Record<string, unknown>; outcome: string;
  lastContactedAt?: string; dueAt?: string; createdAt: string; updatedAt: string; resolvedAt?: string;
}
export type TicketStatus = "pending" | "confirmed" | "cancelled" | "refunded";
export interface EventTicket {
  id: string; reference: string; eventId: string; personId: string;
  payerName: string; payerEmail: string; quantity: number; amount: number; currency: string;
  status: TicketStatus; qrToken?: string; checkedIn: boolean; checkedInAt?: string;
  createdAt: string; updatedAt: string;
}
export interface ConsentRecord {
  marketing?: boolean; contact?: boolean; privacy?: boolean;
  acceptedAt: string; source: string; ip?: string;
}
```

`EventPass` gains: `capacity?: number; capacityUsed?: number; registrationDeadline?: string; maxPerPerson?: number; allowPublicRegistration?: boolean; remindersEnabled?: boolean;` and `Permission` gains `"manage_workflows" | "check_in_attendees"`.

---

## Patterns to Follow

### DB read/write + guarded server page
```
// SOURCE: src/app/admin/(admin)/events/page.tsx:1-8
import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
export default async function EventsPage() {
  await requirePage("manage_events");
  const items = await db.getAll<any>("events").catch(() => []);
  return <EventTable initialData={items} />;
}
```
Every new admin page mirrors this (swap permission + table/component).

### Admin action with permission + activity log
```
// SOURCE: src/actions/crud.ts:7-16
export async function createItem(table: string, data: Record<string, unknown>) {
  const admin = await requireAdmin();
  const result = await db.create(table, data);
  await logActivity(admin.email, "create", table, { resourceId: result?.id as string, details: ... });
  return result;
}
```

### Person linking + record (reuse for registrations/applications)
```
// SOURCE: src/actions/people.ts:270-279 (registerForFreeEvent)
const person = await findOrCreatePerson({ firstName: opts.name, email: opts.email });
await ensurePersonRoles(person.id, ["attendee"]);
await upsertPersonRecord(person.id, "event_registration", { refId: opts.eventId, refTitle: opts.eventTitle, status: "confirmed" });
```

### Paystack verification (extend, don't break donation)
```
// SOURCE: src/app/api/webhooks/paystack/route.ts:17-24 (HMAC), 32-40 (dedupe)
if (event.event === "charge.success") { ...dedupe by reference... await db.create("paystack_payments", {...}); }
```
New branch: `if (metadata?.source_type === "event_ticket") { ...confirmTicketByPayment(...) }` — keep the donation branch untouched.

### Email sender (server action → email service)
```
// SOURCE: src/lib/email.ts:6-25
async function sendRequest(body: Record<string, unknown>): Promise<{ error?: string }> { ...fetch(`${SERVICE_URL}/send`, {headers: {"x-api-key": API_KEY}, ...}) }
```
New senders follow this shape: `sendRegistrationConfirmation(opts) => sendRequest({type: "registration-confirmed", ...})`.

### Tests (mock `@/` modules, direct route import)
```
// SOURCE: src/__tests__/PaystackWebhook.test.tsx:10-20,33-44
vi.mock("@/lib/db", () => ({ db: { query: (...a) => mockQuery(...a), create: (...a) => mockCreate(...a) } }));
const { POST } = await import("@/app/api/webhooks/paystack/route");
```

### Admin table component
```
// SOURCE: src/components/admin/EventTable.tsx:11-53
const [items, setItems] = useState(initialData.map(normalize));
const [search, setSearch] = useState("");
const filtered = search ? items.filter(...) : items;
```
Mirror for `WorkflowQueue`/registrant tables.

---

## Files to Change (overview)

| File | Action | Story |
|------|--------|-------|
| `scripts/migrations/009-workflow-records-consent.sql` | CREATE | 11/12/13 |
| `scripts/migrations/010-event-operations.sql` | CREATE | 16/17 |
| `src/types/cms.ts` | UPDATE | all |
| `src/lib/workflows.ts` | CREATE | 11/14 |
| `src/lib/consent.ts` | CREATE | 13 |
| `src/lib/tickets.ts` | CREATE | 17/18/19/20 |
| `src/actions/workflows.ts` | CREATE | 14 |
| `src/actions/events.ts` | CREATE | 16/17/20 |
| `src/actions/tickets.ts` | CREATE | 18/19/20 |
| `src/actions/people.ts` | UPDATE | 12/13/17 |
| `src/actions/email-admin.ts` | CREATE | 15 |
| `src/lib/email.ts` | UPDATE | 15 |
| `src/lib/email-templates.ts` | UPDATE | 15 |
| `src/app/api/webhooks/paystack/route.ts` | UPDATE | 18 |
| `src/lib/auth/permissions.ts` | UPDATE | 14/20 |
| `src/lib/auth/super-admin.ts` | UPDATE | 14/20 |
| `src/components/admin/AdminLayout.tsx` | UPDATE | 14/20 |
| `src/components/admin/WorkflowQueue.tsx` | CREATE | 14 |
| `src/components/admin/WorkflowDetail.tsx` | CREATE | 14 |
| `src/app/admin/(admin)/workflow/page.tsx` | CREATE | 14 |
| `src/app/admin/(admin)/workflow/[id]/page.tsx` | CREATE | 14 |
| `src/components/admin/EmailTemplateManager.tsx` | CREATE | 15 |
| `src/app/admin/(admin)/settings/page.tsx` | UPDATE | 15 |
| `src/components/admin/EventForm.tsx` | UPDATE | 16 |
| `src/components/admin/EventAdminDetail.tsx` | CREATE | 16 |
| `src/app/admin/(admin)/events/[id]/page.tsx` | CREATE | 16 |
| `src/components/ConsentCheckbox.tsx` | CREATE | 13 |
| `src/app/(public_pages)/contact/actions.ts` | UPDATE | 12/13 |
| `src/app/(public_pages)/contact/page.tsx` | UPDATE | 13 |
| `src/app/(public_pages)/get-involved/page.tsx` | UPDATE | 13/18 |
| `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | UPDATE | 17/18 |
| `src/app/(public_pages)/pass/[token]/page.tsx` | CREATE | 19 |
| `src/components/admin/CheckInScanner.tsx` | CREATE | 20 |
| `src/app/admin/(admin)/checkin/page.tsx` | CREATE | 20 |
| `src/app/(public_pages)/privacy/page.tsx` | CREATE | 13 |
| `package.json` | UPDATE | 19/20 (`qrcode`, `html5-qrcode`) |

---

## Tasks

Execute in story order. Each task atomic + verifiable.

### STORY BMAC-11 — Workflow record data model

**Task 1: Migration + types + workflows lib**
- **File**: `scripts/migrations/009-workflow-records-consent.sql` (CREATE), `src/types/cms.ts` (UPDATE), `src/lib/workflows.ts` (CREATE)
- **Action**: CREATE x2, UPDATE x1
- **Implement**: migration above (workflow_records + people.consent). Add `WorkflowStatus/Kind/Priority`, `WorkflowRecord`, `ConsentRecord`, `TicketStatus`, `EventTicket`, and `EventPass` ops fields + `Permission` additions to `cms.ts`. Create `src/lib/workflows.ts`:
  - `createWorkflowRecord(input): Promise<WorkflowRecord | null>` — `db.create("workflow_records", {id: `wf-${crypto.randomUUID()}`, ...})` (mirror `upsertPersonRecord` shape in `src/actions/people.ts:191-208`).
  - `listWorkflows({kind?, status?, search?, limit?})` — `db.query` with `WHERE` filters + `ORDER BY created_at DESC`, ILIKE search on `title/summary/submitter_email`.
  - `getWorkflow(id)`, `updateWorkflow(id, patch)`, `countOpenWorkflows()`, `resolveWorkflow(id, outcome)`.
  - All return `null`/`[]` on error (mirror `src/actions/people.ts:202-208` catch style).
- **Mirror**: `src/lib/notifications.ts:45-61` (create helper w/ uuid), `src/actions/people.ts:191-208`
- **Validate**: `pnpm run build`

### STORY BMAC-12 — Persisted public workflows (contact + get-involved + event registration + donation)

**Task 2: Wire workflow_records into every public submission**
- **File**: `src/app/(public_pages)/contact/actions.ts`, `src/actions/people.ts`, `src/lib/workflows.ts`
- **Action**: UPDATE x2
- **Implement**:
  - `contact/actions.ts`: persist FIRST (person → `person_records` kind `contact` status `received` → `createWorkflowRecord` kind `contact`, `open`, `source: "/contact"`, details `{message, phone}`), THEN attempt Resend. Email failure must not lose the record — only surface an error if DB persist also failed. Wrap Resend in its own try/catch.
  - `people.ts` `applyAsPerson`: after `upsertPersonRecord`, `createWorkflowRecord` kind from `kindMap`, status `open`, source from `kind`, submitter name/email, details `{notes, formLinkSent}`. Donation remains webhook-driven but add a `donation` workflow record in the webhook branch (Task 8).
  - `people.ts` `registerForFreeEvent` → becomes `registerForEvent` (Task 9) — for now keep signature but add a `resolved` workflow record (kind `event_registration`).
- **Mirror**: `src/actions/people.ts:365-381` (notification pattern), `src/lib/workflows.ts` (Task 1)
- **Validate**: `pnpm run build`; `pnpm test`

### STORY BMAC-13 — Consent & privacy

**Task 3: Consent helpers + UI checkbox + privacy page**
- **File**: `src/lib/consent.ts` (CREATE), `src/components/ConsentCheckbox.tsx` (CREATE), `src/app/(public_pages)/privacy/page.tsx` (CREATE), `src/app/(public_pages)/contact/page.tsx` (UPDATE), `src/app/(public_pages)/get-involved/page.tsx` (UPDATE), `src/actions/people.ts` (UPDATE), `src/app/(public_pages)/contact/actions.ts` (UPDATE)
- **Action**: CREATE x3, UPDATE x4
- **Implement**:
  - `consent.ts`: `recordConsent(personId, {marketing, contact, privacy}, source)` → `UPDATE people SET consent = $2::jsonb WHERE id=$1` + returns bool; `getConsent(personId)`; `requirePrivacyConsent(accepted)` → throws/returns error string if false.
  - `ConsentCheckbox.tsx`: controlled checkbox with privacy statement text + link to `/privacy`; props `{privacy: boolean; marketing?: boolean; onChange}`. Used in contact form, get-involved modal, event registration form.
  - `privacy/page.tsx`: static page (what data is collected, why, retention, how to request deletion → `/admin` handle via People module). Reuse public layout styling of `get-involved/page.tsx`.
  - Contact + get-involved actions: read `privacy`/`marketing` from form; hard error `{error: "Please accept the privacy policy to continue"}` if `privacy !== true`; call `recordConsent(person.id, consent, source)`; stamp `meta.consent` into the person_record (`upsertPersonRecord` meta) and workflow record details.
  - `get-involved/page.tsx` + `contact/page.tsx`: add `ConsentCheckbox` to forms, send `consent` via action args.
- **Mirror**: consent checkbox UI to modal form styling in `get-involved/page.tsx:414-450`
- **Validate**: `pnpm run build`; manual: submit contact with privacy unchecked → error; checked → persisted

### STORY BMAC-14 — Admin workflow queue

**Task 4: `manage_workflows` permission**
- **File**: `src/types/cms.ts`, `src/lib/auth/permissions.ts`, `src/lib/auth/super-admin.ts`, `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE x4
- **Implement**: add `"manage_workflows"` to `Permission` union + `PERMISSION_LABELS` (label "Manage Workflows") + `ALL_PERMISSIONS`. `ROLE_DEFAULT_PERMISSIONS`: administrator += `manage_workflows`; moderator += `manage_workflows`. AdminLayout: new nav group "Operations" with item `{label:"Workflow Queue", href:"/admin/workflow", icon: ClipboardList, permission:"manage_workflows"}`; add `/admin/workflow` to `routePermissions`.
- **Mirror**: `permissions.ts:3-20`, `AdminLayout.tsx:53-70,82-98`
- **Validate**: `pnpm run build`; existing `permissions.test.ts` still passes (label list sync)

**Task 5: Queue pages + actions**
- **File**: `src/actions/workflows.ts` (CREATE), `src/app/admin/(admin)/workflow/page.tsx` (CREATE), `src/app/admin/(admin)/workflow/[id]/page.tsx` (CREATE), `src/components/admin/WorkflowQueue.tsx` (CREATE), `src/components/admin/WorkflowDetail.tsx` (CREATE), `src/app/admin/(admin)/page.tsx` (UPDATE)
- **Action**: CREATE x5, UPDATE x1
- **Implement**:
  - `actions/workflows.ts` (`"use server"`): `listWorkflows(filters)` (requirePermission manage_workflows), `getWorkflowDetail(id)`, `updateWorkflowStatus(id, {status, priority?, assigneeEmail?, outcome?, note?})` → `requirePermission("manage_workflows")` + `db` update + `logActivity` (mirror `crud.ts:18-27`) + append `{by, at, note}` to `details.history` array; `setLastContacted(id)`.
  - Queue page: server page with `await requirePage("manage_workflows")`, kind/status filter chips, search, open-count badges. Client `WorkflowQueue` mirrors `EventTable` (search + table + status badges).
  - Detail page `/admin/workflow/[id]`: server page `requirePage` → loads record + linked person + `person_records` (via `getPerson`) → client `WorkflowDetail` (status/priority/assignee select, notes, outcome, last-contacted button, link to person page).
  - Dashboard: add "Open Workflow Items" stat card (count via `countOpenWorkflows`) next to existing stats.
- **Mirror**: `src/app/admin/(admin)/events/page.tsx`, `EventTable.tsx`, `src/actions/crud.ts`
- **Validate**: `pnpm run build`; `pnpm test`

### STORY BMAC-15 — Transactional email

**Task 6: Template keys + defaults + senders**
- **File**: `src/lib/email-templates.ts` (UPDATE), `src/lib/email.ts` (UPDATE)
- **Action**: UPDATE x2
- **Implement**:
  - Extend `EmailTemplateKey` union with: `"contact-autoreply"`, `"registration-confirmed"`, `"ticket-receipt"`, `"application-status"`, `"event-reminder"`. Add `EMAIL_TEMPLATE_LABELS` entries and `DEFAULT_EMAIL_TEMPLATES` (use the existing `shell()` builder; ticket-receipt includes `{{passUrl}}` CTA).
  - `email.ts`: add `sendContactAcknowledgement`, `sendRegistrationConfirmation({email, firstName, eventTitle, date, venue, passUrl})`, `sendTicketReceipt({email, firstName, eventTitle, reference, passUrl})`, `sendApplicationStatusUpdate({email, firstName, kindLabel, status, note})`, `sendEventReminder({email, firstName, eventTitle, date, venue})`. All via `sendRequest({type: ..., ...})`.
- **Mirror**: `email.ts:27-99`, `email-templates.ts:96-217`
- **Validate**: `pnpm run build`

**Task 7: Admin email template editor**
- **File**: `src/actions/email-admin.ts` (CREATE), `src/components/admin/EmailTemplateManager.tsx` (CREATE), `src/app/admin/(admin)/settings/page.tsx` (UPDATE)
- **Action**: CREATE x2, UPDATE x1
- **Implement**:
  - `email-admin.ts`: `getEmailTemplates()` → merge `site_settings.email_templates` over `DEFAULT_EMAIL_TEMPLATES` (requirePermission `access_settings`); `saveEmailTemplate(key, {subject, html, text})` → `UPDATE site_settings SET email_templates = jsonb_set(...)`; `resetEmailTemplate(key)` → `jsonb_set(..., '{}')` (falls back to default). `logActivity` on save.
  - `EmailTemplateManager.tsx`: client list of template keys, expand to edit subject + text + html (textarea), Save / Reset buttons. Uses `useToast`.
  - Settings page: mount `<EmailTemplateManager />` in a new section (mirror how other settings sections render).
- **Mirror**: `src/actions/people.ts:356-362` (jsonb_set update pattern), settings page structure
- **Validate**: `pnpm run build`; note in Jira: extend `bmac-express-server` template catalog for the 5 new types in parallel (out of repo scope).

### STORY BMAC-16 — Event operations (admin)

**Task 8: Event ops migration + form + admin detail**
- **File**: `scripts/migrations/010-event-operations.sql` (CREATE), `src/components/admin/EventForm.tsx` (UPDATE), `src/components/admin/EventAdminDetail.tsx` (CREATE), `src/app/admin/(admin)/events/[id]/page.tsx` (CREATE), `src/actions/events.ts` (CREATE), `src/components/admin/EventTable.tsx` (UPDATE)
- **Action**: CREATE x4, UPDATE x2
- **Implement**:
  - Run migration 010 (events ops columns + event_tickets table).
  - `EventForm`: add Capacity, Registration deadline (date input), Max per person, `allow_public_registration` toggle, `reminders_enabled` toggle; keep existing fields. Wire into the existing create/update path.
  - `actions/events.ts`: `getEventAdminDetail(eventId)` → event + ticket counts (`SELECT status, COUNT(*) FROM event_tickets WHERE event_id=$1 GROUP BY status`), `listRegistrants(eventId)` (join event_tickets + people), `exportEventRegistrants(eventId)` (require `export_data`), `setCapacityUsedOverride(eventId, n)` (admin correction), `sendEventReminders(eventId)` → `sendEventReminder` to all confirmed ticket emails (require `manage_events`).
  - EventAdminDetail.tsx: capacity progress bar (capacity_used/capacity), stat chips (registered / confirmed / checked-in / revenue), registrant table with check-in toggle + "Export CSV" (gated `export_data`), "Send Reminders" button. New `/admin/events/[id]` page (`requirePage("manage_events")`).
  - `EventTable`: add link icon to the new detail page per row.
- **Mirror**: `EventForm.tsx`, `EventTable.tsx`, `src/actions/crud.ts`
- **Validate**: `pnpm run build`; `pnpm test`

### STORY BMAC-17 — Public registration (free, capacity-aware)

**Task 9: Ticket lib + free registration action**
- **File**: `src/lib/tickets.ts` (CREATE), `src/actions/events.ts` (UPDATE), `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` (UPDATE), `src/actions/people.ts` (UPDATE)
- **Action**: CREATE x1, UPDATE x3
- **Implement**:
  - `tickets.ts`: `genReference()` (`BMAC-EVT-${base36}`), `genQrToken()` (`crypto.randomBytes(24).toString("base64url")`), `createTicket({eventId, personId, payerName, payerEmail, quantity, amount, currency})` (status `pending`, qr_token set), `reserveCapacity(eventId, n)` (atomic conditional UPDATE, returns capacity_used or null if full), `releaseCapacity(eventId, n)`.
  - `registerForEvent(eventId, {name, email, phone, consent, source})` in `actions/events.ts`: validate consent + email; `reserveCapacity`; on full → `{error: "This event is sold out"}`; create person + `attendee` role + person_record `event_registration` confirmed + `createTicket` status `confirmed` + `createWorkflowRecord` resolved + `sendRegistrationConfirmation` (best-effort) → return `{ passUrl, reference }`.
  - Deprecate `registerForFreeEvent` in `people.ts` (route callers to new action; keep export for tests).
  - `EventDetailClient`: free branch calls `registerForEvent`; success shows real pass link instead of fake entry ID (`:280-283`).
- **Mirror**: `src/actions/people.ts:261-279` (registration), capacity UPDATE pattern in Design Decision #4
- **Validate**: `pnpm run build`; `pnpm test`

### STORY BMAC-18 — Paid tickets (Paystack verified)

**Task 10: Order creation + webhook confirm**
- **File**: `src/actions/tickets.ts` (CREATE), `src/app/api/webhooks/paystack/route.ts` (UPDATE), `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` (UPDATE), `src/app/(public_pages)/get-involved/page.tsx` (UPDATE)
- **Action**: CREATE x1, UPDATE x3
- **Implement**:
  - `actions/tickets.ts`: `createTicketOrder(eventId, {name, email, phone, quantity, consent})` → validate consent/capacity (`reserveCapacity(qty)`), create person + `attendee` role + person_record `event_registration` pending + `createTicket` status `pending` + workflow record `ticket` open → return `{reference, amountKobo: price*qty*100, ticketId}`. `getTicketStatus(reference)` (for client poll), `cancelTicket(ticketId)` (release capacity, workflow record closed).
  - Webhook: in `charge.success`, if `metadata.source_type === "event_ticket"` → find `event_tickets` by `metadata.ticket_id` OR `reference`; if missing/`confirmed`, return early (`already_processed`); mark `confirmed`, `logActivity`, `sendTicketReceipt` (with passUrl), `createAdminNotification`, resolve workflow record (kind `ticket`). **Do not double-increment capacity** (capacity reserved at order creation). Keep donation branch intact. Add `quantity` handling: capacity reserved as quantity, amount = unit price × qty.
  - `EventDetailClient` paid branch: call `createTicketOrder`, then `loadPaystack().setup` with the **server reference** + `metadata.source_type: "event_ticket"`, `metadata.ticket_id`, `metadata.payer_name`; on `callback` → poll `getTicketStatus` until confirmed → show pass link; on `onClose` → show "verifying" note (never confirm client-side).
  - `get-involved/page.tsx`: replace client-random donation ref with server-issued ref only if donation orders are routed through the same helper (optional for this story; minimum: keep ref but log — donation already verified server-side by webhook).
- **Mirror**: `route.ts:28-120` (webhook shape), `src/lib/paystack.ts`
- **Validate**: `pnpm run build`; `pnpm test` (add webhook event_ticket cases to `PaystackWebhook.test.tsx`)

### STORY BMAC-19 — QR passes

**Task 11: Pass route + QR rendering**
- **File**: `package.json` (UPDATE), `src/app/(public_pages)/pass/[token]/page.tsx` (CREATE), `src/app/(public_pages)/pass/[token]/PassClient.tsx` (CREATE), `src/lib/tickets.ts` (UPDATE)
- **Action**: UPDATE x1, CREATE x2
- **Implement**:
  - Add deps: `qrcode` + `@types/qrcode`.
  - `pass/[token]/page.tsx`: server component — `db` lookup `event_tickets WHERE qr_token = $1`; join event title/date/venue; if not found → not-found UI; if `status !== "confirmed"` → "Pass inactive" UI. Generate QR data URL server-side: `import QRCode from "qrcode"; QRCode.toDataURL(passUrl)` where `passUrl = ${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/,"")}/pass/${token}`. Render `PassClient` with ticket + QR img.
  - `PassClient.tsx`: mobile-friendly pass card (attendee name, event, date/venue, QR image, reference, status badge), "Add to calendar" optional.
  - `tickets.ts`: `getTicketByToken(token)` helper.
  - Wire `passUrl` into ticket-receipt email + registration-confirmed email (already templated in Task 6).
- **Mirror**: `src/app/(public_pages)/news/events/[id]/page.tsx` (page structure)
- **Validate**: `pnpm run build`; manual: register free event → open pass URL → QR renders

### STORY BMAC-20 — Mobile check-in

**Task 12: `check_in_attendees` permission + check-in action**
- **File**: `src/types/cms.ts`, `src/lib/auth/permissions.ts`, `src/lib/auth/super-admin.ts`, `src/components/admin/AdminLayout.tsx`, `src/actions/events.ts` (UPDATE), `src/lib/tickets.ts` (UPDATE)
- **Action**: UPDATE x5
- **Implement**: add `"check_in_attendees"` to union + labels + `ALL_PERMISSIONS`; administrator += `check_in_attendees`. AdminLayout: add `{label:"Check-In", href:"/admin/checkin", icon: QrCode, permission:"check_in_attendees"}` to Operations group + `routePermissions["/admin/checkin"]`.
  - `tickets.ts`: `checkInTicket({token? | reference? | email?})` — resolve ticket (by token/reference, or latest confirmed for email), validate `status === "confirmed"`; if already `checked_in` return `{alreadyCheckedIn: true, checkedInAt, attendeeName, eventTitle}`; else atomic `UPDATE event_tickets SET checked_in=TRUE, checked_in_at=now() WHERE id=$1 AND checked_in=FALSE RETURNING ...` (idempotent), `logActivity(adminEmail, "check_in", "event_tickets", {...})`, return `{checkedIn: true, checkedInAt, attendeeName, eventTitle}`.
- **Mirror**: `src/lib/auth/permissions.ts:3-35`, `AdminLayout.tsx:53-70`
- **Validate**: `pnpm run build`

**Task 13: Check-in page + scanner**
- **File**: `package.json` (UPDATE), `src/app/admin/(admin)/checkin/page.tsx` (CREATE), `src/components/admin/CheckInScanner.tsx` (CREATE)
- **Action**: UPDATE x1, CREATE x2
- **Implement**: add dep `html5-qrcode`. Page: `await requirePage("check_in_attendees")` → `<CheckInScanner />`. `CheckInScanner.tsx` ("use client"):
  - Camera scan via `Html5Qrcode` (`Html5Qrcode.getCameras()` → `start(..., {fps:10, qrbox:{width:220,height:220}}, onScan)`; stop on result).
  - Manual fallback: text input (accepts token, reference, or email) + Search → calls `checkInTicket`.
  - Result card: green check / "already checked in (time)" / red (invalid) + attendee name + event title. Auto-clears after a few seconds (successive scans).
  - Mobile-friendly layout (large touch targets), mirrors admin card styling.
- **Mirror**: `src/components/admin/EventTable.tsx` (client table pattern), admin card styling
- **Validate**: `pnpm run build`; `pnpm test` (check-in action unit test: confirm → checked-in → second call alreadyCheckedIn)

---

## Validation

```bash
# Type check
pnpm run build

# Lint
pnpm run lint

# Tests
pnpm test

# Manual smoke (local, dev server running)
# 1. /contact submit w/o consent -> error; with consent -> workflow record in /admin/workflow (open)
# 2. /get-involved join -> workflow record + google-forms-link email path
# 3. Create event w/ capacity 2 -> register 2 free (confirmed, passUrl) -> 3rd -> sold out
# 4. Paid event -> create order -> Paystack test card (408 408 408 408) -> webhook -> ticket confirmed, capacity_used=1, pass email
# 5. /pass/<token> renders QR
# 6. /admin/checkin scan token -> checked in; rescan -> alreadyCheckedIn

# Migrations (idempotent, run on deploy)
#   apply 009 then 010; re-apply to confirm IF NOT EXISTS no-ops
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| Express email service rejects new template `type`s | Graceful: log + continue on send error; registration/payment never depend on email success. Tracked Jira comment to extend `bmac-express-server` catalog in parallel |
| No SQL transactions on Neon HTTP driver → capacity overbooking | Atomic conditional `UPDATE ... AND capacity_used + $1 <= capacity RETURNING`; test sold-out path |
| Webhook change breaks existing donation flow | Keep donation branch untouched; add `event_ticket` branch only; extend webhook tests before/after |
| Client-side Paystack callback trusted → unpaid tickets | Callback only polls server status; server marks confirmed exclusively via signed webhook (PRD §9) |
| New `qrcode`/`html5-qrcode` deps (native none) | Pure JS packages; `qrcode` renders server-side (no browser canvas), `html5-qrcode` lazily loaded only on check-in page |
| Camera fails in venue (dark/no camera) | Manual token/reference/email search is a first-class path + AC |
| Permissions additions miss a surface (nav, route map, labels, role defaults) | One task (Task 4 / Task 12) touches all four; `permissions.test.ts` asserts label/key sync |
| Duplicate people records | `findOrCreatePerson` matches by email/phone/name first (existing behavior); check-in resolves via ticket token primarily |
| Stale `capacity_used` on refunds/cancels | `cancelTicket` releases capacity; admin override action for corrections |

---

## Acceptance Criteria

- [x] BMAC-11: `workflow_records` + `people.consent` migration applied; types + lib exist; build passes
- [x] BMAC-12: contact/get-involved/event-registration/donation all create durable workflow records; contact record persists even when email fails
- [x] BMAC-13: privacy checkbox required on contact + get-involved + event forms; consent stored on person + record meta; `/privacy` page exists
- [x] BMAC-14: `/admin/workflow` queue with status/kind filters, assignee, notes, outcome, open counts on dashboard; gated by `manage_workflows` server-side
- [x] BMAC-15: 5 new template keys + defaults + senders; admin template editor on Settings persists to `site_settings.email_templates`
- [x] BMAC-16: event ops fields (capacity, deadline, max per person, public toggle) editable; `/admin/events/[id]` shows capacity, registrants, checked-in, revenue; attendee CSV export gated `export_data`
- [x] BMAC-17: free registration capacity-aware, confirmed instantly, issues pass link + confirmation email
- [x] BMAC-18: paid ticket confirmed only after signed webhook; dedupe by reference; capacity increments once; ticket-receipt email includes pass link
- [x] BMAC-19: `/pass/<token>` renders scannable QR; inactive/cancelled passes show non-scannable state
- [x] BMAC-20: `/admin/checkin` scans QR + manual search; second scan returns already-checked-in; gated by `check_in_attendees`
- [ ] All builds/lints/tests pass; migrations idempotent; existing donation + free-registration tests still green
