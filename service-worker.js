/* ============================================================
   VRXE Quotation Maker — Service Worker
   - Precaches the app shell (HTML partials, CSS, JS, icons)
   - Runtime-caches CDN libraries and Google Fonts so PDF export
     keeps working offline after the first online visit
   - Navigation requests fall back to the cached index.html
   ============================================================ */

const VERSION    = "vrxe-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "responsive.css",
  "manifest.json",
  "partials/header.html",
  "partials/tabs.html",
  "partials/form-panels.html",
  "partials/form-footer.html",
  "partials/preview.html",
  "partials/item-template.html",
  "partials/admin-modal.html",
  "js/config.js",
  "js/utils.js",
  "js/previewControls.js",
  "js/tabs.js",
  "js/items.js",
  "js/previewRenderer.js",
  "js/pdf.js",
  "js/defaultData.js",
  "js/adminModal.js",
  "js/mobileTabUI.js",
  "js/init.js",
  "js/navMenu.js",
  "js/htmlIncludes.js",
  "assets/vrxe-logo.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-192.png",
  "assets/icon-maskable-512.png"
];

/* Install — cache the shell (best-effort, never fail the whole install) */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        SHELL.map((url) => cache.add(new Request(url, { cache: "reload" })))
      );
    })
  );
  self.skipWaiting();
});

/* Activate — drop old versioned caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Fetch strategy */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  /* Navigation: network-first, fall back to cached shell */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  /* Same-origin assets: cache-first, then network (and cache it) */
  if (sameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  /* Cross-origin (CDN libs, Google Fonts): stale-while-revalidate */
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) {
            cache.put(request, res.clone()).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
