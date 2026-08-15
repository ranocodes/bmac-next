# Plan: Public-Site UX Overhaul — Minimalist Redesign, Conversion, Trust, IA & SEO

## Summary

Full public-site UX/UI audit was performed (route map, feature/flow audit, UI structure audit, live browser checks). This plan converts the findings into a phased, codebase-fit implementation plan.

The visual target is the **minimalist design system already shipped on the admin side** (flat `rounded-xl border border-border` cards, editorial `font-display` type with `tracking-tight`, uppercase micro-labels, `rounded-lg` flat controls, no shadows, warm-white base, green brand accent). The public site gets the **same treatment**: every public page is restyled to that system, then the correctness & feature work lands on top.

It fixes the broken event IA (`/events` list vs `/news/events/[id]` detail), ships missing trust & conversion elements on the two highest-intent pages (event + program detail), restores lost form feedback (contact form renders nothing today), and adds the SEO surface the site completely lacks (no `sitemap.ts`, `robots.ts`, `generateMetadata`, or custom 404). Scope confirmed with the client: all four outcome areas (registration conversion, trust, SEO, maintenance), event URLs unified under `/events`, WhatsApp/social-connect included, and the full feature scope below retained.

**Client-confirmed scope (features retained):**
1. **Program registration stays in-site** (feeds review → accept → cohort → attendance → dashboard) and gains an **admin-editable application form** (admin decides what to ask per program).
2. **Get-involved kinds (Join/Volunteer/School/Partner) also go in-site with admin-editable dynamic forms** — Google Forms are dropped for these. Submissions mirror the program flow: real structured data → actionable inbox item + admin notification + applicant confirmation email. **No per-submission admin alert email**.
3. **Public accounts** (same admin-credential pattern as super-admin/moderator): after review/accept, admin sends login credentials to accepted applicants **in bulk and per-person**; **rejected applicants get a "try next time" email**.
4. **Acceptance email** = congratulation + **Google Drive resource link** (no file upload) + credentials with a default password; **forced password change on first login**.
5. **"My BMAC" logged-in dashboard** showing program/cohort info (application status, cohort, schedule, attendance) + member status. (The `/application-status` lookup in Task 2.4 remains the pre-acceptance check.)

## User Story

As a young person in Jos discovering BMAC
I want to register for an event or program without friction, understand what I'm buying, trust the club, and reach the right people
So that BMAC converts visitors into attendees/donors instead of losing them to dead ends, broken URLs, silent form failures, or an admin-dated visual layer.

## Metadata

| Field | Value |
|-------|-------|
| Type | REFACTOR + ENHANCEMENT (minimalist restyle of all public pages, public accounts, configurable forms, SEO, no new infra) |
| Complexity | VERY HIGH (member platform: accounts, credential provisioning, dashboards, DB migrations; site-wide restyle; ~50+ files) |
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

**Visual audit (public site vs shipped admin minimalism):**
13. **Two hero systems** — event/program detail dark `bg-secondary` heroes vs list-page light `bg-card` heroes; the site lands on neither consistently.
14. **Heavy card language on lists** — `rounded-3xl`/`rounded-bento` + inset glow borders + `shadow-sm` on programs/events/gallery/home cards (does not match admin's flat `rounded-xl border border-border`).
15. **Inconsistent type scale** — mix of `text-3xl`/`text-2xl` headings, some without `font-display`/`tracking-tight`; eyebrow labels inconsistent (`text-slate-300` vs `text-muted-foreground` vs inline badges).
16. **Controls not unified** — buttons mix `rounded-lg`/`rounded-xl`/`rounded-full`; inputs mix `border-input`/`border-border`; badge/pill radii inconsistent.
17. **Detail pages lack the page-header primitive** — no consistent icon-box + title + meta pattern (admin uses `w-9 h-9 rounded-lg bg-muted` + `font-display text-2xl font-bold tracking-tight`).

---

## Patterns to Follow

### Minimalist design system (already shipped on admin — reuse verbatim)
- **Tokens** (keep green brand): `--primary:#0f6b3e`, `--secondary:#0a2e1c`, `--card:#fff`, `--border:#e5e7db`, `--muted-foreground:#6b7280`, `--background:#faf9f6` (warm white), `--font-display:"Outfit"`. No new tokens.
- **Cards**: `rounded-xl border border-border` — crisp 1px. No `rounded-3xl`, `rounded-bento`, `shadow-*`, or inset glow borders. Only exception: homepage statement hero band may use the dark `bg-secondary` block.
- **Page header**: icon box `w-9 h-9 rounded-lg bg-muted text-secondary` + `font-display text-2xl font-bold tracking-tight text-secondary` title + `text-xs text-muted-foreground mt-0.5` meta line. (Public detail pages: breadcrumbs + H1 `font-display text-3xl font-bold tracking-tight text-secondary`.)
- **Type**: headings `font-display` + `tracking-tight`; body `text-secondary`; labels/eyebrows `text-[11px] font-bold uppercase tracking-widest text-muted-foreground`.
- **Buttons**: `rounded-lg`, flat. Primary `bg-primary text-primary-foreground hover:bg-primary/90`; outline/secondary `border border-border bg-card text-secondary hover:bg-muted`; ghost icon `p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted`.
- **Inputs/selects/textareas**: `rounded-lg border border-border bg-card`, focus `focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`.
- **Badges/pills**: `rounded-full bg-X-50 text-X-700` (status), `bg-muted text-muted-foreground` (neutral).
- **Lists (desktop)**: `hidden lg:block` table — thead `text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground`, rows `border-b border-border/50 last:border-0 hover:bg-muted/30`. **Mobile card list**: `lg:hidden space-y-2`, card `w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40`.
- **Empty states**: `rounded-xl border border-border`, muted icon (`text-muted-foreground/20`), `text-sm font-medium text-secondary` + `text-xs text-muted-foreground`.
- **Hero (public decision)**: single **light hero system** site-wide — `bg-background`/`bg-card`, editorial headline, no gradient. Homepage keeps **one** dark `bg-secondary` statement band as the brand anchor. Event/program detail dark heroes are converted to the light system.
- **Divider rhythm**: generous `space-y`, sections separated by `border-t border-border/50` or `space-y-*`, no decorative blobs.
- **Reference files**: admin already merged — `src/components/admin/AnalyticsClient.tsx`, `PeopleTable.tsx`, `Inbox.tsx` (mobile card lists, flat headers); public reference after Phase 1 = each restyled page.

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
Best-in-class: success ref, resend button + 60s cooldown, toast. NewsletterModal uses two-step success swap. **Mirror these for event/program forms and contact.**

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
| `src/app/globals.css` | UPDATE (only if needed) | Any missing minimalist primitives (e.g. `--background` warm-white) — no new tokens beyond the system |
| `src/components/ui/SectionHeader.tsx` | CREATE | Shared eyebrow + heading + meta (page-header primitive for public pages) |
| `src/components/ui/Breadcrumbs.tsx` | CREATE | Shared breadcrumb trail |
| `src/components/ui/ShareButtons.tsx` | CREATE | Native share + WhatsApp share (wa.me) + copy link |
| `src/components/ui/EmptyState.tsx` | UPDATE | `text-slate-300` → `text-muted-foreground`; `rounded-xl border border-border` |
| `src/components/ui/BentoCard.tsx` / `DigitalPass.tsx` | UPDATE (or consolidate) | Single flat card primitive (drop glow border/shadows); `variant` prop |
| `src/components/Navbar.tsx` | UPDATE | Flat nav (border-b, no shadow), active state per minimalist |
| `src/components/Footer.tsx` | UPDATE | Contact info + privacy/terms links + WhatsApp; flat (border-t) |
| `src/app/(public_pages)/HomeClient.tsx` | UPDATE | Restyle + `text-slate-300` fix + terminology |
| `src/app/(public_pages)/programs/ProgramsClient.tsx` | UPDATE | Restyle + hero copy fix + flat cards |
| `src/app/(public_pages)/events/EventsClient.tsx` | UPDATE | Restyle + flat cards + href → `/events/${id}` |
| `src/app/(public_pages)/news/NewsClient.tsx` | UPDATE | Restyle + mobile sidebar fallback |
| `src/app/(public_pages)/gallery/page.tsx` | UPDATE | Restyle to flat card grid |
| `src/app/(public_pages)/contact/page.tsx` | UPDATE | Restyle + render `useActionState` state |
| `src/app/(public_pages)/get-involved/page.tsx` | UPDATE | Restyle + `text-slate-300` fix + dynamic form render |
| `src/app/(public_pages)/about/page.tsx`, `privacy/page.tsx` | UPDATE | Restyle to system |
| `src/app/(public_pages)/donor-lookup/page.tsx` | UPDATE | Restyle |
| `src/app/(public_pages)/events/[id]/page.tsx` | CREATE | New canonical event detail (moved from `/news/events/[id]`) |
| `src/app/(public_pages)/events/[id]/EventDetailClient.tsx` | CREATE (move) | Move from `news/events/[id]/` + restyle |
| `src/app/(public_pages)/news/events/[id]/page.tsx` + `EventDetailClient.tsx` | DELETE | Old path; replaced by redirect |
| `src/proxy.ts` | UPDATE | Redirect `/news/events/:id` → `/events/:id`; extend matcher |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | Restyle + FAQ gate + share + dedupe back-link |
| `src/app/(public_pages)/news/[id]/NewsDetailClient.tsx` | UPDATE | Restyle + dedupe back-links |
| `src/app/(public_pages)/not-found.tsx` | CREATE | Custom 404 (minimalist) |
| `src/app/sitemap.ts` | CREATE | Public sitemap (events, programs, news, static) |
| `src/app/robots.ts` | CREATE | robots.txt |
| `src/app/layout.tsx` + detail pages | UPDATE | `generateMetadata`, Open Graph, JSON-LD (Event, EducationalOrganization) |
| `src/actions/events.ts` | UPDATE | Accept `phone` + real `consent` from form |
| `src/lib/auth/super-admin.ts` | UPDATE | Accept `administrator` role |
| `src/app/(public_pages)/application-status/page.tsx` | CREATE | Login-less application status lookup |
| `src/actions/programs.ts` | UPDATE | `lookupApplicationStatus` + credential provisioning + `answers` storage |
| `src/actions/people.ts` | UPDATE | `applyAsPerson` → in-site dynamic form submission |
| `src/lib/email.ts` | UPDATE | Applicant confirmation + credentials + rejection templates |
| `src/components/admin/ProgramAdminDetail.tsx` | UPDATE | Application-form editor tab + "Send credentials" actions |
| `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx` | UPDATE | Render admin-defined application questions |
| `src/lib/auth/public-auth.ts` | CREATE | Public sessions (super-admin pattern, public scope) |
| `src/app/(public_pages)/login/page.tsx` | CREATE | Public login |
| `src/app/(public_pages)/account/{page,layout}.tsx` | CREATE | "My BMAC" dashboard + password-change gate |
| DB (Neon migrations) | MIGRATE | `form_definitions` + `form_submissions` (jsonb), `public_users` (+ auth cols), `public_sessions` |

---

## Tasks

Execute in order. Phases 0–1 P0 (design + correctness first), Phases 2–6 P1, Phase 7 P2, Phase 8 P2 (largest; can start after Phase 3 lands).

### Phase 0 — Minimalist design system + site-wide restyle (P0)

The public restyle is the cross-cutting visual layer. It must land **before** feature phases so all new UI (forms, dashboards, 404) is born on-system. Class-only where possible; logic changes only where the audit demands (hero copy, back-links, sidebar).

#### Task 0.1: System foundation + shared primitives
- **File**: `src/app/globals.css` (verify), CREATE `src/components/ui/SectionHeader.tsx`, `src/components/ui/Breadcrumbs.tsx`, `src/components/ui/ShareButtons.tsx`
- **Action**: CREATE + UPDATE
- **Implement**: Confirm tokens (green brand, warm-white `--background`, existing `--border`/`--muted-foreground`). Ship `SectionHeader` (eyebrow `text-[11px] font-bold uppercase tracking-widest text-muted-foreground` + `font-display text-3xl font-bold tracking-tight text-secondary` + muted meta). `Breadcrumbs`: `Home / Programs / {title}` inline `<ol>`, `/` separators, muted. `ShareButtons`: native `navigator.share` fallback + WhatsApp `wa.me/?text=` + copy-link — flat `rounded-lg border border-border` pills.
- **Validate**: `npx tsc --noEmit` + `npm run build`

#### Task 0.2: Restyle list & section pages
- **File**: `HomeClient.tsx`, `ProgramsClient.tsx`, `EventsClient.tsx`, `NewsClient.tsx`, `gallery/page.tsx`, `about/page.tsx`, `privacy/page.tsx`, `donor-lookup/page.tsx`
- **Action**: UPDATE
- **Implement**: Replace heavy cards (`rounded-3xl`/`rounded-bento`/glow/shadows) with `rounded-xl border border-border`. Apply page-header primitive (`SectionHeader`) to each list. Standardize button/input/badge classes to the system. Fix `text-slate-300` → `text-muted-foreground` here. Standardize hero: light `bg-background`/`bg-card`, editorial headline; keep the homepage dark statement band only.
- **Validate**: `npm run build` + browser spot-check mobile/desktop

#### Task 0.3: Restyle detail pages (program, event, news) + forms
- **File**: `ProgramDetailClient.tsx`, `NewsDetailClient.tsx`, `contact/page.tsx`, `get-involved/page.tsx`, (event detail post-move in Phase 2)
- **Action**: UPDATE
- **Implement**: Apply page-header + `Breadcrumbs` (replaces ad-hoc back-links). Flatten cards, standardize controls, dedupe back-links to breadcrumbs. Restyle contact + get-involved forms to `rounded-lg border border-border` inputs + flat buttons. Apply the same to the `applyAsPerson` modal.
- **Validate**: `npm run build` + browser spot-check

#### Task 0.4: Navbar + Footer to system
- **File**: `src/components/Navbar.tsx`, `src/components/Footer.tsx`
- **Action**: UPDATE
- **Implement**: Navbar flat (`border-b border-border`, no shadow), active link state `text-secondary font-semibold` + subtle underline. Footer flat `border-t`, sectioned grid, muted links. (Contact info + legal links land in Phase 5 Task 5.1 — do not duplicate.)
- **Validate**: `npm run build`

### Phase 1 — Quick conversion & correctness wins (P0)

#### Task 1.1: Render contact-form feedback
- **File**: `src/app/(public_pages)/contact/page.tsx`
- **Action**: UPDATE
- **Implement**: `useActionState(sendContactMessage, null)` exists (L42) but `state` is never rendered. Add a success banner (on `state.ok`) and an error banner (on `state.error`), styled per existing banner patterns. Disable inputs + "Transmitting…" while `pending`.
- **Mirror**: `src/components/ui/NewsletterModal.tsx:85-105`, `EventDetailClient.tsx:312-314` (spinner).
- **Validate**: `npm run build` + manual submit

#### Task 1.2: Event registration — consent, phone, per-field errors
- **File**: `src/app/(public_pages)/news/events/[id]/EventDetailClient.tsx` (pre-move) + `src/actions/events.ts`
- **Action**: UPDATE
- **Implement**: Remove `consent: true` hardcode (L55, L138); add `ConsentCheckbox` (`src/components/ConsentCheckbox.tsx` exists); pass its value through. Add optional "Phone (WhatsApp)" input; extend `registerForEvent`/`createTicketOrder` signatures + person record. Add per-field inline errors (email regex, required) in addition to the single server-error paragraph.
- **Mirror**: `ConsentCheckbox` usage in `get-involved/page.tsx`; validation in `src/actions/programs.ts:submitApplication`.
- **Validate**: `npm run build` + `npx tsc --noEmit`

#### Task 1.3: Fix invisible `text-slate-300` labels
- **File**: `EmptyState.tsx:29`, `get-involved/page.tsx:307`, `ProgramsClient.tsx:95`, `HomeClient.tsx:138`
- **Action**: UPDATE
- **Implement**: Replace with `text-muted-foreground` (token `#6b7280`). EmptyState icon: `text-slate-300` → `text-muted-foreground`.
- **Validate**: visual spot-check; `npm run build`

#### Task 1.4: Fix programs hero copy + dedupe back-links
- **File**: `ProgramsClient.tsx:52`, `ProgramDetailClient.tsx:151,166,174`, `NewsDetailClient.tsx` back-link pair
- **Action**: UPDATE
- **Implement**: Replace events-copy at `ProgramsClient.tsx:52` with curriculum-appropriate copy ("A hands-on curriculum built to turn Jos's brightest minds into confident public speakers and leaders."). Keep exactly ONE back-link per detail page (breadcrumbs from Phase 0 replace the rest).
- **Validate**: `npm run build`

### Phase 2 — IA & URL unification (P0)

#### Task 2.1: Move event detail to `/events/[id]` + redirect
- **File**: CREATE `src/app/(public_pages)/events/[id]/page.tsx` + `EventDetailClient.tsx` (move content); DELETE `src/app/(public_pages)/news/events/[id]/`; UPDATE `src/proxy.ts`; UPDATE links `EventsClient.tsx:166`, `NewsClient.tsx:167`, `NewsDetailClient.tsx:219`
- **Action**: CREATE / MOVE / DELETE / UPDATE
- **Implement**: Move detail files into the `/events` branch (server page fetches event by id). In `proxy.ts` add a redirect rule: `/news/events/:id` → `/events/:id` (308), matching the existing public-route allowlist style. Update all three client `href` templates to `/events/${event.id}`. Grep the repo + email templates for any other `/news/events` references before deleting the old folder. Restyle the moved `EventDetailClient.tsx` to the light hero + page-header system during the move (Task 0.3 applies).
- **Risk**: Old shared links break → mitigated by 308 redirect in proxy; verify with `curl -I https://bmac-next.vercel.app/news/events/<existing-id>` after deploy.
- **Validate**: `npm run build`; live `curl -I` both paths

#### Task 2.2: Breadcrumbs on detail pages
- **File**: UPDATE event/program/news detail (uses `src/components/ui/Breadcrumbs.tsx` from Phase 0)
- **Action**: UPDATE
- **Implement**: Mount `Breadcrumbs` above the detail H1 on event, program, news detail. Already replaces ad-hoc back-links.
- **Validate**: `npm run build`

### Phase 3 — Trust & conversion on detail pages (P1)

#### Task 3.1: Event detail trust layer
- **File**: `src/app/(public_pages)/events/[id]/EventDetailClient.tsx` (post-move)
- **Action**: UPDATE
- **Implement** (only render when data present — never fabricate):
  - FAQ accordion from event `faqs` (CMS field) — flat, `border-b` separated, sharp `+`/`-` toggle (minimalist).
  - Agenda/schedule block if event has a schedule payload (existing `details` split pattern).
  - `ShareButtons` (native share + WhatsApp `wa.me/?text=…` + copy link).
  - Related events (same category or date-nearest, 3 cards, mirror "Other Growth Pathways" grid).
  - Social proof: render testimonials CMS rows if any.
- **Mirror**: `ProgramDetailClient.tsx` related grid; `NewsDetailClient.tsx:197` share pattern.
- **Validate**: `npm run build`

#### Task 3.2: Program detail — stop fabricating FAQ; add share
- **File**: `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`
- **Action**: UPDATE
- **Implement**: Gate the "Common Questions" block on `program.faqs?.length > 0` (remove hardcoded fallback answers L249-262). Add `ShareButtons` under the hero. Keep related-pathways grid.
- **Validate**: `npm run build`

#### Task 3.3: Login-less "Check Your Application" status lookup
- **File**: CREATE `src/app/(public_pages)/application-status/page.tsx` (+ client form); UPDATE `src/actions/programs.ts` (new `lookupApplicationStatus`)
- **Action**: CREATE / UPDATE
- **Implement**: Mirror the `/donor-lookup` pattern: a form asking for email + application reference → server looks up the person's `program_applications` by email+ref, returns status (`submitted/in_review/accepted/waitlisted/rejected`) + cohort title if assigned + program name. No auth, no PII beyond what the applicant already owns. Link it from the program detail success screen and the program list. Restyle to system (Phase 0 applies).
- **Mirror**: `donor-lookup/page.tsx`, `src/actions/donor-lookup.ts`, spam-guard `src/lib/spam-guard.ts` (honeypot + rate limit — required here since it exposes applicant status).
- **Validate**: `npm run build` + `npx tsc --noEmit`; manual lookup of a known `app-…` reference

#### Task 3.4: WhatsApp & social connect
- **File**: UPDATE `src/components/ui/ShareButtons.tsx` (from Phase 0), `Footer.tsx`, `Navbar.tsx`, event/program detail
- **Action**: UPDATE
- **Implement**: `wa.me/<phone>` deep-link for contact (phone from `site_settings` or contact page value). WhatsApp share buttons on event/program/news detail (`https://wa.me/?text={title} {url}`). Footer: WhatsApp + existing socials, plus "Chat on WhatsApp" CTA.
- **Validate**: `npm run build`

#### Task 3.5: Get-involved kinds → in-site submissions (drop Google Forms)
- **File**: `src/actions/people.ts` — `applyAsPerson` (L290-418)
- **Action**: UPDATE
- **Rationale**: Google Form routing made each submission a near-empty inbox item (real data lived in Sheets) — the clutter the client flagged. With dynamic in-site forms (Task 3.6) the data is real, so submissions become actionable again. Model on `submitApplication` (`programs.ts:106-130`): open workflow item + admin notification + applicant confirmation email; **no admin alert email**.
- **Implement**: In `applyAsPerson`, replace the `sendGoogleFormLinkEmail` branch (L369-397) + `sendFormSubmitAlertEmail` (L399-409) with: store answers (from dynamic form) on `person_records.meta` / a `form_submissions` row, keep `createWorkflowRecord` open (with answers in `details`), send applicant confirmation email, keep `createAdminNotification`. Keep `getConfiguredFormLink` + `google_forms` settings as dead/deprecated (don't delete rows in `site_settings`; stop using them). Non-routed flows (program detail, event, contact, donate) unchanged.
- **Validate**: `npx tsc --noEmit` + existing people tests + `npm run build`

#### Task 3.6: Admin-editable application form editor (programs + get-involved kinds)
- **File**: UPDATE `src/actions/programs.ts`, `src/app/(public_pages)/programs/[id]/ProgramDetailClient.tsx`, `src/app/(public_pages)/get-involved/page.tsx`, `src/components/admin/ProgramAdminDetail.tsx`; DB migration `form_definitions` (entity_type `program | member | volunteer | partner | school`, entity_id nullable, `questions` jsonb), `form_submissions` (entity ref, person_id, `answers` jsonb)
- **Action**: UPDATE + MIGRATION
- **Implement**: One editor primitive used two places: (a) per-**program** — "Application Form" tab in `ProgramAdminDetail.tsx`; (b) per **get-involved kind** (Join/Volunteer/School Chapter/Partner) — same editor in admin settings. Question types `text | textarea | number | date | select+options`; per-question `required`. Public forms render base fields (name, email, phone, consent) + the entity's questions dynamically; answers stored as JSON; admin review view shows them. Unconfigured → existing fixed form as default. New editor + public renders born on the minimalist system.
- **Validate**: `npx tsc --noEmit` + `npm run build` + admin manual test

### Phase 4 — Trust & legitimacy, site-wide (P1)

#### Task 4.1: Footer contact + legal links
- **File**: `src/components/Footer.tsx`
- **Action**: UPDATE
- **Implement**: Add contact block (email, phone, hub address, hours — same values as `contact/page.tsx:130-145`), WhatsApp link, and Privacy link (`/privacy`). `Footer.tsx` already receives `socialLinks` from `site_settings` — extend the settings shape or fall back to defaults. Flat `border-t`, sectioned grid.
- **Validate**: `npm run build`

#### Task 4.2: Custom 404 + real `notFound()`
- **File**: CREATE `src/app/(public_pages)/not-found.tsx`; UPDATE event/program/news detail + list pages
- **Action**: CREATE / UPDATE
- **Implement**: Minimal 404 on-system (mark, "Page not found", links to Programs/Events/Get Involved). Replace hand-rolled "Not Found" divs (`EventDetailClient.tsx:164-173`, `ProgramDetailClient.tsx:146-155`) with Next `notFound()` from server pages.
- **Validate**: `npm run build`; visit a bogus URL live

### Phase 5 — SEO & discoverability (P1)

#### Task 5.1: Metadata + Open Graph + JSON-LD
- **File**: `src/app/layout.tsx` + `events/[id]`, `programs/[id]`, `news/[id]`, list pages
- **Action**: UPDATE
- **Implement**: Root `metadataBase` + default OG tags. Add `generateMetadata` to event/program/news detail (title, description, OG image = hero image, type). Inject JSON-LD: `Event` on event detail (name, startDate, location, offers/price), `EducationalOrganization` for the org, `Article` on news. Existing content type fields carry the data.
- **Validate**: `npm run build`; view-source spot check

#### Task 5.2: sitemap + robots
- **File**: CREATE `src/app/sitemap.ts`, `src/app/robots.ts`
- **Action**: CREATE
- **Implement**: Sitemap over published events (`/events/:id`), programs, news + static routes (Home, About, Programs, Events, Gallery, News, Contact, Get Involved, Privacy). `force-dynamic` fetch from DB like other pages. Robots: allow all, point at sitemap, `NEXT_PUBLIC_APP_URL`.
- **Validate**: `npm run build`; `curl -I /sitemap.xml`

### Phase 6 — Consistency & maintenance (P2)

#### Task 6.1: Terminology + hero alignment
- **File**: `HomeClient.tsx:116` ("Workshops"), `ProgramsClient.tsx:49` ("Curriculum"), `EventsClient.tsx`/`ProgramsClient.tsx` (Pass drift), detail heroes
- **Action**: UPDATE
- **Implement**: Pick one vocabulary: nav "Programs" → home "All Workshops" → "All Programs"; drop "Pass" for program context (keep for event tickets where the digital pass is real). Ensure single light hero system (dark band only on homepage) — the Phase 0 restyle already enforces this; sweep any stragglers.
- **Validate**: `npm run build`

#### Task 6.2: Admin `administrator` role bug
- **File**: `src/lib/auth/super-admin.ts:83`
- **Action**: UPDATE
- **Implement**: Accept `super_admin | moderator | administrator` in `getSuperAdminSession` (role is already assignable via Admins UI — rejecting it server-side is a latent lockout).
- **Validate**: `npx tsc --noEmit` + existing auth tests (`src/__tests__/`)

#### Task 6.3: News sidebar mobile fallback
- **File**: `src/app/(public_pages)/news/NewsClient.tsx`
- **Action**: UPDATE
- **Implement**: Replace `hidden lg:block` sidebar with a layout that shows the events widget + newsletter below content on mobile (stacked), keeping the 12-col split on `lg`. Restyle widgets to flat cards.
- **Validate**: `npm run build`

#### Task 6.4: Consolidate card primitives
- **File**: `src/components/ui/BentoCard.tsx`, `src/components/ui/DigitalPass.tsx`
- **Action**: REFACTOR
- **Implement**: Both do `whileHover={{ y: -5 }}` + `rounded-bento` + inset glow border. Make `BentoCard` the flat base (variant prop), have `DigitalPass` extend it or collapse into one component — `rounded-xl border border-border`, no glow/shadows. Touch nothing else.
- **Validate**: `npm run build` + home/programs visual spot-check

### Phase 7 — Member & applicant platform (P2, largest scope; can start after Phase 3 lands)

#### Task 7.1: Public accounts + session auth
- **File**: CREATE `src/lib/auth/public-auth.ts`, `src/app/(public_pages)/login/page.tsx`, `src/app/(public_pages)/account/layout.tsx`; DB migration `public_users` (or auth columns on `people`: `auth_email`, `password_hash`, `must_change_password`, `auth_status`), `public_sessions`
- **Action**: CREATE + MIGRATION
- **Implement**: Reuse the admin auth primitives (`src/lib/auth/super-admin.ts` pattern: httpOnly cookie session, password-hash util) for a public scope. Admin creates accounts (Phase 7 Task 7.2). Login page; **force password change on first login** (session flag `must_change_password` → redirect to `/account/password` until changed). `/account` guarded by public session. All new UI on the minimalist system.
- **Validate**: `npx tsc --noEmit` + `npm run build` + manual login/password-change roundtrip

#### Task 7.2: Credential provisioning + acceptance/rejection emails
- **File**: UPDATE `src/actions/programs.ts`, `src/components/admin/ProgramAdminDetail.tsx`, `src/lib/email.ts`; `site_settings`/program gain `drive_links` (Google Drive resource folder URL)
- **Action**: UPDATE + MIGRATION
- **Implement**: Per-person + **bulk** "Send credentials" action on accepted applicants: random default password per user, store hash + `must_change_password=true`, email credentials + congratulatory message + **Google Drive resource link**. **Rejection email** on status → rejected: "Not selected this time — try next cohort". Acceptance email on status → accepted: congrats + drive link; credentials either bundled or sent via the admin action.
- **Validate**: `npx tsc --noEmit` + `npm run build`

#### Task 7.3: "My BMAC" member/volunteer/program dashboard
- **File**: CREATE `src/app/(public_pages)/account/page.tsx` (+ client); UPDATE `src/actions/programs.ts` (account data query)
- **Action**: CREATE
- **Implement**: Logged-in view (session guard; redirect to password change if pending): program applications + status + cohort title/schedule + attendance sessions (query `cohort_participants` + `attendance_records`), member/volunteer status from `person_records`. Link from `/application-status` success and program detail. Restyle to system (page-header primitive, flat cards, mobile card lists for attendance/schedule rows).
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

- [ ] **Every public page uses the minimalist system**: flat `rounded-xl border border-border` cards, `font-display` headings, uppercase micro-labels, `rounded-lg` controls, no shadows/`rounded-bento`/glow (homepage dark hero band is the only dark block)
- [ ] Page-header primitive (SectionHeader) on lists, Breadcrumbs on event/program/news detail
- [ ] `/events/[id]` is canonical; old `/news/events/[id]` 308-redirects; all internal links updated
- [ ] Contact form shows explicit success/error feedback
- [ ] Event form collects real consent + optional phone; per-field errors shown
- [ ] Event detail shows FAQ (only if CMS data), share, related events, social proof
- [ ] Program FAQ never renders fabricated answers
- [ ] Applicants can check program-application status + cohort online without login (`/application-status`, linked from program success screen)
- [ ] Footer has contact info + privacy link; WhatsApp contact reachable; navbar/footer flat
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
