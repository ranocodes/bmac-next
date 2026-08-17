# Newsletter Editor Overhaul — Final Report

**Branch:** `feature/newsletter-editor-overhaul`  
**Date:** 2026-08-16  
**Status:** ✅ Complete — all 12 tasks shipped

## What shipped

### P0 — Safety guardrails
| Task | File | Summary |
|------|------|---------|
| Test-send modal | `NewsletterClient.tsx`, `newsletter-admin.ts:sendNewsletterTest` | Send `[TEST]` prefixed emails to specified addresses before broadcast |
| Confirm step | `NewsletterClient.tsx:openConfirm` | Shows audience count + preview modal before every send |
| Progress & abort | `NewsletterClient.tsx:handleSend` | Chunked 100-at-a-time send with progress bar + abort button |
| Draft autosave | `NewsletterClient.tsx` | localStorage `bmac-newsletter-draft:v1`, 800ms debounce, "Draft saved HH:MM" indicator + clear button |

### P1 — Core usability
| Task | File | Summary |
|------|------|---------|
| Markdown editor | `markdown.ts`, `markdown-email-components.ts`, `EmailPreview.tsx` | Full markdown rendering with email-safe inline styles; inbox chrome preview with mobile/desktop toggle |
| Per-pane feedback | `NewsletterClient.tsx` | Separate `composeFeedback`, `listFeedback`, `testFeedback` states |
| Pagination & bulk | `NewsletterClient.tsx`, `newsletter-admin.ts:listNewsletterSubscribers` | Page-based (50/page), search, source filter, select-all/individual checkboxes, bulk delete, source-filtered export |
| Audience targeting | `NewsletterClient.tsx`, `newsletter-admin.ts:performChunk` | Source dropdown filters recipients using `WHERE s.source = $1` |

### P2 — Polish
| Task | File | Summary |
|------|------|---------|
| Broadcast history | `NewsletterHistory.tsx`, `newsletter-admin.ts:listBroadcastHistory` | Table with status badges (sent/sending/scheduled/partial/aborted/test), sent/total, errors, date, cancel button |
| Templates | `newsletter-admin.ts:saveNewsletterTemplate/deleteNewsletterTemplate/listNewsletterTemplates` | Save/load/delete named templates; template dropdown in composer |
| Scheduled sends | `newsletter-admin.ts:scheduleNewsletterBroadcast`, `cron/newsletter/route.ts` | datetime-local picker + schedule button; cron endpoint with `CRON_SECRET` guard; `flushScheduledBroadcasts` claims + loops chunks |

## Key files

| File | Status | Purpose |
|------|--------|---------|
| `src/actions/newsletter-admin.ts` | **Rewritten** | 20 exported functions/types, chunked send, test-send, templates, scheduling, history, cancel, sources, pagination |
| `src/components/admin/NewsletterClient.tsx` | **Rewritten** | Full composer UI with markdown editor, preview, drafts, confirm, progress, abort, templates, scheduling, pagination, bulk actions |
| `src/components/admin/NewsletterHistory.tsx` | **New** | Broadcast history table |
| `src/components/ui/EmailPreview.tsx` | **New** | Email preview with inbox chrome, mobile/desktop toggle |
| `src/lib/markdown.ts` | **New** | Server-safe markdown→HTML converter (no react-dom/server) |
| `src/lib/markdown-email-components.ts` | **New** | Client-safe email components (ReactMarkdown `components` prop) |
| `src/lib/email.ts` | **Updated** | `sendNewsletterBroadcastEmail` accepts optional `bodyHtml` |
| `src/app/admin/(admin)/newsletter/page.tsx` | **Updated** | Fetches 4 data sources via `Promise.all`, passes new props |
| `src/app/api/cron/newsletter/route.ts` | **New** | Cron flush endpoint with `CRON_SECRET` guard |
| `scripts/migrations/019-newsletter-broadcast-log.sql` | **New** | `broadcast_log` + `newsletter_templates` tables + `last_error_at` column |
| `src/__tests__/newsletter-admin.test.ts` | **New** | 10 tests |
| `src/__tests__/markdown.test.ts` | **New** | 7 tests |

## Express backend change (separate repo)

`bmac-express-server/server.js` needs a local update (not committed here):
- `publicShell(body)` now accepts `messageHtml` flag — renders `<div>` instead of `<p>` for block elements
- `newsletter-broadcast` handler reads `bodyHtml` from request and passes `messageHtml: Boolean(bodyHtml)`

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ Clean |
| `npm run lint` | ✅ 454 pre-existing warnings, 0 new |
| `npm test` | ✅ 130/130 (93 pre-existing + 20 new newsletter-admin + 7 new markdown) |
| `npm run build` | ✅ Turbopack build succeeds |

## Before going live

1. **Apply migration:** Run `scripts/migrations/019-newsletter-broadcast-log.sql` against production DB
2. **Deploy Express backend:** Push `bmac-express-server/server.js` changes to email service
3. **Set `CRON_SECRET`:** Add env var to trigger scheduled broadcast flush via cron
