# Admin Dashboard — Phase 1 PRD (MoSCoW)

> Full codebase audit (Next.js 16 / React 19 / Tailwind v4).
> Auth: Neon Auth (Phase 2) — mocked localStorage in Phase 1.
> Backend: Neon Postgres (Phase 2) — localStorage/mock JSON in Phase 1.
> **Build rhythm: 1-2 features per iteration → you test → we iterate.**

---

## M — Must Have (MVP)

| ID | Feature | Why |
|---|---|---|
| M1 | **Login / Logout** — localStorage session token, email/password check | Gates entire admin |
| M2 | **Protected Route Wrapper** — redirects to `/admin/login` if no session | Security |
| M3 | **Admin Layout** — sidebar + top header + responsive hamburger drawer | Shell for everything |
| M4 | **Dashboard Home** — analytics cards (counts) + quick action buttons | Landing page |
| M5 | **News CRUD** — table + form (textarea for content, no WYSIWYG yet) | Core content type |
| M6 | **Events CRUD** — table + form | Core content type |
| M7 | **Programs CRUD** — table + form | Core content type |

## S — Should Have (High Value)

| ID | Feature | Why |
|---|---|---|
| S1 | **WYSIWYG Editor** — TipTap for News content, Event/Program longDesc | Rich content editing |
| S2 | **Site Settings Form** — nav links, social links, copyright, logo text | Wire to Navbar + Footer |
| S3 | **Gallery CRUD** — table + upload form + grid view | Already on live site |
| S4 | **Team CRUD** — table + form | Already on live site |
| S5 | **Testimonials CRUD** — table + form | Already on live site |

## C — Could Have (Nice to Have)

| ID | Feature | Why |
|---|---|---|
| C1 | **Impact Stats CRUD** — table + form | Low effort, visible on home/about |
| C2 | **Media Library** — grid of all site images, copy URL, delete | Convenience |
| C3 | **Table Enhancements** — sort, search, pagination, bulk delete | UX polish |
| C4 | **Image Uploader** — upload to `/public/images/` with preview | Supports all forms |
| C5 | **Dark/Light Admin Toggle** | Visual consistency |

## W — Won't Have (Phase 2)

| ID | Feature | Why |
|---|---|---|
| W1 | Neon Auth integration | Phase 2 |
| W2 | Neon Postgres / Drizzle ORM | Phase 2 |
| W3 | Cloudinary / S3 image upload | Phase 2 |
| W4 | Server actions for data persistence | Phase 2 |
| W5 | Role-based permissions | Phase 2 |
| W6 | Audit logs | Phase 2 |

---

## Iteration Plan (Build → Test → Next)

### Iteration 1: Auth + Layout + Dashboard
```
M1 — Login/Logout page
M2 — Protected route wrapper
M3 — Admin layout (sidebar + header)
M4 — Dashboard home (cards + quick actions)
```
**Deliverable:** You can log in, see admin shell, visit a blank dashboard.

### Iteration 2: News CRUD
```
M5 — News table + form (create/edit/delete)
```
**Deliverable:** You can create, edit, delete news articles. Data persists in localStorage.

### Iteration 3: Events CRUD
```
M6 — Events table + form
```
**Deliverable:** You can manage events. News + Events both working.

### Iteration 4: Programs CRUD
```
M7 — Programs table + form
```
**Deliverable:** All 3 core content types manageable.

### Iteration 5: WYSIWYG Editor
```
S1 — TipTap rich text editor
```
**Deliverable:** Rich text for News content, Event/Program descriptions. Wired into existing forms.

### Iteration 6: Site Settings
```
S2 — Site settings form
```
**Deliverable:** Nav links, social links, copyright editable. Navbar + Footer read from localStorage.

### Iteration 7: Gallery + Team CRUD
```
S3 — Gallery CRUD (table + upload + grid)
S4 — Team CRUD (table + form)
```
**Deliverable:** Gallery and team editable.

### Iteration 8: Testimonials + Impact Stats + Polish
```
S5 — Testimonials CRUD
C1 — Impact Stats CRUD
C3 — Table enhancements (search, sort, pagination)
```
**Deliverable:** All content types manageable. Tables polished.

### Iteration 9 (if needed): Media Library + Uploader
```
C2 — Media Library
C4 — Image Uploader
```
**Deliverable:** Centralized image management.

---

## Storage Layer Abstraction

```
src/data/store.ts  ← All data ops go through this
```

```typescript
// Phase 1: localStorage
export function getAll<T>(key: string): T[] { ... }
export function getById<T>(key: string, id: string): T | undefined { ... }
export function create<T>(key: string, item: T): void { ... }
export function update<T>(key: string, id: string, updates: Partial<T>): void { ... }
export function remove(key: string, id: string): void { ... }
```

**Phase 2:** Same interface, backend swaps to Drizzle + Neon Postgres via **Neon MCP** (`@neondatabase/mcp`) for branch/db/role management. Neon Auth built-in replaces mocked localStorage auth. Relevant skills loaded when Phase 2 work begins.

---

## Types to Add to `src/types/cms.ts`

```typescript
export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
}

export interface SiteSettings {
  id: string;
  logo_text: string;
  navigation: { name: string; href: string }[];
  social_links: { name: string; href: string; icon: string }[];
  copyright: string;
}

export interface AdminUser {
  email: string;
  password: string; // only in Phase 1 mock
}

// Add these to existing models:
// Program: skills?: string[], faqs?: {q: string, a: string}[]
// EventPass: features?: string[]
```

---

## Auth Config (Phase 1 Mock)

```
Email:    admin@bmacjos.org
Password: bmac-admin-2026
```
