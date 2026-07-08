# BMAC Next Product Requirements Document

Generated: 2026-06-27  
Product: BMAC Next Operations Platform  
Project: Brilliant Minds Ambassadors Club (BMAC), Jos, Nigeria

---

## 1. Executive Summary

BMAC Next is evolving from a CMS-backed public website and admin dashboard into a full nonprofit operations platform for Brilliant Minds Ambassadors Club. The current product already supports public pages for programs, events, news, gallery, about, contact, and get involved, plus admin CRUD for core content, users, roles, invitations, settings, partners, testimonials, stats, and activity logs. However, several high-value workflows are currently incomplete or front-end-only, especially event registration, paid ticketing, digital passes, check-in, program applications, donations, and get-involved submissions.

The platform will centralize BMAC's public presence, event operations, program enrollment, donations, people records, communications, and impact reporting. The core value proposition is a single system where BMAC can publish content, receive applications and payments, manage attendees and participants, issue QR passes, check people in on-site, track operational metrics, and maintain a unified history of everyone who engages with the organization.

The MVP goal is to stabilize the existing application first, then ship the first operational platform release: event registration and ticketing with QR check-in, unified people profiles, one-time donations with receipts, program applications and cohorts, persisted public workflows, transactional email, module-level admin permissions, and operational analytics.

---

## 2. Mission

### Mission Statement

Build a reliable, accessible, Nigeria-first digital operations platform that helps BMAC run youth empowerment programs, events, donations, partnerships, and community engagement from one trusted system.

### Core Principles

- **Operational truth:** Public forms, payments, applications, and registrations must create durable records that admins can review, update, export, and report on.
- **People-centered data:** Every attendee, donor, volunteer, member, mentor, partner contact, and participant should map to a unified profile where appropriate.
- **Mobile-first field operations:** Event check-in and admin workflows must work on mobile devices, especially for on-site use in Jos.
- **Secure by default:** Authentication, authorization, payment verification, audit logging, and privacy controls must be treated as core product requirements.
- **Phased delivery:** Stabilize the current system before adding platform features; defer advanced engagement to roadmap items.

---

## 3. Target Users

### Primary Personas

| Persona | Technical Comfort | Needs | Pain Points |
|---|---:|---|---|
| Executive/Admin Lead | Medium | Oversight, reports, team management, approvals | Scattered records, no single dashboard, manual follow-up |
| Events Coordinator | Medium | Create events, manage tickets, check people in, view attendance | Manual registration lists, no QR validation, no live capacity tracking |
| Programs Coordinator | Medium | Review applications, manage cohorts, track attendance and outcomes | Program interest forms are not persisted, no participant workflow |
| Finance/Donations Admin | Medium | Track donations, verify payments, export reports, send receipts | Paystack success is not persisted, donor history is missing |
| Communications/Admin Staff | Low-Medium | Manage contact inquiries, send confirmations, update content | Public forms do not create admin queues |
| Public Visitor | Low | Browse BMAC, register for events, apply to programs, donate, volunteer | Needs simple forms, clear confirmation, mobile-friendly pages |
| Participant/Member/Volunteer | Low-Medium | Register, apply, receive updates, optionally log in later | No reusable profile or application status visibility |

### Key User Needs

- Register for events and receive a verified digital pass.
- Pay for tickets or donations through Paystack and receive receipts.
- Apply for programs and get status updates.
- Submit contact, volunteer, membership, school chapter, and partnership requests.
- Let admins manage all submissions from structured queues.
- Track attendance, applications, donations, and engagement metrics.

---

## 4. MVP Scope

### In Scope

#### Stabilization

- [ ] Verify and fix complete Clerk admin auth flow.
- [ ] Confirm first-admin setup and invite-based subsequent admin flow.
- [ ] Resolve setup documentation drift from legacy Neon Auth/Supabase/GitHub OAuth references to current Clerk/Neon/Paystack reality.
- [ ] Add payment persistence baseline for Paystack webhook success events.
- [ ] Complete mobile responsiveness QA for public and admin pages.
- [ ] Expand critical tests for auth, forms, payment verification, and core admin workflows.
- [ ] Prepare production deployment configuration for Vercel, Neon, Clerk, Paystack, Resend, and domain setup.

#### Core Platform

- [ ] Unified people profiles for public and admin engagement records.
- [ ] Optional public login for users; public forms must still work without login.
- [ ] Admin-created or invited users.
- [ ] Module-level admin permissions for events, people, programs, donations, content, settings, analytics, and users.
- [ ] Persisted public workflows for contact, join, volunteer, school chapter, partnership, program applications, event registrations, and donations.

#### Events

- [ ] Centralized event operations dashboard.
- [ ] Free RSVP and paid ticket registration.
- [ ] Event capacity and registration counts.
- [ ] Attendee records linked to people profiles.
- [ ] Paystack payment verification and payment status.
- [ ] QR/digital pass generation.
- [ ] Transactional pass confirmation email.
- [ ] Mobile web QR scanner for check-in.
- [ ] Manual attendee search/check-in fallback.
- [ ] Event attendee export.
- [ ] Operational event analytics.

#### Programs

- [ ] Public program application workflow.
- [ ] Admin application review statuses.
- [ ] Cohort management.
- [ ] Participant profiles.
- [ ] Attendance tracking.
- [ ] Basic outcome tracking.

#### Donations

- [ ] One-time donation checkout.
- [ ] Paystack verification.
- [ ] Donor records.
- [ ] Receipt email.
- [ ] Admin donation list.
- [ ] Donation exports.

#### Communications

- [ ] Transactional email via Resend or equivalent.
- [ ] Confirmation emails for events, programs, donations, contact messages, and get-involved workflows.
- [ ] Admin-visible email delivery status where practical.

#### Analytics

- [ ] Operational metrics for registrations, check-ins, donations, applications, contacts, revenue, and trends.
- [ ] Dashboard cards and charts for core modules.
- [ ] Date filtering for operational views.

#### Privacy and Security

- [ ] Consent checkboxes on public data collection forms.
- [ ] Date of birth or age collection where required for youth programs/events.
- [ ] Under-18 records marked as minor-sensitive for admin review/follow-up.
- [ ] Admin data export/delete workflows.
- [ ] Audit logs for sensitive admin actions.
- [ ] Idempotent Paystack webhook handling.

### Out of Scope

- [ ] Required public login for all public users.
- [ ] Recurring donations.
- [ ] Donor portal.
- [ ] Refunds, ticket transfers, promo codes, waitlists, and guest group tickets.
- [ ] Public check-in kiosk mode.
- [ ] Live event polls.
- [ ] Post-event survey engine.
- [ ] Certificates.
- [ ] Mentor matching.
- [ ] Alumni tracking.
- [ ] SMS/WhatsApp campaigns.
- [ ] Advanced funnels, attribution analytics, donor retention analytics, and custom report builder.
- [ ] Multi-currency, multi-country, or multilingual support.
- [ ] Automated guardian consent workflow.

---

## 5. User Stories

1. **As an Event Coordinator, I want to create events with capacity, paid/free registration, and attendee lists, so that I can manage real event operations from the admin dashboard.**  
   Example: The Annual Speech Championship has 300 seats, free registration, and a live attendee list.

2. **As a public visitor, I want to register for an event and receive a QR pass, so that I can enter the venue without manual confirmation.**  
   Example: A student registers for Digital Skills Bootcamp, receives a pass by email, and presents it at check-in.

3. **As an on-site admin, I want to scan QR codes or search attendees manually, so that check-in still works even if camera scanning fails.**  
   Example: If a phone camera permission fails, the admin searches by email and checks in the attendee manually.

4. **As a Programs Coordinator, I want to review applications and assign accepted applicants to cohorts, so that program operations move beyond front-end form submissions.**  
   Example: Public Speaking applicants move from `submitted` to `accepted`, then into the July 2026 cohort.

5. **As a Donor, I want to make a one-time donation and receive a receipt, so that I know my support was recorded successfully.**  
   Example: A donor gives ₦25,000 through Paystack and receives a receipt email after webhook verification.

6. **As an Admin Lead, I want one profile per person across events, donations, programs, and volunteering, so that BMAC can understand each person's full relationship with the organization.**  
   Example: A person can be an event attendee, volunteer applicant, donor, and program participant without duplicate records.

7. **As a Communications Admin, I want all public contact and get-involved forms to create admin-managed records, so that no inquiry is lost in email or front-end state.**  
   Example: A school chapter request appears in the admin workflow queue with status, notes, assignee, and follow-up history.

8. **As a Super Admin, I want module-level permissions, so that staff can access only the parts of the platform they are responsible for.**  
   Example: A Finance Admin can view donations and exports but cannot delete events or manage users.

---

## 6. Core Architecture & Patterns

### Current Architecture

- Next.js App Router with public route group and Clerk-protected `/admin`.
- Server components fetch data from Neon via `src/lib/db.ts`.
- Client components receive `initial*` props and handle UI interactions.
- Admin CRUD uses server actions in `src/actions/`.
- Clerk protects admin routes through `src/proxy.ts`.
- Paystack inline script is loaded at root layout; webhook route exists but currently logs charge success instead of persisting records.

### Target Architecture

- Keep the existing Next.js, Clerk, Neon, Tailwind, and server action patterns.
- Add platform domain modules around people, events, registrations, payments, donations, workflows, programs, communications, and analytics.
- Treat public form submissions as server-action or route-handler writes, not client-only state changes.
- Use Neon Postgres as the source of truth.
- Use Paystack webhook verification as the authoritative signal for paid events and donations.
- Use transactional email for user-facing confirmations.
- Keep all admin access behind Clerk and module permissions.

### Key Patterns

- **Unified profile resolution:** Create or match a person by email and phone where available.
- **Workflow records:** Public submissions become records with status, source, assignee, notes, and timestamps.
- **Payment idempotency:** Paystack references must be unique and safe to process multiple times.
- **Event pass lifecycle:** Registration created, payment verified if paid, QR pass issued, pass emailed, check-in recorded.
- **Auditability:** Sensitive actions create activity log records.

---

## 7. Tools/Features

### 7.1 Stabilization and Current-State Fixes

Current issues from the handoff and code review must be resolved before new feature implementation:

- Verify `currentUser()` and Clerk admin flow after clean install.
- Confirm admin invite acceptance for both new Clerk users and existing Clerk sessions.
- Keep Vitest on `pool: "forks"` for Node 24.
- Update `SETUP.md` to remove stale Neon Auth, Supabase, and GitHub OAuth instructions unless those systems are intentionally reintroduced.
- Confirm the production environment variable list for Clerk, Neon, Paystack, and Resend.
- Convert Paystack webhook from logging-only to persistence-ready behavior.

### 7.2 Unified People CRM

People profiles should become the foundation for public and admin records.

Required profile capabilities:

- Name, email, phone, date of birth or age where applicable.
- Role tags: attendee, participant, applicant, donor, volunteer, mentor, member, alumni, partner contact, guardian, admin.
- Source history: event, program, donation, contact, get-involved, admin-created, invited.
- Consent fields and timestamps.
- Minor-sensitive flag for under-18 records.
- Admin notes and status.
- Export and delete/admin privacy workflow.

### 7.3 Event Management

Required event capabilities:

- Event CRUD should expand from content-only to operational settings.
- Events support capacity, registration open/closed state, free/paid registration, price, and pass issuance rules.
- Registration form collects attendee details, consent, and optional account linking.
- Paid registration creates payment intent/reference and waits for Paystack verification.
- Successful registration issues a QR pass and sends an email.
- Admin event dashboard shows capacity, registrations, paid/unpaid, checked-in count, no-shows, and revenue.
- Check-in supports mobile QR scanner and manual search fallback.
- Admin can export attendees.

### 7.4 Program Management

Required program capabilities:

- Public application forms for published programs.
- Application statuses: submitted, in review, accepted, waitlisted, rejected, withdrawn.
- Cohorts linked to programs.
- Participants linked to unified people profiles.
- Attendance tracking per cohort/session or per meeting date.
- Basic outcomes such as completed, dropped, certificate eligible, notes.

### 7.5 Donations

Required donation capabilities:

- One-time donation form with amount presets and custom amount.
- Paystack payment reference and webhook verification.
- Donor profile creation/linking.
- Receipt email after verification.
- Admin donation list with amount, donor, status, reference, date, and export.

### 7.6 Public Workflow Queues

The following public interactions must become persisted workflows:

- Contact message.
- Join BMAC.
- Volunteer application.
- School chapter request.
- Partnership inquiry.
- Program application.
- Event registration.
- Donation.

Workflow records should support:

- Status.
- Assignee.
- Notes.
- Last contacted date.
- Source page/form.
- Linked person profile.
- Audit trail.

### 7.7 Transactional Communications

Required emails:

- Contact acknowledgment.
- Event registration confirmation.
- Event QR pass.
- Donation receipt.
- Program application received.
- Program application status update.
- Join/volunteer/school/partner request acknowledgment.
- Admin invite email remains supported.

### 7.8 Analytics

Required analytics:

- Event registrations by event and date.
- Event check-ins and attendance rate.
- Paid event revenue.
- Donation totals and trends.
- Program applications by program/status.
- Workflow queue counts by status.
- Contact and get-involved submissions.
- Public content counts and publishing status.

---

## 8. Technology Stack

### Existing Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6, App Router, Turbopack dev |
| Runtime | Node 24 |
| UI | React 19.2.4 |
| Styling | Tailwind v4, `@tailwindcss/postcss`, CSS variables in `globals.css` |
| Database | Neon Postgres via `@neondatabase/serverless` HTTP driver |
| Auth | Clerk v7 with hosted pages/admin auth |
| Payments | Paystack Inline + webhook route |
| Email | Resend |
| Testing | Vitest v4.1.8, jsdom, React Testing Library |
| Icons | Lucide React |
| Rich Text | Tiptap and React Markdown |

### Required Integrations

- Clerk for admin auth and optional public login.
- Neon Postgres for platform data.
- Paystack for paid tickets and one-time donations.
- Resend for transactional email.
- Vercel for deployment.

---

## 9. Security & Configuration

### Authentication and Authorization

- Admin routes remain Clerk-protected.
- First admin setup remains restricted to empty `admin_users` table behavior.
- Subsequent admins are invite-based.
- Public users may optionally log in later, but public forms must not require login.
- Module permissions replace broad content-only permissions where necessary.

### Module Permissions

Required permissions:

- `manage_events`
- `check_in_attendees`
- `manage_people`
- `manage_programs`
- `manage_donations`
- `manage_workflows`
- `edit_content`
- `view_analytics`
- `access_settings`
- `manage_users`
- `delete_records`
- `export_data`

### Configuration

Required environment areas:

- Clerk publishable and secret keys.
- Neon database URL and project ID.
- Paystack public and secret keys.
- Resend API key.
- App base URL for email links, QR pass URLs, and webhook callbacks.

### Security Requirements

- Verify Paystack webhook signatures.
- Store unique payment references and prevent duplicate processing.
- Never trust client-side Paystack callback as final payment confirmation.
- Log sensitive admin actions.
- Restrict exports to authorized admins.
- Mark minor-sensitive records.
- Add consent checkboxes to public forms that collect personal data.

---

## 10. API Specification

The implementation may use server actions or route handlers, but these interfaces define required product behavior.

### Event Registration

`POST /api/events/:eventId/register`

Request:

```json
{
  "name": "Aisha Musa",
  "email": "aisha@example.com",
  "phone": "+2348012345678",
  "dateOfBirth": "2008-04-12",
  "ticketQuantity": 1,
  "consentAccepted": true
}
```

Response:

```json
{
  "registrationId": "reg_123",
  "paymentRequired": true,
  "paymentReference": "BMAC-EVT-123",
  "status": "pending_payment"
}
```

### Free Event Confirmation

For free events, registration should immediately return confirmed status and issue a pass.

```json
{
  "registrationId": "reg_123",
  "paymentRequired": false,
  "status": "confirmed",
  "passId": "pass_123"
}
```

### Event Check-In

`POST /api/events/:eventId/check-in`

Request:

```json
{
  "passCode": "BMAC-PASS-ABC123",
  "method": "qr_scan"
}
```

Response:

```json
{
  "checkedIn": true,
  "attendeeName": "Aisha Musa",
  "checkedInAt": "2026-07-15T09:35:00.000Z"
}
```

### Program Application

`POST /api/programs/:programId/apply`

Request:

```json
{
  "name": "Joshua Tanko",
  "email": "joshua@example.com",
  "phone": "+2348012345678",
  "dateOfBirth": "2007-10-01",
  "motivation": "I want to improve my public speaking.",
  "consentAccepted": true
}
```

Response:

```json
{
  "applicationId": "app_123",
  "status": "submitted"
}
```

### Donation

`POST /api/donations`

Request:

```json
{
  "name": "Maryam Abdullah",
  "email": "maryam@example.com",
  "amount": 25000,
  "consentAccepted": true
}
```

Response:

```json
{
  "donationId": "don_123",
  "paymentReference": "BMAC-DON-123",
  "status": "pending_payment"
}
```

### Paystack Webhook

`POST /api/webhooks/paystack`

Required behavior:

- Verify `x-paystack-signature`.
- Parse event body.
- For `charge.success`, locate payment reference.
- Idempotently mark related registration or donation as paid.
- Issue event pass or donation receipt if not already issued.
- Record audit log.

---

## 11. Success Criteria

### MVP Success Definition

BMAC can operate one real event, one program application cycle, one donation campaign, and all key public inquiry workflows from the platform without relying on spreadsheets or front-end-only success states.

### Functional Requirements

- [ ] Admin auth flow works reliably from clean install through invite acceptance.
- [ ] Public event registration creates persisted attendee records.
- [ ] Paid event registration is confirmed only after Paystack webhook verification.
- [ ] QR pass is generated and emailed after confirmed registration.
- [ ] Admin can scan QR passes on mobile and manually check in attendees.
- [ ] Program applications are persisted and reviewable by admins.
- [ ] Accepted applicants can be assigned to cohorts.
- [ ] Donations are persisted, verified, receipted, and exportable.
- [ ] Contact and get-involved forms create admin-managed workflow records.
- [ ] Unified people profiles connect multiple engagements from the same person.
- [ ] Module-level permissions restrict admin access correctly.
- [ ] Operational analytics reflect real records.

### Quality Indicators

- Public forms work on mobile.
- Admin event check-in works on mobile.
- Payment processing is idempotent.
- Tests cover critical auth, payment, registration, and workflow paths.
- Admin pages remain usable at mobile and tablet widths.
- Production setup documentation matches actual technology choices.

---

## 12. Implementation Phases

### Phase 1: Stabilization and Production Readiness

Goal: make the existing product reliable before adding operational platform features.

Deliverables:

- [ ] Verify Clerk auth and first/successive admin flows.
- [ ] Fix any `currentUser()` or Clerk package/runtime issues.
- [ ] Confirm invite acceptance paths.
- [ ] Update setup docs and environment variable guidance.
- [ ] Add baseline Paystack persistence model.
- [ ] Run mobile QA and fix critical layout issues.
- [ ] Expand tests around auth and existing workflows.
- [ ] Prepare Vercel/Neon/Clerk/Paystack/Resend production checklist.

Validation:

- Clean install can create first admin and access `/admin`.
- Invite flow works for second admin.
- Existing public/admin pages still render.
- Tests pass with Vitest forks.

### Phase 2: People, Workflows, and Permissions Foundation

Goal: establish the data foundation for platform operations.

Deliverables:

- [ ] Unified people profiles.
- [ ] Workflow records and admin queues.
- [ ] Module-level permissions.
- [ ] Consent and minor-sensitive fields.
- [ ] Admin export/delete privacy workflows.
- [ ] Contact/get-involved forms persisted to workflow queues.

Validation:

- A public form submission creates or links a person profile.
- Admins can view, update, assign, and export workflow records.
- Permissions hide and block unauthorized module access.

### Phase 3: Event Operations MVP

Goal: make BMAC capable of running real event registration, paid ticketing, QR passes, and check-in.

Deliverables:

- [ ] Event capacity and registration settings.
- [ ] Free and paid event registration.
- [ ] Paystack verification for event tickets.
- [ ] QR pass generation.
- [ ] Pass email.
- [ ] Event attendee dashboard.
- [ ] Mobile QR scanner.
- [ ] Manual search check-in fallback.
- [ ] Event exports and operational metrics.

Validation:

- A paid registration remains pending until webhook verification.
- A confirmed attendee receives a pass.
- Admin can check in the attendee by QR and by manual search.
- Dashboard counts update correctly.

### Phase 4: Programs, Donations, Communications, and Analytics

Goal: complete the first full operations platform release.

Deliverables:

- [ ] Program applications and review statuses.
- [ ] Cohorts and participant attendance tracking.
- [ ] One-time donation checkout and verification.
- [ ] Donation receipts.
- [ ] Transactional emails across core workflows.
- [ ] Operational analytics dashboard.

Validation:

- Program application can move through submitted, review, accepted, and cohort assignment.
- Donation is verified by webhook and receipt is sent.
- Analytics reflect real registration, donation, application, and workflow data.

---

## 13. Future Considerations

Post-MVP enhancements:

- Recurring donations and donor portal.
- Public user account dashboard.
- Waitlists, promo codes, refunds, ticket transfers, and group registrations.
- Event surveys and live polls.
- Certificates for program completion.
- Mentor matching.
- Alumni tracking.
- SMS and WhatsApp notifications.
- Bulk newsletters and segmented campaigns.
- Advanced analytics, funnels, attribution, and donor retention reporting.
- Public/self-service check-in kiosk mode.
- Automated guardian consent workflow.
- Multi-language and multi-currency support.

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Current auth issue persists after clean install | Blocks admin access | Stabilization phase must verify/fix Clerk before feature work |
| Payment state inconsistency | Lost revenue or false confirmations | Treat webhook as source of truth; enforce idempotent payment references |
| Scope creep into full CRM/event suite | Delayed delivery | Keep advanced engagement, recurring donations, and complex ticketing out of MVP |
| Minor data handling is under-specified | Privacy and trust risk | Collect age/date of birth, mark under-18 records, require admin review/follow-up |
| Mobile check-in fails in venue conditions | Event operations disruption | Include manual search fallback and mobile QA as acceptance criteria |
| Duplicate people records | Poor reporting and communication | Add profile matching by email/phone and admin merge workflow in later phase if needed |
| Admin permission gaps | Unauthorized access to sensitive data | Implement module-level server-side permission checks, not UI-only hiding |

---

## 15. Appendix

### Current Repository Facts

- Public pages are under `src/app/(public_pages)/`.
- Admin pages are under `src/app/admin/`.
- Shared public layout is `src/components/layouts/PublicLayout.tsx`.
- Admin layout and navigation are in `src/components/admin/AdminLayout.tsx`.
- Neon helper is `src/lib/db.ts`.
- Clerk middleware is `src/proxy.ts`.
- Shared types are in `src/types/cms.ts`.
- Paystack webhook route is `src/app/api/webhooks/paystack/route.ts`.
- Seeded tables include programs, events, news, testimonials, team members, impact stats, gallery items, partners, site settings, activity logs, admin users, invitations, and categories.

### Current Gaps Observed

- Event reservation/payment confirmation is mostly client-side state.
- Paystack webhook verifies signatures but only logs successful charges.
- Program application form shows success state without persistence.
- Get-involved forms show success/payment initiated state without persistence.
- Contact form sends email but does not create an admin-managed workflow record.
- Admin dashboard shows content counts but not operational metrics.
- `SETUP.md` references legacy technologies that conflict with the current Clerk/Neon architecture.

### Research References

- Cvent event management patterns: registration, onsite check-in/badging, attendee engagement, surveys, and event insights.
- Eventbrite organizer patterns: ticketing, registration, attendee management, check-in, and reporting.
- CiviCRM nonprofit patterns: contacts, events, contributions, memberships, mailings, and reporting.
- Donorbox nonprofit patterns: donation forms, event ticketing, donor management, receipts, and analytics.
- Paystack webhook guidance: verify event origin and process payment events server-side.
- WCAG 2.2 accessibility guidance for forms, navigation, and responsive interfaces.

