# BMAC Next — Setup Guide

> For **production** deployment, see [`DEPLOYMENT.md`](./DEPLOYMENT.md) — the
> production checklist (env matrix, `/health`, shared-key auth, first-admin
> bootstrap).

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free tier works)
- A [Paystack](https://paystack.com) account (for paid events)
- The **bmac-express-server** repo ([ranocodes/bmac-express-server](https://github.com/ranocodes/bmac-express-server)) — the auth + email backend
- An SMTP account (e.g. Gmail app password) for admin email

---

## Architecture

```
browser ──> bmac-next (Next.js 16, Vercel)
              ├─ Neon Postgres (HTTP driver) — public data + activity logs
              └─ bmac-express-server (Express, Vercel) — admin auth + email
                     ├─ Neon Postgres — admin_users, super_admins
                     └─ Nodemailer SMTP — credentials / password-reset / alerts
```

Admin sessions are HMAC-signed cookies (`bmac_admin_session`) set by `bmac-next` after a successful login against the Express backend. Plaintext passwords are never stored — the Express backend stores bcrypt hashes only.

---

## 1. Environment Variables

```bash
cp .env.example .env.local
```

Fill in each key. Instructions below.

---

## 2. Express Backend (`EMAIL_SERVICE_URL`, `EMAIL_SERVICE_API_KEY`)

The Next app calls the Express backend for login, admin creation, and admin email. Set it up first:

1. Clone and install:
   ```bash
   git clone https://github.com/ranocodes/bmac-express-server.git
   cd bmac-express-server
   npm install
   ```
2. Configure:
   ```bash
   cp .env.example .env
   ```
3. Fill in `NEON_DB_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME`, `NEXT_PUBLIC_APP_URL`, and `EMAIL_SERVICE_API_KEY` (generate a random key, e.g. `openssl rand -hex 32`).
4. Run locally:
   ```bash
   npm start   # listens on http://localhost:3001
   ```

Then in `bmac-next/.env.local`:
- `EMAIL_SERVICE_URL=http://localhost:3001`
- `EMAIL_SERVICE_API_KEY=<the exact same key as the backend .env>`

**Deployed**: both apps run on Vercel. `EMAIL_SERVICE_URL` must point to the deployed Express service (e.g. `https://bmac-express-server.vercel.app`). Verify the deployed backend with `curl https://<express-url>/health` → `{"status":"ok"}`. All auth calls use the shared `x-api-key` header (`EMAIL_SERVICE_API_KEY`).

---

## 3. Auth (`SUPER_ADMIN_COOKIE_SECRET`)

| Variable | Where to find |
|---|---|
| `SUPER_ADMIN_COOKIE_SECRET` | Generate: `openssl rand -hex 32` |

Used to sign the `bmac_admin_session` cookie. Keep it stable — rotating it logs out every admin.

Admins live in the database (`admin_users` + `super_admins` tables, bcrypt password hashes) managed through the Express backend. There is no external identity provider.

---

## 4. Neon Postgres (`NEON_DB_URL`)

| Variable | Where to find |
|---|---|
| `NEON_DB_URL` | Neon Console → project → **Connection Details** → copy connection string (HTTP driver, NOT pooler URL) |

**Steps:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a project (or use existing)
3. In the project dashboard, copy the **Connection string** from the **Connection Details** panel
4. The string starts with `postgresql://...`

The same `NEON_DB_URL` is used by both `bmac-next` and `bmac-express-server`.

---

## 5. Paystack (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`)

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard → **Settings** → **API Keys & Webhooks** → Public Key |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard → **Settings** → **API Keys & Webhooks** → Secret Key |

**Steps:**
1. Go to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy the **Public Key** and **Secret Key**
4. Use test keys (starting with `pk_test_` / `sk_test_`) for development

---

## 6. App URL (`NEXT_PUBLIC_APP_URL`)

Required for email links, QR pass URLs, and webhook callbacks.

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In production, set this to your deployed URL (e.g., `https://bmac-next.vercel.app`).

---

## 7. Resend (`RESEND_API_KEY`) — optional

Only used by the **public contact form**. Admin email (credentials, password reset, security alerts) goes through the Express backend's SMTP — not Resend.

| Variable | Where to find |
|---|---|
| `RESEND_API_KEY` | Resend Dashboard → **API Keys** → Create API Key |

---

## 8. Verify Installation

```bash
# terminal 1 — Express backend
cd bmac-express-server && npm start

# terminal 2 — Next app
npm install
npm run dev
```

Visit `http://localhost:3000`. The admin dashboard is at `http://localhost:3000/admin`.

---

## 9. SMS/WhatsApp, cron, and donation goal — optional

| Variable | Purpose |
|---|---|
| `TERMII_API_KEY` | Enables SMS + WhatsApp reminders to event registrants |
| `TERMII_BASE_URL` | Termii API base (default `https://api.ng.termii.com`) |
| `TERMII_SENDER_ID` | SMS sender ID (e.g. `BMACAlert`). For WhatsApp, set a verified sender and `TERMII_WHATSAPP_CHANNEL=whatsapp` |
| `TERMII_WHATSAPP_CHANNEL` | Leave empty for SMS-only; `whatsapp` to route reminders via WhatsApp |
| `CRON_SECRET` | Guards `/api/cron/*`. Call: `GET /api/cron/reminders?token=<CRON_SECRET>` |
| `DONATION_GOAL` | Fallback for the home donation progress bar when the admin Site Settings goal is unset |

Termii sender IDs require approval in the Termii dashboard for SMS delivery in Nigeria.

---

## First-Time Admin Setup

1. Make sure the Express backend is running and `EMAIL_SERVICE_URL`/`EMAIL_SERVICE_API_KEY` are set.
2. Go to `http://localhost:3000/admin/setup`
3. Enter the first admin's email, name, and password. If no admins exist in the database, this account is created as a **Super Admin**.
4. You'll be redirected to the admin dashboard.

Subsequent admins are created from the **Admins** page (`/admin/admins`) — a super admin enters the new admin's email/name and sets a role. The Express backend emails the new admin their credentials.

---

## Troubleshooting

### Login button spins forever on /admin/login
The proxy allowlist in `src/proxy.ts` must include `/admin/login` and `/admin/forgot-password` and `/admin/reset-password/*`. If you removed them, server actions get 307'd and never resolve.

### "Email service error" on login/reset
The Express backend isn't reachable or the API key mismatches:
- Check `EMAIL_SERVICE_URL` and `EMAIL_SERVICE_API_KEY` in `.env.local` match the backend's `.env`.
- Check the backend is running (`curl http://localhost:3001/health`).

### First admin not created automatically
The `admin_users` table must be empty. If a previous setup created entries, truncate the tables or use an existing admin from the Admins page.

### Database connection errors
Verify `NEON_DB_URL` is correct. The project uses the Neon HTTP driver (`@neondatabase/serverless`), not `pg` pool. If you see IPv6 errors, the DNS monkey-patch in `src/lib/db.ts` forces IPv4.

### Admin email not arriving
Admin email is sent by the Express backend via SMTP. Check `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`FROM_EMAIL` and the backend logs. The Next app does not send admin email itself.
