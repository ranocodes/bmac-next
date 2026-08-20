# Deprecated Features Report

**Audit Date:** 2026-08-18

## Dead/Unused Files Found

| File | Status | Reason |
|------|--------|--------|
| `src/components/Modal.tsx` | DEAD | Not imported anywhere in the codebase. Superseded by inline modal patterns used throughout admin components (PeopleTable, etc.). |

## Legacy Newsletter System

The newsletter system is **active** and consists of:

- `src/actions/newsletter.ts` — public subscribe action (used by NewsletterModal)
- `src/actions/newsletter-admin.ts` — admin management actions (used by NewsletterClient, API routes)
- `src/components/admin/NewsletterClient.tsx` — admin UI (used by `/admin/newsletter` page)
- `src/components/admin/NewsletterHistory.tsx` — broadcast history display (used by NewsletterClient)
- `src/components/ui/NewsletterModal.tsx` — public-facing subscribe modal (used on home, news, events, programs pages)
- `src/components/ui/EmailPreview.tsx` — email preview component (used by NewsletterClient)
- `src/app/admin/(admin)/newsletter/page.tsx` — admin newsletter page
- `src/app/api/cron/newsletter/route.ts` — cron job for scheduled broadcasts
- `src/app/api/newsletter/unsubscribe/route.ts` — unsubscribe API endpoint

This system is fully wired and in use. No dead code here.

## Active But Low-Traffic Routes

These routes exist and are linked from the admin sidebar but may have low usage:

- `/admin/donations` — donations management
- `/admin/users` — user management (duplicate of admins?)
- `/admin/workflow` — workflow management
- `/admin/email-sequences` — email sequence management

These are not deprecated — just noted for potential future cleanup.

## Actions Audit

All `src/actions/*.ts` files are imported somewhere:

| Action File | Imported By |
|-------------|-------------|
| `newsletter.ts` | NewsletterModal, NewsDetailClient |
| `newsletter-admin.ts` | NewsletterClient, API routes |
| `waitlist.ts` | tickets.ts, EventAdminDetail |
| `categories.ts` | CategorySelect |
| `tickets.ts` | EventDetailClient |
| `involvement-pages.ts` | InvolvementDetailClient |
| `emails.ts` | ApplicationReview, paystack-confirm, programs |
| `donor-lookup.ts` | donor-lookup page |
| `notifications.ts` | avatar-notifications |

No dead action files found.
