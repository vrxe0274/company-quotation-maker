# VRXE Quotation Maker

A browser-based tool for building VRXE business quotations and exporting them to a
pixel-accurate two-page PDF. Works as a responsive web app on desktop and mobile, and
is installable as a **PWA** (Progressive Web App) on phones and desktops.

## What changed in this version

- **New UI theme** — a clean, mostly-white "document studio" look with an ink-black
  structure and a VRXE brand spectrum (violet → fuchsia → teal) used as a precise
  signature accent (top hairline on panels, focus rings, active steps).
- **Rebuilt responsive layout** for desktop, tablet, and mobile, with attention to UI/UX:
  - Desktop: a persistent left **sidebar** of workflow steps next to the form, with a
    sticky two-column layout (form + live preview).
  - Tablet: single-column stack with a scrollable step bar.
  - Mobile: a Forms / Preview switcher, the steps presented as a **dropdown menu**
    (instead of a cramped strip), and a pinned Next / Previous footer. The form now
    always spans the full screen width.
- **PWA support** — `manifest.json`, app icons, and a `service-worker.js` so the app can
  be installed and used offline.
- **The exported PDF is unchanged.** All `.quotation-page` document styles and the
  preview scaling rules were preserved exactly, so generated PDFs look identical to before.
- **Existing app logic is untouched.** None of the original JavaScript in `js/` was
  modified. The mobile step dropdown is a small, separate enhancement file
  (`js/navMenu.js`) that simply drives the existing tab buttons — it adds no new logic
  to the quotation/PDF code.

## Structure

```
index.html              Main shell (loads partials + scripts, registers the service worker)
styles.css              UI theme + the preserved PDF document template styles
responsive.css          Tablet / mobile / landscape breakpoints
manifest.json           PWA manifest
service-worker.js       Offline app-shell cache
assets/                 Logo + PWA icons
partials/               header, tabs, form-panels, form-footer, preview, item-template, admin-modal
js/                     App logic (unchanged): config, utils, previewControls, tabs, items,
                        previewRenderer, pdf, defaultData, adminModal, mobileTabUI, init, htmlIncludes
                        + navMenu.js (additive mobile step-dropdown UI; original files untouched)
```

## Running locally

Because the HTML sections load from separate files (`fetch`), run the project from a
**local server** rather than opening `index.html` with `file://`.

Examples:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`. (VS Code "Live Server" works too.)

A service worker also requires a server (or HTTPS in production) to register.

## Installing as a PWA

1. Serve the folder over HTTPS (or `localhost`).
2. Open it in a supported browser (Chrome, Edge, Safari, etc.).
3. Use the browser's **Install app / Add to Home Screen** option.

On the first online visit the service worker caches the app shell. The PDF libraries
(`html2canvas`, `jsPDF`) and fonts are loaded from a CDN and are runtime-cached after the
first online use, so PDF export keeps working offline afterwards.

## Admin Editable Defaults

Payment details and Terms & Conditions are locked behind an admin modal.

- **Admin password:** `vrxeadmin`

The Services tab is only marked complete once you review the rows and tick the
services-verification checkbox.
