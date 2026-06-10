/* ============================================================
   navMenu.js — Mobile step navigation as a dropdown.

   This is an ADDITIVE UI layer. It does not modify any existing
   application logic. On mobile (<= 767px) the desktop sidebar is
   hidden by CSS and replaced with a dropdown that lists the
   workflow steps + the admin "Terms & Conditions" entry.

   Selecting an item simply triggers a click on the real
   .tab-btn[data-tab] element, so the original tabs.js navigation
   (App.setActiveTab) stays the single source of truth.

   Desktop (> 767px): the dropdown is hidden; the sidebar is used.
   ============================================================ */
(function () {
  "use strict";

  const MOBILE_BP = 767;
  const isMobile  = () => window.innerWidth <= MOBILE_BP;

  let wrap = null, trigger = null, menu = null;
  let built = false, open = false, lastMobile = null;

  const stepButtons  = () => [...document.querySelectorAll(".tab-btn[data-tab]")];
  const adminButton  = () => document.getElementById("openAdminSettingsBtn");
  const activeButton = () => document.querySelector(".tab-btn[data-tab].is-active");

  const activeIndex = () => {
    const i = stepButtons().indexOf(activeButton());
    return i < 0 ? 0 : i;
  };

  const activeLabel = () => {
    const btn = activeButton();
    if (!btn) return "Select step";
    const t = btn.querySelector(".tab-text");
    return (t ? t.textContent : btn.textContent).trim();
  };

  /* ── Build the dropdown once ─────────────────────────────── */
  function build() {
    if (built) return;
    const tabs = document.querySelector(".tabs");
    const formContent = document.querySelector(".form-content");
    if (!tabs || !formContent) return;

    wrap = document.createElement("div");
    wrap.className = "nav-dropdown";
    wrap.id = "navDropdown";

    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "nav-dd-trigger";
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML =
      '<span class="nav-dd-badge"></span>' +
      '<span class="nav-dd-titles">' +
        '<span class="nav-dd-kicker"></span>' +
        '<span class="nav-dd-label"></span>' +
      "</span>" +
      '<svg class="nav-dd-caret" width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="6 9 12 15 18 9"/></svg>';

    menu = document.createElement("div");
    menu.className = "nav-dd-menu";
    menu.setAttribute("role", "menu");

    rebuildMenu();

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener("click", (e) => {
      if (open && wrap && !wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    formContent.insertBefore(wrap, formContent.firstChild);

    built = true;
    sync();
  }

  function rebuildMenu() {
    if (!menu) return;
    menu.innerHTML = "";

    stepButtons().forEach((btn, i) => {
      const labelEl = btn.querySelector(".tab-text");
      const item = document.createElement("button");
      item.type = "button";
      item.className = "nav-dd-item";
      item.setAttribute("role", "menuitem");
      item.dataset.target = btn.dataset.tab;
      item.innerHTML =
        `<span class="nav-dd-item-num">${i + 1}</span>` +
        `<span class="nav-dd-item-text">${labelEl ? labelEl.textContent.trim() : btn.dataset.tab}</span>` +
        '<svg class="nav-dd-check" width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"/></svg>';
      item.addEventListener("click", () => {
        btn.click();
        close();
        sync();
      });
      menu.appendChild(item);
    });

    const admin = adminButton();
    if (admin) {
      const sep = document.createElement("div");
      sep.className = "nav-dd-sep";
      menu.appendChild(sep);

      const adminItem = document.createElement("button");
      adminItem.type = "button";
      adminItem.className = "nav-dd-item nav-dd-item-admin";
      adminItem.setAttribute("role", "menuitem");
      adminItem.innerHTML =
        '<span class="nav-dd-item-num nav-dd-item-num-admin">✓</span>' +
        '<span class="nav-dd-item-text">Terms &amp; Conditions</span>';
      adminItem.addEventListener("click", () => {
        admin.click();
        close();
      });
      menu.appendChild(adminItem);
    }
  }

  /* ── Keep the trigger + active highlight in sync ─────────── */
  function sync() {
    if (!trigger) return;
    const badge  = trigger.querySelector(".nav-dd-badge");
    const kicker = trigger.querySelector(".nav-dd-kicker");
    const label  = trigger.querySelector(".nav-dd-label");
    const idx    = activeIndex();

    if (badge)  badge.textContent  = String(idx + 1);
    if (kicker) kicker.textContent = `Step ${idx + 1} of ${stepButtons().length}`;
    if (label)  label.textContent  = activeLabel();

    if (menu) {
      const active = activeButton();
      const tab = active ? active.dataset.tab : null;
      menu.querySelectorAll(".nav-dd-item").forEach((it) => {
        it.classList.toggle("is-active", Boolean(tab) && it.dataset.target === tab);
      });
    }
  }

  const toggle = () => open ? close() : openMenu();

  function openMenu() {
    if (!wrap) return;
    open = true;
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }

  function close() {
    open = false;
    if (wrap)    wrap.classList.remove("is-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  /* ── Show on mobile, hide on desktop ─────────────────────── */
  function apply() {
    if (isMobile()) {
      build();
      if (wrap) wrap.style.display = "";
      sync();
    } else if (wrap) {
      wrap.style.display = "none";
      close();
    }
  }

  /* Wrap App.setActiveTab so Next/Previous + sidebar clicks
     update the dropdown label too. Safe + idempotent. */
  function hookSetActiveTab() {
    if (!window.App ||
        typeof window.App.setActiveTab !== "function" ||
        window.App.__navMenuHooked) {
      return;
    }
    const orig = window.App.setActiveTab;
    window.App.setActiveTab = function (...args) {
      const result = orig.apply(this, args);
      sync();
      return result;
    };
    window.App.__navMenuHooked = true;
  }

  window.addEventListener("resize", () => {
    const nm = isMobile();
    if (nm === lastMobile) return;
    lastMobile = nm;
    apply();
  });

  function start() {
    lastMobile = isMobile();
    hookSetActiveTab();
    apply();
  }

  /* HTML partials load asynchronously. htmlIncludes.js dispatches
     "vrxe:ready" after App.init() completes, guaranteeing tabs +
     form-content exist before we build the dropdown. */
  document.addEventListener("vrxe:ready", () => start());
})();
