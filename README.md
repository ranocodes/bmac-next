# BMAC Next

Full-stack Next.js platform for Brilliant Minds Ambassadors Club (BMAC) Jos — a youth empowerment NGO.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind v4, CSS variables |
| Database | Neon Postgres (HTTP driver) |
| Auth | Clerk v7 |
| Payments | Paystack |
| Email | Resend |
| Hosting | Vercel |

## Getting Started

```bash
npm install
cp .env.example .env.local  # fill in values
npm run dev
```

See `SETUP.md` for detailed setup instructions.

## Commands

```bash
npm run dev          # Turbopack dev server
npm run build        # Production build
npm test             # Run tests
npx tsc --noEmit     # Type check
npm run lint         # ESLint
```

## Production Deployment Checklist

### Vercel

- [ ] Create Vercel project linked to GitHub repo
- [ ] Set Framework Preset: **Next.js**
- [ ] Set Node.js version: **20+** (or match `.nvmrc`)
- [ ] Set environment variables (see below)
- [ ] Deploy: `vercel --prod` or via Git integration

### Neon

- [ ] Create production Neon project (paid tier recommended for production)
- [ ] Copy `NEON_DB_URL` (HTTP connection string)
- [ ] Run seed script: `psql $NEON_DB_URL -f scripts/seed.sql`

### Clerk

- [ ] Create production Clerk application
- [ ] Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- [ ] Enable **Custom sessions** in Clerk Dashboard → Sessions
- [ ] Add production URL to **Application URLs** in Clerk Dashboard
- [ ] Configure redirect URLs: `/admin` (after sign-in), `/` (after sign-out)

### Paystack

- [ ] Switch from test keys to live keys
- [ ] Set webhook URL: `https://yourdomain.com/api/webhooks/paystack`
- [ ] Enable `charge.success` event in webhook settings

### Resend

- [ ] Verify domain in Resend (required for production sending)
- [ ] Update sender email from `onboarding@resend.dev` to your domain
- [ ] Copy `RESEND_API_KEY`

### Domain & DNS

- [ ] Configure custom domain in Vercel
- [ ] Add CNAME/A record pointing to Vercel
- [ ] Update Clerk Application URLs with production domain
- [ ] Update Paystack webhook URL with production domain

### Environment Variables (Vercel)

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk Dashboard |
| `NEON_DB_URL` | Neon Console |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard |
| `RESEND_API_KEY` | Resend Dashboard |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., `https://bmac.vercel.app`) |
