# Plan: Align Setup Documentation and Environment Variables

## Summary

Documentation lags the real stack. Docs still describe Clerk auth, env-var-based super admin (`SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD_HASH`), and omit the Express auth backend. Reality: auth is a custom Express service (`bmac-express-server`) with HMAC cookie sessions (`bmac_admin_session`), DB-driven admins (`admin_users` + `super_admins`, bcrypt), Nodemailer SMTP email for admin credentials, and Neon HTTP driver in both services. Rewrite `.env.example`, `SETUP.md`, `README.md`, and `CLAUDE.md` in `bmac-next`; fix `backend/.env.example` and add a backend `README.md`; update the stale BMAC-4 Jira acceptance criteria to match the Express stack.

## User Story

As a developer
I want setup docs and env templates to match the current Express + Neon + Paystack + Nodemailer stack
So that new contributors do not configure legacy Clerk/Resend services that no longer run the app.

## Metadata

| Field | Value |
|-------|-------|
| Type | REFACTOR |
| Complexity | LOW |
| Systems Affected | bmac-next docs, bmac-express-server docs, Jira BMAC-4 |
| Jira Issue | BMAC-4 |

---

## Verified Current State (source of truth)

### bmac-next env vars actually consumed (grep `process.env`)
| Variable | Used in | Purpose |
|---|---|---|
| `NEON_DB_URL` | `src/lib/db.ts:16` | Neon HTTP driver |
| `SUPER_ADMIN_COOKIE_SECRET` | `src/proxy.ts:17`, `src/lib/auth/super-admin.ts:21` | HMAC cookie signing |
| `NEXT_PUBLIC_APP_URL` | `src/lib/url.ts:12`, `src/lib/auth/client.ts:95-144` | email/reset/webhook base URL |
| `EMAIL_SERVICE_URL` | `src/lib/auth/client.ts:3`, `src/lib/email.ts:3` | Express backend base URL |
| `EMAIL_SERVICE_API_KEY` | `src/lib/auth/client.ts:4`, `src/lib/email.ts:4` | Express API key (mirrors backend `EMAIL_SERVICE_API_KEY`) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `EventDetailClient.tsx:43` | inline Paystack checkout |
| `PAYSTACK_SECRET_KEY` | `src/app/api/webhooks/paystack/route.ts:8` | webhook verification |
| `RESEND_API_KEY` | `src/app/(public_pages)/contact/actions.ts:6` | public contact form ONLY |
| `NODE_ENV` | `super-admin.ts:56` | cookie `secure` flag |

### Dead (no longer used, must be removed from docs)
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD_HASH` — env-var auth replaced by DB admins + bcrypt via Express
- All `CLERK_*` vars — Clerk replaced by custom HMAC sessions
- `scripts/generate-password-hash.mjs` — generates scrypt hash for removed env auth (now obsolete)

### backend env vars (`server.js` grep)
`PORT`, `NEON_DB_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_SERVICE_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `NEXT_PUBLIC_APP_URL`
Missing from `backend/.env.example`: `NEON_DB_URL`, `NEXT_PUBLIC_APP_URL`.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `bmac-next/.env.example` | REWRITE | Remove Clerk + env-auth, add `EMAIL_SERVICE_URL`/`EMAIL_SERVICE_API_KEY`, keep super secret/Neon/Paystack/Resend |
| `bmac-next/SETUP.md` | REWRITE | Replace Clerk section with Express backend setup + custom auth flow |
| `bmac-next/README.md` | UPDATE | Fix stack line, env table, first-admin steps |
| `bmac-next/CLAUDE.md` | UPDATE | Fix Tech Stack, Architecture, Auth, Key Files sections (Clerk → Express HMAC) |
| `bmac-next/scripts/generate-password-hash.mjs` | DELETE | Obsolete — replaced by bcrypt in Express |
| `backend/.env.example` | UPDATE | Add `NEON_DB_URL`, `NEXT_PUBLIC_APP_URL` |
| `backend/README.md` | CREATE | Setup, env vars, auth endpoints, email config |
| Jira BMAC-4 | UPDATE | Rewrite description + AC to Express stack |

---

## Tasks

Execute in order.

### Task 1: Rewrite `bmac-next/.env.example`

- **File**: `.env.example`
- **Action**: REWRITE
- **Implement**:
  - Remove: Clerk block, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD_HASH`
  - Keep: `SUPER_ADMIN_COOKIE_SECRET` (comment: `openssl rand -hex 32`), `NEON_DB_URL`, Paystack pair, `NEXT_PUBLIC_APP_URL`
  - Add: `EMAIL_SERVICE_URL=http://localhost:3001`, `EMAIL_SERVICE_API_KEY=<must match backend>`
  - Re-label `RESEND_API_KEY` → "public contact form only"
- **Validate**: `cp .env.example .env.local` runs, comments match `SETUP.md`

### Task 2: Rewrite `bmac-next/SETUP.md`

- **File**: `SETUP.md`
- **Action**: REWRITE
- **Implement**:
  - Prereqs: Node 20+, Neon, Paystack, Express backend repo, SMTP/Gmail app password (drop Clerk, Resend requiredness)
  - Replace Clerk section with **Express auth backend**: clone `ranocodes/bmac-express-server`, `cp .env.example .env`, set `SMTP_*`/`FROM_*`/`EMAIL_SERVICE_API_KEY`/`NEON_DB_URL`, `npm install && npm start`
  - Add section: point Next at the backend (`EMAIL_SERVICE_URL`, `EMAIL_SERVICE_API_KEY` must match)
  - First-time admin: visit `/admin/setup` → register first admin (auto-created super_admin in DB) — not Clerk hosted signup
  - Troubleshooting: drop Clerk bullet, add "moderator redirect loop → check proxy.ts allowlist", "email not sent → check Express /send + SMTP"
- **Validate**: every variable listed appears in `.env.example`

### Task 3: Update `bmac-next/README.md`

- **File**: `README.md`
- **Action**: UPDATE
- **Implement**:
  - Stack line: "Resend for email" → "Nodemailer (SMTP) via the Express backend for admin credentials; Resend only for the contact form"
  - Development env table: drop `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD_HASH`, add `EMAIL_SERVICE_URL`, `EMAIL_SERVICE_API_KEY`
  - Add step: run the Express backend first (`bmac-express-server`)
  - AI disclosure line mentions "custom cookie auth instead of Clerk" — keep (accurate)
- **Validate**: table rows == `.env.example` keys (minus NEXT_PUBLIC_APP_URL optional note)

### Task 4: Update `bmac-next/CLAUDE.md`

- **File**: `CLAUDE.md`
- **Action**: UPDATE
- **Implement**:
  - Tech Stack row: `Clerk v7` → `Custom Express auth (bmac-express-server) + HMAC cookie sessions`
  - Resend row → `Nodemailer SMTP via Express (admin) + Resend (contact form)`
  - Architecture: `admin/` description "Clerk-protected" → "Express-backed custom-session protected"
  - Auth section (§93-100): rewrite Clerk middleware + `currentUser()` → proxy allowlist + `getSuperAdminSession`, DB admins
  - Key Files: `src/proxy.ts` → "Express-backed session guard (Clerk middleware removed)"
- **Validate**: no `Clerk` mentions remain in these sections

### Task 5: Update `backend/.env.example`

- **File**: `backend/.env.example`
- **Action**: UPDATE
- **Implement**: add `NEON_DB_URL=postgresql://...` and `NEXT_PUBLIC_APP_URL=http://localhost:3000` with comments
- **Validate**: keys match `server.js` `process.env` grep

### Task 6: Create `backend/README.md`

- **File**: `backend/README.md`
- **Action**: CREATE
- **Implement**: purpose, setup (`cp .env.example .env`), env table, run (`npm start`, port 3001), auth endpoints (`/api/auth/login`, `create-admin`, `update-admin`, `resend-credentials`, `request-password-reset`, `reset-password`, `/send`), API key header note, deploy note (Vercel)
- **Validate**: endpoint list matches `server.js` routes

### Task 7: Update Jira BMAC-4 description + acceptance criteria

- **Action**: UPDATE (via `editJiraIssue`)
- **Implement**:
  - Description: docs must match **custom Express auth backend + Neon HTTP + Paystack + Nodemailer SMTP** (not Clerk, not Resend-as-primary)
  - AC (rewrite):
    1. setup docs describe the Express auth backend (clone + env + run), not Clerk
    2. `.env.example` lists only live vars; dead Clerk/env-auth vars removed
    3. admin email (credentials/reset/delete alerts) documented as Nodemailer SMTP via Express
    4. legacy Clerk/Supabase/GitHub OAuth references removed or marked obsolete
- **Validate**: re-fetch issue, AC reflects new stack

---

## Validation

```bash
# No code changes in this plan — docs only. Smoke checks:
grep -rn "CLERK" .env.example SETUP.md README.md CLAUDE.md   # expect none (CLAUDE.md may note history)
grep -rn "SUPER_ADMIN_EMAIL\|SUPER_ADMIN_PASSWORD_HASH" .env.example SETUP.md README.md  # expect none
ls backend/.env.example && grep -c "NEON_DB_URL\|NEXT_PUBLIC_APP_URL" backend/.env.example
```

Docs-only change: `npm run build` / lint not required. Jira BMAC-4 must show updated AC.

---

## Acceptance Criteria

- [ ] `bmac-next/.env.example` contains only live vars; no Clerk/env-auth entries
- [ ] `SETUP.md` walks through Express backend setup + first-admin via `/admin/setup`
- [ ] `README.md` stack + env table match reality
- [ ] `CLAUDE.md` no longer describes Clerk as the auth provider
- [ ] `backend/.env.example` has `NEON_DB_URL` + `NEXT_PUBLIC_APP_URL`
- [ ] `backend/README.md` created with setup + endpoints
- [ ] Dead `scripts/generate-password-hash.mjs` removed
- [ ] Jira BMAC-4 AC updated to Express stack
