# BMAC Admin — Setup Guide

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Supabase](https://supabase.com) account (free tier — legacy, being replaced)
- A [Paystack](https://paystack.com) account (for paid events)
- A [GitHub OAuth App](https://github.com/settings/developers) (for Decap CMS)

---

## 1. Environment Variables

```bash
cp .env.example .env.local
```

Fill in each key. Instructions below.

---

## 2. Neon Postgres (`NEON_DB_URL`, `NEON_PROJECT_ID`)

| Variable | Where to find |
|---|---|
| `NEON_DB_URL` | Neon Console → project → **Connection Details** → copy the connection string (prefer pooler URL for serverless) |
| `NEON_PROJECT_ID` | Neon Console URL path: `console.neon.tech/app/projects/<THIS_IS_YOUR_ID>` |

**Steps:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a project (or use existing)
3. In the project dashboard, copy the **Connection string** from the **Connection Details** panel
4. The project ID is in the URL: `console.neon.tech/app/projects/curly-mode-12345678`

---

## 3. Neon Auth (`NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`)

| Variable | Where to find |
|---|---|
| `NEON_AUTH_BASE_URL` | Neon Console → Project → Branch → **Auth** tab → **Configuration** → Auth URL |
| `NEON_AUTH_COOKIE_SECRET` | Generate locally with `openssl rand -base64 32` (must be ≥32 characters) |

**Steps:**
1. In your Neon project, go to **Auth** tab (sidebar)
2. Make sure **Neon Auth** is enabled (it should be by default on new projects)
3. Copy the **Auth URL** from the Configuration section
4. Generate a cookie secret in your terminal:
   ```bash
   openssl rand -base64 32
   ```
5. Paste the result into `NEON_AUTH_COOKIE_SECRET`

**Note:** The Auth URL looks like:
`https://ep-xxx.neonauth.c-7.us-east-1.aws.neon.tech/neondb/auth`

---

## 4. Supabase (Legacy)

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → **Settings** → **API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → **Settings** → **API** → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → **Settings** → **API** → service_role key |
| `SUPABASE_PROJECT_ID` | Supabase Dashboard URL: `supabase.com/project/<THIS_IS_YOUR_ID>` |
| `SUPABASE_PUBLISHABLE_KEY` | Same as `SUPABASE_ANON_KEY` (or under Publishable key if shown separately) |

**Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings** → **API**
4. Copy the **Project URL**, **anon public key**, and **service_role key**
5. The project ID is in the URL when viewing your project

---

## 5. Paystack

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

## 6. GitHub OAuth

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_OAUTH_CLIENT_ID` | GitHub → **Settings** → **Developer Settings** → **OAuth Apps** → your app → Client ID |
| `OAUTH_CLIENT_SECRET` | Same page → Generate a new client secret |

**Steps:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name:** BMAC Admin
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback`
4. After creation, copy the **Client ID**
5. Click **Generate a new client secret** and copy the secret

---

## 7. Verify Installation

```bash
# Install dependencies
npm install

# Install Neon-specific packages
npm install @neondatabase/serverless @neondatabase/auth

# Run the development server
npm run dev
```

Visit `http://localhost:3000/admin` — the first visit will prompt you to create the admin account (sign-up mode).

---

## First-Time Admin Setup

1. Go to `http://localhost:3000/admin/login`
2. If no admin users exist yet, you'll see the **Create Admin Account** form
3. Enter your name, email, and password
4. This creates both a Neon Auth user and a **Super Admin** entry in the database
5. You'll be redirected to sign-in, then to the admin dashboard

---

## Troubleshooting

### "Could not resolve authentication server hostname"
Check `NEON_AUTH_BASE_URL` in `.env.local` — it must match the URL from the Neon Auth config exactly.

### "401 Unauthorized" after sign-in
Your Neon Auth user exists, but there's no matching entry in the `admin_users` table. Contact an existing admin to invite you, or if this is the first setup, make sure no admin_users exist before signing up.

### Database connection errors
Verify `NEON_DB_URL` is correct. The connection string includes your database password — treat it like a secret.
