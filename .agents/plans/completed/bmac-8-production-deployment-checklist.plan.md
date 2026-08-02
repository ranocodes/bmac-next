# Plan: Production Deployment Checklist + Admin Role Editing + Profile Dropdown (BMAC-8)

## Summary

Three workstreams. (1) Produce a production deployment checklist (docs-only) that
covers the env-variable matrix for both **bmac-next** and **bmac-express-server**,
health-endpoint and shared-key auth verification, first-admin bootstrap, and an
explicit "no legacy Clerk/Supabase/Neon Auth" statement. (2) Let a super admin
edit the role/permissions of an existing admin instead of creating a duplicate
account — extend the Express `update-admin` endpoint, the Next client/action
layer, and the Admins edit modal. (3) Replace the admin header profile dropdown
with a kokonutui-style component (gradient avatar ring, animated menu) adapted to
the admin dashboard.

## User Story

As a super admin
I want a production deployment checklist, editable roles/permissions for existing
admins, and a polished profile dropdown
So that deployment is repeatable, access control is changeable without account
duplication, and the dashboard feels finished.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | HIGH |
| Systems Affected | bmac-next (`src`, `.env.example`, docs), bmac-express-server (`../backend/server.js`, `.env.example`), Jira BMAC-8 |
| Jira Issue | BMAC-8 |

---

## Patterns to Follow

### Server action with permission gate
```
// SOURCE: src/actions/admin-users.ts:8-11
export async function getAdminUsers() {
  await requirePermission("manage_users");
  return db.query<any>("SELECT ... FROM public.admin_users ORDER BY created_at ASC");
}
```
All new action logic goes behind `requirePermission("manage_users")`.

### Server-action call of Express API client
```
// SOURCE: src/actions/admin-users.ts:60-75
export async function updateAdminUser(id, opts) {
  const admin = await requirePermission("manage_users");
  const { updateAdmin } = await import("@/lib/auth/client");
  const result = await updateAdmin(id, opts);
  if (result.error) return { error: result.error };
  logActivity(admin.email, "admin_update", "auth", { details: `Updated ${result.email || id}` });
  return {};
}
```

### Admin API client (post + shared key)
```
// SOURCE: src/lib/auth/client.ts:53-59
const res = await fetch(`${SERVICE_URL}${path}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  body: JSON.stringify(body || {}),
});
```
`updateAdmin` (client.ts:127-136) currently forwards only `firstName`/`email`; extend the opts shape the same way `createAdmin` (client.ts:81-97) forwards `role`/`permissions`.

### Express endpoint + guards
```
// SOURCE: ../backend/server.js:388-435 (update-admin)
// ALL_PERMISSIONS: ../backend/server.js:48-51
// requireApiKey:   ../backend/server.js:200-210
// admin_users.role carries the role; super_admins row = credentials only (create-admin inserts both, server.js:286-295 / 330-337)
```

### Permission checkbox editor (existing UI pattern)
```
// SOURCE: src/components/admin/UsersTable.tsx:50-64 (openPermissionEditor / toggleEditPerm)
```
Reuse for the AdminsTable role/permissions modal.

### Custom dropdown (project pattern, no radix)
```
// SOURCE: src/components/admin/AdminLayout.tsx:256-276 (profileOpen state + backdrop click-catcher)
// framer-motion is available: package.json "framer-motion": "^11.18.2"
```
No `@radix-ui/react-dropdown-menu` installed and no `components.json`; build the
kokonutui look with the existing absolute-panel + backdrop pattern, animated via
framer-motion `AnimatePresence`.

### Env template (docs workstream)
```
// SOURCE: .env.example (bmac-next, 8 keys) and ../backend/.env.example (9 keys)
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `DEPLOYMENT.md` | CREATE | Production deployment checklist (WS-A) |
| `.env.example` | UPDATE | Fix inaccurate comments/placeholders found during inventory (WS-A) |
| `../backend/.env.example` | UPDATE | Align with actual server env surface (WS-A) |
| `SETUP.md` | UPDATE | Cross-link DEPLOYMENT.md, health endpoint, shared-key note (WS-A) |
| `../backend/server.js` | UPDATE | Extend `update-admin` with `role`/`permissions` + guards (WS-B) |
| `src/lib/auth/client.ts` | UPDATE | `updateAdmin` accepts `role`/`permissions` (WS-B) |
| `src/actions/admin-users.ts` | UPDATE | `updateAdminUser` forwards role/permissions + super-admin guards (WS-B) |
| `src/components/admin/AdminsTable.tsx` | UPDATE | Edit modal gains role select + permission checkboxes (WS-B) |
| `src/components/admin/ProfileDropdown.tsx` | CREATE | Kokonutui-style profile dropdown (WS-C) |
| `src/components/admin/AdminLayout.tsx` | UPDATE | Replace inline profile menu (lines 256-276) with ProfileDropdown (WS-C) |
| `src/__tests__/admin-auth.test.ts` | UPDATE | Action guard tests for role/permission editing (WS-B) |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### WS-A — Deployment checklist (docs)

#### Task A1: Inventory env usage (verification only, no edit)

- **File**: whole repo
- **Action**: VERIFY
- **Implement**: Confirm every `process.env.*` referenced in `src/` has a key in `.env.example`. Known surface: `SUPER_ADMIN_COOKIE_SECRET` (`src/proxy.ts:17`, `src/lib/auth/super-admin.ts:21`), `NEON_DB_URL` (`src/lib/db.ts:16`), `NEXT_PUBLIC_APP_URL` (`src/lib/url.ts:12`), `EMAIL_SERVICE_URL`/`EMAIL_SERVICE_API_KEY` (`src/lib/email.ts:3-4`, `src/lib/auth/client.ts:3-4`), `PAYSTACK_SECRET_KEY` (`src/app/api/webhooks/paystack/route.ts:8`), `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (`EventDetailClient.tsx:43`, fallback `pk_test_placeholder`), `RESEND_API_KEY` (public contact form). Record any gap found in the plan's validation notes.
- **Mirror**: `.env.example`
- **Validate**: grep result table in plan review

#### Task A2: Refresh `.env.example` (bmac-next)

- **File**: `.env.example`
- **Action**: UPDATE
- **Implement**: Keep the 8 keys; tighten comments to match actual usage (mark `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` as required publishable key, note `RESEND_API_KEY` only for the public contact form). Add generation hint: `openssl rand -hex 32` for `SUPER_ADMIN_COOKIE_SECRET` and `EMAIL_SERVICE_API_KEY`.
- **Mirror**: `../backend/.env.example` (already has the `openssl rand -hex 32` pattern documented)
- **Validate**: `npm run build`

#### Task A3: Refresh `../backend/.env.example`

- **File**: `../backend/.env.example`
- **Action**: UPDATE
- **Implement**: Ensure the 9 keys (PORT, NEON_DB_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_SERVICE_API_KEY, FROM_EMAIL, FROM_NAME, NEXT_PUBLIC_APP_URL) match server usage exactly (`server.js:21-38,191,342`). Fix any drift.
- **Mirror**: existing `../backend/.env.example`
- **Validate**: `cd ../backend && node -e "require('dotenv').config(); require('./server.js')"` (starts, no env error) — or visual diff only if server can't bind

#### Task A4: Create `DEPLOYMENT.md`

- **File**: `DEPLOYMENT.md`
- **Action**: CREATE
- **Implement**: Production deployment checklist covering all 5 BMAC-8 ACs:
  - AC1: env matrix for both repos (table), secrets generation commands, app base URL.
  - AC2: Express backend deploy (Neon `NEON_DB_URL`, SMTP creds); verify with `curl <express-url>/health` → `{"status":"ok",...}` (`../backend/server.js:684`).
  - AC3: shared-key auth end-to-end: Next sends `x-api-key` (`client.ts:53-59`), Express checks it (`requireApiKey`, `server.js:200-210`); verification steps (curl a `POST /api/auth/*` with/without key, then a real login).
  - AC4: explicitly states **no** legacy Clerk/Supabase/Neon Auth setup steps; note `@clerk/nextjs` + `@clerk/ui` exist in `package.json` but are unused (zero imports) — checklist-only note, no removal in this task.
  - AC5: fresh deploy bootstrap via `/admin/setup` (`src/app/admin/(public)/setup/page.tsx`) → `register-first-admin` → rows in `public.super_admins` + `public.admin_users`.
- **Mirror**: `SETUP.md` structure
- **Validate**: reviewer walks each AC against the checklist

#### Task A5: Cross-link `SETUP.md`

- **File**: `SETUP.md`
- **Action**: UPDATE
- **Implement**: Add a "Production" section pointing to `DEPLOYMENT.md`, documenting the `/health` endpoint and the `x-api-key` handshake.
- **Mirror**: `SETUP.md` existing sections
- **Validate**: `npm run build` unaffected (docs only)

### WS-B — Role/permission editing for existing admins

#### Task B1: Extend Express `update-admin`

- **File**: `../backend/server.js`
- **Action**: UPDATE
- **Implement**: In `update-admin` (`server.js:388`), accept optional `role` and `permissions`:
  - If `role` present, validate ∈ `['super_admin','moderator']`; if `permissions` present, validate array and every item ∈ `ALL_PERMISSIONS` (`server.js:48-51`).
  - Guard: demoting a super_admin when it is the only `admin_users` row with `role='super_admin'` → 400 `Cannot demote the last super admin`.
  - Update: `UPDATE public.admin_users SET email=$1, first_name=$2, role=$3, permissions=$4 WHERE id=$5` (role/permissions only when provided; `permissions` stored via `JSON.stringify`). Keep the existing email-clash checks and the `super_admins` email/first_name sync. `super_admins` role is not touched (credentials table).
  - `logAuthActivity(newEmail, 'admin_role_update', ...)` when role/permissions changed.
- **Mirror**: `create-admin` role/permissions handling (`server.js:309-335`), `update-admin` existing guards (`server.js:388-435`)
- **Validate**: `cd ../backend && node --check server.js`; manual curl against local instance

#### Task B2: Extend Next client `updateAdmin`

- **File**: `src/lib/auth/client.ts`
- **Action**: UPDATE
- **Implement**: Widen `updateAdmin` opts (`client.ts:127-136`) to `{ firstName?; email?; role?: AdminRole; permissions?: Permission[] }` and forward all provided fields in the POST body.
- **Mirror**: `createAdmin` (`client.ts:81-97`)
- **Validate**: `npm run build`

#### Task B3: Extend action `updateAdminUser`

- **File**: `src/actions/admin-users.ts`
- **Action**: UPDATE
- **Implement**: Widen `updateAdminUser` (`admin-users.ts:60-75`) opts to include `role?`/`permissions?`. Guards:
  - `requirePermission("manage_users")` (existing).
  - Role changes only when caller is `super_admin`.
  - Self-demotion → error.
  - Forward to `updateAdmin(id, opts)`; log `admin_role_update` when role/permissions changed.
- **Mirror**: existing `updateAdminUser` shape; `deleteAdminUser` last-super-admin guard pattern (`admin-users.ts:33-44`)
- **Validate**: `npm run build`

#### Task B4: Extend Admins edit modal

- **File**: `src/components/admin/AdminsTable.tsx`
- **Action**: UPDATE
- **Implement**: In the edit modal (`AdminsTable.tsx:225-260`) add a role `<select>` (`super_admin`/`moderator`) and permission checkboxes from the 8 `Permission` values (`src/types/cms.ts:95-102`). Send the full payload via `updateAdminUser`. Disable role change for the current user's own row.
- **Mirror**: `UsersTable.tsx:50-64` permission toggle pattern; `roleBadge` styling already present (`AdminsTable.tsx:23`)
- **Validate**: `npm run build`

#### Task B5: Action guard tests

- **File**: `src/__tests__/admin-auth.test.ts`
- **Action**: UPDATE
- **Implement**: Mock `@/lib/auth/server` (`requirePermission`), `@/lib/auth/client` (`updateAdmin`), `@/actions/activity-logs` (`logActivity`); assert: non-super-admin caller cannot change role; self-demotion rejected; last-super-admin demotion rejected; valid role+permission change calls `updateAdmin` with expected payload and logs `admin_role_update`.
- **Mirror**: existing `admin-auth.test.ts` mock shape (namespace-import mocks, `src/__tests__/mocks.tsx`)
- **Validate**: `npm test`

### WS-C — Kokonutui-style profile dropdown

#### Task C1: Create `ProfileDropdown`

- **File**: `src/components/admin/ProfileDropdown.tsx`
- **Action**: CREATE
- **Implement**: `"use client"` component matching the kokonutui ProfileDropdown structure (avatar button with gradient ring + first-initial, name/email, bending-line indicator, `w-64 rounded-2xl` menu with header block, menu items, red Sign Out), adapted to the admin dashboard:
  - Theme tokens: `bg-card`, `border-border`, `text-secondary`, `text-muted-foreground`, `bg-primary/10` (match `AdminLayout.tsx`), instead of zinc-800.
  - Menu items: Profile (`/admin`), Settings (`/admin/settings`), Sign Out. Drop the AI Model/Subscription rows.
  - Open/close via framer-motion `AnimatePresence` (fade/zoom, matching kokonutui data-state animation intent) + fixed backdrop click-catcher (`AdminLayout.tsx:262` pattern).
  - Props: `{ firstName, email, role, onLogout }`.
- **Mirror**: kokonutui source (pasted by user) for structure; `AdminLayout.tsx:256-276` for the open/close wiring and `logoutAdmin()` flow
- **Validate**: `npm run build`

#### Task C2: Wire into `AdminLayout`

- **File**: `src/components/admin/AdminLayout.tsx`
- **Action**: UPDATE
- **Implement**: Replace the inline profile button + menu (`AdminLayout.tsx:256-276`) with `<ProfileDropdown firstName={firstName} email={email} role={role} onLogout={() => logoutAdmin().catch(() => window.location.assign("/admin/login"))} />`. Remove the now-unused `profileOpen` state (`AdminLayout.tsx:110`) and the `relative` wrapper if no longer needed. Keep the `firstName` display span next to it (`:277`).
- **Mirror**: existing `logoutAdmin` handling (`AdminLayout.tsx:243,269`)
- **Validate**: `npm run build`

---

## Validation

```bash
# Type check / build
npm run build

# Express syntax check
cd ../backend && node --check server.js

# Lint
npx eslint src/components/admin/ProfileDropdown.tsx src/components/admin/AdminsTable.tsx src/actions/admin-users.ts src/lib/auth/client.ts

# Tests
npm test
```

Known pre-existing lint baseline: 18 `no-explicit-any` in `src/__tests__` (238 repo-wide) — do not introduce new error categories.

---

## Acceptance Criteria

- [ ] `DEPLOYMENT.md` exists and walks all 5 BMAC-8 ACs (env matrix, `/health`, shared-key auth, no-legacy-auth statement, first-admin bootstrap)
- [ ] Both `.env.example` files match actual env usage
- [ ] Super admin can change role + permissions of an existing admin via the Admins edit modal (no duplicate account)
- [ ] Last-super-admin, self-demotion, and non-super-admin callers are blocked
- [ ] Profile dropdown replaced with kokonutui-style component; sign out still works
- [ ] `npm run build`, `node --check server.js`, and `npm test` pass
- [ ] Follows existing patterns
