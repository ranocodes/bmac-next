# Plan: BMAC Comprehensive UX Overhaul (6 Epics)

## Summary

Fix registration flow gaps, reorganize inbox into categorized streams, standardize admin UI with shared components, unify settings editor to single-save pattern, remove volunteer hours feature, and clean up admin layout. Covers 6 epics across ~25 files with shared component extraction to reduce duplication.

## User Story

As an admin and public user, I want a polished, consistent admin experience with working registration flows, organized inbox, and no dead features, so that I can manage the organization efficiently without cognitive overload.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT + BUG_FIX + REFACTOR |
| Complexity | HIGH |
| Systems Affected | Auth, Events, Programs, Inbox, Forms, Settings, Admin Layout |
| Jira Issue | N/A (epics defined inline) |

---

## Patterns to Follow

### Server Action Error Handling
```typescript
// SOURCE: src/actions/events.ts:275-276
if (!opts.consent) return { error: "Consent is required to register." };
if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
  return { error: "Valid email required" };
}
```

### Sticky Save Bar (ProgramForm)
```typescript
// SOURCE: src/components/admin/ProgramForm.tsx:206-239
<div className="sticky top-0 z-40 bg-background border-b border-border/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 -mt-2">
  <div className="flex items-center justify-between gap-2">
    <Link href="/admin/programs" className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-muted-foreground hover:text-secondary transition-colors shrink-0">
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back</span>
    </Link>
    <div className="flex items-center gap-2 flex-1 justify-end max-w-[280px] sm:max-w-none">
      <button onClick={() => handleSubmit("draft")} disabled={saving} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 bg-card border border-border/50 text-secondary font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-xs sm:text-sm">
        <Save className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{saving ? "Saving..." : "Save Draft"}</span>
      </button>
      <button onClick={() => handleSubmit("published")} disabled={saving} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs sm:text-sm">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{isEdit ? "Update & Publish" : "Publish"}</span>
      </button>
    </div>
  </div>
</div>
```

### Badge Pattern (inline)
```typescript
// SOURCE: src/components/admin/Inbox.tsx:25-34
const kindMeta: Record<string, { label: string; color: string }> = {
  contact: { label: "Contact", color: "bg-blue-50 text-blue-700" },
  member: { label: "Member", color: "bg-emerald-50 text-emerald-700" },
  // ...
};
// Rendered as:
<span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${color}`}>
  {label}
</span>
```

### Toast Pattern
```typescript
// SOURCE: src/components/admin/SettingsForm.tsx:106-124
const { toast } = useToast();
setSavingSite(true);
try {
  await saveSiteSettings({...});
  toast("Settings saved", "success");
} catch {
  toast("Failed to save settings", "error");
} finally {
  setSavingSite(false);
}
```

### Generic CRUD (How Programs/Events Are Saved)
```typescript
// SOURCE: src/actions/crud.ts:18-27
export async function updateItem(table: string, id: string, data: Record<string, unknown>) {
  const admin = await requireAdmin();
  const result = await db.update(table, id, data);
  // ...
  return result;
}
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/components/admin/StatusBadge.tsx` | CREATE | Shared status badge component |
| `src/components/admin/AdminPageHeader.tsx` | CREATE | Shared page header with back+title+actions |
| `src/components/admin/StatusBanner.tsx` | CREATE | Registration status banner for public pages |
| `src/actions/programs.ts` | UPDATE | Add auto-enable applications on publish |
| `src/actions/events.ts` | UPDATE | Add auto-enable registration on publish |
| `src/actions/tickets.ts` | UPDATE | Add missing status/deadline/registration guards |
| `src/actions/crud.ts` | UPDATE | Add pre-save hooks for auto-enable logic |
| `src/app/(public_pages)/programs/[id]/page.tsx` | UPDATE | Add notFound() for non-published programs |
| `src/app/(public_pages)/events/[id]/EventDetailClient.tsx` | UPDATE | Add registration status banners |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | Add application status banners |
| `src/components/admin/Inbox.tsx` | UPDATE | Add stream tabs (General/Membership/Cohort) |
| `src/app/admin/(admin)/inbox/page.tsx` | UPDATE | Replace hardcoded SQL with paginated query |
| `src/app/admin/(admin)/inbox/[id]/page.tsx` | CREATE | Dedicated application review page |
| `src/components/admin/ApplicationReview.tsx` | CREATE | Application review client component |
| `src/components/admin/FormsManager.tsx` | UPDATE | Replace `<a target="_blank">` with `<Link>`, add program forms |
| `src/components/admin/SettingsForm.tsx` | UPDATE | Single save bar, visual polish |
| `src/components/admin/AdminLayout.tsx` | UPDATE | Remove volunteer-hours nav, sidebar cleanup |
| `src/actions/volunteer-hours.ts` | DELETE | Remove volunteer hours feature |
| `src/app/admin/(admin)/volunteer-hours/page.tsx` | DELETE | Remove volunteer hours page |
| `src/components/admin/VolunteerHoursAdmin.tsx` | DELETE | Remove volunteer hours component |
| `src/app/(public_pages)/account/VolunteerHoursWidget.tsx` | DELETE | Remove volunteer hours widget |
| `src/app/(public_pages)/account/page.tsx` | UPDATE | Remove volunteer hours references |

---

## Tasks

### EPIC 1: Registration Flow Fix

---

### Task 1: Create shared StatusBadge component

- **File**: `src/components/admin/StatusBadge.tsx`
- **Action**: CREATE
- **Implement**: Shared badge component with consistent color mapping for all status values across admin pages. Accept `{ status: string, size?: 'sm' | 'md' }` props.
- **Color mapping**: published/confirmed/sent = `bg-emerald-50 text-emerald-700`, draft/pending = `bg-amber-50 text-amber-700`, rejected/failed = `bg-red-50 text-red-700`, archived/cancelled = `bg-muted text-muted-foreground`
- **Pattern**: Mirror the inline badge from `src/components/admin/Inbox.tsx:25-34`
- **Validate**: `pnpm run build`

---

### Task 2: Create shared AdminPageHeader component

- **File**: `src/components/admin/AdminPageHeader.tsx`
- **Action**: CREATE
- **Implement**: Reusable page header: `{ backHref?: string, title: string, subtitle?: string, actions?: ReactNode }`
- **Back link**: `<Link href={backHref}>` with ArrowLeft icon, "Back to {section}" label
- **Title**: `font-display text-2xl md:text-3xl font-bold tracking-tight text-secondary`
- **Subtitle**: `text-sm text-muted-foreground mt-1`
- **Actions slot**: right-aligned flex gap-2
- **Mirror**: `src/components/admin/ProgramForm.tsx:210-216` for back link pattern
- **Validate**: `pnpm run build`

---

### Task 3: Create shared StatusBanner for public pages

- **File**: `src/components/admin/StatusBanner.tsx`
- **Action**: CREATE
- **Implement**: Public-facing banner for registration/applications closed states: `{ title: string, description: string, variant?: 'info' | 'warning' | 'closed' }`
- **Styling**: `bg-muted/50 border border-border rounded-xl p-6 text-center`
- **Used by**: EventDetailClient and ProgramDetailClient when registration/applications are closed
- **Validate**: `pnpm run build`

---

### Task 4: Add auto-enable registration when publishing events

- **File**: `src/actions/crud.ts`
- **Action**: UPDATE
- **Implement**: Add a `preSaveHook` to `updateItem` that checks if `table === "events"` and `data.status === "published"` and `data.allow_public_registration === undefined`, then auto-sets `data.allow_public_registration = true`
- **Also**: Add same hook for `createItem` with same logic
- **Mirror**: `src/actions/crud.ts:18-27` - extend existing function
- **Validate**: `pnpm run build`

---

### Task 5: Add auto-enable applications when publishing programs

- **File**: `src/actions/crud.ts`
- **Action**: UPDATE
- **Implement**: Add pre-save hook: if `table === "programs"` and `data.status === "published"` and `data.applicationsOpen === undefined`, auto-set `data.applicationsOpen = true`
- **Mirror**: Same pattern as Task 4
- **Validate**: `pnpm run build`

---

### Task 6: Add missing guards to paid ticket order flow

- **File**: `src/actions/tickets.ts`
- **Action**: UPDATE
- **Implement**: Add guards to `createTicketOrder` before L46 (reserveCapacity):
  1. Check `event.status !== "published"` → return "Registration is closed"
  2. Check `event.registration_deadline` past → return "Registration deadline has passed"
  3. Check `event.allow_public_registration === false` → return "Registration is closed to the public"
- **Mirror**: `src/actions/events.ts:281-291` - exact same guard pattern
- **Note**: Need to fetch additional event fields (status, allow_public_registration, registration_deadline) in the existing query at L38-41
- **Validate**: `pnpm run build`

---

### Task 7: Add missing guards to paid program order flow

- **File**: `src/actions/programs.ts`
- **Action**: UPDATE
- **Implement**: In `createProgramOrder` (L161-267), add guards before payment:
  1. Check `program.status !== "published"` → return "Program not available"
  2. Check `program.applicationsOpen === false` → return "Applications are not open"
- **Mirror**: `src/actions/programs.ts:52-58` in `submitApplication` - same guards
- **Note**: Verify the existing program fetch already includes status and applicationsOpen
- **Validate**: `pnpm run build`

---

### Task 8: Add notFound() for non-published programs

- **File**: `src/app/(public_pages)/programs/[id]/page.tsx`
- **Action**: UPDATE
- **Implement**: After L35 (`if (!programs.some(...)) notFound()`), add: `if (program.status !== "published") notFound();`
- **Mirror**: Standard Next.js notFound pattern
- **Validate**: `pnpm run build`

---

### Task 9: Add registration status banners to event detail page

- **File**: `src/app/(public_pages)/events/[id]/EventDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: Before the form (L441), check registration state and show StatusBanner:
  1. If `event.status !== "published"` → "Registration Closed" banner, hide form
  2. If `event.allow_public_registration === false` → "Registration Closed to Public" banner, hide form
  3. If `event.registration_deadline` passed → "Registration Deadline Passed" banner, hide form
  4. If sold out → already handled by waitlist (L229-243), no change needed
- **Also**: Change hero badge (L265) from hardcoded "Registration Open" to dynamic based on `allow_public_registration`
- **Mirror**: Use StatusBanner from Task 3
- **Validate**: `pnpm run build`

---

### Task 10: Add application status banners to program detail page

- **File**: `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: The `applicationsOpen` check already exists at L531. Verify it renders a proper StatusBanner (not just hiding the form). Add banner when applications are closed.
- **Mirror**: Use StatusBanner from Task 3
- **Validate**: `pnpm run build`

---

### EPIC 2: Inbox Categorization

---

### Task 11: Add stream tabs to inbox UI

- **File**: `src/components/admin/Inbox.tsx`
- **Action**: UPDATE
- **Implement**: Add 3 stream tabs above the existing kind filters:
  - "All" → all kinds (current behavior)
  - "General Inquiries" → contact, partner, donation
  - "Club Membership" → member, volunteer
  - "Cohort Applications" → program
- **Stream tabs**: Horizontal button group with active indicator (bg-primary/10 text-primary)
- **Count badges**: Show count of open items per stream
- **Interaction**: Selecting a stream filters the kind dropdown to only show relevant kinds
- **Mirror**: Existing kind filter pattern at `src/components/admin/Inbox.tsx:95-102`
- **Validate**: `pnpm run build`

---

### Task 12: Replace hardcoded inbox SQL with paginated query

- **File**: `src/app/admin/(admin)/inbox/page.tsx`
- **Action**: UPDATE
- **Implement**: Replace the hardcoded `SELECT * ... LIMIT 200` query with a call to `listWorkflows` from `@/actions/workflows` (which already supports filtering and pagination)
- **Pass**: `initialData` and `totalCount` to the Inbox component
- **Mirror**: `src/app/admin/(admin)/inbox/page.tsx:7-13` - current pattern
- **Validate**: `pnpm run build`

---

### Task 13: Create dedicated application review page

- **File**: `src/app/admin/(admin)/inbox/[id]/page.tsx` (server) + `src/components/admin/ApplicationReview.tsx` (client)
- **Action**: CREATE
- **Implement**: Full-page review for any workflow item:
  - Server page: fetches workflow detail via `getWorkflowDetail(id)`, passes to client
  - Client component: shows submitter info, form responses, person records, linked programs/events
  - Action buttons: Accept (status → resolved, send acceptance email), Deny (status → closed, send rejection email), Request Info (open email compose)
  - Back button returns to inbox with same filters
- **Mirror**: `src/components/admin/ProgramAdminDetail.tsx` for detail page layout
- **Wire to**: `updateWorkflowStatus`, `replyToSubmission` from `src/actions/workflows.ts`
- **Validate**: `pnpm run build`

---

### EPIC 3: Forms CRUD Sync

---

### Task 14: Fix forms editor navigation (remove target="_blank")

- **File**: `src/components/admin/FormsManager.tsx`
- **Action**: UPDATE
- **Implement**: Replace `<a href="..." target="_blank" rel="noopener noreferrer">` at L118-125 with `<Link href="...">` from `next/link`. Import `Link` from `next/link`.
- **Mirror**: Existing Link usage in `src/components/admin/AdminLayout.tsx:242`
- **Validate**: `pnpm run build`

---

### Task 15: Add program forms to forms admin list

- **File**: `src/components/admin/FormsManager.tsx`
- **Action**: UPDATE
- **Implement**: After loading standalone forms (L41-53), also query for program forms:
  1. Fetch all programs from DB
  2. For each program, check if a form definition exists with `entityType="program"` and `entityId=program.id`
  3. Add program forms as additional cards with program name as subtitle
- **Mirror**: Existing card pattern at L80-141
- **Also**: The forms editor page at `src/app/admin/(admin)/forms/[entityType]/page.tsx` needs to handle program-specific forms via query param (e.g., `/admin/forms/program?programId=xxx`)
- **Validate**: `pnpm run build`

---

### EPIC 4: Settings Editor Standardization

---

### Task 16: Unify settings editor to single save action

- **File**: `src/components/admin/SettingsForm.tsx`
- **Action**: UPDATE
- **Implement**: Replace 4 separate save buttons (Site L233, About L281, Contact L307, Templates L364) with a single sticky save bar:
  1. Add `dirty` state tracking (compare current values to initial)
  2. Sticky save bar at top: Back link + "Save All Settings" button
  3. Single `handleSaveAll()` that calls `saveSiteSettings()` + `saveEmailTemplates()` in sequence
  4. Profile save remains separate (different auth context)
- **Mirror**: `src/components/admin/ProgramForm.tsx:206-239` for sticky bar pattern
- **Remove**: Individual save buttons from Site, About, Contact, Templates sections
- **Validate**: `pnpm run build`

---

### Task 17: Settings editor visual polish

- **File**: `src/components/admin/SettingsForm.tsx`
- **Action**: UPDATE
- **Implement**:
  1. Change `max-w-2xl` to full width (remove max-width constraint)
  2. Standardize input styling to match program editor: `h-10 rounded-lg border focus:ring-1 focus:ring-primary/20`
  3. Social links editor: match add/remove pattern from ProgramForm features
  4. Email template editor: monospace font, consistent textarea sizing
  5. All sections use consistent card containers
- **Mirror**: `src/components/admin/ProgramForm.tsx:247-249` for section header pattern
- **Validate**: `pnpm run build`

---

### EPIC 5: Remove Volunteer Hours

---

### Task 18: Delete volunteer hours files

- **File**: Multiple files
- **Action**: DELETE
- **Implement**: Delete these files (confirm with user first):
  1. `src/actions/volunteer-hours.ts`
  2. `src/app/admin/(admin)/volunteer-hours/page.tsx`
  3. `src/components/admin/VolunteerHoursAdmin.tsx`
  4. `src/app/(public_pages)/account/VolunteerHoursWidget.tsx`
- **Mirror**: N/A (deletion)
- **Validate**: `pnpm run build`

---

### Task 19: Remove volunteer hours from nav and account page

- **File**: `src/components/admin/AdminLayout.tsx`, `src/app/(public_pages)/account/page.tsx`
- **Action**: UPDATE
- **Implement**:
  1. AdminLayout.tsx: Remove `{ label: "Volunteer Hours", href: "/admin/volunteer-hours", icon: Clock, permission: "manage_people" }` from L75
  2. AdminLayout.tsx: Remove `Clock` from lucide-react imports if no longer used
  3. Account page: Remove any VolunteerHoursWidget imports and rendering
- **Mirror**: N/A
- **Validate**: `pnpm run build`

---

### Task 20: Drop volunteer_hours table from DB

- **File**: Neon DB (migration)
- **Action**: CREATE (migration)
- **Implement**: `DROP TABLE IF EXISTS public.volunteer_hours;` — only if table exists
- **Mirror**: N/A
- **Validate**: Confirm table exists first, then run migration

---

### EPIC 6: Admin Layout Cleanup

---

### Task 21: Reorganize admin sidebar nav groups

- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: Restructure nav groups for better hierarchy:
  - **Content**: News, Events, Programs, Gallery, Team, Testimonials
  - **People**: Partners, People, Admins
  - **Operations**: Inbox, Check-In, Analytics, Donations & Payments
  - **System**: Forms, Email Sequences, Newsletter, Activity Log, Settings
- **Remove**: Volunteer Hours entry (Task 19)
- **Add**: Visual dividers between groups (subtle `border-t border-border/30`)
- **Mirror**: Existing group structure at L41-82
- **Validate**: `pnpm run build`

---

### Task 22: Add localStorage persistence for sidebar group collapse state

- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: Persist `openGroups` state to localStorage:
  1. On toggle, save to `localStorage.setItem("bmac_admin_sidebar_groups", JSON.stringify(openGroups))`
  2. On mount, read from localStorage instead of just detecting active group
  3. Default: all groups collapsed except the one containing current route
- **Mirror**: Existing pattern at L136-139 for sidebarCollapsed persistence
- **Validate**: `pnpm run build`

---

### Task 23: Standardize active nav item indicator

- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: Enhance active nav item styling:
  1. Add left border indicator: `border-l-2 border-primary` on active items
  2. Background: `bg-primary/10` (already exists at L243)
  3. Text: `text-primary` (already exists)
  4. Remove the ChevronRight indicator (L246) — border-left is cleaner
- **Mirror**: Current active state at L243
- **Validate**: `pnpm run build`

---

### Task 24: Replace ad-hoc page headers across admin pages

- **File**: Multiple admin pages
- **Action**: UPDATE
- **Implement**: Replace inline page headers in these files with AdminPageHeader:
  1. `src/app/admin/(admin)/inbox/page.tsx` - has inline header
  2. `src/app/admin/(admin)/settings/page.tsx` - has inline header
  3. `src/app/admin/(admin)/forms/page.tsx` - has inline header
  4. `src/app/admin/(admin)/email-sequences/page.tsx` - has inline header
  5. `src/app/admin/(admin)/donations/page.tsx` - has inline header
  6. `src/app/admin/(admin)/people/page.tsx` - has inline header
  7. `src/app/admin/(admin)/events/page.tsx` - has inline header
  8. `src/app/admin/(admin)/programs/page.tsx` - has inline header
- **Mirror**: AdminPageHeader from Task 2
- **Validate**: `pnpm run build`

---

### Task 25: Replace inline status badges with StatusBadge across admin pages

- **File**: Multiple admin components
- **Action**: UPDATE
- **Implement**: Replace inline badge patterns in:
  1. `src/components/admin/Inbox.tsx` - kind and status badges (L25-41)
  2. `src/components/admin/FormsManager.tsx` - Active/None badges (L96-102)
  3. `src/components/admin/EmailSequencesAdmin.tsx` - status badges
  4. Any other admin components with inline badge className strings
- **Mirror**: StatusBadge from Task 1
- **Validate**: `pnpm run build`

---

## Validation

```bash
# Type check
pnpm run build

# Lint
pnpm run lint

# Tests
pnpm test
```

---

## Acceptance Criteria

- [ ] All 25 tasks completed
- [ ] Type check passes (`pnpm run build`)
- [ ] Lint passes (`pnpm run lint`)
- [ ] No `target="_blank"` in admin internal navigation
- [ ] Registration guards work for both free and paid flows
- [ ] Program detail returns 404 for non-published programs
- [ ] Inbox shows 3 categorized streams with count badges
- [ ] Settings editor has single save bar
- [ ] Volunteer hours completely removed from all layers
- [ ] Shared StatusBadge and AdminPageHeader used across admin pages
- [ ] Sidebar nav groups reorganized with localStorage persistence
- [ ] Follows existing codebase patterns exactly
