# Plan: Module-Level Admin Permissions (BMAC-10)

## Summary

Replace the coarse 8-permission admin model with module-level permissions (news, events, programs, gallery, team, testimonials, categories, partners, stats, payments, people, logs, users, settings, export). Enforce permissions server-side on every admin route (currently only the client nav gates access), keep client-side nav/route filtering in sync, add a dedicated `export_data` permission that hides and blocks CSV export, and make permission edits from the Users page take effect on the editor's own session immediately.

## User Story

As a Super Admin
I want staff accounts to have module-level permissions
So that staff can access only the parts of the platform they are responsible for, enforced on the server.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | auth (session cookie), admin routes/pages, admin nav, admin users editor, people export |
| Jira Issue | BMAC-10 |

---

## Current State (verified)

- `Permission` union is 8 coarse values: `manage_users, edit_content, manage_courses, manage_partners, view_analytics, access_settings, delete_records, manage_moderators` (`src/types/cms.ts:94-102`).
- Route gating is **client-side only**: `routePermissions` map + `checkRouteAccess` in `src/components/admin/AdminLayout.tsx:82-105` renders "Access Denied" but never blocks the server fetch — every admin page (`src/app/admin/(admin)/**/page.tsx`) is a server component that loads data directly (`db.getAll`), with zero permission checks.
- Server-side enforcement exists only in server actions via `requirePermission` (`src/lib/auth/server.ts:42-45`); used in `admin-users`, `activity-logs`, `people`.
- Session cookie (`bmac_admin_session`, HMAC-signed) stores `role` + `permissions`; `getSuperAdminSession` validates role ∈ {super_admin, moderator} (`src/lib/auth/super-admin.ts:61-80`). Admin/role/permission CRUD hits an **external auth service** (`EMAIL_SERVICE_URL` in `src/lib/auth/client.ts:3`) that stores permission strings opaquely — new names are safe to add there.
- Local Neon `admin_users` table mirrors admins (`getAdminUsers`, `src/actions/admin-users.ts:9-12`) and is the write target for `updateUserPermissions` (local-only, `admin-users.ts:14-17`).
- Export exists only in `exportPeople` (`src/actions/people.ts:254`) + "Export CSV" button in `src/components/admin/PeopleTable.tsx:71`; gated by `manage_users`, button always visible to anyone who can view.
- Permission editor lists live in three places: `AdminsTable.tsx:12`, `UsersTable.tsx:22`, `CreateAdminForm.tsx:10`. `UsersTable` already has a permissions editor calling `updateUserPermissions` (`UsersTable.tsx:59-63`).
- Super admins are force-granted all permissions at save time in `AdminsTable.tsx:92`, but `requirePermission` reads whatever is in the cookie.

## Design Decisions

1. **Module-level permission set** — each admin module gets its own `manage_*` permission. Keep `view_analytics`, `access_settings`. Drop `delete_records` (folded into module perms) and `manage_moderators` (folded into `manage_users`). Add `export_data`.
2. **Super admin implicit bypass** — `requirePermission` returns `ALL_PERMISSIONS` when `role === "super_admin"`. This survives stale cookies and the external service's stored rows after deploy without forcing every account to re-login or re-save.
3. **Server-side route guard** — new `requirePage(permission)` helper in `src/lib/auth/server.ts` (`requirePermission` + `redirect("/admin")` on denial), called as the first statement of every admin page. Satisfies AC "denied server-side" and the people page already redirects to a gated action; the others don't.
4. **Client nav in sync** — `navGroups` and `routePermissions` map to the new module permissions; editing permissions updates the DB/cookie, and the client re-renders from the (refreshed) session.
5. **Self-edit reflection** — after saving permissions in the Users page, refresh the editor's own session cookie from the local `admin_users` row so their nav/route access changes immediately (AC "when changes are saved, then navigation and route access reflect"). Other admins pick up changes at next login (cookie is per-browser; external service re-reads its store).
6. **Export gating** — `export_data` is a distinct permission. `exportPeople` requires it server-side (blocked); PeopleTable hides the Export CSV button unless the viewer has it (hidden). If a viewer lacks `manage_people`, they never see the list at all.
7. **Data migration** — remap existing local `admin_users.permissions` old→new names so existing non-super accounts keep working. External service rows re-saved manually (super bypass covers the owner).

## Old → New Permission Map (for migration)

| Old | New |
|-----|-----|
| `edit_content` | `manage_news`, `manage_events`, `manage_gallery`, `manage_team`, `manage_testimonials`, `manage_categories`, `manage_stats` |
| `manage_courses` | `manage_programs` |
| `manage_partners` | `manage_partners` |
| `view_analytics` | `view_analytics` |
| `access_settings` | `access_settings` |
| `manage_users` | `manage_users` |
| `manage_moderators` | `manage_users` |
| `delete_records` | *(drop — module perms imply CRUD)* |

## Route → Permission Map

| Route prefix | Permission |
|--------------|------------|
| `/admin` (dashboard) | `view_analytics` |
| `/admin/news*` | `manage_news` |
| `/admin/events*` | `manage_events` |
| `/admin/programs*` | `manage_programs` |
| `/admin/gallery*` | `manage_gallery` |
| `/admin/team*` | `manage_team` |
| `/admin/testimonials*` | `manage_testimonials` |
| `/admin/categories*` | `manage_categories` |
| `/admin/partners*` | `manage_partners` |
| `/admin/stats*` | `manage_stats` |
| `/admin/payments*` | `manage_payments` |
| `/admin/people*` | `manage_people` |
| `/admin/logs*` | `manage_logs` |
| `/admin/admins*`, `/admin/users*` | `manage_users` |
| `/admin/settings*` | `access_settings` |
| export (actions, buttons) | `export_data` |

---

## Patterns to Follow

### Naming
```
// SOURCE: src/types/cms.ts:92-102
export type AdminRole = "super_admin" | "administrator" | "moderator";
export type Permission =
  | "manage_users" | "edit_content" | ...;
```
Add the new union members here; keep the type narrow (no `string`).

### Error Handling / Guard
```
// SOURCE: src/lib/auth/server.ts:42-45
export async function requirePermission(permission: Permission) {
  const admin = await requireAdmin();
  if (!admin.permissions?.includes(permission)) throw new Error("Forbidden: insufficient permissions");
  return admin;
}
```
New `requirePage` wraps this and calls `redirect("/admin")` on failure (mirror `loginAdmin`'s `redirect` usage in `src/actions/admin-auth.ts:3,27`).

### Permission editor list
```
// SOURCE: src/components/admin/UsersTable.tsx:22-31
const allPermissions: { key: Permission; label: string }[] = [
  { key: "edit_content", label: "Edit Content" }, ...
];
```
Single shared source preferred: export one `PERMISSION_LABELS` list from `src/lib/auth/permissions.ts` and import in AdminsTable, UsersTable, CreateAdminForm, and the migration doc.

### Tests
```
// SOURCE: src/__tests__/admin-users.test.ts:1-33
vi.mock("@/lib/auth/server", () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}));
vi.mock("@/lib/db", () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));
```
Mirror the mock-`@/`-modules style. AdminLayout tests: `src/__tests__/AdminLayout.test.tsx:22-41` (`usePathname` from `./mocks`).

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/types/cms.ts` | UPDATE | module-level `Permission` union |
| `src/lib/auth/super-admin.ts` | UPDATE | `ALL_PERMISSIONS` new set |
| `src/lib/auth/server.ts` | UPDATE | super bypass + `requirePage` helper |
| `src/lib/auth/permissions.ts` | CREATE | shared `PERMISSION_LABELS` list |
| `src/components/admin/AdminLayout.tsx` | UPDATE | navGroups + routePermissions to module perms |
| `src/actions/people.ts` | UPDATE | `exportPeople` → `export_data` |
| `src/components/admin/PeopleTable.tsx` | UPDATE | hide Export CSV without `export_data` |
| `src/app/admin/(admin)/people/page.tsx` | UPDATE | pass `canExport` from session |
| `src/components/admin/UsersTable.tsx` | UPDATE | new permission list + session refresh after save |
| `src/components/admin/AdminsTable.tsx` | UPDATE | new permission list (import shared) |
| `src/components/admin/CreateAdminForm.tsx` | UPDATE | new permission list (import shared) |
| `src/actions/admin-users.ts` | UPDATE | add `refreshSessionPermissions` action |
| 33 admin pages under `src/app/admin/(admin)/` | UPDATE | `await requirePage(...)` first line |
| `src/__tests__/` (new + existing) | CREATE/UPDATE | permission/guard/export tests |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Expand Permission model + guard helpers

- **File**: `src/types/cms.ts`, `src/lib/auth/super-admin.ts`, `src/lib/auth/server.ts`, `src/lib/auth/permissions.ts`
- **Action**: UPDATE x3, CREATE x1
- **Implement**:
  - Replace `Permission` union with module set (Design Decisions #1). Keep `AdminRole` unchanged.
  - `ALL_PERMISSIONS` in `super-admin.ts` = the new set.
  - `server.ts`: in `requirePermission`, if `admin.role === "super_admin"` return `admin` (implicit all). Add `export async function requirePage(permission: Permission)` → try `requirePermission`, on throw `redirect("/admin")`.
  - Create `src/lib/auth/permissions.ts` exporting `PERMISSION_LABELS: { key: Permission; label: string }[]` (one entry per permission, human labels) and `ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, Permission[]>` (super_admin → all; moderator/administrator → sensible defaults like content modules).
- **Mirror**: `src/lib/auth/super-admin.ts:7-10` (ALL_PERMISSIONS), `server.ts:42-45`
- **Validate**: `pnpm run build`

### Task 2: Server-side guards on all admin pages

- **File**: every `src/app/admin/(admin)/**/page.tsx` (33 pages)
- **Action**: UPDATE
- **Implement**: add as the first statement of each page:
  ```ts
  import { requirePage } from "@/lib/auth/server";
  export default async function XPage() {
    await requirePage("manage_events");
    ...
  }
  ```
  Use the Route → Permission map. `export const dynamic = "force-dynamic"` already on most pages; add if missing so the guard always runs.
- **Mirror**: `src/app/admin/(admin)/people/page.tsx:1-9` (already has `force-dynamic`; add guard)
- **Validate**: `pnpm run build`; curl an admin page with a permission-less session → redirect to `/admin`

### Task 3: Client nav + route map

- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: update `navGroups` `permission` fields and `routePermissions` record to the module map. Add `export_data` to nothing in nav (no page); it gates actions/buttons only.
- **Mirror**: `AdminLayout.tsx:82-99`
- **Validate**: `pnpm run build`; `pnpm test` (existing AdminLayout tests updated to new permission names)

### Task 4: Permission editors + session refresh

- **File**: `src/components/admin/UsersTable.tsx`, `src/components/admin/AdminsTable.tsx`, `src/components/admin/CreateAdminForm.tsx`, `src/actions/admin-users.ts`
- **Action**: UPDATE x4
- **Implement**:
  - Replace the three inline `allPermissions`/`ALL_PERMISSIONS_LIST` arrays with imports from `@/lib/auth/permissions`.
  - `AdminsTable.tsx:92` super-admin-all logic now resolves against the new set (still force all for super).
  - Add `export async function refreshSessionPermissions()` in `admin-users.ts`: `requirePermission("manage_users")` → read own row from `admin_users` → `setSuperAdminSession(email, firstName, permissions, role)`. UsersTable calls it after a successful `updateUserPermissions` so the editor's nav reflects immediately.
- **Mirror**: `src/actions/admin-users.ts:14-17`, `UsersTable.tsx:59-63`
- **Validate**: `pnpm run build`; `pnpm test`

### Task 5: Export permission

- **File**: `src/actions/people.ts`, `src/components/admin/PeopleTable.tsx`, `src/app/admin/(admin)/people/page.tsx`
- **Action**: UPDATE x3
- **Implement**:
  - `exportPeople` (`people.ts:254`): `requirePermission("export_data")` instead of `manage_users`.
  - `PeopleTable`: accept `canExport: boolean` prop; render Export CSV button only when true.
  - People page: `const admin = await requirePage("manage_people")`; pass `canExport={admin.permissions.includes("export_data")}`.
- **Mirror**: `PeopleTable.tsx:71` (button), `people.ts:254` (action)
- **Validate**: `pnpm run build`; test that non-export admin sees no button and action throws

### Task 6: Data migration (Neon)

- **File**: production DB `br-cold-heart-apcgi6sy` via `Neon_run_sql_transaction`
- **Action**: RUN migration
- **Implement**: remap `public.admin_users.permissions` JSONB using the Old→New map (expand `edit_content`/`manage_courses`, drop `delete_records`, fold `manage_moderators`). Idempotent: only remap rows containing old names. Super_admin rows: set to `ALL_PERMISSIONS`.
- **Validate**: `SELECT email, permissions FROM public.admin_users` — no old names remain; then report in Jira comment that the external auth service admins must be re-saved once from the Users page (or rely on super bypass).

### Task 7: Tests

- **File**: `src/__tests__/permissions.test.ts` (CREATE), `src/__tests__/AdminLayout.test.tsx` (UPDATE), `src/__tests__/PeopleTable.test.tsx` (CREATE)
- **Action**: CREATE x2, UPDATE x1
- **Implement**:
  - `permissions.test.ts`: mock `@/lib/auth/super-admin` + `server` — `requirePermission` returns admin for super_admin with empty perms; non-super with matching perm passes; non-super without throws; `requirePage` redirects on denial.
  - `AdminLayout.test.tsx`: update nav route expectations to new permission names; assert `/admin/events` requires `manage_events`, `/admin/payments` requires `manage_payments`.
  - `PeopleTable.test.tsx`: render with `canExport` true → button shown; false → hidden.
- **Mirror**: `admin-users.test.ts:1-33`, `AdminLayout.test.tsx:22-70`
- **Validate**: `pnpm test`

---

## Validation

```bash
# Type check
pnpm run build

# Lint
npx eslint src/lib/auth src/actions/people.ts src/components/admin/PeopleTable.tsx src/actions/admin-users.ts src/__tests__/permissions.test.ts src/__tests__/PeopleTable.test.tsx

# Tests
pnpm test
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| External auth service stores old permission names → non-super admins lose access after deploy | super_admin bypass in `requirePermission`; Task 6 local remap; re-save via Users page for the rest |
| `redirect()` inside `requirePage` throws in server actions context | `requirePage` only used in pages (rendering); keep `requirePermission` for actions |
| Stale client nav after self-edit | Task 4 `refreshSessionPermissions` rewrites the editor's cookie |
| 33-page guard edits are repetitive / easy to miss one | Route→Permission map table in this plan; per-module task grouping; build + E2E sweep |

---

## Acceptance Criteria

- [ ] Admin with `manage_events` can open event admin pages; admin without gets redirected server-side (AC#1)
- [ ] Admin without `manage_payments` cannot fetch `/admin/payments` — denied before DB read (AC#2)
- [ ] Permission edits from the Users page update nav + route access (AC#3)
- [ ] Non-export admin on `/admin/people` sees no Export CSV button and `exportPeople` action is blocked (AC#4)
- [ ] All tasks completed, build passes, tests pass, follows existing patterns
