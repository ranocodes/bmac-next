# Plan: Pre-Launch Roadmap — Phase 0 Security + Phase 1 Notifications, Giving & Newsletter

## Summary

Sequential build hardening the site before launch. Phase 0: login brute-force protection, session cookie hardening, new-admin alert, public form spam guards, Paystack key separation + webhook IP verify, ops flags. Phase 1: WhatsApp/SMS notification layer, automatic event reminders, waitlist with auto-promote, donation progress bar + receipt PDF, donor self-service lookup, newsletter subscribe already exists + admin batch send. All work follows existing server-action / lib / Neon-DB patterns. No external email tools — nodemailer through the Express backend (`EMAIL_SERVICE_URL/send`).

## User Story

As a pre-launch nonprofit running the site in Nigeria with mixed volunteer + dedicated staff,
I want auth hardening, automated outreach, waitlists, and donor tooling
So that the site is safe to open, attendees get timely reminders, donors see impact and receipts, and newsletter operations are manageable.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | HIGH |
| Systems Affected | `src/actions/*`, `src/lib/*`, `src/app/(public_pages)/*`, `src/app/admin/*`, `src/app/api/*`, `src/types/cms.ts`, DB schema (Neon), `.env*`, Express backend (bmac-express-server) |
| Jira Issue | N/A |

---

## Patterns to Follow

### Naming — server actions return `{ error?: string }`, camelCase exports
```
// SOURCE: src/actions/events.ts:267-273
export async function registerForEvent(opts: {
  eventId: string; name: string; email: string; phone?: string; consent?: boolean;
}): Promise<{ error?: string; passUrl?: string; reference?: string }> {
  if (!opts.consent) return { error: "Consent is required to register." };
```

### Error Handling — permission gate throws, action returns error object
```
// SOURCE: src/lib/auth/server.ts:43
export async function requirePermission(permission: Permission) {
  // throws new Error("Forbidden: insufficient permissions") — no token
```
```
// SOURCE: src/actions/events.ts:366-370
} catch (err) {
  await releaseCapacity(opts.eventId, 1);
  console.error("registerForEvent error:", err);
  return { error: "Something went wrong. Try again." };
}
```

### DB — Neon HTTP driver, whitelisted ORDER BY columns, raw SQL via `db.query`
```
// SOURCE: src/lib/db.ts:111-114
async query<T>(queryStr: string, params?: any[]): Promise<T[]> {
  const sql = getSql();
  return (await sql.query(queryStr, params ?? [])) as any as T[];
}
```

### Email — lib sends `{ type, ... }` payload to Express service; returns `{ error? }`
```
// SOURCE: src/lib/email.ts:12-31
async function sendRequest(body: Record<string, unknown>): Promise<{ error?: string }> {
  const res = await fetch(`${SERVICE_URL}/send`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify(body) });
  if (!res.ok) { /* return { error } */ }
  return {};
}
```
> NOTE: New email types must also be added to bmac-express-server's `/send` handler.

### Admin notifications — `createAdminNotification` + `emailSuperAdmins`
```
// SOURCE: src/lib/notifications.ts:59
export async function createAdminNotification(input: { title; message; type; link })
```
```
// SOURCE: src/actions/events.ts:351-364
await createAdminNotification({ title: "New registration", message: `${opts.name} registered for ${event.title} (${ticket.reference}).`, type: "registration", link: "/admin/events" });
await emailSuperAdmins(adminEmail => sendRegistrationAlertEmail({ email: adminEmail, attendeeName: opts.name, attendeeEmail: opts.email, eventName: event.title }));
```

### Auth session cookie — HMAC signed, set/clear in super-admin.ts
```
// SOURCE: src/lib/auth/super-admin.ts:53-62
cookie.set(COOKIE_NAME, `${payloadB64}.${sig}`, {
  httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 24,
});
```

### Paystack webhook — HMAC sha512 verify against secret
```
// SOURCE: src/app/api/webhooks/paystack/route.ts:12-29
const secret = process.env.PAYSTACK_SECRET_KEY;
const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
// compare x-paystack-signature; on event.event === 'charge.success' handle payment
```

### Tests — vitest, vi.mock, resetAllMocks, isolated `db.query` stubs
```
// SOURCE: src/__tests__/bmac33-acceptance.test.ts (vi.mock("@/lib/db", ...); vi.resetAllMocks())
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `.env.example` | UPDATE | Add TERMII (SMS), CRON_SECRET, DONATION_GOAL, RECEIPT/AWS vars if any |
| `src/types/cms.ts` | UPDATE | Extend SiteSettings; add WaitlistRow, DonationRow types |
| `src/lib/auth/server.ts` | UPDATE | Login throttle helper (rate limit / lockout) |
| `src/actions/admin-auth.ts` | UPDATE | Apply throttle in `loginAdmin`; alert on `createAdminAction` |
| `src/lib/auth/super-admin.ts` | UPDATE | Cookie hardening (add `priority`, explicit flags) |
| `src/lib/sms.ts` | CREATE | WhatsApp/SMS send layer via Termii (nodemailer n/a for SMS) |
| `src/actions/reminders.ts` | CREATE | `sendDueReminders()` for auto reminders |
| `src/app/api/cron/reminders/route.ts` | CREATE | Vercel Cron guarded endpoint |
| `src/actions/waitlist.ts` | CREATE | join / list / promote waitlist |
| `src/lib/donations.ts` | CREATE | donation totals + receipt generation |
| `src/app/api/receipts/[reference]/route.ts` | CREATE | PDF receipt endpoint (PDF generation) |
| `src/actions/donor-lookup.ts` | CREATE | donor self-service by email |
| `src/actions/newsletter-admin.ts` | CREATE | list subscribers, batch send |
| `src/actions/people.ts` | UPDATE | Honeypot + rate limit on `applyAsPerson` |
| `src/actions/newsletter.ts` | UPDATE | Honeypot + rate limit on subscribe |
| `src/app/(public_pages)/get-involved/page.tsx` | UPDATE | Donation progress bar, receipt link, honeypot field |
| `src/app/HomeClient.tsx` | UPDATE | Donation goal progress section |
| `src/components/admin/AdminLayout.tsx` | UPDATE | Nav items: Newsletter, Waitlists (if per-event) |
| `src/app/admin/newsletter/page.tsx` | CREATE | Admin newsletter page |
| `src/components/admin/NewsletterClient.tsx` | CREATE | Subscriber list + compose/send |
| `src/app/(public_pages)/donor-lookup/page.tsx` | CREATE | Donor self-service page |
| `src/components/public/DonationProgress.tsx` | CREATE | Progress bar component |
| `src/actions/events.ts` | UPDATE | Auto-promote from waitlist on capacity freed; wire reminders flag |
| `src/lib/tickets.ts` | UPDATE | Trigger waitlist promote on releaseCapacity path |
| `src/__tests__/phase0-phase1.test.ts` | CREATE | Coverage for new actions (throttle, waitlist, newsletter batch) |
| Express backend (bmac-express-server) | UPDATE | New email types (reminder-fallback, newsletter-broadcast, receipt) |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Phase 0 — Security

#### Task 1: Login brute-force throttle + lockout
- **File**: `src/actions/admin-auth.ts` (+ `src/lib/auth/server.ts` or new `src/lib/rate-limit.ts`)
- **Action**: CREATE `src/lib/rate-limit.ts`, UPDATE `admin-auth.ts`
- **Implement**: DB-backed `login_attempts` table (email, ip, success, created_at). Before calling `authClient.loginAdmin`, count failed attempts in last 15 min; if ≥ 5, return `{ error: "Too many attempts. Try again later." }`. On failure insert; on success clear. Also log IP from `headers()`.
- **Mirror**: `src/actions/events.ts:85-88` (`db.query` pattern), `src/actions/admin-auth.ts:9` login flow
- **Validate**: `npx vitest run src/__tests__/phase0-phase1.test.ts`

#### Task 2: Session cookie hardening
- **File**: `src/lib/auth/super-admin.ts`
- **Action**: UPDATE
- **Implement**: In `setSuperAdminSession` add `priority: "high"`, `secure: true` when `NODE_ENV === "production"` (already), keep `httpOnly`, `sameSite: "lax"`. In `clearSuperAdminSession` mirror the same flags (currently only path+maxAge) so clear works with secure/sameSite. Consider shorter `maxAge` (24h) and `createdAt` expiry check in `getSuperAdminSession`.
- **Mirror**: `src/lib/auth/super-admin.ts:53-62,85-88`
- **Validate**: `npx tsc --noEmit`

#### Task 3: New-admin creation alert
- **File**: `src/actions/admin-auth.ts`
- **Action**: UPDATE
- **Implement**: After successful `createAdminAction`, `createAdminNotification({ title: "New admin created", message, type: "admin", link: "/admin/admins" })` + `emailSuperAdmins(...)` using an existing/ new email type (e.g. `admin-created`).
- **Mirror**: `src/actions/events.ts:351-364`
- **Validate**: `npx vitest run src/__tests__/admin-auth.test.ts`

#### Task 4: Public form spam guards (honeypot + rate limit)
- **File**: `src/actions/people.ts`, `src/actions/newsletter.ts`, `src/actions/donations.ts`
- **Action**: UPDATE
- **Implement**: `src/lib/spam-guard.ts` with `assertSafe(scope, email, ip)` — honeypot field check (reject if hidden field filled) + DB rate limit (max 5 per email/IP per 10 min per scope). Wrap `applyAsPerson`, `subscribeToNewsletter`, `createPendingDonation`. Add honeypot input to get-involved page + newsletter form.
- **Mirror**: `src/lib/rate-limit.ts` (Task 1) reuse; `src/actions/events.ts:85-88`
- **Validate**: `npx vitest run src/__tests__/phase0-phase1.test.ts`

#### Task 5: Paystack key separation + webhook verification
- **File**: `src/app/api/webhooks/paystack/route.ts`, `.env.example`
- **Action**: UPDATE
- **Implement**: Document test/live key separation in `.env.example`. Guard: reject placeholder `pk_test_placeholder` in production for `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`. Keep HMAC sha512 verify (already correct). Add webhook payload amount/currency sanity check against stored pending donation.
- **Mirror**: `src/app/api/webhooks/paystack/route.ts:12-29`
- **Validate**: `npx vitest run src/__tests__/PaystackWebhook.test.ts`

#### Task 6: Ops flags (backup, email auth, CDN/WAF) — documentation + config
- **File**: `.env.example`, SETUP.md / ops doc
- **Action**: UPDATE
- **Implement**: Add `CRON_SECRET` to `.env.example`. Write ops checklist: Neon PITR/backups (console), SPF/DKIM/DMARC records for the sending domain, CDN/WAF recommendation. No code beyond env entries.
- **Validate**: `npx tsc --noEmit`

### Phase 1 — Notifications

#### Task 7: WhatsApp/SMS notification layer
- **File**: `src/lib/sms.ts`, `.env.example`
- **Action**: CREATE
- **Implement**: Termii-based `sendSms(phone, message)` + `sendWhatsApp(phone, message)` wrappers returning `{ error? }`, fail-closed when `TERMII_API_KEY` unset (log + return error, never throw). Add `TERMII_API_KEY`, `TERMII_BASE_URL`, `TERMII_SENDER_ID` envs.
- **Mirror**: `src/lib/email.ts:12-31` error contract
- **Validate**: `npx tsc --noEmit`

#### Task 8: Automatic event reminders (scheduled)
- **File**: `src/actions/reminders.ts`, `src/app/api/cron/reminders/route.ts`, `next.config.ts`
- **Action**: CREATE + UPDATE
- **Implement**: `sendDueReminders()` — query events with `reminders_enabled=true`, date within 24-48h, tickets confirmed; send `sendEventReminderEmail` (existing) + optional SMS via Task 7. Add `CRON_SECRET`-guarded route. Add `crons` config to `next.config.ts` (or vercel.json). Idempotency: track last-sent per ticket (e.g. `reminder_sent_at` on event_tickets or in-memory guard).
- **Mirror**: `src/actions/events.ts:239-265` (sendEventReminders), `src/lib/email.ts:269`
- **Validate**: `npx vitest run src/__tests__/phase0-phase1.test.ts`

#### Task 9: Waitlist + auto-promote
- **File**: `src/actions/waitlist.ts`, `src/actions/events.ts`, `src/lib/tickets.ts`, `src/types/cms.ts`
- **Action**: CREATE + UPDATE
- **Implement**: `event_waitlist` table (event_id, person_id, name, email, phone, status: waiting/promoted/cancelled, created_at). `joinWaitlist(eventId, name, email, phone)` when sold out (in `registerForEvent` sold-out branch). `promoteWaitlist(eventId, count)` admin action. Auto-promote: when `releaseCapacity` frees slots, promote oldest waiting entry (email confirmation + ticket creation). Add `reminders_enabled`-style `waitlist_enabled` flag on events (EventRow).
- **Mirror**: `src/actions/events.ts:303-329` (reserve/release + createTicket), `src/lib/tickets.ts:97-115`
- **Validate**: `npx vitest run src/__tests__/phase0-phase1.test.ts`

### Phase 1 — Giving

#### Task 10: Donation progress bar + goal
- **File**: `src/lib/donations.ts`, `src/components/public/DonationProgress.tsx`, `src/app/(public_pages)/get-involved/page.tsx`, `src/app/HomeClient.tsx`, `src/types/cms.ts`
- **Action**: CREATE + UPDATE
- **Implement**: `getDonationTotals()` — sum confirmed `donation` person_records + paystack_payments amount (currency-filtered NGN). Store goal in `site_settings.donation_goal` (default from env `DONATION_GOAL`). Render progress bar (raised/goal + %) on get-involved donate tab and home. Percent capped at 100.
- **Mirror**: `src/actions/settings.ts:19-31` (site_settings get/save), `src/actions/donations.ts` (meta/amount)
- **Validate**: `npx vitest run src/__tests__/HomeClient.test.tsx`

#### Task 11: Donation receipt PDF
- **File**: `src/app/api/receipts/[reference]/route.ts`, `src/lib/donations.ts`
- **Action**: CREATE + UPDATE
- **Implement**: Route fetches donation by reference (public — receipt contains amount/date/reference only), returns a print-friendly HTML or generated PDF. Use a lightweight PDF approach consistent with repo (no heavy deps — check if `pdf-lib`/`@react-pdf` present; else return HTML with print CSS). Link from get-involved success + donation email.
- **Mirror**: `src/app/api/webhooks/paystack/route.ts` (route file shape)
- **Validate**: `npx tsc --noEmit`

#### Task 12: Donor self-service lookup
- **File**: `src/actions/donor-lookup.ts`, `src/app/(public_pages)/donor-lookup/page.tsx`
- **Action**: CREATE
- **Implement**: Public page — enter email → list that donor's confirmed donations (date, amount, reference, status) + receipt links. Server action queries by email only (no auth). Rate-limit via spam-guard (Task 4). Privacy: no email enumeration — generic empty message.
- **Mirror**: `src/actions/donations.ts` (query pattern), get-involved page pattern
- **Validate**: `npx vitest run src/__tests__/phase0-phase1.test.ts`

### Phase 1 — Newsletter

#### Task 13: Admin newsletter (subscribers + batch send)
- **File**: `src/actions/newsletter-admin.ts`, `src/app/admin/newsletter/page.tsx`, `src/components/admin/NewsletterClient.tsx`, `src/components/admin/AdminLayout.tsx`, `src/lib/email.ts`
- **Action**: CREATE + UPDATE
- **Implement**: `listSubscribers()`, `sendNewsletter(subject, body)` — iterate `newsletter_subscribers`, send via new email type `newsletter-broadcast` (add to Express backend) or reuse `sendNewsletterWelcomeEmail` with custom body. Gate with `requirePermission("manage_news")`. Admin nav item "Newsletter". Batch chunk (e.g. 50/request), failure-tolerant (count sent/failed).
- **Mirror**: `src/actions/events.ts:239-265` (batch loop + logActivity), AdminLayout nav pattern `src/components/admin/AdminLayout.tsx:45`
- **Validate**: `npx vitest run src/__tests__/phase0-phase1.test.ts`

---

## Validation

```bash
# Type check
npx tsc --noEmit

# Lint (pre-existing 272 no-explicit-any errors — do not add new ones)
npm run lint

# Tests
npx vitest run
```

---

## Acceptance Criteria

- [ ] All tasks completed in order
- [ ] Login throttled (5 fails / 15 min) with DB-backed attempts table
- [ ] Session cookie hardened; clear cookie matches set flags
- [ ] New-admin creation alerts super admins
- [ ] Public forms (people, newsletter, donations) honeypot + rate limited
- [ ] Paystack placeholder key rejected in prod; HMAC verification intact
- [ ] SMS/WhatsApp layer exists, fail-closed, env-guarded
- [ ] Auto reminders send to confirmed tickets within 24-48h, idempotent, CRON_SECRET-guarded
- [ ] Waitlist join + admin promote + auto-promote on capacity freed
- [ ] Donation progress bar with goal on home + get-involved
- [ ] Receipt PDF accessible by reference
- [ ] Donor self-service lookup by email, rate-limited, no enumeration
- [ ] Admin newsletter page lists subscribers + batch sends
- [ ] Type check passes
- [ ] Tests pass
- [ ] Follows existing patterns (error objects, db.query, createAdminNotification, email via /send)
