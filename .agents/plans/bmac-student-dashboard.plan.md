# BMAC Student Dashboard Plan

## Overview
Create role-specific dashboards for students (club members) and volunteers. Users with both roles get a combined dashboard. Replaces the generic `/account` page with a richer, app-like experience.

## Architecture

### Route Structure
```
/dashboard                  → Main entry, detects role, shows combined or role-specific view
/dashboard/member           → Member-only features (redirect if not a member)
/dashboard/volunteer        → Volunteer-only features (redirect if not a volunteer)
```

### Role Detection
- Read `people.roles` JSONB array from database
- Priority for landing: if both roles → `/dashboard` (combined view); if only member → `/dashboard/member`; if only volunteer → `/dashboard/volunteer`
- Admins bypass this (they have `/admin`)

### Layout
New minimal layout at `src/app/(public_pages)/dashboard/layout.tsx`:
- Sidebar navigation (role-aware)
- Top bar with user name, logout
- Clean, app-like design (no full site header/footer)

## Implementation Tasks

### 1. Create role detection utility
**File:** `src/lib/role-detect.ts`
- `getUserRole(email)` → queries `people.roles` for given email
- Returns `{ isMember: boolean, isVolunteer: boolean, primaryRole: "member" | "volunteer" | "combined" }`
- Used by layout and dashboard pages

### 2. Create dashboard layout
**File:** `src/app/(public_pages)/dashboard/layout.tsx`
- Auth check (redirect to `/login` if no session)
- Fetch user roles via `getUserRole()`
- Render sidebar with role-aware nav items
- Pass role info to children via layout props or context

### 3. Create main dashboard page
**File:** `src/app/(public_pages)/dashboard/page.tsx`
- Server component
- Fetch all relevant data based on roles
- Render combined view with sections:
  - **Member Section**: Program applications, cohort enrollment, attendance stats, certificates
  - **Volunteer Section**: Volunteer status, tasks/records, hours (if tracked)
- If only one role, show only that section (no empty sections)

### 4. Create member dashboard page
**File:** `src/app/(public_pages)/dashboard/member/page.tsx`
- Redirect to `/dashboard` if not a member
- Show member-specific content:
  - Program applications list with status
  - Active cohort enrollment with progress
  - Attendance history and stats
  - Certificate links

### 5. Create volunteer dashboard page
**File:** `src/app/(public_pages)/dashboard/volunteer/page.tsx`
- Redirect to `/dashboard` if not a volunteer
- Show volunteer-specific content:
  - Volunteer status (pending/active/inactive)
  - Recent activity/tasks
  - Contact history
  - Links to apply for programs

### 6. Update login redirect
**File:** `src/app/(public_pages)/login/LoginForm.tsx`
- Change redirect from `/account` to `/dashboard`
- The dashboard layout will handle role-based routing

### 7. Keep `/account` as legacy redirect
**File:** `src/app/(public_pages)/account/page.tsx`
- Keep the page but add a redirect to `/dashboard`
- This handles any existing bookmarks or links

### 8. Update navigation links
**Files:** Various public pages that link to `/account`
- Update links to point to `/dashboard` instead
- Check: `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`
- Check: `src/app/(public_pages)/get-involved/page.tsx`
- Check: Any other pages linking to `/account`

## Data Queries (reuse from current `/account`)

### Member Data
```sql
-- Program applications
SELECT pa.id, pa.status, pa.created_at, pr.title AS program_title
FROM program_applications pa
JOIN people p ON p.id = pa.person_id
JOIN programs pr ON pr.id = pa.program_id
WHERE LOWER(p.email) = LOWER($1)
ORDER BY pa.created_at DESC

-- Cohort enrollment
SELECT c.title, c.start_date, c.end_date, pt.status, pt.id
FROM participants pt
JOIN cohorts c ON c.id = pt.cohort_id
JOIN people p ON p.id = pt.person_id
WHERE LOWER(p.email) = LOWER($1)
ORDER BY c.start_date DESC

-- Attendance
SELECT ar.session_date, ar.present
FROM attendance_records ar
JOIN participants pt ON pt.id = ar.participant_id
JOIN people p ON p.id = pt.person_id
WHERE LOWER(p.email) = LOWER($1)
ORDER BY ar.session_date DESC
```

### Volunteer Data
```sql
-- Volunteer records
SELECT kind, status, ref_title, created_at
FROM person_records pr
JOIN people p ON p.id = pr.person_id
WHERE LOWER(p.email) = LOWER($1) AND kind = 'volunteer'
ORDER BY pr.created_at DESC
```

## Design Decisions

### Layout
- **Sidebar**: Fixed left sidebar with navigation
  - Dashboard (home icon)
  - My Programs (book icon) - member only
  - My Cohorts (users icon) - member only
  - Volunteer (heart icon) - volunteer only
  - Settings (gear icon)
- **Top Bar**: User name, role badge, logout
- **Content Area**: Main content with proper padding

### Combined Dashboard
For users with both roles:
- Welcome message with both role badges
- Two-column layout on desktop:
  - Left: Member section (applications, cohorts, attendance)
  - Right: Volunteer section (status, tasks, records)
- Single column on mobile with tabs to switch between sections

### Styling
- Use existing design system (colors, fonts, spacing)
- Cards for data sections
- Status badges (reuse StatusBadge component)
- Responsive design (mobile-first)

## Migration Path
- No database changes needed (data already exists)
- No breaking changes (old `/account` redirects to new `/dashboard`)
- Can be deployed incrementally

## Testing
1. Test with user who has only "member" role
2. Test with user who has only "volunteer" role
3. Test with user who has both roles
4. Test with user who has no roles (should redirect to login or show error)
5. Test login redirect goes to `/dashboard`
6. Test `/account` redirects to `/dashboard`
7. Test responsive layout on mobile
