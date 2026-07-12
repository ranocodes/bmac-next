# BMAC Next

Full-stack web platform for Brilliant Minds Ambassadors Club (BMAC) Jos, a youth empowerment NGO in Plateau State, Nigeria. I built a public-facing site for programs, events, news, and donations, plus an admin CMS to manage everything.

## Screenshots

**Homepage**
![Homepage](screenshoot/homepage.png)

**Programs**
![Programs page](screenshoot/programs%20page.png)

**Program detail**
![Program detail page](screenshoot/programs%20detail%20page.png)

**Events**
![Event page](screenshoot/event%20page.png)

**News**
![News page](screenshoot/news%20page.png)

**Get involved**
![Get involved page](screenshoot/get-involved%20page.png)

**Gallery**
![Gallery page](screenshoot/gallery%20page.png)

**About**
![About page](screenshoot/about%20page.png)

**Admin dashboard**
![Admin dashboard](screenshoot/admin-dashboard.png)

## What it does

**Public site:** Visitors can browse programs (Public Speaking, Digital Literacy, Mentorship, etc.), read news articles, register for events, view a photo gallery, and get involved through five paths: join as a member, volunteer, start a school chapter, donate, or partner. Event registration handles both free and paid events through Paystack. Donations also go through Paystack with preset or custom amounts. The contact form sends emails via Resend, and a newsletter modal captures subscriber emails.

**Admin dashboard:** Logged-in admins manage all site content (news, events, programs, gallery, team members, testimonials, partners, impact stats) through a CMS with create, edit, and publish workflows. The dashboard shows live stats: total views, unique visitors, today's activity, recent content, and top pages. Admins can invite other admins with role-based permissions (super_admin, administrator, moderator), and every action gets logged in an activity feed.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, CSS variables |
| Database | Neon Postgres (HTTP driver) |
| Auth | Custom HMAC-signed cookies |
| Payments | Paystack (inline.js) |
| Email | Resend (contact forms), external service (invites, password resets) |
| Rich text | TipTap editor (events, news articles) |
| Charts | Chart.js (admin analytics) |
| Hosting | Vercel |

## Why I built it

BMAC runs programs across schools in Jos and needed a single place to manage events, let the team update content, and handle membership and donations. Before this, content was scattered and admin work required a developer. I wanted to give the team a CMS they can actually use, and give members a site that works on their phones.

Built as a [Horizons](https://horizons.dev) project.

## How I built it

I used coding agents (like GitHub Copilt & Opencode) to help scaffold components, boilerplate, and repetitive features like CRUD forms, table views, and API routes. The agents handled a lot of the tedious wiring, which let me focus on the parts that needed real decisions: the data layer, auth flow, and overall architecture.

The data layer is a thin abstraction over Neon's HTTP driver (`src/lib/db.ts`). No ORM. I built a `db` object that exposes `getAll`, `getById`, `create`, `update`, `remove`, `exists`, `count`, and `query` functions that build parameterized SQL and auto-serialize objects/arrays to JSONB. Every admin CRUD operation goes through `src/actions/crud.ts`, which handles auth checks, database calls, and activity logging in one pass.

The auth system uses HMAC-signed cookies instead of JWTs. On login, an external auth service verifies credentials and I sign a session cookie with a server-side secret. Admin middleware (`src/proxy.ts`) intercepts every `/admin/*` request, reads the cookie, and rejects unauthenticated access. Permission checks happen at both the layout level (nav items hidden based on role) and the action level (`requirePermission()` in server actions).

## Local setup

Clone and install:

```bash
git clone <repo-url>
cd bmac-next
npm install
```

Set up environment variables:

```bash
cp .env.example .env.local
```

You need these services configured:

| Variable | Service | Purpose |
|---|---|---|
| `NEON_DB_URL` | [Neon](https://console.neon.tech) | Postgres connection string (HTTP driver) |
| `SUPER_ADMIN_EMAIL` | Any | First admin email |
| `SUPER_ADMIN_PASSWORD_HASH` | Generate with `node scripts/generate-password-hash.mjs <password>` | Bcrypt hash |
| `SUPER_ADMIN_COOKIE_SECRET` | Generate with `openssl rand -hex 32` | Cookie signing key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | [Paystack](https://dashboard.paystack.com) | Payment processing (public key) |
| `PAYSTACK_SECRET_KEY` | Paystack | Payment processing (secret key) |
| `RESEND_API_KEY` | [Resend](https://resend.com) | Contact form emails |
| `NEXT_PUBLIC_APP_URL` | Your domain | `http://localhost:3000` for local dev |

See `SETUP.md` for detailed instructions on getting each key.

Run the dev server:

```bash
npm run dev
```

Public site at `http://localhost:3000`, admin dashboard at `http://localhost:3000/admin`.

Seed the database:

```bash
psql $NEON_DB_URL -f scripts/seed.sql
```

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm test             # Run tests (Vitest)
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```
