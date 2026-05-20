# BMAC Jos: Decap CMS Integration Plan & Website Audit

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
| **Hero/About Story** | Singleton | Medium | Markdown |
| **Site Settings** | Singleton | Low | YAML |

---

## 4. CRUD Readiness Assessment
*   **Current Status:** **Not CRUD Ready.**
*   **Missing Requirements:**
    *   **External Data Source:** Content must move from `.tsx` constants to `.md` or `.json` files in a `/content` directory.
    *   **Data Fetching Layer:** A utility library to parse Markdown (e.g., `gray-matter`) and inject data into Server Components.
    *   **CMS Configuration:** A `config.yml` file defining the fields for the Decap interface.
    *   **Authentication:** Netlify Identity or a Git Gateway (e.g., Decap's local-fs-proxy).

---

## 5. Decap CMS Integration Strategy
*   **Workflow:** Git-based. Every save in the CMS creates a Git commit in the repository.
*   **Backend:** Git Gateway via Netlify Identity.
*   **Preview Mode:** Real-time previews using a `Preview Component` that mimics the site's layout.
*   **File Approach:** 
    *   **Markdown:** Used for detail-heavy pages (News, Events, Programs) to allow for rich text editing.
    *   **JSON:** Used for simple lists (Team, Gallery, FAQs) for fast parsing.
*   **Media Library:** Store uploads in `public/images/uploads`.

---

## 6. Collection and Schema Design (Proposed `config.yml`)

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "news"
    label: "News & Blog"
    folder: "content/news"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Publish Date", name: "date", widget: "datetime" }
      - { label: "Category", name: "category", widget: "select", options: ["Culture", "Education", "Community", "Partnership"] }
      - { label: "Featured", name: "featured", widget: "boolean", default: false }
      - { label: "Featured Image", name: "img", widget: "image" }
      - { label: "Summary", name: "desc", widget: "text" }
      - { label: "Body Content", name: "body", widget: "markdown" }

  - name: "programs"
    label: "Workshops & Programs"
    folder: "content/programs"
    create: true
    fields:
      - { label: "Program Name", name: "title", widget: "string" }
      - { label: "Icon", name: "icon", widget: "select", options: ["Mic", "BookOpen", "Users", "Trophy", "Cpu"] }
      - { label: "Thumbnail Image", name: "img", widget: "image" }
      - { label: "Short Description", name: "desc", widget: "text" }
      - { label: "Detailed Overview", name: "body", widget: "markdown" }
      - { label: "Logistics", name: "details", widget: "list", summary: "{{fields.item}}" }
```

---

## 7. Frontend Refactor Plan

1.  **Create Content Directory:** Structure `/content/news`, `/content/programs`, etc.
2.  **Externalize Data:** Convert current `.tsx` arrays into individual `.md` or `.json` files.
3.  **Data Utility (lib/cms.ts):** Create logic to read and parse local CMS files.
4.  **Refactor Server Components:** Update page files to fetch data using the new CMS utility.
5.  **Dynamic Routing:** Update `[id]/page.tsx` routes to fetch files by slug.

---

## 8. Admin Workflow Design
1.  **Access:** Admin visits `/admin`.
2.  **Auth:** Login via Email/Password (Netlify Identity).
3.  **Edit:** Admin edits content in the visual UI.
4.  **Save:** Decap CMS commits changes to GitHub.
5.  **Build:** Continuous Deployment (Vercel/Netlify) triggers a rebuild.
6.  **Live:** Update appears on the site automatically.

---

## 9. Security and Permissions
*   **Role Based Access:** Restricted via Netlify Identity.
*   **Git Security:** Admins do not need direct access to the GitHub repository.
*   **Media Protection:** Uploads are stored in the public folder but managed via the CMS.

---

## 10. Step-by-Step Implementation Roadmap

### **Phase 1: Setup**
*   Add `public/admin/index.html` and `public/admin/config.yml`.
*   Setup Decap's `local-fs-proxy` for local development.

### **Phase 2: Data Migration**
*   Move hardcoded constants to `/content` directory as MD/JSON files.

### **Phase 3: Frontend Refactor**
*   Implement data fetching utility and replace static imports.
*   Update dynamic routes.

### **Phase 4: Cloud Deployment**
*   Enable Git Gateway and Identity.
*   Final testing.

---

## 11. Final Recommendations
1.  **Hosting:** Deploy on **Netlify** for easiest Identity integration.
2.  **Performance:** Next.js static generation ensures zero performance impact.
3.  **Scalability:** This architecture supports thousands of entries effortlessly.
