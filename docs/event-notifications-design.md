# Event Notifications, Attendee Pass, and Check-In — Design

Status: Approved (design + implement)
Date: 2026-08-14
Scope: admin alerts, attendee email + pass, event check-in, get-involved email reliability.

## 1. Goals

1. Admins are notified in real time (in-app + email) for every free registration, paid ticket, donation, and check-in.
2. Attendees receive a QR code embedded directly in the confirmation/receipt email, plus a clickable pass link.
3. The pass page is clean, minimal, and reliable as the on-venue entry credential.
4. Check-in is fast and event-scoped: the scanner validates that the scanned ticket belongs to the selected event; wrong-event tickets are rejected with a clear error.
5. Get-involved emails (form link + donation thanks) never fail silently.

## 2. Current state (audit summary)

### Email infrastructure
- Next app sends via an Express email service (`bmac-express-server`, port 3001) through `POST /send` (`src/lib/email.ts` → `sendRequest`).
- All templates are rendered server-side in `server.js` (`publicShell` + `fillTemplate`). No QR support yet; no `qrcode` dependency.
- `src/lib/email-templates.ts` holds the admin-editable template registry (used by settings UI), separate from the render code in the email server.

### Registration & tickets
- Free events: `registerForEvent` in `src/actions/events.ts` creates a ticket (status `confirmed`), generates a pass URL, sends `registration-confirmed` email. No admin notification exists for free registrations.
- Paid events: `createTicketOrder` in `src/actions/tickets.ts` creates a ticket (status `pending`); the Paystack webhook (`src/app/api/webhooks/paystack/route.ts`) confirms it, sends `ticket-receipt`, and creates an in-app admin notification (`Paid ticket confirmed`). Admin email is NOT sent for tickets.
- Donations: webhook sends `donation-thanks` (attendee) + `donation-alert` (admin email) + in-app notification. Already complete.
- Check-in: `checkInAttendee` (`src/actions/events.ts`) → `checkInTicket` (`src/lib/tickets.ts`). Logs activity but creates NO notification and sends NO email.
- Check-in scanner (`src/components/admin/CheckInClient.tsx`): camera scan, manual search by token/reference/email. Bugs: (1) camera element is inside a `display:none` container when `startScanner()` runs → video has zero size and scan fails; (2) no event scoping — a ticket for any event can be checked in under the wrong event; (3) no scan cooldown → double-scan in the same frame is possible.
- Pass page (`src/app/(public_pages)/pass/[token]/page.tsx` + `PassClient.tsx`): server page looks up ticket, generates QR from the pass URL, renders a bold gradient card. Functional but busy.

### Get-involved
- `applyAsPerson` in `src/actions/people.ts`: sends the Google Form link only when a form link is configured (`getConfiguredFormLink`). If no link is configured or the email send fails, the UI falls back to a generic "We'll review your application" message — the user is never told their email may not arrive, and the failure is silent.
- Donation thanks email is sent from the webhook; the get-involved client callback only says "Payment Initiated" and cannot confirm delivery.

## 3. Admin notifications

### Channels
- In-app: `createAdminNotification` (existing, `src/lib/notifications.ts`) → `admin_notifications` table → bell dropdown in admin header (polls every 30s).
- Email: a new `sendAdminAlertEmail` helper in `src/lib/email.ts` that sends one alert per super admin (`getSuperAdminEmails`) using new email service types.

### Matrix

| Event | In-app notification | Admin email | Link |
|---|---|---|---|
| Free registration (`registerForEvent`) | `New registration` | `registration-alert` | `/admin/events` |
| Paid ticket confirmed (webhook) | `Paid ticket confirmed` (existing) | `ticket-alert` (new) | `/admin/events` |
| Donation (webhook) | existing | existing `donation-alert` | `/admin/payments` |
| Check-in (`checkInAttendee`) | `Check-in` (new) | `checkin-alert` (new) | `/admin/checkin` |

### Email content (new types in email service)
- `registration-alert`: "New registration — <event>. <name> (<email>) registered for <event>."
- `ticket-alert`: "Paid ticket — <event>. <name> paid <amount> (<reference>)."
- `checkin-alert`: "Check-in — <attendee> checked in for <event>."

All admin alerts use `publicShell` with a "View in Dashboard" CTA. Alert emails are sent with `.catch()` swallowing errors so a failed alert never breaks the underlying action.

## 4. Attendee email — QR + pass link

### Change
Add a `qrcode` dependency to the Express email service. In `server.js`, for `registration-confirmed` and `ticket-receipt`:
1. Generate a QR PNG data URL from the absolute `passUrl` (already absolutized client-side).
2. Render the QR image (base64 data URI) centered in the email body, followed by a "View Your Pass" button + plain-text fallback link.

### Templates updated
- `registration-confirmed`: heading "Registration confirmed", message + embedded QR + pass CTA.
- `ticket-receipt`: heading "Your BMAC ticket", message + embedded QR + pass CTA.

`publicShell` gains an optional `qrDataUrl` slot. Text fallback already includes `passUrl`.

## 5. Pass page (redesign)

Keep the server component logic (`page.tsx`) unchanged. Redesign `PassClient.tsx`:
- Minimal card: white surface, thin border, generous spacing, restrained type.
- Clear status pill: Active / Checked In / status (non-confirmed).
- Attendee name, event title, date, venue.
- QR code centered on white in a bordered tile.
- Reference + quantity in a compact footer row.
- Not-found and inactive states stay clear and simple.

## 6. Check-in (event-scoped, reliable)

### Event scoping
- Admin picks the target event from a select (loaded from `page.tsx`: published events).
- `checkInAttendee` and `checkInTicket` accept `eventId`. Scanner validates `ticket.event_id === eventId`.
- New result states: `wrongEvent` (ticket belongs to a different event — show that event's title) and `wrongEventTitle`.

### Scanner reliability fixes
- Move the `#bmac-checkin-scanner` element into a container that is always rendered (min-height) instead of `display:none`, and call `html5.start()` only after the container is visible. Ensures the camera gets a sized region.
- Scan cooldown (~1.5s) via ref so a single QR held in frame cannot double-check-in.
- Keep camera running after a successful scan for fast sequential check-ins (cooldown governs repeat decodes) — no per-scan stop/start.
- Manual search stays, also event-scoped; errors returned as flash messages.

### Result states
`checkedIn` | `alreadyCheckedIn` | `notFound` | `notConfirmed` | `wrongEvent` (+ which event).

## 7. Get-involved email reliability

- `applyAsPerson`: if the Google Form link is not configured OR the email send fails, return structured flags (`formLink`, `emailSent`, `emailError`) and surface a clear message in the UI instead of the generic fallback. Keep the form link visible in the success panel even when email delivery failed (so the user can proceed), and keep the resend control.
- Admin gets an in-app notification when a form link is missing (config gap), so the gap is not silent.
- Donation: the client callback message becomes delivery-accurate ("Payment initiated — a thank-you email is sent on confirmation").

## 8. Out of scope / notes

- Template editing in admin settings UI remains separate from the email server's render code (existing limitation, not changed).
- Reminder emails keep the same CTA (no QR embed required for reminders).
