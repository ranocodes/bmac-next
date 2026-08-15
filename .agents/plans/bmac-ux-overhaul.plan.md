# Plan: Public-Site UX Overhaul — Conversion, Trust, IA & SEO

## Summary

Full public-site UX/UI audit was performed (route map, feature/flow audit, UI structure audit, live browser checks). This plan converts the findings into a phased, codebase-fit implementation plan. It fixes the broken event IA (`/events` list vs `/news/events/[id]` detail), ships missing trust & conversion elements on the two highest-intent pages (event + program detail), restores lost form feedback (contact form renders nothing today), and adds the SEO surface the site completely lacks (no `sitemap.ts`, `robots.ts`, `generateMetadata`, or custom 404). Scope confirmed with the client: all four outcome areas (registration conversion, trust, SEO, maintenance), event URLs unified under `/events`, and WhatsApp/social-connect included. Minimalist design system (warm monochrome, editorial type, crisp 1px borders) is the visual target where new UI is added.

**Client-confirmed scope expansion (get-involved / cohort / dashboards):**
1. **Program registration stays in-site** (feeds review → accept → cohort → attendance → dashboard) and gains an **admin-editable application form** (admin decides what to ask per program).
2. **Get-involved kinds (Join/Volunteer/School/Partner) also go in-site with admin-editable dynamic forms** — Google Forms are dropped for these. Submissions mirror the program flow: real structured data → actionable inbox item + admin notification + applicant confirmation email. **No per-submission admin alert email** (redundant with inbox + notification; the declutter win the client wanted).
3. **Public accounts** (same admin-credential pattern as super-admin/moderator): after review/accept, admin sends login credentials to accepted applicants **in bulk and per-person**; **rejected applicants get a "try next time" email** (no ghosting).
4. **Acceptance email** = congratulation + **Google Drive resource link** (no file upload) + credentials with a default password; **forced password change on first login**.
5. **"My BMAC" logged-in dashboard** showing program/cohort info (application status, cohort, schedule, attendance) + member status. (Chosen over login-less hub; the `/application-status` lookup in Task 2.4 remains the pre-acceptance check.)

## User Story

As a young person in Jos discovering BMAC
I want to register for an event or program without friction, understand what I'm buying, trust the club, and reach the right people
So that BMAC converts visitors into attendees/donors instead of losing them to dead ends, broken URLs, or silent form failures.

## Metadata

| Field | Value |
|-------|-------|
| Type | REFACTOR + ENHANCEMENT (UX overhaul, public accounts, configurable forms, no new infra) |
| Complexity | VERY HIGH (member platform: accounts, credential provisioning, dashboards, DB migrations; ~40+ files) |
| Systems Affected | Public routes `(public_pages)/`, `src/proxy.ts`, `src/components/{layouts,ui,admin}/`, `src/lib/{email,tickets,spam-guard,auth}/`, `src/actions/{events,programs,people,settings}.ts`, DB migrations (program form schema, public users/sessions) |
| Jira Issue | N/A |

---

## Audit Findings (evidence)

Priority-ranked defects found by three parallel exploration passes + grep verification:

1. **Broken event IA** — list at `/events`, detail at `/news/events/[id]`, no `/news/events` list (404). 3 client links target the split path: `EventsClient.tsx:166`, `NewsClient.tsx:167`, `NewsDetailClient.tsx:219`.
2. **Contact form gives zero feedback** — `useActionState` state never rendered (`contact/page.tsx:42`); button flips to "Transmitting…" and nothing else happens.
3. **Event registration silently implies consent** — `consent: true` hardcoded (`EventDetailClient.tsx:55,138`), no consent UI, no phone field, HTML-required only validation.
4. **No breadcrumbs anywhere**; duplicate back-links: `ProgramDetailClient.tsx:151,166,174` (three copies), news detail two copies.
5. **`text-slate-300` on white** — near-invisible card labels at `EmptyState.tsx:29`, `get-involved/page.tsx:307`, `ProgramsClient.tsx:95`, `HomeClient.tsx:138`.
6. **Copy-paste defect** — programs hero says "Secure your digital entry pass to the next gathering of Jos's brightest minds" (`ProgramsClient.tsx:52`), copied from events hero (`EventsClient.tsx:154`). Terminology drift: Workshops / Curriculum / Pass.
7. **Program FAQ fabricates fallbacks** — hardcoded Q&As render even when CMS `faqs` empty (`ProgramDetailClient.tsx:249-262`).
8. **Highest-intent page has fewest trust elements** — event detail lacks FAQ, share buttons, related events, social proof, map.
9. **No SEO surface** — no `sitemap.ts`, `robots.ts`, `not-found.tsx`, zero `generateMetadata`/Open Graph in the whole `src/`.
10. **Footer lacks contact info + privacy link** (`Footer.tsx` — nav + socials only).
11. **Admin bug** — `super-admin.ts:83` rejects sessions with role `administrator` even though the role is assignable in the Admins UI.
12. **News sidebar hidden on mobile** — `NewsClient.tsx` sidebar `hidden lg:block` (events widget + newsletter vanish on phones).

---

## Patterns to Follow

### Naming
```
// SOURCE: src/actions/newsletter.ts / src/actions/tickets.ts
export async function subscribeToNewsletter(...) / createTicketOrder(...)
```
Actions: `camelCase` prefixed by intent (`create*`, `submit*`, `verify*`, `lookup*`). Components: PascalCase. New public widgets go in `src/components/ui/`, new public forms in the page's local folder.

### Error Handling
```
// SOURCE: src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx:300
<p className="text-sm font-bold text-red-500">{error}</p>
```
Single-server-error paragraph pattern; inline per-field errors do NOT exist yet (plan adds them). Submit buttons: `disabled={isPending}` + spinner ring swap (`animate-spin`, e.g. `EventDetailClient.tsx:312-314`).

### Form Feedback (gold standard already in repo)
```
// SOURCE: src/app/(public_pages)/get-involved/page.tsx — applyAsPerson modal
```
Best-in-class: success ref, Google Form link, resend button + 60s cooldown, toast. NewsletterModal uses two-step success swap. **Mirror these for event/program forms and contact.**

### Tests
```
// SOURCE: src/__tests__/setup.tsx (global mocks), src/__tests__/HomeClient.test.tsx
npx vitest run src/__tests__/X.test.tsx   // pool: "forks" required (see CLAUDE.md)
```
Test files import `./mocks`; auth/session modules globally mocked in `setup.tsx`.

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(public_pages)/events/[id]/page.tsx` | CREATE | New canonical event detail (moved from `/news/events/[id]`) |
| `src/app/(public_pages)/events/[id]/EventDetailClient.tsx` | CREATE (move) | Move from `news/events/[id]/` |
| `src/app/(public_pages)/news/events/[id]/page.tsx` + `EventDetailClient.tsx` | DELETE | Old path; replaced by redirect |
| `src/proxy.ts` | UPDATE | Redirect `/news/events/:id` → `/events/:id`; extend matcher |
| `src/components/ui/Breadcrumbs.tsx` | CREATE | Shared breadcrumb trail |
| `src/components/ui/ShareButtons.tsx` | CREATE | Native share + WhatsApp share (wa.me) + copy link |
| `src/app/(public_pages)/contact/page.tsx` | UPDATE | Render `useActionState` `state` (success + error + pending) |
| `src/app/(public_pages)/news/events/[id]/…` → see move | UPDATE | Consent UI, phone field, per-field errors, FAQ, related events |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | FAQ only when CMS `faqs` present; share buttons; dedupe back-link |
| `src/actions/events.ts` | UPDATE | Accept `phone` + real `consent` from form |
| `src/components/Footer.tsx` | UPDATE | Contact info, privacy/terms links, WhatsApp link |
| `src/app/(public_pages)/not-found.tsx` | CREATE | Custom 404 |
| `src/app/sitemap.ts` | CREATE | Public sitemap (events, programs, news, static) |
| `src/app/robots.ts` | CREATE | robots.txt |
| `src/app/layout.tsx` + detail pages | UPDATE | `generateMetadata`, Open Graph, JSON-LD (Event, EducationalOrganization) |
| `src/lib/auth/super-admin.ts` | UPDATE | Accept `administrator` role |
| `src/components/ui/EmptyState.tsx`, `get-involved/page.tsx`, `ProgramsClient.tsx`, `HomeClient.tsx` | UPDATE | Replace `text-slate-300` |
| `src/components/ui/BentoCard.tsx` / `DigitalPass.tsx` | UPDATE (or consolidate) | Single hover/shape primitive |
| `src/app/(public_pages)/application-status/page.tsx` | CREATE | Login-less application status lookup (PRD §3 gap) |
| `src/actions/programs.ts` | UPDATE | `lookupApplicationStatus` action |
| `src/actions/people.ts` | UPDATE | `applyAsPerson` → in-site dynamic form submission (drop Google Form link email) |
| `src/lib/email.ts` | UPDATE | Applicant confirmation email for get-involved kinds (replace `sendGoogleFormLinkEmail`) |
| `src/components/admin/ProgramAdminDetail.tsx` | UPDATE | Application-form editor tab + "Send credentials" actions |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | Render admin-defined application questions |
| `src/lib/auth/public-auth.ts` | CREATE | Public sessions (super-admin pattern, public scope) |
| `src/app/(public_pages)/login/page.tsx` | CREATE | Public login |
| `src/app/(public_pages)/account/{page,layout}.tsx` | CREATE | "My BMAC" dashboard + password-change gate |
| `src/actions/programs.ts` | UPDATE | Credential provisioning (bulk + per-person), rejection email, `answers` storage |
| `src/lib/email.ts` | UPDATE | Credentials + congrats + Google Drive link email; rejection template |
| DB (Neon migrations) | MIGRATE | `form_definitions` + `form_submissions` (jsonb), `public_users` (+ auth cols), `public_sessions` |

---

## Tasks

Execute in order. Phases 0–1 are P0 (ship first), Phases 2–4 P1, Phase 5 P2.

### Phase 0 — Quick conversion & correctness wins

#### Task 0.1: Render contact-form feedback
- **File**: `src/app/(public_pages)/contact/page.tsx`
- **Action**: UPDATE
- **Implement**: `const [state, formAction, pending] = useActionState(sendContactMessage, null)` exists (L42) but `state` is never rendered. Add a success banner (on `state.ok`) and an error banner (on `state.error`), styled per existing banner patterns. Disable inputs + "Transmitting…" while `pending`.
- **Mirror**: `src/components/ui/NewsletterModal.tsx:85-105` (two-step success/error), `EventDetailClient.tsx:312-314` (spinner).
- **Validate**: `npx vitest run src/__tests__/` (if contact tests exist) + `npm run build`

#### Task 0.2: Event registration — consent, phone, per-field errors
- **File**: `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` (pre-move) + `src/actions/events.ts`
- **Action**: UPDATE
- **Implement**:
  - Remove `consent: true` hardcode (L55, L138); add `ConsentCheckbox` (`src/components/ConsentCheckbox.tsx` exists) to the form; pass its value through.
  - Add optional "Phone (WhatsApp)" input; extend `registerForEvent`/`createTicketOrder` signatures + person record.
  - Add per-field inline errors (email regex, required) in addition to the single server-error paragraph.
- **Mirror**: `ConsentCheckbox` usage in `get-involved/page.tsx`; validation in `src/actions/programs.ts:submitApplication`.
- **Validate**: `npm run build` + `npx tsc --noEmit`

#### Task 0.3: Fix invisible `text-slate-300` labels
- **File**: `EmptyState.tsx:29`, `get-involved/page.tsx:307`, `ProgramsClient.tsx:95`, `HomeClient.tsx:138`
- **Action**: UPDATE
- **Implement**: Replace with `text-muted-foreground` (token `#6b7280`, existing) — matches the site's own muted label color used elsewhere. EmptyState icon: `text-slate-300` → `text-muted-foreground`.
- **Validate**: visual spot-check; `npm run build`

#### Task 0.4: Fix programs hero copy + dedupe back-links
- **File**: `ProgramsClient.tsx:52`, `ProgramDetailClient.tsx:151,166,174`, `NewsDetailClient.tsx` back-link pair
- **Action**: UPDATE
- **Implement**: Replace events-copy at `ProgramsClient.tsx:52` with curriculum-appropriate copy ("A hands-on curriculum built to turn Jos's brightest minds into confident public speakers and leaders."). Keep exactly ONE back-link per detail page (remove mobile/desktop duplicates — the layout already stacks, one control suffices; or keep responsive variant in a single conditional).
- **Validate**: `npm run build`

### Phase 1 — IA & URL unification (P0)

#### Task 1.1: Move event detail to `/events/[id]` + redirect
- **File**: CREATE `src/app/(public_pages)/events/[id]/page.tsx` + `EventDetailClient.tsx` (move content); DELETE `src/app/(public_pages)/news/events/[id]/`; UPDATE `src/proxy.ts`; UPDATE links `EventsClient.tsx:166`, `NewsClient.tsx:167`, `NewsDetailClient.tsx:219`
- **Action**: CREATE / MOVE / DELETE / UPDATE
- **Implement**: Move detail files into the `/events` branch (server page fetches event by id — adjust the shared fetch). In `proxy.ts` add a redirect rule: `/news/events/:id` → `/events/:id` (308), matching the existing public-route allowlist style. Update all three client `href` templates to `/events/${event.id}`. Grep the repo + email templates for any other `/news/events` references before deleting the old folder.
- **Risk**: Old shared links break → mitigated by 308 redirect in proxy; verify with `curl -I https://bmac-next.vercel.app/news/events/<existing-id>` after deploy.
- **Validate**: `npm run build`; live `curl -I` both paths

#### Task 1.2: Breadcrumbs on detail pages
- **File**: CREATE `src/components/ui/Breadcrumbs.tsx`; UPDATE event/program/news detail
- **Action**: CREATE / UPDATE
- **Implement**: Minimal component: `Home / Programs / {title}` — inline `<ol>` of `Link`s, separator `/`, muted `text-muted-foreground`, small caps per minimalist system. Mount above the detail H1 (event, program, news). Replaces the ad-hoc back-links at event/program/news detail.
- **Validate**: `npm run build`

### Phase 2 — Trust & conversion on detail pages (P1)

#### Task 2.1: Event detail trust layer
- **File**: `src/app/(public_pages)/events/[id]/EventDetailClient.tsx` (post-move)
- **Action**: UPDATE
- **Implement** (only render when data present — never fabricate):
  - FAQ accordion from event `faqs` (CMS field, pattern per `ProgramForm.tsx:380-391`) — flat, `border-b` separated, sharp `+`/`-` toggle (minimalist spec).
  - Agenda/schedule block if event has a schedule payload (existing `details` split pattern per `ProgramDetailClient.tsx:269-283`).
  - `ShareButtons` (native share + WhatsApp `wa.me/?text=…` + copy link) — registration pages are the most-shared URLs.
  - Related events (same category or date-nearest, 3 cards, mirror "Other Growth Pathways" grid `ProgramDetailClient.tsx:357-382`).
  - Social proof: render testimonials CMS rows (exists as table + admin UI) if any.
- **Mirror**: `ProgramDetailClient.tsx:357-382` related grid; `NewsDetailClient.tsx:197` share pattern.
- **Validate**: `npm run build`

#### Task 2.2: Program detail — stop fabricating FAQ; add share
- **File**: `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: Gate the "Common Questions" block on `program.faqs?.length > 0` (remove hardcoded fallback answers L249-262). Add `ShareButtons` under the hero. Keep related-pathways grid.
- **Validate**: `npm run build`

#### Task 2.4: Login-less "Check Your Application" status lookup
- **File**: CREATE `src/app/(public_pages)/application-status/page.tsx` (+ client form); UPDATE `src/actions/programs.ts` (new `lookupApplicationStatus`)
- **Action**: CREATE / UPDATE
- **Implement**: Mirror the `/donor-lookup` pattern (`donor-lookup/page.tsx` + `src/actions/donor-lookup.ts`): a form asking for email + application reference → server looks up the person's `program_applications` by email+ref, returns status (`submitted/in_review/accepted/waitlisted/rejected`) + cohort title if assigned + program name. No auth, no PII beyond what the applicant already owns. Link it from the program detail success screen and the program list. This covers the PRD §3 pain point ("No reusable profile or application status visibility") without building public login (deferred per PRD §9/§13).
- **Mirror**: `src/app/(public_pages)/donor-lookup/page.tsx`, `src/actions/donor-lookup.ts` (email lookup → status list), spam-guard `src/lib/spam-guard.ts` (honeypot + rate limit — required here since it exposes applicant status).
- **Validate**: `npm run build` + `npx tsc --noEmit`; manual lookup of a known `app-…` reference

#### Task 2.3: WhatsApp & social connect
- **File**: CREATE `src/components/ui/ShareButtons.tsx`; UPDATE `Footer.tsx`, `Navbar.tsx`, event/program detail
- **Action**: CREATE / UPDATE
- **Implement**: `wa.me/<phone>` deep-link for contact (phone from `site_settings` or contact page value). WhatsApp share buttons on event/program/news detail (`https://wa.me/?text={title} {url}`). Footer: WhatsApp + existing socials, plus "Chat on WhatsApp" CTA.
- **Validate**: `npm run build`

#### Task 2.5: Get-involved kinds → in-site submissions (drop Google Forms)
- **File**: `src/actions/people.ts` — `applyAsPerson` (L290-418)
- **Action**: UPDATE
- **Rationale**: Google Form routing made each submission a near-empty inbox item (real data lived in Sheets) — the clutter the client flagged. With dynamic in-site forms (Task 2.6) the data is real, so submissions become actionable again. Model on `submitApplication` (`programs.ts:106-130`): open workflow item + admin notification + applicant confirmation email; **no admin alert email**.
- **Implement**: In `applyAsPerson`, replace the `sendGoogleFormLinkEmail` branch (L369-397) + `sendFormSubmitAlertEmail` (L399-409) with: store answers (from dynamic form) on `person_records.meta` / a `form_submissions` row, keep `createWorkflowRecord` open (with answers in `details`), send applicant confirmation email (reuse `sendWorkflowEmail`-style template), keep `createAdminNotification`. Keep `getConfiguredFormLink` + `google_forms` settings as dead/deprecated (don't delete rows in `site_settings`; stop using them). Non-routed flows (program detail, event, contact, donate) unchanged.
- **Validate**: `npx tsc --noEmit` + existing people tests + `npm run build`

#### Task 2.6: Admin-editable application form editor (programs + get-involved kinds)
- **File**: UPDATE `src/actions/programs.ts`, `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`, `src/app/(public_pages)/get-involved/page.tsx`, `src/components/admin/ProgramAdminDetail.tsx`; DB migration `form_definitions` (entity_type `program | member | volunteer | partner | school`, entity_id nullable, `questions` jsonb), `form_submissions` (entity ref, person_id, `answers` jsonb)
- **Action**: UPDATE + MIGRATION
- **Implement**: One editor primitive used two places: (a) per-**program** — "Application Form" tab in `ProgramAdminDetail.tsx`; (b) per **get-involved kind** (Join/Volunteer/School Chapter/Partner) — same editor in admin settings. Question types `text | textarea | number | date | select+options`; per-question `required`. Public forms render base fields (name, email, phone, consent) + the entity's questions dynamically; answers stored as JSON; admin review view shows them. Unconfigured → existing fixed form as default.
- **Validate**: `npx tsc --noEmit` + `npm run build` + admin manual test

### Phase 3 — Trust & legitimacy, site-wide (P1)

#### Task 3.1: Footer contact + legal links
- **File**: `src/components/Footer.tsx`
- **Action**: UPDATE
- **Implement**: Add contact block (email, phone, hub address, hours — same values as `contact/page.tsx:130-145`), WhatsApp link, and Privacy link (`/privacy`). Note: `Footer.tsx` already receives `socialLinks` from `site_settings` — extend the settings shape or fall back to defaults in `Footer.tsx`.
- **Validate**: `npm run build`

#### Task 3.2: Custom 404 + real `notFound()`
- **File**: CREATE `src/app/(public_pages)/not-found.tsx`; UPDATE event/program/news detail + list pages
- **Action**: CREATE / UPDATE
- **Implement**: Minimal 404 (mark, "Page not found", links to Programs/Events/Get Involved). Replace hand-rolled "Not Found" divs (`EventDetailClient.tsx:164-173`, `ProgramDetailClient.tsx:146-155`) with Next `notFound()` from server pages.
- **Validate**: `npm run build`; visit a bogus URL live

### Phase 4 — SEO & discoverability (P1)

#### Task 4.1: Metadata + Open Graph + JSON-LD
- **File**: `src/app/layout.tsx` + `events/[id]`, `programs/[id]`, `news/[id]`, list pages
- **Action**: UPDATE
- **Implement**: Root `metadataBase` + default OG tags. Add `generateMetadata` to event/program/news detail (title, description, OG image = hero image, type). Inject JSON-LD: `Event` on event detail (name, startDate, location, offers/price), `EducationalOrganization` for the org, `Article` on news. Existing content type fields carry the data.
- **Validate**: `npm run build`; view-source spot check

#### Task 4.2: sitemap + robots
- **File**: CREATE `src/app/sitemap.ts`, `src/app/robots.ts`
- **Action**: CREATE
- **Implement**: Sitemap over published events (`/events/:id`), programs, news + static routes (Home, About, Programs, Events, Gallery, News, Contact, Get Involved, Privacy). `force-dynamic` fetch from DB like other pages. Robots: allow all, point at sitemap, `NEXT_PUBLIC_APP_URL`.
- **Validate**: `npm run build`; `curl -I /sitemap.xml`

### Phase 5 — Consistency & maintenance (P2)

#### Task 5.1: Terminology + hero alignment
- **File**: `HomeClient.tsx:116` ("Workshops"), `ProgramsClient.tsx:49` ("Curriculum"), `EventsClient.tsx`/`ProgramsClient.tsx` (Pass drift), detail heroes
- **Action**: UPDATE
- **Implement**: Pick one vocabulary: nav "Programs" → home "All Workshops" → "All Programs"; drop "Pass" for program context (keep for event tickets where the digital pass is real). Align event-detail dark hero (`bg-secondary`) with the light `bg-card` hero used on program/news lists for a single hero system.
- **Validate**: `npm run build`

#### Task 5.2: Admin `administrator` role bug
- **File**: `src/lib/auth/super-admin.ts:83`
- **Action**: UPDATE
- **Implement**: Accept `super_admin | moderator | administrator` in `getSuperAdminSession` (role is already assignable via Admins UI — rejecting it server-side is a latent lockout).
- **Validate**: `npx tsc --noEmit` + existing auth tests (`src/__tests__/`)

#### Task 5.3: News sidebar mobile fallback
- **File**: `src/app/(public_pages)/news/NewsClient.tsx`
- **Action**: UPDATE
- **Implement**: Replace `hidden lg:block` sidebar with a layout that shows the events widget + newsletter below content on mobile (stacked), keeping the 12-col split on `lg`.
- **Validate**: `npm run build`

#### Task 5.4: Consolidate card primitives
- **File**: `src/components/ui/BentoCard.tsx`, `src/components/ui/DigitalPass.tsx`
- **Action**: REFACTOR
- **Implement**: Both do `whileHover={{ y: -5 }}` + `rounded-bento` + inset glow border. Make `BentoCard` the base (with `variant` prop), have `DigitalPass` extend it or collapse into one component. Touch nothing else.
- **Validate**: `npm run build` + home/programs visual spot-check

### Phase 6 — Member & applicant platform (P2, largest scope; can start after Phase 1 lands)

#### Task 6.1: Public accounts + session auth
- **File**: CREATE `src/lib/auth/public-auth.ts`, `src/app/(public_pages)/login/page.tsx`, `src/app/(public_pages)/account/layout.tsx`; DB migration `public_users` (or auth columns on `people`: `auth_email`, `password_hash`, `must_change_password`, `auth_status`), `public_sessions`
- **Action**: CREATE + MIGRATION
- **Implement**: Reuse the admin auth primitives (`src/lib/auth/super-admin.ts` pattern: httpOnly cookie session, password-hash util) for a public scope. Admin creates accounts (Task 6.2). Login page; **force password change on first login** (session flag `must_change_password` → redirect to `/account/password` until changed). `/account` guarded by public session.
- **Validate**: `npx tsc --noEmit` + `npm run build` + manual login/password-change roundtrip

#### Task 6.2: Credential provisioning + acceptance/rejection emails
- **File**: UPDATE `src/actions/programs.ts`, `src/components/admin/ProgramAdminDetail.tsx`, `src/lib/email.ts`; `site_settings`/program gain `drive_links` (Google Drive resource folder URL)
- **Action**: UPDATE + MIGRATION
- **Implement**:
  - Per-person + **bulk** "Send credentials" action on accepted applicants: random default password per user, store hash + `must_change_password=true`, email credentials + congratulatory message + **Google Drive resource link** (no file upload).
  - **Rejection email** on status → rejected: "Not selected this time — try next cohort" (no ghosting). Acceptance email on status → accepted: congrats + drive link; credentials either bundled or sent via the admin action.
- **Validate**: `npx tsc --noEmit` + `npm run build`

#### Task 6.3: "My BMAC" member/volunteer/program dashboard
- **File**: CREATE `src/app/(public_pages)/account/page.tsx` (+ client); UPDATE `src/actions/programs.ts` (account data query)
- **Action**: CREATE
- **Implement**: Logged-in view (session guard; redirect to password change if pending): program applications + status + cohort title/schedule + attendance sessions (query `cohort_participants` + `attendance_records`), member/volunteer status from `person_records`. Link from `/application-status` success and program detail. This is the client-requested member/volunteer dashboard; scope confirmed = program/cohort info.
- **Validate**: `npx tsc --noEmit` + `npm run build`

---

## Validation

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Tests (pool: "forks" required — do not change)
npm run test

# Build
npm run build

# Live (after deploy)
curl -I https://bmac-next.vercel.app/events/<existing-id>       # 200
curl -I https://bmac-next.vercel.app/news/events/<existing-id>  # 308 → /events/<id>
curl -I https://bmac-next.vercel.app/sitemap.xml                # 200
curl -I https://bmac-next.vercel.app/robots.txt                 # 200
```

---

## Acceptance Criteria

- [ ] `/events/[id]` is canonical; old `/news/events/[id]` 308-redirects; all internal links updated
- [ ] Breadcrumbs render on event, program, news detail
- [ ] Contact form shows explicit success/error feedback
- [ ] Event form collects real consent + optional phone; per-field errors shown
- [ ] Event detail shows FAQ (only if CMS data), share, related events, social proof
- [ ] Program FAQ never renders fabricated answers
- [ ] Applicants can check program-application status + cohort online without login (`/application-status`, linked from program success screen)
- [ ] Footer has contact info + privacy link; WhatsApp contact reachable
- [ ] Custom 404 for public site; detail pages use real `notFound()`
- [ ] `sitemap.xml` + `robots.txt` live and correct; detail pages have Open Graph + JSON-LD
- [ ] No `text-slate-300` on white anywhere; terminology aligned ("Programs")
- [ ] `administrator` role can log into admin
- [ ] Join/Volunteer/School/Partner submissions use admin-defined dynamic in-site forms (Google Forms dropped); inbox items carry real answers; confirmation email sent; no admin alert email
- [ ] Admins edit per-program application questions; public form renders them; answers visible in review
- [ ] Admin sends credentials to accepted applicants (bulk + per-person); first login forces password change
- [ ] Accepted → congrats + Google Drive resources + credentials email; Rejected → "try next time" email (no ghosting)
- [ ] Logged-in "My BMAC" shows program/cohort/attendance + member status
- [ ] Type check, lint, tests, build all pass
