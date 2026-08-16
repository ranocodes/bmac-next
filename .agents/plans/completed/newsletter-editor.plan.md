# Plan: Newsletter Editor Overhaul

## Summary

Upgrade the admin newsletter composer (`src/components/admin/NewsletterClient.tsx`) from a plain-textarea fire-and-forget form into a safe broadcast workflow: draft autosave, markdown editing with live preview (reuse `MarkdownEditor`), test-send, a review/confirm step, chunked send with progress + abort, subscriber list pagination/bulk/source-targeting, a `broadcast_log` history + stats view, and HTML-rendered emails. Plain-text remains the fallback if the Express email backend cannot be extended.

## User Story

As an admin
I want to compose, preview, review, and send newsletters safely with send history
So that I never blast an unvetted email to the whole list and can tell what/how it performed.

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | HIGH |
| Systems Affected | `src/components/admin/NewsletterClient.tsx`, `src/actions/newsletter-admin.ts`, `src/lib/email.ts`, `src/components/ui/MarkdownEditor.tsx` (reuse), `src/app/admin/(admin)/newsletter/page.tsx`, DB migration (`broadcast_log`), Express backend `bmac-express-server` `/send` template (HTML body variant) |
| Jira Issue | N/A |

---

## Patterns to Follow

### Naming
```
// SOURCE: src/actions/newsletter-admin.ts:8-14,39-43
export interface NewsletterSubscriber { email; source; active; createdAt; lastSentAt }
export async function sendNewsletterBroadcast(opts: { subject; body; limit? }): Promise<{ sent; errors; error? }>
```
Keep `listNewsletterSubscribers` / `sendNewsletterBroadcast` / `unsubscribeNewsletter` naming; new actions `sendNewsletterTest`, `listBroadcastHistory`, `saveNewsletterDraft`.

### Editor (mirror, reuse directly)
```
// SOURCE: src/components/ui/MarkdownEditor.tsx:63-180
<MarkdownEditor value={content} onChange={setContent} placeholder="..." />
```
Toolbar buttons grouped left (Bold/Italic/H1/H2/Link/List/Ol/Quote), Split + Preview toggle right, `insertText(before, after, placeholder)` with selection-preserving cursor, Ctrl+B/I/K shortcuts. **Do not rebuild** — reuse as-is for the newsletter body.

### Error handling
```
// SOURCE: src/actions/newsletter-admin.ts:47,70-73
if (!subject || !body) return { sent: 0, errors: 0, error: "..." };
if (res.error) { errors++; console.error(...) }
```
Actions return `{ ...; error?: string }`; UI surfaces via existing `result` alert banner pattern (`NewsletterClient.tsx:149-156`).

### Form component
```
// SOURCE: src/app/admin/(admin)/newsletter/page.tsx:7-11
export default async function NewsletterPage() { await requirePage("manage_newsletter"); return <NewsletterClient initialSubscribers={subscribers} />; }
```
Server page guards with `requirePage`, passes `initial*` to `"use client"` component.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/components/admin/NewsletterClient.tsx` | UPDATE | Composer: drafts, MarkdownEditor, test-send, confirm step, progress/abort, preview; split feedback state |
| `src/actions/newsletter-admin.ts` | UPDATE | Test-send, chunked send (`offset`+`limit`, returns `total`), abort-able, source targeting, success-only `last_sent_at`, broadcast log write |
| `src/lib/email.ts` | UPDATE | Optional `bodyHtml` on `sendNewsletterBroadcastEmail`; markdown→HTML render (react-markdown, server-side) |
| `src/components/admin/NewsletterHistory.tsx` | CREATE | Broadcast history table + per-campaign stats |
| `src/components/ui/EmailPreview.tsx` | CREATE | Desktop + mobile email mock rendering HTML body |
| `scripts/migrations/019-newsletter-broadcast-log.sql` | CREATE | `broadcast_log` table + index |
| `src/app/admin/(admin)/newsletter/page.tsx` | UPDATE | Fetch history too; pass `initialBroadcasts` |
| `bmac-express-server` (external repo) | UPDATE | `/send` `newsletter-broadcast` template: render `bodyHtml` when present, else plain text |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Draft autosave (localStorage)
- **File**: `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: On every subject/body change, debounce-write `{ subject, body, savedAt }` to `localStorage["bmac_newsletter_draft"]`. On mount, if a draft exists and subject/body are empty, hydrate + show "Draft restored" chip (dismissible). "Clear draft" on successful send. Keep last 5 drafts list (small dropdown) — Task 11 covers saved templates separately.
- **Mirror**: `useState` + `useEffect` pattern already in `NewsletterClient.tsx:18-19`
- **Validate**: `npx tsc --noEmit`

### Task 2: Test-send
- **File**: `src/actions/newsletter-admin.ts`, `src/lib/email.ts`, `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: New action `sendNewsletterTest({ subject, body, to: string[] })` — validates emails, renders HTML (Task 6 helper), sends via `sendNewsletterBroadcastEmail` per address, no subscriber query, no log write. UI: "Send test" button next to Send → prompt for comma-separated addresses (prefilled with admin's own email if available via `useAdmin()`), success/failure inline.
- **Validate**: `npx tsc --noEmit`

### Task 3: Review / confirm step before broadcast
- **File**: `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: Clicking "Send Broadcast" opens a modal: recipient count (from current targeting filter), subject, rendered body preview (`EmailPreview`), and two buttons "Cancel" / "Send to N subscribers". Fire only from confirm. Guard empty-state (nothing to send → disabled).
- **Validate**: `npx tsc --noEmit` + manual click-through

### Task 4: Chunked send with progress + abort
- **File**: `src/actions/newsletter-admin.ts`, `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: `sendNewsletterBroadcast` gains `offset?: number`, `limit` (default 100, max 500), returns `{ sent, errors, total, done }`. Client loops chunks calling the action repeatedly, showing `sent/errors/total` progress bar + "Abort" button (client flag stops the loop; already-sent chunks stay sent — acceptable, document in log). `logActivity` only once at completion. This replaces the unbounded single-call hang (`newsletter-admin.ts:62-80`).
- **Validate**: `npm run build`

### Task 5: Fix `last_sent_at` on failure
- **File**: `src/actions/newsletter-admin.ts`
- **Action**: UPDATE
- **Implement**: Move `UPDATE ... SET last_sent_at = now()` (currently `newsletter-admin.ts:76-79`) inside the success branch only; on error optionally track `last_error_at` column (add in Task 11 migration).
- **Validate**: `npx tsc --noEmit`

### Task 6: Markdown editor + server-side HTML render
- **File**: `src/components/admin/NewsletterClient.tsx`, `src/lib/email.ts`
- **Action**: UPDATE
- **Implement**: Replace `<textarea>` body with `<MarkdownEditor>` (reuse). In `src/lib/email.ts` add `markdownToHtml(md)` using `react-markdown` + `renderToStaticMarkup` (**no `rehype-raw`** — sanitized, raw HTML not passed through) with the same component styles as `MarkdownEditor`'s `previewComponents` adapted for email (inline-friendly, table styles). `sendNewsletterBroadcastEmail` gains optional `bodyHtml`; `sendRequest` passes `bodyHtml` through. **Express dependency**: `/send` `newsletter-broadcast` template must render `{bodyHtml}` when present, else `{body}`. If Express cannot be updated this sprint, ship plain-text fallback (HTML field omitted) — feature is degraded, not broken.
- **Mirror**: `MarkdownEditor.tsx:21-61` (component set), `NewsForm.tsx:217` (usage)
- **Validate**: `npm run build` + test-send renders formatting in inbox

### Task 7: Email preview pane (desktop + mobile)
- **File**: `src/components/ui/EmailPreview.tsx` (CREATE), `src/components/admin/NewsletterClient.tsx`
- **Action**: CREATE + UPDATE
- **Implement**: `EmailPreview` renders the HTML body (Task 6 output) inside a 600px max-width card (desktop) and a ~375px frame (mobile toggle). Shows subject as inbox-style header. Used in Task 3 confirm modal and inline under the editor (collapsible).
- **Validate**: `npx tsc --noEmit` + visual check

### Task 8: Separate feedback state per pane
- **File**: `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: Split the single `result` state (`NewsletterClient.tsx:21`) into `composeResult` (broadcast/test errors live in compose pane) and `listResult` (add/delete/import errors live in subscriber pane). Prevents cross-pane feedback overwrite (current bug: subscriber actions render their result in the compose pane).
- **Validate**: `npx tsc --noEmit`

### Task 9: Subscriber list — pagination, totals, bulk actions, source filter
- **File**: `src/actions/newsletter-admin.ts`, `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: Replace silent `filtered.slice(0, 100)` (`NewsletterClient.tsx:225`) with load-more/pagination + "showing X of Y" indicator (server returns `total`). Add source filter dropdown (values from `DISTINCT source`), bulk delete (checkbox select + confirm), "Export filtered" (reuse `exportNewsletterSubscribers` with filter). Surface `active` status badge per row (field currently dead).
- **Validate**: `npm run build` + `npx vitest run src/__tests__/`

### Task 10: Source targeting for broadcasts
- **File**: `src/actions/newsletter-admin.ts`, `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: `sendNewsletterBroadcast` gains `source?: string` filter (`WHERE s.source = $n` when set). UI: "Audience" select (All subscribers / volunteers / schools / partners… from `DISTINCT source`) above Send; recipient count in confirm modal reflects it (Task 3).
- **Validate**: `npm run build`

### Task 11: Broadcast history + stats
- **File**: `scripts/migrations/019-newsletter-broadcast-log.sql` (CREATE), `src/actions/newsletter-admin.ts`, `src/components/admin/NewsletterHistory.tsx` (CREATE), `src/app/admin/(admin)/newsletter/page.tsx`
- **Action**: CREATE + UPDATE + MIGRATE
- **Implement**: Table `broadcast_log`: `id` (genId "bc"), `subject`, `body_md`, `body_html`, `audience_source` (nullable), `recipient_count`, `sent_count`, `error_count`, `status` (`sent | partial | aborted | test`), `created_by`, `created_at`; index on `created_at DESC`. Write a row in `sendNewsletterBroadcast` (completion) and `sendNewsletterTest` (`status='test'`, recipient_count = test count). Also add `last_error_at` to `newsletter_subscribers` (Task 5). `listBroadcastHistory()` + `NewsletterHistory` table under the compose grid: subject, date, audience, sent/failed, status badge; row click → detail modal (subject, rendered body, counts). History and compose split: `NewsletterClient` becomes tabs or stacked sections.
- **Validate**: `npm run build` + send test broadcast → history row appears

### Task 12: Templates + scheduling (P2, lowest priority)
- **File**: `src/actions/newsletter-admin.ts`, `src/components/admin/NewsletterClient.tsx`
- **Action**: UPDATE
- **Implement**: (a) **Templates**: save current subject+body as named template (store in new `newsletter_templates` table or `broadcast_log`-adjacent table; pick table in implementation), insert into editor on select. (b) **Schedule/send-later**: store due broadcasts in `broadcast_log.status='scheduled'` + `scheduled_for`; a Vercel cron route (`app/api/cron/newsletter/route.ts`, guarded) flushes due rows through the chunked sender. **Infra note**: requires a cron-enabled Vercel deployment + `CRON_SECRET`; if cron is not available, expose "Send now" only and keep scheduled rows until manually flushed — flag this dependency to the user before building.
- **Validate**: `npm run build` + cron dry-run via manual endpoint hit

---

## Validation

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Acceptance Criteria

- [ ] Draft autosave survives reload; restored notice shown
- [ ] Test-send reaches listed addresses before any broadcast
- [ ] Broadcast requires confirm modal showing recipient count + preview; nothing fires on first click
- [ ] Send shows progress and can be aborted; activity log written once
- [ ] `last_sent_at` only updates on success
- [ ] Body composed in MarkdownEditor with live preview; email renders formatted HTML (or cleanly degrades to plain text if Express not updated)
- [ ] Subscriber feedback and compose feedback use separate states
- [ ] List shows total vs shown, source filter, bulk delete, export-filtered; `active` surfaced
- [ ] Audience targeting filters recipients; count reflects it
- [ ] `broadcast_log` records every send (broadcast + test); history view shows subject/date/audience/sent/failed/status
- [ ] Templates save/insert (Task 12a) and scheduled sends flush via cron or manual kick (Task 12b, infra-dependent)
- [ ] Type check, lint, tests, build all pass
