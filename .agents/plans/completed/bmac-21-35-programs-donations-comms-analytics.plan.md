# Plan: BMAC-21 to BMAC-35 — Programs, Donations, Communications & Analytics

## Summary

This plan covers Phase 4 of the BMAC Next platform: completing the first full operations platform release by implementing program applications with review workflow and cohort management, one-time donation checkout with Paystack verification and receipt emails, transactional emails across all core workflows, and an operational analytics dashboard. The existing foundation (unified people profiles, workflow queues, event operations with QR check-in, module permissions) provides the data model and admin infrastructure.

## User Story

As a **BMAC admin team**, I want to:
- Review and manage program applications through a structured status workflow
- Assign accepted applicants to cohorts and track attendance
- Accept one-time donations via Paystack with instant receipt emails
- Send confirmation emails for all public submissions (contact, join, volunteer, school chapter, partnership, program applications, event registrations, donations)
- View operational metrics (registrations, check-ins, donations, applications, workflow counts, revenue trends) in a dashboard
So that **BMAC can operate real programs, donation campaigns, and all key public inquiry workflows from the platform without spreadsheets or front-end-only success states**.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | HIGH |
| Systems Affected | programs, donations, workflow_records, people, admin dashboard, public pages, email service, Paystack webhook, analytics |
| Jira Issue | N/A |

---

## Patterns to Follow

### Naming
```
// SOURCE: src/types/cms.ts:3-17
export interface Program {
  id: string;
  title: string;
  desc: string;
  longDesc: string;
  // ... existing fields
  // ADD: applications, cohorts, participants
}

// SOURCE: src/actions/people.ts:82-193 (findOrCreatePerson, upsertPersonRecord)
async function findOrCreatePerson(input: { firstName; email; phone?; dateOfBirth? }) {
  // matches by email/phone first, creates if not found
}

// SOURCE: src/actions/workflows.ts:1-60
export async function createWorkflowRecord(input: { kind; refId; title; summary; priority }) {
  // creates workflow_records with status "open"
}
```

### Error Handling
```
// SOURCE: src/app/api/webhooks/paystack/route.ts:1-201
// Pattern: verify signature → parse event → idempotent check → process → response
// All server actions wrap DB calls in try/catch and return { error?: string; data?: T }

// SOURCE: src/components/admin/ProgramForm.tsx:62-93
async function handleSubmit(publishStatus) {
  setError("");
  // validation → setSaving(true) → try/catch → setSaving(false)
  // toast on success, setError on failure
}
```

### Tests
```
// SOURCE: src/__tests__/AdminLayout.test.tsx:1-110
// Pattern: mock admin-context, actions, next/navigation
// render(<Component user={...} />)
// fireEvent.click(screen.getByRole("button", { name: /.../ }))
// await waitFor(() => expect(...).toBeInTheDocument())

// SOURCE: src/__tests__/PaystackWebhook.test.tsx
// Tests webhook signature verification, idempotent processing, email dispatch
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `scripts/migrations/012-program-operations.sql` | CREATE | Add program applications, cohorts, participants, attendance tables; add donation table |
| `src/types/cms.ts` | UPDATE | Add ProgramApplication, Cohort, Participant, Donation types; extend Program |
| `src/actions/programs.ts` | CREATE | Server actions: submitApplication, updateApplicationStatus, createCohort, addParticipant, recordAttendance, getProgramDetail, listApplications |
| `src/actions/donations.ts` | CREATE | Server actions: createDonationIntent, recordDonation, sendReceipt |
| `src/actions/emails.ts` | CREATE | Consolidated email dispatch for all workflow types |
| `src/app/api/webhooks/paystack/route.ts` | UPDATE | Add donation verification branch; idempotent receipt issuance |
| `src/app/admin/(admin)/programs/[id]/page.tsx` | UPDATE | Replace with detail page showing applications, cohorts, participants, attendance |
| `src/app/admin/(admin)/programs/[id]/edit/page.tsx` | UPDATE | Add tabs for Applications / Cohorts / Attendance |
| `src/components/admin/ProgramDetail.tsx` | CREATE | Admin program detail with application review, cohort mgmt, attendance |
| `src/components/admin/ApplicationTable.tsx` | CREATE | Table for program applications with status badges, actions |
| `src/components/admin/CohortTable.tsx` | CREATE | Table for cohorts with participant counts, attendance rates |
| `src/components/admin/ParticipantTable.tsx` | CREATE | Participant list with attendance records |
| `src/app/admin/(admin)/donations/page.tsx` | UPDATE | Enhance with donation details, receipt resend, export |
| `src/components/admin/DonationsTable.tsx` | CREATE | Table for donations with amount, donor, status, receipt actions |
| `src/app/(public_pages)/programs/[id]/page.tsx` | UPDATE | Add application form for published programs |
| `src/components/admin/ProgramApplicationForm.tsx` | CREATE | Public program application form (name, email, phone, DOB, motivation, consent) |
| `src/app/(public_pages)/donate/page.tsx` | CREATE | Public donation page with amount presets, custom amount, Paystack checkout |
| `src/components/ui/DonationForm.tsx` | CREATE | Donation form component |
| `src/app/(public_pages)/contact/actions.ts` | UPDATE | Add email dispatch for contact form |
| `src/app/(public_pages)/get-involved/page.tsx` | UPDATE | Add email dispatch for join/volunteer/school/partner forms |
| `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` | UPDATE | Add email dispatch for event registration |
| `src/lib/emails.ts` | UPDATE | Add templates: application-received, application-status, donation-receipt, program-confirmation |
| `src/app/admin/(admin)/analytics/page.tsx` | CREATE | Operational analytics dashboard |
| `src/components/admin/AnalyticsDashboard.tsx` | CREATE | Charts for registrations, check-ins, donations, applications, workflow counts, revenue |
| `src/lib/analytics.ts` | UPDATE | Add query functions for operational metrics |
| `src/lib/workflows.ts` | UPDATE | Add helper to create workflow records for all submission types |

---

## Tasks

### Task 1: Database Migration — Program Operations & Donations

- **File**: `scripts/migrations/012-program-operations.sql`
- **Action**: CREATE
- **Implement**: 
  - `program_applications` table (id, program_id, person_id, status, motivation, date_of_birth, consent, created_at, updated_at)
  - `cohorts` table (id, program_id, title, start_date, end_date, capacity, created_at)
  - `participants` table (id, cohort_id, person_id, status, joined_at)
  - `attendance_records` table (id, cohort_id, person_id, session_date, present, marked_by, marked_at)
  - `donations` table (id, person_id, amount, currency, reference, status, receipt_sent, created_at)
  - Indexes on foreign keys and status columns
- **Mirror**: `scripts/migrations/011-event-operations.sql`
- **Validate**: `npm run build`

### Task 2: Extend Types — Program Applications, Cohorts, Donations

- **File**: `src/types/cms.ts`
- **Action**: UPDATE
- **Implement**: Add `ProgramApplication`, `Cohort`, `Participant`, `Donation`, `AttendanceRecord` interfaces; extend `Program` with optional `applications`, `cohorts`, `participants` arrays
- **Mirror**: `src/types/cms.ts:3-17`
- **Validate**: `npm run build`

### Task 3: Server Actions — Programs Module

- **File**: `src/actions/programs.ts`
- **Action**: CREATE
- **Implement**:
  - `submitApplication(opts)` — validate, findOrCreatePerson, upsertPersonRecord("program"), create workflow_record("program"), return { applicationId }
  - `updateApplicationStatus(applicationId, status, adminEmail)` — update status, log activity, send status email
  - `createCohort(programId, opts)` — create cohort, return id
  - `addParticipantToCohort(cohortId, personId)` — link person, update application status to "accepted"
  - `recordAttendance(cohortId, personId, sessionDate, present, adminEmail)` — upsert attendance_record
  - `getProgramDetail(programId)` — return program with applications, cohorts, participants
  - `listApplications(programId, status?)` — filtered list
- **Mirror**: `src/actions/events.ts`, `src/actions/people.ts`
- **Validate**: `npm run build`

### Task 4: Server Actions — Donations Module

- **File**: `src/actions/donations.ts`
- **Action**: CREATE
- **Implement**:
  - `createDonationIntent(opts)` — validate, findOrCreatePerson, upsertPersonRecord("donation" pending), create workflow_record("donation"), return { donationId, paymentReference }
  - `recordDonation(reference, payerEmail, amount, currency)` — called by webhook, update donation status to completed, upsertPersonRecord completed, create receipt, send receipt email
  - `sendReceipt(donationId)` — regenerate and resend receipt
- **Mirror**: `src/actions/tickets.ts`, `src/actions/events.ts`
- **Validate**: `npm run build`

### Task 5: Consolidated Email Dispatch

- **File**: `src/actions/emails.ts`
- **Action**: CREATE
- **Implement**: Single exported `sendWorkflowEmail(kind, personEmail, personName, opts)` that routes to correct template based on kind: contact, member, volunteer, partner, program, event_registration, donation, ticket. All templates already defined in `src/lib/email-templates.ts` (application-status, event-reminder, registration-confirmed, ticket-receipt, donation-thanks, contact-autoreply, etc.)
- **Mirror**: `src/lib/email-templates.ts:EMAIL_TEMPLATE_KEY`
- **Validate**: `npm run build`

### Task 6: Paystack Webhook — Donation Verification & Receipt

- **File**: `src/app/api/webhooks/paystack/route.ts`
- **Action**: UPDATE
- **Implement**: In `charge.success` handler, add donation branch alongside event_ticket branch. Verify source_type === "donation". Call `recordDonation` (idempotent by reference). Send receipt via `sendDonationThanksEmail`. Create admin notification with link to `/admin/payments`.
- **Mirror**: existing event_ticket branch (lines 64-139)
- **Validate**: `npm run build`; manual test with Paystack test card

### Task 7: Admin Program Detail Page — Applications, Cohorts, Attendance

- **File**: `src/app/admin/(admin)/programs/[id]/page.tsx`
- **Action**: UPDATE (replace current)
- **Implement**: Server component fetches `getProgramDetail(id)` → renders `<ProgramDetail program={data} />`. Tabs: Overview / Applications / Cohorts / Attendance. Uses `ProgramDetail.tsx` client component.
- **Mirror**: `src/app/admin/(admin)/events/[id]/page.tsx`
- **Validate**: `npm run build`

### Task 8: Admin Program Detail Client Component

- **File**: `src/components/admin/ProgramDetail.tsx`
- **Action**: CREATE
- **Implement**: Tabbed interface. Overview: program metadata. Applications: `<ApplicationTable />`. Cohorts: `<CohortTable />` with "New Cohort" button. Attendance: `<ParticipantTable />` with session date picker and present checkboxes. All mutations via server actions.
- **Mirror**: `src/components/admin/EventAdminDetail.tsx`, `src/components/admin/PeopleTable.tsx`
- **Validate**: `npm run build`

### Task 9: Application Table Component

- **File**: `src/components/admin/ApplicationTable.tsx`
- **Action**: CREATE
- **Implement**: Table with columns: Applicant, Email, Status (badge: submitted/in_review/accepted/waitlisted/rejected/withdrawn), Date, Actions (View, Update Status dropdown, Assign to Cohort). Status update calls `updateApplicationStatus`.
- **Mirror**: `src/components/admin/EventTable.tsx`
- **Validate**: `npm run build`

### Task 10: Cohort Table Component

- **File**: `src/components/admin/CohortTable.tsx`
- **Action**: CREATE
- **Implement**: Table with columns: Cohort Title, Dates, Capacity, Participants, Attendance Rate, Actions (Edit, View Participants, Delete). "New Cohort" modal form.
- **Mirror**: `src/components/admin/EventTable.tsx`
- **Validate**: `npm run build`

### Task 11: Participant Attendance Table

- **File**: `src/components/admin/ParticipantTable.tsx`
- **Action**: CREATE
- **Implement**: Table with columns: Participant, Email, Cohort, Sessions Attended / Total, Actions (View Sessions). Inline present checkbox per session date. `recordAttendance` server action.
- **Mirror**: `src/components/admin/EventAdminDetail.tsx` check-in section
- **Validate**: `npm run build`

### Task 12: Admin Donations Page Enhancement

- **File**: `src/app/admin/(admin)/donations/page.tsx`
- **Action**: UPDATE
- **Implement**: Add donation detail modal (donor info, amount, status, receipt resend button, workflow link). Export CSV button. Filter by status/date.
- **Mirror**: `src/app/admin/(admin)/payments/page.tsx`
- **Validate**: `npm run build`

### Task 13: Donations Table Component

- **File**: `src/components/admin/DonationsTable.tsx`
- **Action**: CREATE
- **Implement**: Table with columns: Donor, Email, Amount, Currency, Status (pending/completed/failed/refunded), Receipt (sent/unsent with resend), Date, Actions (View, Resend Receipt). Server action `sendReceipt`.
- **Mirror**: `src/components/admin/PaymentsTable.tsx`
- **Validate**: `npm run build`

### Task 14: Public Program Application Form

- **File**: `src/app/(public_pages)/programs/[id]/page.tsx`
- **Action**: UPDATE
- **Implement**: If program is published and has `applicationsOpen` (new field), render `<ProgramApplicationForm program={program} />` below overview. Form submits to `submitApplication`.
- **Mirror**: `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx`
- **Validate**: `npm run build`

### Task 15: Program Application Form Component

- **File**: `src/components/admin/ProgramApplicationForm.tsx`
- **Action**: CREATE
- **Implement**: Client form with fields: Full Name, Email, Phone, Date of Birth (for minor flag), Motivation (textarea), Consent checkbox (required). Submit calls `submitApplication`. Shows success state with workflow reference.
- **Mirror**: `src/components/ConsentCheckbox.tsx`, `src/app/(public_pages)/get-involved/page.tsx` form
- **Validate**: `npm run build`

### Task 16: Public Donation Page

- **File**: `src/app/(public_pages)/donate/page.tsx`
- **Action**: CREATE
- **Implement**: Page with hero, amount presets (₦5,000 / ₦10,000 / ₦25,000 / ₦50,000), custom amount input, donor name/email, consent checkbox. Paystack inline checkout loads on submit. Creates donation intent via `createDonationIntent` before Paystack, then redirects to Paystack.
- **Mirror**: `src/app/(public_pages)/get-involved/page.tsx` donation section
- **Validate**: `npm run build`

### Task 17: Donation Form Component

- **File**: `src/components/ui/DonationForm.tsx`
- **Action**: CREATE
- **Implement**: Reusable form component for donation page. Handles amount selection, custom amount, name/email, consent, Paystack callback. Shows loading/success/error states.
- **Mirror**: `src/app/(public_pages)/get-involved/page.tsx` Paystack integration
- **Validate**: `npm run build`

### Task 18: Wire Email Dispatch to All Public Forms

- **Files**: `src/app/(public_pages)/contact/actions.ts`, `src/app/(public_pages)/get-involved/page.tsx`, `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: After creating workflow_record and person_record, call `sendWorkflowEmail(kind, email, name, opts)` for each submission type. Handle email failures gracefully (log, don't block user).
- **Mirror**: existing `createWorkflowRecord` + email in `src/actions/people.ts:414`
- **Validate**: `npm run build`

### Task 19: Email Templates for New Workflow Types

- **File**: `src/lib/emails.ts` (or `src/lib/email-templates.ts`)
- **Action**: UPDATE
- **Implement**: Add templates for `application-status` (accepted/rejected/waitlisted), `program-confirmation` (registration confirmed with cohort info if assigned), verify existing `donation-receipt` works, add `event-reminder` template.
- **Mirror**: `src/lib/email-templates.ts:47-50` (EMAIL_TEMPLATE_KEY list)
- **Validate**: `npm run build`

### Task 20: Operational Analytics Dashboard

- **File**: `src/app/admin/(admin)/analytics/page.tsx`
- **Action**: CREATE
- **Implement**: Server component fetches `getAnalyticsSummary()` → renders `<AnalyticsDashboard data={summary} />`. Protected by `view_analytics` permission. Add to AdminLayout nav under Operations group.
- **Mirror**: `src/app/admin/(admin)/stats/page.tsx`
- **Validate**: `npm run build`

### Task 21: Analytics Dashboard Client Component

- **File**: `src/components/admin/AnalyticsDashboard.tsx`
- **Action**: CREATE
- **Implement**: Grid of metric cards (Registrations, Check-ins, Donations, Applications, Workflow Open, Revenue). Charts: Registrations over time (line), Donations by month (bar), Application status breakdown (pie), Check-in rate by event (horizontal bar). Date range filter (7d/30d/90d/all). Uses `chart.js`/`react-chartjs-2` already in deps.
- **Mirror**: `src/components/admin/DashboardClient.tsx` stats cards
- **Validate**: `npm run build`

### Task 22: Analytics Query Functions

- **File**: `src/lib/analytics.ts`
- **Action**: UPDATE
- **Implement**: Add `getAnalyticsSummary(dateRange)` returning: registrations (total, by event, trend), checkins (total, rate, by event), donations (total amount, count, trend), applications (total, by status, by program), workflows (open counts by kind), revenue (event + donation). SQL queries with date filters.
- **Mirror**: existing `getDashboardStats`, `getVisitorStats`, `getDailyViews`
- **Validate**: `npm run build`

### Task 23: Add Analytics to Admin Navigation

- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: Add "Analytics" to Operations nav group with `href: "/admin/analytics"`, `icon: BarChart`, `permission: "view_analytics"`. Add route permission mapping.
- **Mirror**: existing nav items (lines 70-110)
- **Validate**: `npm run build`

### Task 24: Program Applications Migration Data

- **File**: `scripts/migrations/012-program-operations.sql`
- **Action**: UPDATE (already created in Task 1)
- **Implement**: Ensure migration includes `applications_open` boolean on `programs` table default false; `cohort_id` on `participants`; proper cascading deletes.
- **Mirror**: `011-event-operations.sql` capacity/registration fields
- **Validate**: Apply to Neon via `run_sql`; verify schema

### Task 25: Validation & Smoke Test

- **Action**: VALIDATE
- **Implement**: Run `npm run build`, `npm run lint`, `npm test`. Manual smoke: submit program application → verify workflow record created → admin sees application → update status to accepted → create cohort → add participant → record attendance. Make donation → Paystack test card → webhook confirms → receipt email sent. Visit `/admin/analytics` → verify charts render.

---

## Validation

```bash
# Type check
npm run build

# Lint
npm run lint

# Tests
npm test

# Manual smoke
# 1. /programs/[id] submit application → workflow record + email
# 2. /admin/programs/[id] review application → accept → cohort → participant
# 3. /donate → Paystack test card → webhook → donation completed + receipt
# 4. /admin/analytics → charts render with real data
```

---

## Acceptance Criteria

- [ ] BMAC-21: Program application form on public program page creates persisted application + workflow record; consent required; minor flag on DOB < 18
- [ ] BMAC-22: Admin program detail shows applications with status badges; status update sends email; assign to cohort action
- [ ] BMAC-23: Cohort CRUD with start/end dates, capacity; participant list with attendance tracking per session
- [ ] BMAC-24: Attendance recording via present checkbox per session date; attendance rate per cohort
- [ ] BMAC-25: Public donation page with amount presets + custom; Paystack checkout creates donation intent + workflow
- [ ] BMAC-26: Paystack webhook verifies donation, marks completed, sends receipt email, creates admin notification
- [ ] BMAC-27: Donation receipt email includes amount, donor name, reference, date
- [ ] BMAC-28: Admin donations table shows status, receipt resend, export CSV
- [ ] BMAC-29: All public forms (contact, join, volunteer, school, partner, program, event, donation) send confirmation email on submission
- [ ] BMAC-30: Application status email (accepted/rejected/waitlisted) sent on admin status change
- [ ] BMAC-31: Event registration confirmation email includes pass link
- [ ] BMAC-32: Operational analytics dashboard with metric cards + charts (registrations, check-ins, donations, applications, workflows, revenue)
- [ ] BMAC-33: Analytics date range filter (7d/30d/90d/all) updates all charts
- [ ] BMAC-34: Analytics accessible via admin nav (Operations group) gated by `view_analytics` permission
- [ ] BMAC-35: All builds/lints/tests pass; migrations idempotent; existing event/donation/registration tests still green

---

## Risks

| Risk | Mitigation |
|------|------------|
| Paystack webhook idempotency for donations | Use unique reference + `INSERT ... ON CONFLICT DO NOTHING` pattern; verify `paystack_payments` reference check |
| Duplicate cohort/attendance records | Unique constraints on (cohort_id, person_id, session_date) |
| Email template changes break existing flows | Keep template keys stable; add new keys only; test send in dev |
| Analytics queries slow on large data | Add indexes on created_at, status columns; paginate/filter in UI |
| Minor-sensitive data (DOB) handling | Store DOB, compute age on read, flag in admin UI, exclude from exports without permission |
| Scope creep into advanced features | Stick to PRD Phase 4 deliverables; defer waitlists, certificates, recurring donations |

---

## Plan Created

**File**: `.agents/plans/bmac-21-35-programs-donations-comms-analytics.plan.md`

**Summary**: Phase 4 implementation plan covering program applications with review workflow, cohort/attendance management, one-time donations with Paystack verification and receipts, transactional emails for all public workflows, and an operational analytics dashboard with charts and date filtering.

**Scope**:
- 5 CREATE files (migration, programs.ts, donations.ts, emails.ts, analytics dashboard)
- 18 UPDATE files (types, webhook, admin pages, public pages, email templates, nav, analytics queries)
- 25 total tasks

**Key Patterns**:
- Server action pattern from `src/actions/events.ts` and `src/actions/people.ts`
- Admin detail page pattern from `src/app/admin/(admin)/events/[id]/page.tsx`
- Table component pattern from `src/components/admin/EventTable.tsx` and `src/components/admin/PaymentsTable.tsx`
- Email template pattern from `src/lib/email-templates.ts`
- Migration pattern from `scripts/migrations/011-event-operations.sql`

**Next Step**: Review the plan, then implement tasks in order starting with Task 1 (migration).