# BMAC Jos: Decap CMS Integration Plan & Website Audit (REFINED)

## 1. Executive Summary
The current website is a high-performance Next.js 16 application with a premium UI. However, it is currently "content-locked"—meaning updates require a developer to modify `.tsx` files. By integrating **Decap CMS**, we will move this content into a Git-based backend. This allows non-technical admins to perform full **CRUD (Create, Read, Update, Delete)** operations on programs, news, events, and team members through a secure web interface, while maintaining the high-end "Bento 2.0" aesthetic.

---

## 2. Website Architecture Audit
*   **Framework:** Next.js 16.2.6 (App Router) + Turbopack.
*   **Styling:** Tailwind CSS v4 (CSS-only theme configuration).
*   **Animations:** Framer Motion (Scroll-triggered).
*   **Current Data Flow:** Internal `const` arrays inside page files.
*   **Content Management:** Manual code edits.
*   **Bottleneck:** Adding a new blog post or program requires a code commit and redeploy.

---

## 3. Dynamic Content Inventory
| Area | Content Type | Complexity | Storage Recommendation |
| :--- | :--- | :--- | :--- |
| **Blog Posts** | Collection | High | Markdown (`.md`) |
| **Events** | Collection | Medium | Markdown (`.md`) |
| **Programs** | Collection | High | Markdown (`.md`) |
| **Team Members** | Collection | Low | JSON/YAML |
| **Gallery** | Collection | Low | JSON |
| **FAQs** | Collection | Low | JSON |
| **Testimonials** | Collection | Low | JSON |
| **Impact Stats** | Singleton | Low | JSON (Global stats like "350+ members") |
| **Social Links** | Singleton | Low | YAML (Footer/Contact links) |
| **Navigation** | Singleton | Medium | JSON (Header/Footer menu management) |
| **Page SEO** | Singleton | Medium | YAML (Per-page titles/descriptions) |
| **Hero Sections** | Singleton | Medium | Markdown (Per-page headlines/images) |
| **Site Branding** | Singleton | Low | YAML (Logos, copyright text) |

---

## 4. CRUD Readiness Assessment
*   **Current Status:** **Not CRUD Ready.**
*   **Missing Requirements:**
    *   **External Data Source:** Content must move from `.tsx` constants to `.md` or `.json` files in a `/content` directory.
    *   **Data Fetching Layer:** A utility library to parse Markdown (e.g., `gray-matter`) and inject data into Server Components.
    *   **CMS Configuration:** A `config.yml` file defining the fields for the Decap interface.
    *   **Authentication:** Netlify Identity or a Git Gateway.

---

## 5. Decap CMS Integration Strategy
*   **Workflow:** Git-based. Every save in the CMS creates a Git commit in the repository.
*   **Backend:** Git Gateway via Netlify Identity.
*   **Preview Mode:** Real-time previews using a `Preview Component` that mimics the site's layout.
*   **File Approach:** 
    *   **Markdown:** Used for detail-heavy pages (News, Events, Programs) for rich text editing.
    *   **JSON:** Used for simple lists (Team, Gallery, FAQs) and global settings.
*   **Media Library:** Store uploads in `public/images/uploads`.

---

## 6. Expanded Collection Design (Proposed `config.yml`)

### A. Dynamic Collections (Markdown)
*   **News/Blog:** `content/news/*.md`
*   **Events:** 
    *   `content/events/*.md`
    *   Fields:
        *   `title`: Event name.
        *   `date`: Visual date string.
        *   `venue`: Location name.
        *   `time`: Start/End time.
        *   `desc`: Short teaser for grid cards.
        *   `longDesc`: Full narrative description for the detail page.
        *   `highlights`: A dynamic list of key features (e.g., "Networking", "Certificates").
        *   `map_coordinates`: Lat/Long for the Google Maps embed.
*   **Programs:** `content/programs/*.md`

### B. Global Singleton Settings (YAML/JSON)
*   **Impact Stats:**
    *   `content/settings/stats.json`
    *   Fields: `label`, `value`, `icon` (Lucide name).
*   **Branding & Navigation:**
    *   `content/settings/site.json`
    *   Fields: `logo_text`, `copyright`, `social_links` (list), `navigation` (list).
*   **SEO Metadata:**
    *   `content/settings/seo.json`
    *   Fields: `home_title`, `home_desc`, `about_title`, etc.

---

## 7. Frontend Refactor Plan

1.  **Create Content Directory:** Structure `/content/news`, `/content/programs`, `/content/settings`, etc.
2.  **Externalize Data:** Convert current `.tsx` arrays into individual `.md` or `.json` files.
3.  **Data Utility (lib/cms.ts):** Create logic to read and parse local CMS files using `gray-matter`.
4.  **Refactor Server Components:** Update page files to fetch data using the new CMS utility.
5.  **Lucide Icon Mapper:** Create a utility to map string icon names from CMS (e.g., "Mic") to actual Lucide components.

---

## 8. Admin Workflow Design
1.  **Access:** Admin visits `bmacjos.org/admin`.
2.  **Auth:** Login via Netlify Identity.
3.  **Edit:** Admin updates stats, news, or navigation items.
4.  **Save:** Decap CMS commits changes to GitHub.
5.  **Live:** Update appears on the site automatically after a static build.

---

## 9. Deployment & Performance
1.  **Hosting:** Deploy on **Netlify** for native CMS and Identity support.
2.  **Static Generation:** Use `getStaticProps` (or equivalent in Next 16) to ensure zero performance hit from the CMS.
3.  **Scalability:** The Git-based approach scales with the project history.

---

## 10. Implementation Roadmap

1.  **Phase 1:** Core Setup (`admin/index.html`, `config.yml`).
2.  **Phase 2:** Global Settings Migration (Stats, Nav, Social).
3.  **Phase 3:** Detail Collections Migration (News, Programs, Events).
4.  **Phase 4:** SEO & Metadata Integration.
5.  **Phase 5:** Media Library & Image Optimization.
