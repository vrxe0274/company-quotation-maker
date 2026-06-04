/* ============================================================
   mobileTabUI.js  — VRXE Quotation Maker
   Mobile layout: two tabs at top (Forms | Preview)
   + Download button shown on the Preview tab.

   Desktop: does nothing (≥ 768px).
   Mobile  (≤ 767px):
     - Injects a fixed top tab bar below the app header
     - Tab 1 "Forms"   → shows .form-panel, hides .preview-panel
     - Tab 2 "Preview" → shows .preview-panel, hides .form-panel
       and shows a Download PDF button at top of preview panel
   ============================================================ */

(function () {
  "use strict";

  const MOBILE_BP = 767;
  const isMobile  = () => window.innerWidth <= MOBILE_BP;

  /* ── DOM refs (resolved after includes load) ─────────────── */
  let tabBar        = null;
  let formPanel     = null;
  let previewPanel  = null;
  let mobileDownBtn = null;
  let activeTab     = "forms"; // "forms" | "preview"

  /* ── 1. Build the top tab bar ────────────────────────────── */
  function buildTabBar() {
    if (document.getElementById("mobilePrimaryTabBar")) return;

    tabBar = document.createElement("div");
    tabBar.id        = "mobilePrimaryTabBar";
    tabBar.className = "mobile-primary-tab-bar";
    tabBar.setAttribute("role", "tablist");
    tabBar.setAttribute("aria-label", "Main sections");

    tabBar.innerHTML = `
      <button
        class="mptb-btn is-active"
        id="mptbFormsBtn"
        data-mptb="forms"
        type="button"
        role="tab"
        aria-selected="true"
        aria-controls="mptb-forms-panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span>Forms</span>
      </button>
      <button
        class="mptb-btn"
        id="mptbPreviewBtn"
        data-mptb="preview"
        type="button"
        role="tab"
        aria-selected="false"
        aria-controls="mptb-preview-panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Preview</span>
      </button>
    `;

    tabBar.querySelectorAll(".mptb-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.mptb));
    });

    /* Insert right after the app-header */
    const header = document.querySelector(".app-header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(tabBar, header.nextSibling);
    } else {
      document.body.prepend(tabBar);
    }
  }

  /* ── 2. Build the in-preview download button ─────────────── */
  function buildMobileDownloadBtn() {
    if (document.getElementById("mobilePreviewDownloadBtn")) return;

    mobileDownBtn = document.createElement("button");
    mobileDownBtn.id        = "mobilePreviewDownloadBtn";
    mobileDownBtn.className = "primary-btn mobile-preview-download-btn";
    mobileDownBtn.type      = "button";
    mobileDownBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        style="flex-shrink:0">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download PDF
    `;
    mobileDownBtn.addEventListener("click", () => {
      if (typeof App !== "undefined" && App.downloadPdf) App.downloadPdf();
    });

    /* Prepend inside preview-panel, before the preview-title */
    if (previewPanel) {
      const previewTitle = previewPanel.querySelector(".preview-title");
      if (previewTitle) {
        previewPanel.insertBefore(mobileDownBtn, previewTitle);
      } else {
        previewPanel.prepend(mobileDownBtn);
      }
    }
  }

  /* ── 3. Switch active tab ────────────────────────────────── */
  function switchTab(tab) {
    if (!isMobile()) return;
    activeTab = tab;

    /* Resolve panels on first switch (they may not exist at build time) */
    formPanel    = formPanel    || document.querySelector(".form-panel");
    previewPanel = previewPanel || document.querySelector(".preview-panel");

    if (!formPanel || !previewPanel) return;

    const showForms   = tab === "forms";
    const showPreview = tab === "preview";

    formPanel.style.display    = showForms   ? ""      : "none";
    previewPanel.style.display = showPreview ? "flex"  : "none";

    /* Mobile-download button visibility */
    if (mobileDownBtn) {
      mobileDownBtn.style.display = showPreview ? "flex" : "none";
    }

    /* Update tab button states */
    if (tabBar) {
      tabBar.querySelectorAll(".mptb-btn").forEach((btn) => {
        const isActive = btn.dataset.mptb === tab;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    /* Re-fit the preview after it becomes visible */
    if (showPreview && typeof App !== "undefined" && App.fitPreviewToPanel) {
      requestAnimationFrame(() => App.fitPreviewToPanel());
    }
  }

  /* ── 4. Apply / remove mobile layout ────────────────────── */
  function applyMobileLayout() {
    formPanel    = document.querySelector(".form-panel");
    previewPanel = document.querySelector(".preview-panel");

    if (!formPanel || !previewPanel) return;

    buildTabBar();
    buildMobileDownloadBtn();
    switchTab(activeTab);

    /* Hide the header download button on mobile (preview tab has its own) */
    const headerDownBtn = document.getElementById("downloadPdfBtn");
    if (headerDownBtn) headerDownBtn.style.display = "none";
  }

  function removeDesktopOverride() {
    formPanel    = document.querySelector(".form-panel");
    previewPanel = document.querySelector(".preview-panel");

    if (formPanel)    formPanel.style.display    = "";
    if (previewPanel) previewPanel.style.display = "";
    if (mobileDownBtn) mobileDownBtn.style.display = "none";

    /* Restore header download button */
    const headerDownBtn = document.getElementById("downloadPdfBtn");
    if (headerDownBtn) headerDownBtn.style.display = "";

    if (tabBar) tabBar.style.display = "none";
  }

  /* ── 5. Responsive listener ──────────────────────────────── */
  let lastMobile = null;

  function onResize() {
    const nowMobile = isMobile();
    if (nowMobile === lastMobile) return;
    lastMobile = nowMobile;

    if (nowMobile) {
      if (tabBar) tabBar.style.display = "";
      applyMobileLayout();
    } else {
      removeDesktopOverride();
    }
  }

  window.addEventListener("resize", onResize);

  /* ── 6. Init (called after App.init finishes) ─────────────── */
  function init() {
    lastMobile = isMobile();

    if (lastMobile) {
      applyMobileLayout();
    }
    /* If desktop: do nothing — standard styles take over */
  }

  /* Hook into App.init so we run after all partials are loaded */
  const _originalInit = window.App && window.App.init;
  if (typeof _originalInit === "function") {
    window.App.init = function (...args) {
      _originalInit.apply(this, args);
      init();
    };
  } else {
    /* Fallback: wait for DOMContentLoaded */
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 450));
  }

})();
