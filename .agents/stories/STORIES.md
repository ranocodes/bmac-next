# BMAC Jira Stories

Generated: 2026-06-27  
Source PRD: `.agents/PRDs/PRD.md`  
Jira Project Name: BMAC  
Jira Project Key: BMAC  
Epic: Not provided  

Atlassian MCP is not configured in this session, so these stories are generated as Jira-ready markdown only.

---

## Story Index

| ID | Title | Jira Type | Priority | Phase |
|---|---|---:|---:|---|
| BMAC-S001 | Verify and fix Clerk admin bootstrap auth | Bug | High | Phase 1 |
| BMAC-S002 | Verify admin invite acceptance paths | Bug | High | Phase 1 |
| BMAC-S003 | Align setup documentation and environment variables | Task | High | Phase 1 |
| BMAC-S004 | Add Paystack payment persistence baseline | Task | High | Phase 1 |
| BMAC-S005 | Complete public and admin mobile QA fixes | Task | High | Phase 1 |
| BMAC-S006 | Add stabilization regression test coverage | Task | High | Phase 1 |
| BMAC-S007 | Prepare production deployment checklist | Task | Medium | Phase 1 |
| BMAC-S008 | Create unified people profile data model | Story | High | Phase 2 |
| BMAC-S009 | Add module-level admin permissions | Story | High | Phase 2 |
| BMAC-S010 | Create workflow record data model | Story | High | Phase 2 |
| BMAC-S011 | Persist contact and get-involved submissions | Story | High | Phase 2 |
| BMAC-S012 | Add consent, privacy, and minor-sensitive handling | Story | High | Phase 2 |
| BMAC-S013 | Build admin workflow queue UI | Story | High | Phase 2 |
| BMAC-S014 | Add transactional email foundation | Story | High | Phase 2 |
| BMAC-S015 | Expand event model with operational settings | Story | High | Phase 3 |
| BMAC-S016 | Build public event registration flow | Story | High | Phase 3 |
| BMAC-S017 | Implement paid event ticket verification | Story | High | Phase 3 |
| BMAC-S018 | Generate and email event QR passes | Story | High | Phase 3 |
| BMAC-S019 | Build mobile QR check-in scanner | Story | High | Phase 3 |
| BMAC-S020 | Build manual attendee check-in fallback | Story | High | Phase 3 |
| BMAC-S021 | Build event attendee dashboard and export | Story | High | Phase 3 |
| BMAC-S022 | Add event operational analytics | Story | Medium | Phase 3 |
| BMAC-S023 | Persist public program applications | Story | High | Phase 4 |
| BMAC-S024 | Build program application review workflow | Story | High | Phase 4 |
| BMAC-S025 | Add cohorts and participant assignment | Story | High | Phase 4 |
| BMAC-S026 | Add program attendance and outcomes | Story | Medium | Phase 4 |
| BMAC-S027 | Build one-time donation checkout | Story | High | Phase 4 |
| BMAC-S028 | Verify donations and send receipts | Story | High | Phase 4 |
| BMAC-S029 | Build donations admin list and export | Story | Medium | Phase 4 |
| BMAC-S030 | Build operational analytics dashboard | Story | Medium | Phase 4 |
| BMAC-S031 | Add workflow and status transactional emails | Story | Medium | Phase 4 |
| BMAC-S032 | Add end-to-end acceptance coverage | Task | High | Phase 4 |

---

## BMAC-S001 Verify and Fix Clerk Admin Bootstrap Auth

**Type**: Bug  
**Jira Type**: Bug  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `auth`, `clerk`, `admin`, `backend`

### Description
As a Super Admin, I want the first-time Clerk signup and admin bootstrap flow to work reliably, so that a clean installation can access the admin dashboard.

### Acceptance Criteria
- [ ] Given an empty `admin_users` table, when the first Clerk user signs up and visits `/admin`, then a `super_admin` record is created.
- [ ] Given the first admin exists, when they revisit `/admin`, then the admin dashboard renders without `ClerkAPIResponseError`.
- [ ] Given Clerk user data is unavailable or invalid, when `/admin` loads, then the app fails safely with a clear login/access state.
- [ ] Given a clean install, when the auth flow is tested manually, then the result is documented in the handoff or issue notes.

### Technical Notes
- Inspect `src/app/admin/layout.tsx`, `src/lib/auth/server.ts`, and `src/proxy.ts`.
- Do not reintroduce `middleware.ts`; Next.js 16 uses `proxy.ts` in this project.
- Preserve Clerk hosted auth pages.

### Dependencies
- Blocked by: None
- Blocks: BMAC-S002, BMAC-S006, BMAC-S007

---

## BMAC-S002 Verify Admin Invite Acceptance Paths

**Type**: Bug  
**Jira Type**: Bug  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `auth`, `clerk`, `invitations`, `admin`

### Description
As a Super Admin, I want invited admins to accept invitations whether they are new or existing Clerk users, so that staff onboarding works reliably.

### Acceptance Criteria
- [ ] Given an admin creates an invite, when the invite is submitted, then an invitation row is created and the email is added to the Clerk allowlist.
- [ ] Given a new user opens an invite link, when they sign up, then an `admin_users` record is created with the invited role and permissions.
- [ ] Given an existing signed-in Clerk user opens an invite link, when they accept, then account creation is skipped and an `admin_users` record is created.
- [ ] Given an expired or reused invite code, when the invite page loads or submits, then the user sees a clear error and no duplicate admin is created.

### Technical Notes
- Inspect `src/actions/invitations.ts` and `src/components/admin/AcceptInviteForm.tsx`.
- Keep `acceptExistingUserInvite` behavior.
- Verify activity logs are written for invite creation and acceptance if supported.

### Dependencies
- Blocked by: BMAC-S001
- Blocks: BMAC-S006, BMAC-S007

---

## BMAC-S003 Align Setup Documentation and Environment Variables

**Type**: Technical  
**Jira Type**: Task  
**Priority**: High  
**Complexity**: Small  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `docs`, `setup`, `environment`

### Description
As a developer, I want setup documentation to match the current Clerk, Neon, Paystack, and Resend stack, so that new contributors do not configure legacy services.

### Acceptance Criteria
- [ ] Given a developer reads setup docs, when they configure auth, then the docs reference Clerk, not Neon Auth.
- [ ] Given a developer configures data storage, when they read setup docs, then Neon Postgres HTTP driver is the primary database path.
- [ ] Given a developer configures payments and email, when they read setup docs, then Paystack and Resend environment variables are documented.
- [ ] Given legacy Supabase or GitHub OAuth references remain, when docs are reviewed, then they are clearly removed or marked obsolete.

### Technical Notes
- Update `SETUP.md` and any `.env.example` file if present.
- Preserve the known Neon IPv4 caveat from `agent_handoff.md`.

### Dependencies
- Blocked by: None
- Blocks: BMAC-S007

---

## BMAC-S004 Add Paystack Payment Persistence Baseline

**Type**: Technical  
**Jira Type**: Task  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `payments`, `paystack`, `database`, `backend`

### Description
As an Admin, I want Paystack webhook success events to be persisted instead of only logged, so that later event and donation features can rely on verified payment state.

### Acceptance Criteria
- [ ] Given Paystack sends `charge.success`, when the webhook signature is valid, then the payment reference and metadata are stored.
- [ ] Given the same Paystack event is delivered twice, when the webhook runs again, then processing remains idempotent.
- [ ] Given a webhook has an invalid signature, when it is received, then no record is created and a 401 response is returned.
- [ ] Given a stored payment exists, when admins or later features query it, then they can identify reference, amount, email, status, and timestamp.

### Technical Notes
- Start from `src/app/api/webhooks/paystack/route.ts`.
- Webhook verification must remain server-side and must not trust the client callback.
- This story creates a baseline payments table/model, not full event ticketing or donations.

### Dependencies
- Blocked by: None
- Blocks: BMAC-S017, BMAC-S028

---

## BMAC-S005 Complete Public and Admin Mobile QA Fixes

**Type**: Technical  
**Jira Type**: Task  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `mobile`, `frontend`, `qa`, `accessibility`

### Description
As a mobile user, I want public and admin pages to be usable on phone and tablet screens, so that BMAC can support field operations and public visitors.

### Acceptance Criteria
- [ ] Given a mobile viewport, when public pages are viewed, then navigation, forms, and content do not overflow horizontally.
- [ ] Given a mobile viewport, when admin pages are viewed, then tables, forms, and side navigation remain usable.
- [ ] Given event check-in will be mobile-first, when admin layouts are tested, then sticky headers and controls do not block core actions.
- [ ] Given critical layout issues are found, when fixes are applied, then they are documented with before/after notes or screenshots.

### Technical Notes
- Prioritize public events, program detail, get involved, contact, admin dashboard, admin event forms, and admin tables.
- Use `agent-browser` if local browser QA is needed.

### Dependencies
- Blocked by: None
- Blocks: BMAC-S019, BMAC-S020

---

## BMAC-S006 Add Stabilization Regression Test Coverage

**Type**: Technical  
**Jira Type**: Task  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `tests`, `vitest`, `auth`, `payments`

### Description
As a developer, I want regression tests for stabilized auth, forms, and payment behavior, so that foundational issues do not reappear.

### Acceptance Criteria
- [ ] Given test setup runs on Node 24, when tests execute, then Vitest uses `pool: "forks"`.
- [ ] Given admin auth helpers are mocked, when admin layout behavior is tested, then first-admin and unauthorized states are covered where feasible.
- [ ] Given Paystack webhook handling exists, when webhook tests run, then valid, invalid, and duplicate events are covered.
- [ ] Given current UI tests emit avoidable DOM warnings, when mocks are adjusted, then warnings are reduced without weakening assertions.

### Technical Notes
- Preserve `src/__tests__/setup.tsx` as `.tsx`.
- Existing tests import `src/__tests__/mocks.tsx`; avoid breaking that pattern.

### Dependencies
- Blocked by: BMAC-S001, BMAC-S002, BMAC-S004
- Blocks: BMAC-S032

---

## BMAC-S007 Prepare Production Deployment Checklist

**Type**: Technical  
**Jira Type**: Task  
**Priority**: Medium  
**Complexity**: Small  
**Phase**: Phase 1 - Stabilization and Production Readiness  
**Labels**: `deployment`, `vercel`, `neon`, `clerk`, `paystack`

### Description
As a project owner, I want a production deployment checklist, so that BMAC can launch with the correct services and secrets.

### Acceptance Criteria
- [ ] Given the app is deployed, when environment variables are configured, then Clerk, Neon, Paystack, Resend, and app base URL are all covered.
- [ ] Given production Paystack is enabled, when webhooks are configured, then webhook URL and signature handling are documented.
- [ ] Given Clerk production is configured, when admin onboarding occurs, then allowlist/invite rules are documented.
- [ ] Given a deployment checklist exists, when another engineer follows it, then no legacy Supabase/Neon Auth steps are required.

### Technical Notes
- This is documentation/checklist work, not actual deployment unless separately requested.

### Dependencies
- Blocked by: BMAC-S001, BMAC-S002, BMAC-S003
- Blocks: None

---

## BMAC-S008 Create Unified People Profile Data Model

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `database`, `crm`, `people`, `backend`

### Description
As an Admin Lead, I want one profile per person across events, donations, programs, and volunteering, so that BMAC can understand each person's full relationship with the organization.

### Acceptance Criteria
- [ ] Given a public form submits name, email, or phone, when the backend handles it, then a person profile is created or linked.
- [ ] Given the same email submits multiple workflows, when records are viewed, then they link to the same person profile.
- [ ] Given a person participates in multiple areas, when admins view the profile, then role tags can represent attendee, donor, applicant, volunteer, partner contact, member, or admin.
- [ ] Given a person profile exists, when exported by authorized admins, then core profile fields are included.

### Technical Notes
- Add tables/types for people and role tags.
- Matching should start with email and phone; advanced merge workflow can be future work.
- Use `public.` schema prefix in raw queries.

### Dependencies
- Blocked by: BMAC-S003
- Blocks: BMAC-S010, BMAC-S011, BMAC-S016, BMAC-S023, BMAC-S027

---

## BMAC-S009 Add Module-Level Admin Permissions

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `auth`, `rbac`, `admin`, `security`

### Description
As a Super Admin, I want module-level permissions, so that staff can access only the parts of the platform they are responsible for.

### Acceptance Criteria
- [ ] Given an admin has event permissions, when they open event admin pages, then access is allowed.
- [ ] Given an admin lacks donation permissions, when they attempt donation admin routes, then access is denied server-side.
- [ ] Given permissions are edited from the users page, when changes are saved, then navigation and route access reflect the new permissions.
- [ ] Given export permissions are separate, when a non-export admin views a list, then export controls are hidden and blocked.

### Technical Notes
- Extend `Permission` in `src/types/cms.ts`.
- Update `src/components/admin/AdminLayout.tsx` and server-side route checks.
- Do not rely on UI hiding alone.

### Dependencies
- Blocked by: BMAC-S001
- Blocks: BMAC-S013, BMAC-S021, BMAC-S029, BMAC-S030

---

## BMAC-S010 Create Workflow Record Data Model

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `database`, `workflows`, `backend`

### Description
As a Communications Admin, I want public submissions to become structured workflow records, so that inquiries and applications can be tracked through completion.

### Acceptance Criteria
- [ ] Given any supported public workflow is submitted, when the backend persists it, then a workflow record is created with type, status, source, and timestamps.
- [ ] Given a workflow belongs to a person, when the record is viewed, then the linked person profile is available.
- [ ] Given an admin updates workflow status, when the record is saved, then status history or audit logging is preserved.
- [ ] Given a workflow is assigned, when another admin views the queue, then assignee is visible.

### Technical Notes
- Workflow types include contact, join, volunteer, school chapter, partnership, program application, event registration, and donation.
- Program/event/donation-specific records may have dedicated tables but should link into workflow or activity history.

### Dependencies
- Blocked by: BMAC-S008
- Blocks: BMAC-S011, BMAC-S013, BMAC-S023, BMAC-S027

---

## BMAC-S011 Persist Contact and Get-Involved Submissions

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `forms`, `workflows`, `frontend`, `backend`

### Description
As a Communications Admin, I want contact and get-involved forms to create persisted records, so that no inquiry is lost in email or front-end state.

### Acceptance Criteria
- [ ] Given the contact form is submitted, when validation passes, then a workflow record and person profile are created or linked.
- [ ] Given a join, volunteer, school chapter, or partnership modal is submitted, when validation passes, then the correct workflow type is stored.
- [ ] Given submission fails, when the public user submits the form, then they see a clear error and no false success state.
- [ ] Given submission succeeds, when the public user sees confirmation, then the record is visible in the admin workflow queue.

### Technical Notes
- Replace front-end-only `submitted` state in get-involved flows with server-backed submission.
- Contact currently sends email through Resend; preserve email but add persistence.

### Dependencies
- Blocked by: BMAC-S008, BMAC-S010
- Blocks: BMAC-S013, BMAC-S031

---

## BMAC-S012 Add Consent, Privacy, and Minor-Sensitive Handling

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `privacy`, `security`, `forms`, `admin`

### Description
As an Admin Lead, I want consent, export/delete workflows, and minor-sensitive flags, so that BMAC handles personal data responsibly.

### Acceptance Criteria
- [ ] Given a public form collects personal data, when rendered, then it includes a required consent checkbox.
- [ ] Given date of birth or age indicates under 18, when a profile is created, then the record is marked minor-sensitive for admin review.
- [ ] Given an authorized admin requests data export for a person, when export is run, then profile and linked records are returned.
- [ ] Given an authorized admin deletes or anonymizes personal data, when the action completes, then an audit log is created.

### Technical Notes
- Automated guardian consent is out of MVP.
- Use Nigeria/NGN/English assumptions; no multi-locale privacy workflows in v1.

### Dependencies
- Blocked by: BMAC-S008, BMAC-S009
- Blocks: BMAC-S016, BMAC-S023, BMAC-S027

---

## BMAC-S013 Build Admin Workflow Queue UI

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `admin`, `workflows`, `frontend`, `backend`

### Description
As a Communications Admin, I want an admin workflow queue, so that submitted inquiries and applications can be assigned, reviewed, and resolved.

### Acceptance Criteria
- [ ] Given workflow records exist, when an authorized admin opens the queue, then records are listed with type, status, person, assignee, and date.
- [ ] Given an admin filters by status or type, when filters are applied, then the list updates correctly.
- [ ] Given an admin updates status, assignee, notes, or last contacted date, when saved, then changes persist.
- [ ] Given an admin lacks workflow permission, when they access the queue, then access is blocked.

### Technical Notes
- Add admin navigation entry under Management or a new Operations group.
- Reuse existing admin table/form styling patterns.

### Dependencies
- Blocked by: BMAC-S009, BMAC-S010, BMAC-S011
- Blocks: BMAC-S030

---

## BMAC-S014 Add Transactional Email Foundation

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 2 - People, Workflows, and Permissions Foundation  
**Labels**: `email`, `resend`, `backend`

### Description
As a public user, I want confirmation emails after important submissions, so that I know BMAC received my request.

### Acceptance Criteria
- [ ] Given a server action needs to send email, when it calls the email service, then sender, recipient, subject, and body are validated.
- [ ] Given an email send fails, when the workflow record exists, then failure is recorded without losing the submission.
- [ ] Given an email is sent, when admins inspect related records, then delivery status is visible where practical.
- [ ] Given Resend API key is missing, when email sending is attempted, then the app fails safely and logs a clear server-side error.

### Technical Notes
- Build a shared server-side email utility around existing Resend usage.
- Keep email templates simple for v1.

### Dependencies
- Blocked by: BMAC-S010
- Blocks: BMAC-S018, BMAC-S028, BMAC-S031

---

## BMAC-S015 Expand Event Model With Operational Settings

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `database`, `admin`, `backend`

### Description
As an Events Coordinator, I want events to include capacity and registration settings, so that event records support real operations.

### Acceptance Criteria
- [ ] Given an admin creates or edits an event, when operational fields are entered, then capacity, registration state, payment mode, and price persist.
- [ ] Given registration is closed, when a public user opens the event page, then registration controls are disabled or hidden with clear messaging.
- [ ] Given an event reaches capacity, when another public user attempts registration, then registration is blocked.
- [ ] Given existing seeded events lack new fields, when viewed, then safe defaults are applied.

### Technical Notes
- Extend current event CRUD and schema from content-only fields.
- Preserve current public event pages and admin event table behavior.

### Dependencies
- Blocked by: BMAC-S008, BMAC-S009
- Blocks: BMAC-S016, BMAC-S017, BMAC-S021

---

## BMAC-S016 Build Public Event Registration Flow

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `registration`, `frontend`, `backend`

### Description
As a public visitor, I want to register for a free or paid event, so that BMAC can record my attendance request and issue the correct next step.

### Acceptance Criteria
- [ ] Given a free event is open, when a user submits valid registration details and consent, then a confirmed registration is created.
- [ ] Given a paid event is open, when a user submits valid details, then a pending payment registration and Paystack reference are created.
- [ ] Given a duplicate registration is attempted for the same event and email, when submitted, then the user sees a clear duplicate message.
- [ ] Given validation fails, when the form submits, then missing fields are shown and no registration is created.

### Technical Notes
- Replace client-only reservation state in `EventDetailClient`.
- Link registration to unified person profile and workflow/activity history.

### Dependencies
- Blocked by: BMAC-S008, BMAC-S012, BMAC-S015
- Blocks: BMAC-S017, BMAC-S018, BMAC-S021, BMAC-S022

---

## BMAC-S017 Implement Paid Event Ticket Verification

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `payments`, `paystack`, `backend`

### Description
As an Events Coordinator, I want paid ticket registrations confirmed only after Paystack verification, so that attendance and revenue records are trustworthy.

### Acceptance Criteria
- [ ] Given a paid event registration is created, when Paystack checkout starts, then the payment reference maps to that registration.
- [ ] Given Paystack sends a valid `charge.success`, when the webhook processes it, then the registration becomes paid and confirmed.
- [ ] Given Paystack callback fires in the browser, when webhook has not verified payment, then final status does not become confirmed.
- [ ] Given duplicate webhook delivery occurs, when processed, then registration and payment state are not duplicated.

### Technical Notes
- Reuse baseline payment persistence from BMAC-S004.
- The webhook is the source of truth.

### Dependencies
- Blocked by: BMAC-S004, BMAC-S016
- Blocks: BMAC-S018, BMAC-S021, BMAC-S022

---

## BMAC-S018 Generate and Email Event QR Passes

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `qr`, `email`, `frontend`, `backend`

### Description
As a registered attendee, I want to receive a QR pass after confirmation, so that I can enter the event quickly.

### Acceptance Criteria
- [ ] Given a free registration is confirmed, when the registration completes, then a unique pass code is generated.
- [ ] Given a paid registration is verified, when Paystack confirmation is processed, then a unique pass code is generated.
- [ ] Given a pass is generated, when email sending succeeds, then the attendee receives event details and QR/pass code.
- [ ] Given the same confirmation is processed twice, when pass generation runs again, then only one active pass remains.

### Technical Notes
- QR may be generated as image, signed token, or pass code representation, but must be scannable by the check-in UI.
- Email foundation comes from BMAC-S014.

### Dependencies
- Blocked by: BMAC-S014, BMAC-S016, BMAC-S017
- Blocks: BMAC-S019, BMAC-S020

---

## BMAC-S019 Build Mobile QR Check-In Scanner

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `check-in`, `mobile`, `frontend`

### Description
As an on-site admin, I want to scan attendee QR passes from my phone browser, so that check-in is fast during events.

### Acceptance Criteria
- [ ] Given an authorized admin opens the check-in page on mobile, when camera permission is granted, then QR scanning starts.
- [ ] Given a valid unredeemed pass is scanned, when check-in completes, then attendee status becomes checked in.
- [ ] Given an invalid, wrong-event, or already checked-in pass is scanned, when processed, then a clear error or warning appears.
- [ ] Given the admin lacks check-in permission, when they access scanner routes, then access is blocked.

### Technical Notes
- Must work in a secure browser context in production.
- Manual fallback is covered separately in BMAC-S020.

### Dependencies
- Blocked by: BMAC-S005, BMAC-S009, BMAC-S018
- Blocks: BMAC-S021, BMAC-S032

---

## BMAC-S020 Build Manual Attendee Check-In Fallback

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Small  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `check-in`, `admin`, `frontend`

### Description
As an on-site admin, I want to search attendees manually, so that check-in still works if QR scanning fails.

### Acceptance Criteria
- [ ] Given an authorized admin opens manual check-in, when they search by name or email, then matching confirmed attendees are shown.
- [ ] Given a confirmed attendee is selected, when check-in is clicked, then the attendee is marked checked in.
- [ ] Given an attendee is already checked in, when viewed, then the UI shows checked-in status and timestamp.
- [ ] Given an attendee is unpaid or unconfirmed, when viewed, then check-in is blocked or clearly warned.

### Technical Notes
- Must be available from the same event operations/check-in area as scanner.

### Dependencies
- Blocked by: BMAC-S005, BMAC-S009, BMAC-S018
- Blocks: BMAC-S021, BMAC-S032

---

## BMAC-S021 Build Event Attendee Dashboard and Export

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `admin`, `exports`, `analytics`

### Description
As an Events Coordinator, I want an attendee dashboard per event, so that I can manage registration, payment, attendance, and exports.

### Acceptance Criteria
- [ ] Given an event has registrations, when an admin opens the attendee dashboard, then attendees, payment status, pass status, and check-in status are visible.
- [ ] Given the admin filters by status, when filters are applied, then attendee list updates.
- [ ] Given the admin has export permission, when export is clicked, then attendee data downloads.
- [ ] Given the admin lacks export permission, when they view the dashboard, then export is hidden and server-side blocked.

### Technical Notes
- Add event-specific admin route or tab under existing events admin.
- Respect module permissions from BMAC-S009.

### Dependencies
- Blocked by: BMAC-S009, BMAC-S016, BMAC-S017, BMAC-S019, BMAC-S020
- Blocks: BMAC-S022, BMAC-S030

---

## BMAC-S022 Add Event Operational Analytics

**Type**: Feature  
**Jira Type**: Story  
**Priority**: Medium  
**Complexity**: Medium  
**Phase**: Phase 3 - Event Operations MVP  
**Labels**: `events`, `analytics`, `admin`

### Description
As an Events Coordinator, I want event metrics, so that I can understand registrations, revenue, check-ins, and attendance rate.

### Acceptance Criteria
- [ ] Given event registrations exist, when analytics load, then total, confirmed, pending, cancelled, and checked-in counts are shown.
- [ ] Given paid event registrations exist, when analytics load, then verified revenue is shown.
- [ ] Given check-ins occur, when metrics refresh, then attendance rate is calculated.
- [ ] Given admins filter by event/date, when filters are applied, then metrics update.

### Technical Notes
- Use verified payment records only for revenue.
- This can be event-specific first; broader analytics dashboard is BMAC-S030.

### Dependencies
- Blocked by: BMAC-S017, BMAC-S021
- Blocks: BMAC-S030

---

## BMAC-S023 Persist Public Program Applications

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `programs`, `applications`, `forms`, `backend`

### Description
As a public visitor, I want to apply to a program and receive confirmation, so that BMAC can review my application.

### Acceptance Criteria
- [ ] Given a published program has applications open, when a user submits valid details and consent, then an application record is created.
- [ ] Given the applicant is under 18, when the application is stored, then the linked person is marked minor-sensitive.
- [ ] Given the same email applies twice to the same program, when submitted, then duplicate handling prevents accidental duplicates.
- [ ] Given submission succeeds, when the user sees confirmation, then the application is visible to admins.

### Technical Notes
- Replace front-end-only submitted state in `ProgramDetailClient`.
- Link application to person profile and workflow history.

### Dependencies
- Blocked by: BMAC-S008, BMAC-S010, BMAC-S012
- Blocks: BMAC-S024, BMAC-S031

---

## BMAC-S024 Build Program Application Review Workflow

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `programs`, `admin`, `workflow`

### Description
As a Programs Coordinator, I want to review applications and update statuses, so that applicants move through a clear admissions workflow.

### Acceptance Criteria
- [ ] Given applications exist, when an authorized admin opens program applications, then they can filter by program and status.
- [ ] Given an application is reviewed, when status changes to in review, accepted, waitlisted, rejected, or withdrawn, then the status persists.
- [ ] Given status changes, when audit logs are viewed, then the admin action is recorded.
- [ ] Given an admin lacks program permissions, when they access application review, then access is blocked.

### Technical Notes
- Status set comes from PRD: submitted, in review, accepted, waitlisted, rejected, withdrawn.

### Dependencies
- Blocked by: BMAC-S009, BMAC-S023
- Blocks: BMAC-S025, BMAC-S031

---

## BMAC-S025 Add Cohorts and Participant Assignment

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `programs`, `cohorts`, `participants`, `admin`

### Description
As a Programs Coordinator, I want to assign accepted applicants to cohorts, so that BMAC can manage active program groups.

### Acceptance Criteria
- [ ] Given a program exists, when an admin creates a cohort, then cohort name, schedule, dates, and capacity are stored.
- [ ] Given an application is accepted, when assigned to a cohort, then a participant record is created or linked.
- [ ] Given a cohort has participants, when the cohort detail is opened, then participant list is visible.
- [ ] Given a participant is removed or moved, when saved, then the change is persisted and logged.

### Technical Notes
- Cohorts link to existing programs and people profiles.
- Keep advanced learning operations out of v1.

### Dependencies
- Blocked by: BMAC-S024
- Blocks: BMAC-S026, BMAC-S030

---

## BMAC-S026 Add Program Attendance and Outcomes

**Type**: Feature  
**Jira Type**: Story  
**Priority**: Medium  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `programs`, `attendance`, `outcomes`, `admin`

### Description
As a Programs Coordinator, I want to track participant attendance and basic outcomes, so that BMAC can report program impact.

### Acceptance Criteria
- [ ] Given a cohort has participants, when an admin records attendance for a meeting date, then present/absent status persists.
- [ ] Given attendance exists, when the participant profile is viewed, then attendance history is visible.
- [ ] Given a participant completes, drops, or becomes certificate eligible, when outcome is updated, then the outcome persists.
- [ ] Given program metrics are viewed, when attendance/outcomes exist, then completion and attendance summaries are available.

### Technical Notes
- Certificates are roadmap only; this story only tracks certificate eligibility as a basic outcome.

### Dependencies
- Blocked by: BMAC-S025
- Blocks: BMAC-S030

---

## BMAC-S027 Build One-Time Donation Checkout

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `donations`, `payments`, `frontend`, `backend`

### Description
As a donor, I want to make a one-time donation, so that I can financially support BMAC.

### Acceptance Criteria
- [ ] Given a donor selects a preset or custom amount, when they submit valid details and consent, then a pending donation record is created.
- [ ] Given Paystack checkout starts, when initialized, then the payment reference maps to the donation record.
- [ ] Given validation fails, when the donor submits, then missing fields are shown and no payment starts.
- [ ] Given a donation is pending, when admins view donations, then it is distinguishable from verified donations.

### Technical Notes
- Replace current get-involved donation front-end-only state.
- Recurring donations are out of MVP.

### Dependencies
- Blocked by: BMAC-S008, BMAC-S010, BMAC-S012
- Blocks: BMAC-S028, BMAC-S029, BMAC-S030

---

## BMAC-S028 Verify Donations and Send Receipts

**Type**: Feature  
**Jira Type**: Story  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `donations`, `payments`, `email`, `paystack`

### Description
As a donor, I want my donation verified and receipted, so that I have proof BMAC received my support.

### Acceptance Criteria
- [ ] Given Paystack sends a valid `charge.success` for a donation, when webhook processes it, then donation status becomes verified.
- [ ] Given donation verification completes, when receipt email sends, then the donor receives amount, date, and reference.
- [ ] Given duplicate webhook delivery occurs, when processed, then receipt is not sent twice unless explicitly retried.
- [ ] Given receipt sending fails, when admin views donation, then email failure status is visible.

### Technical Notes
- Reuse Paystack baseline and transactional email foundation.
- Only one-time donations in v1.

### Dependencies
- Blocked by: BMAC-S004, BMAC-S014, BMAC-S027
- Blocks: BMAC-S029, BMAC-S030

---

## BMAC-S029 Build Donations Admin List and Export

**Type**: Feature  
**Jira Type**: Story  
**Priority**: Medium  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `donations`, `admin`, `exports`

### Description
As a Finance Admin, I want to view and export donations, so that I can reconcile financial support and report revenue.

### Acceptance Criteria
- [ ] Given donations exist, when an authorized admin opens donations, then donor, amount, reference, status, and date are visible.
- [ ] Given filters are applied, when status or date range changes, then the list updates.
- [ ] Given an admin has export permission, when export is clicked, then donation data downloads.
- [ ] Given an admin lacks donation permission, when they access donation admin routes, then access is blocked.

### Technical Notes
- Use module permissions and export permissions from BMAC-S009.

### Dependencies
- Blocked by: BMAC-S009, BMAC-S028
- Blocks: BMAC-S030

---

## BMAC-S030 Build Operational Analytics Dashboard

**Type**: Feature  
**Jira Type**: Story  
**Priority**: Medium  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `analytics`, `admin`, `dashboard`

### Description
As an Admin Lead, I want operational metrics across events, programs, donations, and workflows, so that I can understand BMAC activity and impact.

### Acceptance Criteria
- [ ] Given registrations exist, when analytics load, then registration and check-in totals are shown.
- [ ] Given donations exist, when analytics load, then verified donation totals and trends are shown.
- [ ] Given program applications and cohorts exist, when analytics load, then application status and participant summaries are shown.
- [ ] Given workflow records exist, when analytics load, then counts by type and status are shown.
- [ ] Given an admin lacks analytics permission, when they access analytics, then access is blocked.

### Technical Notes
- Operational metrics only; advanced funnels and attribution are roadmap.
- Add to dashboard or separate analytics route based on existing admin design.

### Dependencies
- Blocked by: BMAC-S013, BMAC-S022, BMAC-S026, BMAC-S029
- Blocks: BMAC-S032

---

## BMAC-S031 Add Workflow and Status Transactional Emails

**Type**: Feature  
**Jira Type**: Story  
**Priority**: Medium  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `email`, `workflows`, `programs`, `communications`

### Description
As a public user, I want to receive confirmation and status emails, so that I know BMAC has received and processed my request.

### Acceptance Criteria
- [ ] Given a contact or get-involved workflow is submitted, when persistence succeeds, then an acknowledgment email is sent.
- [ ] Given a program application is submitted, when persistence succeeds, then an application received email is sent.
- [ ] Given a program application status changes, when the admin chooses to notify the applicant, then a status update email is sent.
- [ ] Given an email fails, when the admin views the workflow/application, then failure status is visible.

### Technical Notes
- Build on BMAC-S014.
- Do not add bulk newsletter/SMS/WhatsApp in v1.

### Dependencies
- Blocked by: BMAC-S014, BMAC-S011, BMAC-S023, BMAC-S024
- Blocks: BMAC-S032

---

## BMAC-S032 Add End-to-End Acceptance Coverage

**Type**: Technical  
**Jira Type**: Task  
**Priority**: High  
**Complexity**: Medium  
**Phase**: Phase 4 - Programs, Donations, Communications, and Analytics  
**Labels**: `tests`, `qa`, `acceptance`, `e2e`

### Description
As a project owner, I want acceptance coverage for the full platform MVP, so that critical operational workflows are verified before launch.

### Acceptance Criteria
- [ ] Given the event workflow is tested, when a free registration is created, pass issued, and attendee checked in, then all states are verified.
- [ ] Given the paid event workflow is tested, when Paystack webhook verifies payment, then registration and pass issuance are verified.
- [ ] Given program application workflow is tested, when an applicant is accepted and assigned to a cohort, then the full path is verified.
- [ ] Given donation workflow is tested, when webhook verifies payment, then donation status and receipt behavior are verified.
- [ ] Given permissions are tested, when restricted admins attempt unauthorized actions, then access is blocked server-side.

### Technical Notes
- Use Vitest/RTL where feasible; add browser-based/manual acceptance scripts if full E2E tooling is not present.
- Keep Node 24 Vitest fork pool constraint.

### Dependencies
- Blocked by: BMAC-S006, BMAC-S019, BMAC-S020, BMAC-S030, BMAC-S031
- Blocks: None

---

## Dependency Summary

- Phase 1 blocks all later operational work.
- Unified people profiles (`BMAC-S008`) block workflow, event, program, and donation persistence.
- Module permissions (`BMAC-S009`) block protected admin surfaces and exports.
- Payment persistence (`BMAC-S004`) blocks paid event and donation verification.
- Transactional email foundation (`BMAC-S014`) blocks QR pass emails, donation receipts, and workflow confirmations.
- Event check-in stories depend on QR pass issuance.
- Operational analytics depends on event, program, donation, and workflow data being available.

---

## Jira Import Notes

Use these settings if importing manually into Jira:

- Project key: `BMAC`
- Issue type mapping:
  - `Story` for Feature and Enhancement
  - `Task` for Technical
  - `Bug` for known fixes
- Suggested labels are listed per story.
- No epic key was provided. Create an epic such as `BMAC Platform MVP` first, then link these stories under it.

To push stories automatically in a future session, configure Atlassian MCP and re-run the create-stories flow with:

```bash
/create-stories .agents/PRDs/PRD.md --project BMAC --epic BMAC-<EPIC_NUMBER>
```

