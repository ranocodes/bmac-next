# BMAC Next — Setup Guide

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free tier works)
- A [Clerk](https://clerk.com) account (free tier works)
- A [Paystack](https://paystack.com) account (for paid events)
- A [Resend](https://resend.com) account (for transactional email)

---

## 1. Environment Variables

```bash
cp .env.example .env.local
```

Fill in each key. Instructions below.

---

## 2. Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → **API Keys** → Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Dashboard → **API Keys** → Secret Key |

**Steps:**
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application (or use existing)
3. Go to **API Keys**
4. Copy the **Publishable Key** (`pk_...`) and **Secret Key** (`sk_...`)
5. In Clerk Dashboard → **Sessions**, enable **Custom sessions** (for `currentUser()`)
6. Under **Email, Phone, Username**, enable **Email address** as a identification strategy

---

## 3. Neon Postgres (`NEON_DB_URL`)

| Variable | Where to find |
|---|---|
| `NEON_DB_URL` | Neon Console → project → **Connection Details** → copy connection string (HTTP driver, NOT pooler URL) |

**Steps:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a project (or use existing)
3. In the project dashboard, copy the **Connection string** from the **Connection Details** panel
4. The string starts with `postgresql://...`

---

## 4. Paystack (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`)

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

## 5. Resend (`RESEND_API_KEY`)

| Variable | Where to find |
|---|---|
| `RESEND_API_KEY` | Resend Dashboard → **API Keys** → Create API Key |

**Steps:**
1. Go to [resend.com](https://resend.com)
2. Go to **API Keys**
3. Create a new API key
4. Copy the key (`re_...`)

---

## 6. App URL (`NEXT_PUBLIC_APP_URL`)

Required for email links, QR pass URLs, and webhook callbacks.

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In production, set this to your deployed URL (e.g., `https://bmac.vercel.app`).

---

## 7. Verify Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The admin dashboard is at `http://localhost:3000/admin`.

---

## First-Time Admin Setup

1. Go to `http://localhost:3000/admin`
2. You'll be redirected to Clerk's hosted sign-up page
3. Sign up with your email and password
4. If no `admin_users` exist in the database, you'll be automatically created as a **Super Admin**
5. You'll be redirected to the admin dashboard

---

## Troubleshooting

### "Authentication service unavailable" on /admin
Clerk's `currentUser()` may be failing. Check that:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
- Clerk application is active
- Custom sessions are enabled in Clerk Dashboard → Sessions

### First admin not created automatically
The `admin_users` table must be empty. If a previous setup created entries, truncate the table or manually add your email to the `admin_users` table.

### Database connection errors
Verify `NEON_DB_URL` is correct. The project uses the Neon HTTP driver (`@neondatabase/serverless`), not `pg` pool. If you see IPv6 errors, the DNS monkey-patch in `src/lib/db.ts` forces IPv4.
