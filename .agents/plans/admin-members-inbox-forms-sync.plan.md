# Plan: Admin Members, Inbox, Forms, and Application Sync

## Summary

Build a cleaner admin application workflow by separating true members from general people records, narrowing Inbox and Forms to application-only work, moving program form editing into the Programs editor, and making public application pages render from saved form definitions instead of hardcoded fields. The implementation should reuse the existing `people`, `person_records`, `workflow_records`, `form_definitions`, `form_submissions`, `program_applications`, `cohorts`, and `participants` tables rather than adding a parallel workflow.

## User Story

As a BMAC admin
I want only real applicants and accepted members to appear in the correct admin areas
So that membership, volunteer, and cohort decisions are managed without noise from donors, event attendees, or static forms.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT / BUG_FIX |
| Complexity | HIGH |
| Systems Affected | Admin navigation, Members/People, Inbox workflows, form editor, public application pages, program application actions, email actions, tests |
| Jira Issue | N/A |

---

## Patterns to Follow

### Data Mapping
```ts
// SOURCE: src/actions/forms.ts:20
function rowToFormDefinition(row: FormDefDbRow): FormDefinition {
  let questions: FormQuestion[] = [];
  try {
    questions = typeof row.questions === "string" ? JSON.parse(row.questions) : (row.questions ?? []);
  } catch {
    questions = [];
  }
```

Use row-mapping helpers for DB JSON fields. Add helpers near the action that owns the data instead of parsing JSON in components.

### Form CRUD
```ts
// SOURCE: src/actions/forms.ts:63
export async function getFormDefinition(
  entityType: string,
  entityId?: string
): Promise<FormDefinition | null> {
```

Continue to use `entity_type` plus optional `entity_id` for global forms and program-specific forms. Keep the public page and admin editor using the same `FormQuestion[]` shape.

### Admin Form Editor
```tsx
// SOURCE: src/app/admin/(admin)/forms/[entityType]/page.tsx:41
useEffect(() => {
  async function load() {
    const [def, subs] = await Promise.all([
      getFormDefinition(entityType, programId ?? undefined),
      getFormSubmissions(entityType, programId ?? undefined),
    ]);
```

Reuse `FormEditor` as the editing surface. For programs, embed it in `ProgramForm`/program editor rather than exposing program cards under `/admin/forms`.

### Workflow Updates
```ts
// SOURCE: src/actions/workflows.ts:128
export async function updateWorkflowStatus(
  id: string,
  opts: {
    status?: WorkflowStatus;
    priority?: WorkflowPriority;
```

Keep workflow status history in `details.history`; add application-specific actions around this instead of duplicating status history logic in components.

### Program Decisions
```ts
// SOURCE: src/actions/programs.ts:362
export async function updateApplicationStatus(input: {
  applicationId: string;
  status: "submitted" | "in_review" | "accepted" | "waitlisted" | "rejected" | "withdrawn";
  adminEmail: string;
}): Promise<{ success: boolean; error?: string }> {
```

Program/cohort application accept/reject should update `program_applications`, send the existing status emails, and then synchronize the corresponding workflow record.

### Existing Bug to Preserve Against
```ts
// SOURCE: src/actions/workflows.ts:94
if (record.refId) {
  const pRows = await db.query(
    "SELECT id, first_name, last_name, email, phone FROM public.people WHERE id = $1",
    [record.refId]
  );
```

`workflow.refId` is a person id for get-involved applications, but a program application id for cohort applications. The workflow detail loader must resolve both.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/actions/people.ts` | UPDATE | Add accepted-members query and accept/reject helpers for member/volunteer applications. |
| `src/app/admin/(admin)/people/page.tsx` | MOVE/REPLACE | Rename route surface to `/admin/members`; optionally redirect old `/admin/people`. |
| `src/app/admin/(admin)/people/[id]/page.tsx` | MOVE/REPLACE | Rename detail surface to `/admin/members/[id]`; keep old route redirect if needed. |
| `src/app/admin/(admin)/members/page.tsx` | CREATE | Members list page backed by accepted-only warehouse data. |
| `src/app/admin/(admin)/members/[id]/page.tsx` | CREATE | Member detail page using existing `PersonDetail` pattern or a renamed version. |
| `src/components/admin/PeopleTable.tsx` | UPDATE/RENAME | Rename UI to Members, remove donor/attendee language, and show only member statuses. |
| `src/components/admin/AdminLayout.tsx` | UPDATE | Change nav label and route from People to Members; update `routePermissions`. |
| `src/actions/workflows.ts` | UPDATE | Add application-only inbox listing/stats/detail helpers and resolve person/form submissions for workflow details. |
| `src/app/admin/(admin)/inbox/page.tsx` | UPDATE | Fetch only `program`, `member`, and `volunteer` workflow records. |
| `src/components/admin/Inbox.tsx` | UPDATE | Remove non-application filters/streams and make row click navigate to `/admin/inbox/[id]`. |
| `src/app/admin/(admin)/inbox/[id]/page.tsx` | UPDATE | Load enriched applicant answers and reject unsupported workflow kinds. |
| `src/components/admin/ApplicationReview.tsx` | UPDATE | Show submitted form answers and use canonical accept/reject/send-login actions. |
| `src/actions/forms.ts` | UPDATE | Add default seed definitions and a get-or-create helper for editable live page question sets. |
| `src/components/admin/FormsManager.tsx` | UPDATE | Limit `/forms` cards to Partner, Volunteer, and Membership only. Remove donation, contact, newsletter, school chapter, and program cards. |
| `src/app/admin/(admin)/forms/[entityType]/page.tsx` | UPDATE | Restrict allowed entity types and seed missing definitions from defaults. |
| `src/components/admin/ProgramForm.tsx` | UPDATE | Keep program form editing here and seed the editor from existing public program fields if missing. |
| `src/app/(public_pages)/get-involved/[id]/page.tsx` | UPDATE | Ensure join/volunteer/partner map to the same entity types shown in `/forms`. |
| `src/app/(public_pages)/get-involved/[id]/InvolvementDetailClient.tsx` | UPDATE | Render all editable fields from the form definition and submit once through `applyAsPerson`. Keep donations static. |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | Render program application questions from the program form definition instead of hardcoded fields. |
| `src/actions/programs.ts` | UPDATE | Accept dynamic answers in application submit/order flows and save them to `form_submissions` linked to person/application. |
| `src/types/cms.ts` | UPDATE | Add any missing statuses/types for member application decision state and form-answer display. |
| `src/__tests__/people.test.ts` | UPDATE | Cover members-only query and exclusion of donors/attendees. |
| `src/__tests__/workflows-reply.test.ts` or new inbox test | UPDATE/CREATE | Cover application-only inbox filtering and workflow detail person resolution. |
| `src/__tests__/...forms...test.tsx` | CREATE | Cover FormsManager scope and form default seeding behavior. |

---

## Tasks

### Task 1: Define Canonical Application Form Types

- **File**: `src/actions/forms.ts`
- **Action**: UPDATE
- **Implement**:
  - Add constants for allowed standalone admin forms: `partner`, `volunteer`, `member`.
  - Add legacy aliases only where needed for migration reads: `membership` -> `member`, maybe `school-chapter` -> `program` for historical submissions.
  - Add `getFormDefinitionOrDefault(entityType, entityId?)` that returns a persisted definition when present, otherwise returns a default question set.
  - Default member/volunteer/partner question sets should be extracted from the current live base/dynamic fields in `InvolvementDetailClient`: full name, email, phone, motivation/notes, consent, and existing dynamic questions if seeded.
  - Do not add a donation default. Donations stay static.
- **Mirror**: `src/actions/forms.ts:20` for JSON parsing, `src/actions/forms.ts:63` for lookup shape.
- **Validate**: `npx tsc --noEmit`

### Task 2: Narrow `/admin/forms`

- **File**: `src/components/admin/FormsManager.tsx`
- **Action**: UPDATE
- **Implement**:
  - Replace `FORM_TYPES` with only Partner Application, Volunteer Application, Membership Application.
  - Remove `getAllPrograms` import/useEffect and all program form cards.
  - Remove donation/contact/newsletter/school-chapter cards.
  - Use the default-backed form loader so zero-question cards show the actual editable defaults.
- **Mirror**: `src/components/admin/FormsManager.tsx:22` for current card config, `src/components/admin/FormsManager.tsx:60` for card loading.
- **Validate**: `npm run lint`

### Task 3: Restrict Form Editor Route

- **File**: `src/app/admin/(admin)/forms/[entityType]/page.tsx`
- **Action**: UPDATE
- **Implement**:
  - Permit only `partner`, `volunteer`, and `member` on this route.
  - Redirect or render not-found for `donation`, `contact`, `newsletter`, `school-chapter`, and `program`.
  - Load defaults when there is no saved definition.
  - Normalize any existing `membership` references to `member`.
- **Mirror**: `src/app/admin/(admin)/forms/[entityType]/page.tsx:41` for load/save lifecycle.
- **Validate**: `npx tsc --noEmit`

### Task 4: Keep Program Form Editing in Program Editor

- **File**: `src/components/admin/ProgramForm.tsx`
- **Action**: UPDATE
- **Implement**:
  - Confirm the existing embedded `FormEditor` remains the only supported editor for program application forms.
  - Load program form definition via `getFormDefinitionOrDefault("program", programId)`.
  - For new programs, persist program application questions after the program id exists.
  - Ensure Program table/detail links do not send users to `/admin/forms/program`.
- **Mirror**: `src/components/admin/ProgramForm.tsx:102` and `src/components/admin/ProgramForm.tsx:1053` from grep results.
- **Validate**: `npx tsc --noEmit`

### Task 5: Make Get-Involved Forms Fully Dynamic

- **File**: `src/app/(public_pages)/get-involved/[id]/page.tsx`
- **Action**: UPDATE
- **Implement**:
  - Map `join` to `member`, `volunteer` to `volunteer`, `partner` to `partner`.
  - Keep `donate` without an `entityType`.
  - Decide whether `school` remains public but outside `/forms`, or is treated as a program workflow managed elsewhere. If kept, do not expose it in `/admin/forms`.
- **Mirror**: `src/app/(public_pages)/get-involved/[id]/page.tsx:6` for `ENTITY_MAP`.
- **Validate**: `npx tsc --noEmit`

### Task 6: Submit Get-Involved Answers Once

- **File**: `src/app/(public_pages)/get-involved/[id]/InvolvementDetailClient.tsx`
- **Action**: UPDATE
- **Implement**:
  - Replace the separate `submitForm(entityType!, null, answers)` call with passing `answers` into `applyAsPerson`.
  - Render base questions from the default-backed form definition rather than the hardcoded `BASE_FIELDS` when an application form exists.
  - Keep donation amount UI static and separate.
- **Mirror**: `src/app/(public_pages)/get-involved/[id]/InvolvementDetailClient.tsx:124` for form definition loading and `:149` for answer aggregation.
- **Validate**: `npx tsc --noEmit`

### Task 7: Persist Member/Volunteer/Partner Application Answers

- **File**: `src/actions/people.ts`
- **Action**: UPDATE
- **Implement**:
  - Extend `applyAsPerson` with `answers?: Record<string, unknown>`.
  - Store answers once via `submitForm(entityType, null, answers, person.id)`.
  - Include `formSubmissionId` and normalized answers summary in workflow `details`.
  - Do not assign accepted roles immediately on submission. A submitted volunteer/member should be an applicant/pending record until accepted. Only accepted records should appear on Members.
- **Mirror**: `src/actions/people.ts:277` for input validation, `src/actions/people.ts:343` for workflow creation, `src/actions/people.ts:368` for current form submission.
- **Validate**: `npm test -- src/__tests__/people.test.ts`

### Task 8: Make Program Applications Dynamic

- **File**: `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`
- **Action**: UPDATE
- **Implement**:
  - Load `getFormDefinitionOrDefault("program", program.id)`.
  - Render program application fields from the definition instead of hardcoded name/email/phone/motivation inputs.
  - Map canonical fields to `submitApplication`/`createProgramOrder` inputs: name, email, phone, motivation, consent.
  - Pass full `answers` to program actions for persistence and admin display.
- **Mirror**: `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx:127` for submit flow and `:553` for current hardcoded form.
- **Validate**: `npx tsc --noEmit`

### Task 9: Persist Program Form Answers

- **File**: `src/actions/programs.ts`
- **Action**: UPDATE
- **Implement**:
  - Extend `submitApplication` and `createProgramOrder` with `answers?: Record<string, unknown>`.
  - After person/application creation, call `submitForm("program", programId, answers, person.id)`.
  - Store `formSubmissionId` in workflow details with `programId`, `applicationId`, and submitted answers metadata.
  - Include `programTitle` in workflow details so review pages do not infer it from the workflow title.
- **Mirror**: `src/actions/programs.ts:31` for free application flow, `src/actions/programs.ts:108` for workflow creation, `src/actions/programs.ts:362` for status updates.
- **Validate**: `npm test -- src/__tests__/bmac33-acceptance.test.ts`

### Task 10: Create Members-Only Data Query

- **File**: `src/actions/people.ts`
- **Action**: UPDATE
- **Implement**:
  - Add `getMembers()` and `exportMembers()`.
  - Include only:
    - people with accepted/enrolled/completed program participation through `participants` joined to `cohorts`;
    - accepted volunteer records;
    - accepted member records.
  - Exclude event registration, donor, contact, partner, admin-only, and generic applicant-only people.
  - Count only member-relevant records in `recordCount`.
  - Keep `getPeople()` intact if other systems still need unified profiles internally.
- **Mirror**: `src/actions/people.ts:224` for current unified people query and `src/actions/people.ts:246` for detail loading.
- **Validate**: `npm test -- src/__tests__/people.test.ts`

### Task 11: Rename People Route to Members

- **Files**:
  - `src/app/admin/(admin)/members/page.tsx`
  - `src/app/admin/(admin)/members/[id]/page.tsx`
  - `src/app/admin/(admin)/people/page.tsx`
  - `src/app/admin/(admin)/people/[id]/page.tsx`
  - `src/components/admin/AdminLayout.tsx`
- **Action**: CREATE / UPDATE
- **Implement**:
  - Create `/admin/members` pages using `getMembers()`.
  - Update nav label and href from People to Members.
  - Add permission mapping for `/admin/members` to `manage_people`.
  - Redirect old `/admin/people` and `/admin/people/[id]` to `/admin/members` equivalents, unless the old route is intentionally removed.
  - Rename UI copy from "People" to "Members" and remove donor/event wording.
- **Mirror**: `src/components/admin/AdminLayout.tsx:53` for nav group and `:92` for route permissions.
- **Validate**: `npx tsc --noEmit && npm run lint`

### Task 12: Limit Inbox Data at the Server

- **File**: `src/actions/workflows.ts`
- **Action**: UPDATE
- **Implement**:
  - Add `listApplicationWorkflows()` and `getApplicationInboxStats()` that hard-filter workflow kinds to `program`, `member`, `volunteer`.
  - Do not rely on client filters to hide non-applications.
  - Keep generic workflow functions for any other admin areas that may need them.
- **Mirror**: `src/actions/workflows.ts:28` for current list API and `src/actions/workflows.ts:50` for stats.
- **Validate**: `npm test -- src/__tests__/workflows-reply.test.ts`

### Task 13: Update Inbox List UX

- **Files**:
  - `src/app/admin/(admin)/inbox/page.tsx`
  - `src/components/admin/Inbox.tsx`
- **Action**: UPDATE
- **Implement**:
  - Page loader must call `listApplicationWorkflows`.
  - Remove General Inquiries, Donation, Partner, Event Registration, Ticket, Contact filters.
  - Show only Membership, Volunteer, and Cohort Applications.
  - Row click should navigate to `/admin/inbox/[id]` so the admin sees the detail page with answers and accept/reject actions.
- **Mirror**: `src/components/admin/Inbox.tsx:37` for streams and `src/components/admin/Inbox.tsx:104` for filtering.
- **Validate**: `npx tsc --noEmit`

### Task 14: Enrich Inbox Detail with Answers

- **Files**:
  - `src/actions/workflows.ts`
  - `src/app/admin/(admin)/inbox/[id]/page.tsx`
  - `src/components/admin/ApplicationReview.tsx`
- **Action**: UPDATE
- **Implement**:
  - Add detail loader that rejects non-application workflow kinds.
  - Resolve person by:
    - `workflow.refId` when it is a `person-*` id;
    - `program_applications.person_id` when workflow kind is `program` and `refId` is an `app-*` id.
  - Load linked `form_submissions` by `details.formSubmissionId`, falling back to latest submission by `entityType/entityId/personId`.
  - Render question labels and answers in a dedicated "Application Answers" section.
- **Mirror**: `src/actions/workflows.ts:69` for existing detail loader and `src/components/admin/ApplicationReview.tsx:191` for detail page layout.
- **Validate**: `npx tsc --noEmit`

### Task 15: Canonical Accept/Reject Actions

- **Files**:
  - `src/actions/workflows.ts`
  - `src/actions/people.ts`
  - `src/actions/programs.ts`
  - `src/components/admin/ApplicationReview.tsx`
- **Action**: UPDATE
- **Implement**:
  - Add `acceptApplicationWorkflow(workflowId)` and `rejectApplicationWorkflow(workflowId)` or equivalent server actions.
  - Program workflow accept/reject must call `updateApplicationStatus`.
  - Member/volunteer accept must update `person_records.status = 'accepted'`, ensure role `member` or `volunteer`, resolve workflow, and send an acceptance email.
  - Member/volunteer reject must update `person_records.status = 'rejected'`, close workflow, and send rejection email with "welcome to reapply for a future cohort" wording.
  - Avoid double-sending generic status emails from `updateWorkflowStatus` when a specific accept/reject email has already been sent.
- **Mirror**: `src/components/admin/ApplicationReview.tsx:96` and `:124` for current accept/reject UI, `src/actions/programs.ts:399` for rejection email behavior.
- **Validate**: `npm test -- src/__tests__/workflows-reply.test.ts`

### Task 16: Add Send Login Button to Accepted Applications

- **Files**:
  - `src/components/admin/ApplicationReview.tsx`
  - `src/actions/programs.ts`
- **Action**: UPDATE
- **Implement**:
  - For accepted program applications, show "Send Student Portal Login".
  - Reuse existing `sendPublicCredentials({ personId, programId })`.
  - Only enable the button after application status is accepted.
  - For accepted member/volunteer applications, decide whether they also use the student portal. If not, hide the button outside cohort/program applications.
- **Mirror**: `src/components/admin/ProgramAdminDetail.tsx` credential-send behavior from observed code and `src/actions/programs.ts` existing `sendPublicCredentials` export.
- **Validate**: `npx tsc --noEmit`

### Task 17: Update Email Copy

- **Files**:
  - `src/actions/emails.ts` or `src/lib/email.ts`
  - `src/actions/programs.ts`
  - `src/actions/workflows.ts`
- **Action**: UPDATE
- **Implement**:
  - Ensure rejection email copy explicitly says the applicant is welcome to reapply for a future cohort.
  - Use the same copy for program, membership, and volunteer rejection where applicable.
  - Do not trigger generic "closed/resolved" status emails after the specific rejection email.
- **Mirror**: `src/actions/programs.ts:399` current rejection note.
- **Validate**: targeted email action tests if present, otherwise `npx tsc --noEmit`

### Task 18: Tests

- **Files**:
  - `src/__tests__/people.test.ts`
  - `src/__tests__/workflows-reply.test.ts`
  - new `src/__tests__/forms-manager.test.tsx` or nearest existing test pattern
- **Action**: UPDATE / CREATE
- **Implement**:
  - Members query includes accepted volunteers/members and cohort participants.
  - Members query excludes donors, event attendees, partner contacts, and pending applicants.
  - Inbox list action returns only `program`, `member`, `volunteer`.
  - Workflow detail resolves a program application's person from `program_applications.person_id`.
  - FormsManager renders only the three allowed forms.
  - Public dynamic form submission passes answers through once with a `personId`.
- **Mirror**: Existing test setup under `src/__tests__/setup.tsx`; import `./mocks` for component tests.
- **Validate**: `npm test`

---

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
```

For a full production check:

```bash
npm run build
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| Existing workflows use mixed `refId` meanings | Add explicit resolution by id prefix/table lookup in the enriched detail loader. |
| Existing `membership` form definitions may not appear under `member` | Add alias/fallback reads and optionally migrate on save to `member`. |
| Accept/reject could send duplicate emails | Centralize application decision actions and bypass generic workflow status email when decision-specific email is sent. |
| Members route could hide legitimate accepted users because status strings vary | Include accepted statuses from both person records and participants; add tests around exact accepted/enrolled/completed statuses. |
| Program paid application flow may lose dynamic answers before payment confirmation | Persist answers when creating the pending application/order, not only after Paystack callback. |
| Donation form accidentally becomes editable | Keep donate route `entityType` null and remove `donation` from all allowed admin form lists. |

---

## Acceptance Criteria

- [ ] `/admin/members` replaces the visible People route.
- [ ] Members list shows only accepted cohort students, accepted volunteers, and accepted members.
- [ ] Members list excludes event registrants, donors, contacts, partner-only records, and pending applicants.
- [ ] `/admin/inbox` shows only program/cohort, membership, and volunteer applications.
- [ ] Inbox detail page displays submitted application answers with labels.
- [ ] Inbox detail page can accept/reject applicants.
- [ ] Rejection sends an email saying applicants are welcome to reapply for a future cohort.
- [ ] Accepted cohort/program applicants can be sent student portal credentials from the detail page.
- [ ] `/admin/forms` shows only Partner, Volunteer, and Membership application forms.
- [ ] Donations remain static and are not editable through `/admin/forms`.
- [ ] Program application forms are edited only from the Programs editor.
- [ ] Live volunteer/membership/partner/program pages render form questions from form editor data.
- [ ] Form editors do not show zero questions when the live form has questions.
- [ ] Type check, lint, and tests pass.
