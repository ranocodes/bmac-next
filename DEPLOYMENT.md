# BMAC — Production Deployment Checklist

Follow this checklist when deploying **bmac-next** and **bmac-express-server** to
production. It covers environment configuration, the Express backend health
check, shared-key auth, and first-admin bootstrap. Pair with
[`SETUP.md`](./SETUP.md) for the full local walkthrough.

---

## 1. Environment variables — both apps

Copy `.env.example` → `.env.local` (bmac-next) and `.env` (bmac-express-server),
then fill in production values.

### bmac-next

| Variable | Required | How to set |
|---|---|---|
| `SUPER_ADMIN_COOKIE_SECRET` | yes | `openssl rand -hex 32` (stable across restarts) |
| `EMAIL_SERVICE_URL` | yes | HTTPS URL of the deployed Express service (e.g. `https://bmac-express-server.example.com`) |
| `EMAIL_SERVICE_API_KEY` | yes | `openssl rand -hex 32` — **must match** the backend's key |
| `NEON_DB_URL` | yes | Neon → Connection Details → HTTP driver connection string (NOT the pooler URL) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | yes | Paystack Dashboard → Settings → API Keys & Webhooks → Public Key (live `pk_live_...`) |
| `PAYSTACK_SECRET_KEY` | yes | Same page → Secret Key (live `sk_live_...`) |
| `NEXT_PUBLIC_APP_URL` | yes | Deployed Next.js URL (e.g. `https://bmac-next.example.com`) |
| `RESEND_API_KEY` | no | Resend Dashboard → API Keys (public contact form only) |

> **⚠️ Publishable key fallback**: `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx:43`
> falls back to `pk_test_placeholder` when `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is
> unset. A live key **must** be set in production or ticket checkout uses a bogus
> key.

### bmac-express-server

| Variable | Required | How to set |
|---|---|---|
| `PORT` | no | defaults to `3001` |
| `NEON_DB_URL` | yes | Same Neon connection string as bmac-next |
| `SMTP_HOST` / `SMTP_PORT` | yes | SMTP provider (e.g. `smtp.gmail.com`, `587`) |
| `SMTP_USER` / `SMTP_PASS` | yes | SMTP login + app password |
| `EMAIL_SERVICE_API_KEY` | yes | `openssl rand -hex 32` — **must match** bmac-next's key |
| `FROM_EMAIL` | yes | Sender address for admin email |
| `FROM_NAME` | no | Defaults to `BMAC Admin` |
| `NEXT_PUBLIC_APP_URL` | yes | Deployed Next.js URL (used for email links) |

### Verification

- Keys match between apps (`EMAIL_SERVICE_API_KEY`, `NEON_DB_URL`).
- Secrets are stored in the platform's secret manager (Vercel Project Env Vars),
  never committed.

---

## 2. Express backend — SMTP + Neon + health endpoint

1. Deploy `bmac-express-server` first (it is a dependency of bmac-next).
2. Confirm the deploy has `NEON_DB_URL` and SMTP vars set.
3. Health check:

```bash
curl https://<express-url>/health
# → {"status":"ok","timestamp":"..."}
```

The endpoint is `GET /health` in `server.js:684`. A `200 {"status":"ok"}` means
the service is up; it does **not** test the DB. To confirm DB connectivity, call
an auth endpoint (next section).

---

## 3. Shared-key auth — end to end

bmac-next → bmac-express-server calls are authenticated with the
`x-api-key` header:

- bmac-next sends it on every admin API call — `src/lib/auth/client.ts:53-59`.
- bmac-express-server validates it in `requireApiKey` — `server.js:200-210`
  (401 when missing/mismatched).

### Verify

1. **Without key** → expect 401:

```bash
curl -X POST https://<express-url>/api/auth/admins-count
# → {"error":"Unauthorized"}  (HTTP 401)
```

2. **With correct key** → expect 200:

```bash
curl -X POST https://<express-url>/api/auth/admins-count \
  -H "Content-Type: application/json" \
  -H "x-api-key: <EMAIL_SERVICE_API_KEY>"
# → {"count":N}
```

3. **Through bmac-next**: log in at `/admin/login`. A successful login proves
   the whole chain (Next server action → Express `/api/auth/login` → Neon) works.
   Check the Express logs for the login activity entry.

---

## 4. No legacy auth providers

This stack uses **no** Clerk, Supabase Auth, or Neon Auth. Deployment requires
none of their keys, projects, or webhook setup.

- `@clerk/nextjs` + `@clerk/ui` appear in `bmac-next/package.json` but have
  **zero imports** in `src/` — they are leftover dependencies and require no
  configuration. They may be removed separately.
- Auth = HMAC-signed `bmac_admin_session` cookie (bmac-next) + bcrypt hashes in
  `public.super_admins` (bmac-express-server). No external identity provider.

**Do NOT** add Clerk/Supabase/Neon Auth steps to this checklist.

---

## 5. First-admin bootstrap on a fresh deploy

1. Ensure the Express backend is deployed and `EMAIL_SERVICE_URL` /
   `EMAIL_SERVICE_API_KEY` are set in bmac-next.
2. Visit `<app-url>/admin/setup` (route: `src/app/admin/(public)/setup/page.tsx`).
3. Enter the first admin's email, name, and password. When `public.admin_users`
   is empty, this registers the account as a **super admin** via
   `register-first-admin` (`server.js:273`) and inserts rows in
   `public.super_admins` + `public.admin_users`.
4. You are redirected into the dashboard as the super admin.
5. Subsequent admins are created from **Admins** (`/admin/admins`) — a super
   admin can also edit an existing admin's role/permissions instead of creating
   a duplicate account.

> If the page instead redirects to `/admin/login`, an admin already exists — use
> the Admins page rather than re-running setup.

---

## 6. Pre-launch sweep

- [ ] Both apps on HTTPS with `NODE_ENV=production` (secure admin cookie — `src/lib/auth/super-admin.ts:56`)
- [ ] `curl <express-url>/health` returns `{"status":"ok"}`
- [ ] Shared-key auth verified (401 without key, 200 with key, real login works)
- [ ] First admin created via `/admin/setup` on the fresh database
- [ ] Live Paystack keys set (no `pk_test_placeholder`); test/live keys not mixed
- [ ] `NEXT_PUBLIC_APP_URL` set to the production URL (email links / QR / webhook callbacks)
- [ ] No Clerk/Supabase/Neon Auth env vars, projects, or steps involved

## 7. Post-launch operational checklist

- [ ] Enable Neon Point-in-Time Recovery (PITR) for the production branch (Neon console → Project Settings → Branches → PITR) — protects against accidental `DELETE`/`UPDATE` and data loss
- [ ] Set `CRON_SECRET` and schedule `/api/cron/reminders?token=<CRON_SECRET>` (e.g. Vercel Cron `crons.json` or external cron on a `* * * * *` interval)
- [ ] Configure Termii sender + verify WhatsApp channel if SMS/WhatsApp reminders are enabled (see `SETUP.md` §9)
- [ ] Email deliverability: set SPF, DKIM, and DMARC records for the sending domain (Resend + Express SMTP). DMARC `p=reject` recommended once SPF/DKIM pass.
- [ ] CDN/WAF in front of the app (e.g. Cloudflare): enable TLS, bot protection, and rate limiting on `/admin/login`
- [ ] Verify webhook signature check live: send a test `charge.success` event with a forged `X-Paystack-Signature` and confirm 401
- [ ] Confirm admin donation amount-mismatch alerts are visible under Admin → Notifications

