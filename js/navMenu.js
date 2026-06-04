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

  var MOBILE_BP = 767;
  function isMobile() { return window.innerWidth <= MOBILE_BP; }

  var wrap = null, trigger = null, menu = null;
  var built = false, open = false, lastMobile = null;

  function stepButtons() {
    return Array.prototype.slice.call(
      document.querySelectorAll(".tab-btn[data-tab]")
    );
  }
  function adminButton() {
    return document.getElementById("openAdminSettingsBtn");
  }
  function activeButton() {
    return document.querySelector(".tab-btn[data-tab].is-active");
  }

  function activeIndex() {
    var i = stepButtons().indexOf(activeButton());
    return i < 0 ? 0 : i;
  }
  function activeLabel() {
    var btn = activeButton();
    if (!btn) return "Select step";
    var t = btn.querySelector(".tab-text");
    return (t ? t.textContent : btn.textContent).trim();
  }

  /* ── Build the dropdown once ─────────────────────────────── */
  function build() {
    if (built) return;
    var tabs = document.querySelector(".tabs");
    var formContent = document.querySelector(".form-content");
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

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener("click", function (e) {
      if (open && wrap && !wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
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

    stepButtons().forEach(function (btn, i) {
      var labelEl = btn.querySelector(".tab-text");
      var item = document.createElement("button");
      item.type = "button";
      item.className = "nav-dd-item";
      item.setAttribute("role", "menuitem");
      item.dataset.target = btn.dataset.tab;
      item.innerHTML =
        '<span class="nav-dd-item-num">' + (i + 1) + "</span>" +
        '<span class="nav-dd-item-text">' +
          (labelEl ? labelEl.textContent.trim() : btn.dataset.tab) +
        "</span>" +
        '<svg class="nav-dd-check" width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="20 6 9 17 4 12"/></svg>';
      item.addEventListener("click", function () {
        btn.click();      /* drives the original tabs.js navigation */
        close();
        sync();
      });
      menu.appendChild(item);
    });

    var admin = adminButton();
    if (admin) {
      var sep = document.createElement("div");
      sep.className = "nav-dd-sep";
      menu.appendChild(sep);

      var adminItem = document.createElement("button");
      adminItem.type = "button";
      adminItem.className = "nav-dd-item nav-dd-item-admin";
      adminItem.setAttribute("role", "menuitem");
      adminItem.innerHTML =
        '<span class="nav-dd-item-num nav-dd-item-num-admin">✓</span>' +
        '<span class="nav-dd-item-text">Terms &amp; Conditions</span>';
      adminItem.addEventListener("click", function () {
        admin.click();
        close();
      });
      menu.appendChild(adminItem);
    }
  }

  /* ── Keep the trigger + active highlight in sync ─────────── */
  function sync() {
    if (!trigger) return;
    var badge = trigger.querySelector(".nav-dd-badge");
    var kicker = trigger.querySelector(".nav-dd-kicker");
    var label = trigger.querySelector(".nav-dd-label");
    var idx = activeIndex();

    if (badge) badge.textContent = String(idx + 1);
    if (kicker) kicker.textContent = "Step " + (idx + 1) + " of " + stepButtons().length;
    if (label) label.textContent = activeLabel();

    if (menu) {
      var active = activeButton();
      var tab = active ? active.dataset.tab : null;
      Array.prototype.forEach.call(
        menu.querySelectorAll(".nav-dd-item"),
        function (it) {
          it.classList.toggle("is-active", tab && it.dataset.target === tab);
        }
      );
    }
  }

  function toggle() { open ? close() : openMenu(); }
  function openMenu() {
    if (!wrap) return;
    open = true;
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }
  function close() {
    open = false;
    if (wrap) wrap.classList.remove("is-open");
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
    var orig = window.App.setActiveTab;
    window.App.setActiveTab = function () {
      var result = orig.apply(this, arguments);
      sync();
      return result;
    };
    window.App.__navMenuHooked = true;
  }

  window.addEventListener("resize", function () {
    var nm = isMobile();
    if (nm === lastMobile) return;
    lastMobile = nm;
    apply();
  });

  function start() {
    lastMobile = isMobile();
    hookSetActiveTab();
    apply();
  }

  /* The HTML partials load asynchronously, so poll briefly until
     the tabs + form-content exist, then initialise. */
  function waitAndStart(tries) {
    tries = tries || 0;
    if (document.querySelector(".tabs") &&
        document.querySelector(".form-content")) {
      start();
      return;
    }
    if (tries > 80) return;
    setTimeout(function () { waitAndStart(tries + 1); }, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { waitAndStart(0); });
  } else {
    waitAndStart(0);
  }
})();
