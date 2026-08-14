# Plan: Download Event Pass (PNG)

## Summary

Add a "Download pass" button to the public pass page so an attendee can save their event pass as a PNG image of the exact card rendered at `/pass/[token]`. The image is captured client-side from the already-rendered card DOM with the `html-to-image` library (pure TS, browser-only, no server cost), then downloaded as `bmac-pass-{reference}.png`. The QR code is already a same-origin data URL (`src/app/(public_pages)/pass/[token]/page.tsx:42-43`), so capture has no tainted-canvas/CORS risk. Button is available in all pass states (pending, cancelled, confirmed, checked-in), matching the decision that any holder of the token URL may download.

## User Story

As an event attendee
I want to download my event pass as an image
So that I can save it to my phone / print it without needing the internet at the venue.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY (small enhancement) |
| Complexity | LOW |
| Systems Affected | `src/app/(public_pages)/pass/[token]/PassClient.tsx`, `package.json` |
| Jira Issue | N/A (new feature request — no ticket yet) |

---

## Current State (verified)

- **Pass page** (`src/app/(public_pages)/pass/[token]/page.tsx`, `force-dynamic`): queries `event_tickets` joined to `events`, generates QR data URL server-side via the `qrcode` package (`page.tsx:38-47`), renders `<PassClient ticket qrDataUrl>`.
- **Pass card** (`src/app/(public_pages)/pass/[token]/PassClient.tsx:74-144`): white rounded card with event title, status pill, date/venue/attendee rows, QR image (`PassClient.tsx:117-119`), reference + quantity footer. "Not found" branch at `PassClient.tsx:59-70`. Inactive passes render an amber warning box instead of QR (`PassClient.tsx:112-116`).
- **No download affordance exists.** No image/PDF/canvas dependency in `package.json` (checked: sharp, html-to-image, html2canvas, jspdf, @napi-rs/canvas all absent).
- **Style to mirror**: `Back to Events` link (`PassClient.tsx:77-79`) and existing Tailwind button patterns in admin components.
- **Design decision**: client-side `html-to-image` capture of the rendered card → PNG. Chosen over server-side rendering (no new native dep, pixel-identical to screen, reuses existing markup) and over `window.print` (low fidelity).

---

## Patterns to Follow

### Client component + dynamic-import dependency
```
// SOURCE: src/app/(public_pages)/pass/[token]/PassClient.tsx:1
"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, User, Ticket, CheckCircle2, AlertTriangle } from "lucide-react";
```

### Button/link styling already on this page
```
// SOURCE: src/app/(public_pages)/pass/[token]/PassClient.tsx:77-79
<Link href="/events" className="inline-flex items-center gap-2 text-secondary/60 hover:text-primary text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
  <ArrowLeft size={14} /> Back to Events
</Link>
```

### Existing dependency via npm
No example in-repo; `html-to-image` is installed via `npm install html-to-image` and imported as `import { toPng } from "html-to-image";` (ESM, browser-only).

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | UPDATE | add `html-to-image` dependency |
| `src/app/(public_pages)/pass/[token]/PassClient.tsx` | UPDATE | add ref-wrapped card, Download button, `toPng` capture + anchor download |

---

## Tasks

### Task 1: Install `html-to-image`

- **File**: `package.json`
- **Action**: UPDATE
- **Implement**: `npm install html-to-image`
- **Validate**: `npm ls html-to-image`

### Task 2: Add Download button + capture logic to PassClient

- **File**: `src/app/(public_pages)/pass/[token]/PassClient.tsx`
- **Action**: UPDATE
- **Implement**:
  - `"use client"` already present. Add `import { useRef, useState } from "react";` and `import { toPng } from "html-to-image";`.
  - Wrap the pass card `<div className="bg-white border border-border rounded-3xl shadow-sm">` (`PassClient.tsx:81`) in a `<div ref={passRef}>` wrapper (or attach `ref` directly to the card div) so the capture node is exactly the card.
  - Add a `Download pass` button below the card (between the card and the checked-in line at `PassClient.tsx:136`), always rendered when `ticket` exists. Style to mirror the page's button language (`text-xs font-bold uppercase tracking-widest`), primary variant:
    ```tsx
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <Download size={14} /> {downloading ? "Preparing…" : "Download pass"}
    </button>
    ```
  - Handler:
    ```tsx
    const handleDownload = async () => {
      if (!passRef.current) return;
      setDownloading(true);
      setDownloadError("");
      try {
        const dataUrl = await toPng(passRef.current, { pixelRatio: 2, cacheBust: true });
        const link = document.createElement("a");
        link.download = `bmac-pass-${ticket?.reference || "pass"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Pass download error:", err);
        setDownloadError("Could not generate the image. Try again.");
      } finally {
        setDownloading(false);
      }
    };
    ```
  - Import `Download` icon from `lucide-react`.
  - Render `{downloadError && <p className="mt-2 text-center text-red-500 text-xs font-bold">{downloadError}</p>}` under the button.
  - Works in all states: for inactive/checked-in passes the card (warning box or checked-in pill) is captured as rendered; the QR `<img>` data URL is same-origin so capture is not tainted.
- **Mirror**: `src/app/(public_pages)/pass/[token]/PassClient.tsx:1,77-79` - client component + page-local styling
- **Validate**: `npm run build && npm run lint`

---

## Validation

```bash
# Type check + build
npm run build

# Lint
npm run lint

# Manual
npm run dev → open /pass/<token> for a confirmed ticket → click Download pass → PNG saved with pixelRatio-2 QR, opens cleanly.
Also check: pending/cancelled ticket (warning card downloads), checked-in ticket, quantity > 1, and a bogus token (page still shows "Pass Not Found" — no button).
```

---

## Acceptance Criteria

- [ ] `html-to-image` added to `package.json`
- [ ] Download button visible on pass page for every existing-ticket state
- [ ] Clicking it saves `bmac-pass-{reference}.png` at 2x pixel density
- [ ] Captured image matches the on-screen card (title, date, venue, attendee, QR, reference)
- [ ] Failure path shows inline error, does not crash the page
- [ ] `npm run build` and `npm run lint` pass
- [ ] Pass Not Found state unchanged (no download button)
