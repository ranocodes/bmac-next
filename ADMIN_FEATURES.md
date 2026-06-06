# Admin Dashboard — Feature List

> Audit result for Phase 1 build (localStorage / mock data).

## Authentication
- [ ] **Login Page** — Mocked auth with localStorage (email/password check, session token in localStorage)

## Dashboard Home
- [ ] **Analytics Cards** — Total posts, events, programs, gallery items (counts from mock data)
- [ ] **Recent Activity Feed** — Latest created/updated items across all content types
- [ ] **Quick Action Buttons** — "New Post", "New Event", "New Program"

## Content Management (Tables)
- [ ] **News Articles Table** — CRUD, sortable columns (title, date, category, featured status), search/filter
- [ ] **Events Table** — CRUD, sortable (title, date, venue, category), filter by category
- [ ] **Programs Table** — CRUD, sortable (title, color/variant), filter by variant
- [ ] **Gallery Manager** — Upload, delete, reorder, categorize images

## Forms (Content Editing)
- [ ] **WYSIWYG Editor** — Rich text for `content` / `longDesc` fields (news body, event/program descriptions)
- [ ] **Image Uploader** — Upload images, get URL, preview before saving
- [ ] **News Form** — Title, date, category, featured toggle, description, content (WYSIWYG), image
- [ ] **Event Form** — Title, date, time, venue, category, price (paid/free toggle), description, long description
- [ ] **Program Form** — Title, description, long description, image, icon, color, variant (featured/default), details
- [ ] **Team Members Form** — Name, role, image
- [ ] **Site Settings Form** — Site name, navigation links, social links, copyright text

## Media
- [ ] **Media Library** — Grid view of all uploaded images, copy URL, delete

## Layout & Navigation
- [ ] **Admin Sidebar** — Collapsible nav with icons, links to all sections
- [ ] **Admin Layout** — Sidebar + top header bar + content area, mobile-responsive (sidebar becomes hamburger drawer)
- [ ] **Mobile Responsiveness** — All admin pages fully responsive (tables horizontal scroll, stacked cards on mobile)

## System
- [ ] **Protected Routes** — Redirect to login if no localStorage session token
- [ ] **Logout** — Clear localStorage session, redirect to login
