# BMAC-4: Align setup documentation and environment variables

Status: Complete · Date: 2026-08-02 · Branch: `test` (bmac-next) / `main` (backend)

## Scope

Aligned setup docs and env templates with the current stack: custom Express auth
backend (bmac-express-server, HMAC cookie, bcrypt), Neon Postgres HTTP, Paystack,
Nodemailer SMTP (via Express), Resend contact-form-only. Removed all legacy Clerk
and env-var super-admin references.

## Changes

### bmac-next (`test`)
- `.env.example` — rewritten: removed Clerk + `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD_HASH`; added `EMAIL_SERVICE_URL`, `EMAIL_SERVICE_API_KEY`; relabeled `RESEND_API_KEY` as contact-form-only. (Gitignored by `.env*` rule — lives on disk, not tracked.)
- `SETUP.md` — rewritten: Express backend setup (clone bmac-express-server, `cp .env.example .env`, SMTP/Neon), first admin via `/admin/setup`, architecture diagram, troubleshooting.
- `README.md` — stack line (Express auth, Nodemailer + Resend), env table updated, "set up Express backend first" + `/admin/setup` for first admin.
- `CLAUDE.md` — all 7 Clerk references removed (overview, tech stack rows, architecture, auth section, key files, test setup).
- `scripts/generate-password-hash.mjs` — deleted (obsolete; bcrypt lives in Express).

### backend (`main`)
- `.env.example` — added `NEON_DB_URL`, `NEXT_PUBLIC_APP_URL` to existing `PORT`/`SMTP_*`/`EMAIL_SERVICE_API_KEY`/`FROM_*`.
- `README.md` — created: purpose, stack, setup, env table, `/health`, auth API table with `x-api-key` requirement, deploy notes.

### Jira
- BMAC-2 (Done), BMAC-3 (Done), BMAC-4 (In Progress), BMAC-8 (To Do) — descriptions/ACs rewritten to Express stack; `clerk` labels removed.

## Validation

- `grep -i clerk` in `bmac-next/{CLAUDE.md,SETUP.md,.env.example}` → clean.
- `grep -i clerk` in `backend/{README.md,.env.example}` → clean.
- `bmac-next/README.md` retains one historical note ("custom cookie auth instead of Clerk") recording the architecture decision — kept intentionally.

## Deviations

- Worked directly on `test` (bmac-next) and `main` (backend) per user instruction; feature branches deleted.
- `.env.example` (bmac-next) cannot be committed (gitignore `.env*`); content verified on disk.
- Clerk purge extended to Jira tasks BMAC-2/3/4/8 per user request (originally only BMAC-4).
