# Plan: Security Audit Remediation — bmac-next

## Summary

Close all findings from the full appsec audit: add auth guards to every unauthenticated exported server action (forms, waitlist, emails, analytics, people helpers, logActivity, sendToRows), fix the pay-less ticket/program bypass by cross-checking Paystack webhook amounts against stored order amounts, allowlist table names in the DB layer, add security headers, and apply rate limiting to all unguarded public endpoints. No schema changes required except optional columns already covered by existing JSON `meta` fields.

## User Story

As the site owner
I want every privileged server action authenticated and every payment amount verified server-side
So that attackers cannot dump PII, send phishing emails from our domain, buy tickets at ₦1, or forge/spam our data.

## Metadata

| Field | Value |
|-------|-------|
| Type | BUG_FIX (security hardening) |
| Complexity | HIGH |
| Systems Affected | server actions, payments/webhook, db layer, proxy/config, public API routes |
| Jira Issue | N/A |

---

## Patterns to Follow

### Auth guard (the pattern to add everywhere)
```
// SOURCE: src/actions/settings.ts:18-22
export async function getSiteSettings() {
  await requireAdmin();
  ...
}
```

### Fine-grained permission guard
```
// SOURCE: src/app/api/admin/stats/route.ts:6-12
try {
  await requirePermission("view_analytics");
} catch {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Rate limiting / spam guard
```
// SOURCE: src/lib/spam-guard.ts:43-52 + src/actions/programs.ts:331-334
const guard = await assertSafe("application-status", raw, await getClientIp());
if (guard.error) return { error: guard.error };
await recordSubmission("application-status", raw, await getClientIp());
```

### Donation amount tolerance check (mirror for tickets/programs)
```
// SOURCE: src/lib/paystack-confirm.ts:238-258
const expectedMeta = ...;
if (expectedMeta && expectedMeta.amount != null) {
  const webhookAmount = Number(amount || 0);
  const expectedAmount = Number(expectedMeta.amount) * 100;
  const tolerance = Math.max(Math.round(expectedAmount * 0.01), 1);
  if (Math.abs(webhookAmount - expectedAmount) > tolerance) {
    // create admin notification "amount mismatch", log, abort confirmation
  }
}
```

### Error handling in actions
```
// SOURCE: src/actions/tickets.ts:110-113
} catch (err) {
  console.error("createTicketOrder error:", err);
  return { error: "Something went wrong. Try again." };
}
```

### Tests
```
// SOURCE: src/__tests__/markdown.test.ts
// vitest, describe/it/expect from "vitest"
import { describe, it, expect } from "vitest";
```

**Permission names available** (`src/lib/auth/super-admin.ts:7-13`): `manage_news, manage_events, manage_programs, manage_gallery, manage_team, manage_testimonials, manage_categories, manage_partners, manage_stats, manage_payments, manage_people, manage_logs, manage_users, access_settings, export_data, view_analytics, manage_workflows, check_in_attendees, manage_newsletter`.

**Key rule**: every file with `"use server"` at top — ALL exports are publicly invokable HTTP endpoints. Helpers must live in non-`"use server"` modules or be non-exported.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/activity-log.ts` | CREATE | internal-only logActivity (no "use server") |
| `src/lib/people-core.ts` | CREATE | findOrCreatePerson/ensurePersonRoles/upsertPersonRecord moved out of "use server" scope |
| `src/lib/newsletter-broadcast.ts` | CREATE | sendToRows + flushScheduledBroadcasts internals |
| `src/lib/payments-verify.ts` | CREATE | shared amount-tolerance verifier for ticket + program webhooks |
| `src/actions/forms.ts` | UPDATE | requireAdmin on 5 admin exports; re-point genId/helpers |
| `src/actions/waitlist.ts` | UPDATE | requireAdmin on list/promote/remove |
| `src/actions/emails.ts` | UPDATE | requireAdmin on all 6 exports |
| `src/actions/analytics.ts` | UPDATE | requirePermission("view_analytics") on all 12 exports |
| `src/actions/people.ts` | UPDATE | stop exporting helpers; delegate to lib/people-core.ts |
| `src/actions/activity-logs.ts` | UPDATE | logActivity → re-export from lib; keep clearActivityLogs guarded |
| `src/actions/newsletter-admin.ts` | UPDATE | guard sendToRows; move broadcast flush to lib |
| `src/actions/tickets.ts` | UPDATE | cancelTicket ownership check; rate limit getTicketStatus/verifyTicketPayment; store total amountKobo in ticket meta |
| `src/actions/events.ts` | UPDATE | assertSafe+recordSubmission in registerForEvent |
| `src/actions/programs.ts` | UPDATE | assertSafe+recordSubmission in submitApplication & createProgramOrder |
| `src/lib/db.ts` | UPDATE | TABLE allowlist validation for identifier interpolation |
| `src/actions/crud.ts` | UPDATE | pass through allowlist check (defense at db layer is primary) |
| `src/lib/paystack-confirm.ts` | UPDATE | amount cross-check in event_ticket branch; program branch uses paystack_payments.expected meta |
| `src/app/(public_pages)/events/[id]/EventDetailClient.tsx` | UPDATE | line ~172: always trust server-returned order.amountKobo, drop client fallback `(event.price||0)*100` |
| `src/proxy.ts` | UPDATE | verify session TTL in edge cookie check |
| `next.config.ts` | UPDATE | security headers block |
| `src/app/(public_pages)/contact/actions.ts` | UPDATE | honeypot + rate limit |
| `src/app/api/track/route.ts` | UPDATE | field length caps + per-sid/IP limiter |
| `src/app/api/track-event/route.ts` | UPDATE | same limiter |
| `src/app/api/receipts/[reference]/route.ts` | UPDATE | reference regex + rate limit |
| `.env.example` | UPDATE | PUBLIC_AUTH_COOKIE_SECRET, CRON_SECRET entries; remove dead Clerk vars from .env docs |
| `src/__tests__/payments-verify.test.ts` | CREATE | unit tests for tolerance logic |

---

## Tasks

Execute in order. Each task atomic and verifiable.

### Task 1: Internal helper modules (break "use server" endpoint exposure)

- **File**: `src/lib/activity-log.ts`, `src/lib/people-core.ts`, `src/lib/newsletter-broadcast.ts` — CREATE
- **Action**: CREATE
- **Implement**:
  - Move `logActivity` body verbatim from `src/actions/activity-logs.ts:7-23` into `src/lib/activity-log.ts` (no `"use server"` directive).
  - Move `findOrCreatePerson`, `ensurePersonRoles`, `upsertPersonRecord`, and their private deps (`getPersonBy...` queries) from `src/actions/people.ts` into `src/lib/people-core.ts`.
  - Move `sendToRows` and `flushScheduledBroadcasts` bodies from `src/actions/newsletter-admin.ts` into `src/lib/newsletter-broadcast.ts`.
- **Mirror**: `src/lib/email.ts` (plain module, no directive)
- **Validate**: `npm run build` (expect import errors until Tasks 2–5 update call sites)

### Task 2: Guard forms.ts

- **File**: `src/actions/forms.ts`
- **Action**: UPDATE
- **Implement**: Add `await requirePermission("manage_workflows");` as first statement of `upsertFormDefinition`, `deleteFormDefinition`, `getFormSubmissions`, `getFormSubmissionById`, `getLatestFormSubmission`. Keep `submitForm` public but ADD `assertSafe("form:"+formId, email, ip)` + honeypot check before insert. Re-point any imports of people helpers to `@/lib/people-core`.
- **Mirror**: `src/actions/settings.ts:24-26` (requirePermission pattern)
- **Validate**: `npm run build`

### Task 3: Guard waitlist.ts

- **File**: `src/actions/waitlist.ts`
- **Action**: UPDATE
- **Implement**: `listWaitlist` → `requirePermission("manage_events")`. `promoteFromWaitlist` → same. `removeFromWaitlist` → same. Join waitlist stays public.
- **Mirror**: `src/actions/workflows.ts:28-32`
- **Validate**: `npm run build`

### Task 4: Guard emails.ts

- **File**: `src/actions/emails.ts`
- **Action**: UPDATE
- **Implement**: Add `await requireAdmin();` as first statement of all six exports (`sendWorkflowEmail`, `sendApplicationStatusEmail`, `sendEventReminderEmail`, `sendPublicCredentialsEmail`, `sendPublicWelcomeEmail`, `sendPaymentRequiredEmail`). Verify all existing callers run in admin context (grep first); if a caller is public-flow, route it through the corresponding `lib/email` function directly instead.
- **Mirror**: `src/actions/settings.ts:101-104`
- **Validate**: `npm run build && grep -rn "from \"@/actions/emails\"" src --include="*.tsx" --include="*.ts"`

### Task 5: Guard analytics.ts + activity-logs + newsletter-admin

- **File**: `src/actions/analytics.ts`, `src/actions/activity-logs.ts`, `src/actions/newsletter-admin.ts`
- **Action**: UPDATE
- **Implement**:
  - All 12 analytics exports: `await requirePermission("view_analytics");` first line.
  - `activity-logs.ts`: replace inline logActivity with `export { logActivity } from "@/lib/activity-log"` — NO, that re-exposes it. Instead: delete local function, import `{ logActivity } from "@/lib/activity-log"` for internal use, remove export entirely. Keep `clearActivityLogs` with existing `manage_users` guard.
  - `newsletter-admin.ts`: `sendToRows` becomes thin wrapper: `requirePermission("manage_newsletter")` then delegates to lib. `flushScheduledBroadcasts`: remove export; update `src/app/api/cron/newsletter/route.ts` to import from `@/lib/newsletter-broadcast`. Public subscribe/unsubscribe actions stay.
- **Mirror**: `src/app/api/admin/analytics/route.ts:6-10`
- **Validate**: `npm run build`

### Task 6: tickets.ts hardening

- **File**: `src/actions/tickets.ts`
- **Action**: UPDATE
- **Implement**:
  - `cancelTicket(ticketId)`: fetch ticket; get public session via existing `getPublicSession()` (see `src/lib/auth/*` used in account flows); if no session OR session email !== ticket.payer_email → return `{ error: "Not authorized" }`.
  - `getTicketStatus(reference)`: prepend `assertSafe("ticket-status", reference, await getClientIp())`; validate `/^[A-Z0-9-]+$/i` format first.
  - `verifyTicketPayment(reference)`: same guard.
  - In `createTicketOrder` (~line 70): also persist `totalAmountKobo: amountKobo` into ticket row/meta so webhook can compare totals (quantity-aware).
- **Mirror**: `src/actions/programs.ts:331-334` (assertSafe usage)
- **Validate**: `npm run build`

### Task 7: Rate limit remaining public write actions

- **File**: `src/actions/events.ts`, `src/actions/programs.ts`, `src/app/(public_pages)/contact/actions.ts`
- **Action**: UPDATE
- **Implement**:
  - `registerForEvent`: after input validation → `const ip = await getClientIp(); const guard = await assertSafe("event-reg:"+eventId, email, ip, payloadWithHoneypot); if (guard.error) return { error: guard.error }; await recordSubmission(...same key...)`.
  - `submitApplication` + `createProgramOrder`: identical pattern, scope `"program-apply:"+programId`.
  - `sendContactMessage`: convert FormData → object, check `honeypotFilled(payload)` then `assertSafe("contact", email, ip)` + `recordSubmission`.
- **Mirror**: `src/actions/programs.ts:331-334` + `src/lib/spam-guard.ts:14-17` (HONEYPOT_FIELD)
- **Validate**: `npm run build`

### Task 8: DB table allowlist

- **File**: `src/lib/db.ts`, `src/actions/crud.ts`
- **Action**: UPDATE
- **Implement**:
  - In db.ts add: `const ALLOWED_IDENTIFIERS = /^[a-z_][a-z0-9_]*$/i;` plus a curated set of known table names (derive from schema: events, news_articles, programs, cohorts, participants, people, person_records, form_definitions, form_submissions, program_applications, event_tickets, donations, paystack_payments, newsletter_subscribers, page_views, workflow_records, activity_logs, site_settings, notifications, admin_users, involvement_pages, categories). Export `function assertIdentifier(name: string)` that throws unless allowlisted or matching regex AND present in a runtime-discovered table list (cache `information_schema.tables` result 60s).
  - Apply inside `getAll/getById/create/update/delete/count` where `${table}` / column names interpolate.
  - crud.ts: no functional change needed once db layer enforces; optionally pre-validate for cleaner errors.
- **Mirror**: parameterized query style already in `src/lib/db.ts`
- **Validate**: `npm run build` and manual smoke: `db.getAll("events")` works, `db.getAll("(SELECT 1)")` throws.

### Task 9: Webhook amount verification (pay-less bypass)

- **File**: `src/lib/payments-verify.ts` CREATE; `src/lib/paystack-confirm.ts` UPDATE
- **Action**: CREATE + UPDATE
- **Implement**:
  - lib fn: `verifyExpectedAmount(webhookAmountKobo, expectedAmountKobo): boolean` using donation tolerance math (`max(round(expected*0.01), 1)`).
  - Event-ticket branch of `confirmChargeSuccess` (~line 110+): extend ticket SELECT to include stored amount/total; compute expected = unit_amount × quantity (or persisted totalAmountKobo from Task 6); on mismatch → reuse donation pattern: create admin notification ("Ticket amount mismatch", type "donation"), console.error, return early WITHOUT confirming ticket.
  - Program branch: before marking application paid, look up expected price from `programs.price` via `program_applications.program_id` and verify same way.
  - Keep donation logic untouched (already correct).
- **Mirror**: `src/lib/paystack-confirm.ts:238-258`
- **Validate**: `npm run test`, `npm run build`

### Task 10: Client trust removal

- **File**: `src/app/(public_pages)/events/[id]/EventDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: Line ~172: replace `amount: order.amountKobo || (event.price || 0) * 100` with strict `amount: order.amountKobo`; if falsy → surface error state instead of initializing Paystack. Server value is authoritative.
- **Mirror**: response contract of `createTicketOrder` (returns amountKobo always on success)
- **Validate**: `npm run build`

### Task 11: Security headers + edge TTL check

- **File**: `next.config.ts`, `src/proxy.ts`
- **Action**: UPDATE
- **Implement**:
  - next.config: add async `headers()` returning for all routes: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000; includeSubDomains`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. CSP: start report-only (`Content-Security-Policy-Report-Only`) with `default-src 'self'`; inline styles allowed (`'unsafe-inline'` for style-src — app uses inline style attrs); script-src `'self' 'unsafe-inline' https://js.paystack.co`; frame-src `https://checkout.paystack.com`; img-src `'self' data: https:`. Tighten later after report monitoring.
  - proxy.ts `verifyCookie`: after HMAC verify, parse payload and reject if `payload.createdAt` missing or older than 24h (mirrors server-side TTL in super-admin.ts).
- **Validate**: `npm run build`; `curl -I localhost:3000` after `npm run dev` shows headers.

### Task 12: Track endpoints + receipts hardening + env hygiene

- **File**: `src/app/api/track/route.ts`, `src/app/api/track-event/route.ts`, `src/app/api/receipts/[reference]/route.ts`, `.env.example`
- **Action**: UPDATE
- **Implement**:
  - track/track-event: cap every string field (path ≤512, utm*/device/browser ≤128, properties JSON.stringify ≤2048 chars → truncate/reject). Add module-level in-memory sliding-window limiter keyed by sid+IP: max 30 req/min, else 429. (In-memory acceptable: per-instance best-effort; note tradeoff in code-free commit message.)
  - receipts: validate reference matches `/^BMAC-[A-Z0-9]{6,}$/i`; reuse in-memory limiter (10/min/IP).
  - .env.example: add `PUBLIC_AUTH_COOKIE_SECRET=` and `CRON_SECRET=` with comment "openssl rand -hex 32". Remove Clerk var examples.
- **Validate**: `npm run build`, POST flood to /api/track returns 429.

### Task 13: Tests

- **File**: `src/__tests__/payments-verify.test.ts` CREATE
- **Action**: CREATE
- **Implement**: vitest unit tests for `verifyExpectedAmount`: exact match true; ±1% true; 2% off false; zero expected false-safe behavior documented. One test asserting next.config headers array contains X-Frame-Options.
- **Mirror**: `src/__tests__/markdown.test.ts` structure
- **Validate**: `npm run test`

---

## Validation

```bash
# Build/typecheck
npm run build

# Lint
npm run lint

# Unit tests
npm run test
```

Manual smoke (dev server):
- Logged-out POST to each guarded action → Unauthorized error.
- `/admin` pages still load with valid admin cookie.
- Ticket purchase flow end-to-end (test mode) still confirms; tampered amount in metadata does NOT confirm.
- Contact form submits once; 6th rapid submit → "Too many requests."

## Acceptance Criteria

- [ ] No `"use server"` file exports an unauth'd privileged operation (grep audit clean)
- [ ] Webhook rejects mismatched ticket/program amounts (unit-tested)
- [ ] All identifier interpolation in db.ts passes allowlist
- [ ] Security headers present on responses
- [ ] Public endpoints rate-limited: contact, registerForEvent, submitApplication, createProgramOrder, getTicketStatus, verifyTicketPayment, track, track-event, receipts
- [ ] Build + lint + tests pass
