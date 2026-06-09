/* ============================================================
   items.js — service row management

   Row types
   ─────────────────────────────────────────────────────────────
   "main"       VR Booth — has pricing, no Included checkbox.
                Always the first row; cannot be deleted.
   "inclusion"  Accessories, Labor, etc. — always Included,
                no pricing fields shown.
   "additional" *VR Mock Demo, *Additional — has pricing,
                no Included checkbox. Can be deleted.
   ============================================================ */

/* Read all item cards back into plain objects for the renderer */
App.getItems = () => {
  return [...document.querySelectorAll(".item-card")].map((card) => {
    const type = card.dataset.type || "inclusion";

    if (type === "inclusion") {
      return {
        type,
        service:       card.querySelector(".item-service")?.value.trim() || "",
        description:   card.querySelector(".item-description")?.value.trim() || "",
        details:       (card.querySelector(".item-details")?.value || "")
                         .split("\n").map(x => x.trim()).filter(Boolean),
        originalPrice: 0,
        finalPrice:    0,
        included:      true,
        total:         0
      };
    }

    // main / additional — have real price inputs
    const finalPrice = Number(card.querySelector(".item-final")?.value) || 0;
    return {
      type,
      service:       card.querySelector(".item-service")?.value.trim() || "",
      description:   card.querySelector(".item-description")?.value.trim() || "",
      details:       (card.querySelector(".item-details")?.value || "")
                       .split("\n").map(x => x.trim()).filter(Boolean),
      originalPrice: Number(card.querySelector(".item-original")?.value) || 0,
      finalPrice,
      included:      false,
      total:         finalPrice
    };
  });
};

/* ── Build a card DOM element ─────────────────────────────── */
App.buildItemCard = (item = {}) => {
  const type = item.type || "inclusion";

  const card = document.createElement("div");
  card.className  = "item-card";
  card.dataset.type = type;

  /* ── Card header row (badge + toggle + remove) ── */
  const cardHeader = document.createElement("div");
  cardHeader.className = "item-card-header";

  /* ── Type badge ── */
  const badge = document.createElement("div");
  badge.className = "item-type-badge";
  badge.textContent =
    type === "main"       ? "⬤  VR Booth (Main)"  :
    type === "additional" ? "+  Additional"         :
                            "✓  Inclusion";
  cardHeader.appendChild(badge);

  /* ── Header right controls ── */
  const headerControls = document.createElement("div");
  headerControls.className = "item-card-controls";

  /* ── Remove button (not shown for "main") ── */
  if (type !== "main") {
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-item-btn";
    removeBtn.type = "button";
    removeBtn.setAttribute("aria-label", "Remove service row");
    removeBtn.title = "Remove row";
    removeBtn.textContent = "🗑";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (document.querySelectorAll(".item-card").length > 1) {
        card.remove();
        App.renderPreview();
      }
    });
    headerControls.appendChild(removeBtn);
  }

  /* ── Collapse toggle ── */
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "item-toggle-btn";
  toggleBtn.type = "button";
  toggleBtn.setAttribute("aria-label", "Toggle row");
  toggleBtn.setAttribute("aria-expanded", "true");
  toggleBtn.innerHTML = `<svg class="item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>`;
  headerControls.appendChild(toggleBtn);

  cardHeader.appendChild(headerControls);
  card.appendChild(cardHeader);

  /* ── Collapsible body ── */
  const cardBody = document.createElement("div");
  cardBody.className = "item-card-body";

  /* ── Grid ── */
  const grid = document.createElement("div");
  grid.className = "grid item-grid";

  /* Service name (all types) */
  const lService = document.createElement("label");
  lService.textContent = type === "main" ? "Service / Product Name" : "Service";
  const iService = document.createElement("input");
  iService.className = "item-service";
  iService.type = "text";
  iService.placeholder = type === "main" ? "VR Booth" : type === "additional" ? "e.g. Extra Headset" : "e.g. Labor";
  iService.value = item.service || "";
  lService.appendChild(iService);
  grid.appendChild(lService);

  /* Description (all types) */
  const lDesc = document.createElement("label");
  lDesc.textContent = "Description";
  const iDesc = document.createElement("input");
  iDesc.className = "item-description";
  iDesc.type = "text";
  iDesc.placeholder = "Short description";
  iDesc.value = item.description || "";
  lDesc.appendChild(iDesc);
  grid.appendChild(lDesc);

  /* Details textarea (all types, full width) */
  const lDetails = document.createElement("label");
  lDetails.textContent = "Details / Bullets";
  lDetails.style.gridColumn = "1 / -1";
  const ta = document.createElement("textarea");
  ta.className = "item-details";
  ta.rows = 3;
  ta.placeholder = "One detail per line";
  ta.value = Array.isArray(item.details) ? item.details.join("\n") : (item.details || "");
  lDetails.appendChild(ta);
  grid.appendChild(lDetails);

  /* Pricing fields — only for main & additional */
  if (type === "main" || type === "additional") {
    const lOrig = document.createElement("label");
    lOrig.textContent = "Original Price";
    const iOrig = document.createElement("input");
    iOrig.className = "item-original";
    iOrig.type = "number";
    iOrig.min  = "0";
    iOrig.step = "0.01";
    iOrig.placeholder = "0.00";
    iOrig.value = item.originalPrice || "";
    lOrig.appendChild(iOrig);
    grid.appendChild(lOrig);

    const lFinal = document.createElement("label");
    lFinal.textContent = "Final Price";
    const iFinal = document.createElement("input");
    iFinal.className = "item-final";
    iFinal.type = "number";
    iFinal.min  = "0";
    iFinal.step = "0.01";
    iFinal.placeholder = "0.00";
    iFinal.value = item.finalPrice || "";
    lFinal.appendChild(iFinal);
    grid.appendChild(lFinal);
  } else {
    /* Inclusions: hidden zero-value fields so getItems() stays consistent */
    const hOrig  = document.createElement("input");
    hOrig.className = "item-original";
    hOrig.type  = "hidden";
    hOrig.value = "0";
    grid.appendChild(hOrig);

    const hFinal = document.createElement("input");
    hFinal.className = "item-final";
    hFinal.type  = "hidden";
    hFinal.value = "0";
    grid.appendChild(hFinal);
  }

  /* Inclusions: hidden checkbox always-checked so getItems reads included=true */
  const hCheck = document.createElement("input");
  hCheck.className = "item-included";
  hCheck.type  = "hidden";
  hCheck.value = type === "inclusion" ? "1" : "0";
  grid.appendChild(hCheck);

  cardBody.appendChild(grid);
  card.appendChild(cardBody);

  /* ── Collapsed service name preview (visible when folded) ── */
  const collapsedPreview = document.createElement("div");
  collapsedPreview.className = "item-collapsed-preview";
  card.appendChild(collapsedPreview);

  /* Update collapsed preview text when service input changes */
  const updateCollapsedPreview = () => {
    const name = iService.value.trim();
    collapsedPreview.textContent = name || "(unnamed service)";
  };
  updateCollapsedPreview();
  iService.addEventListener("input", updateCollapsedPreview);

  /* ── Toggle logic ── */
  let isExpanded = false;

  const setExpanded = (expanded) => {
    isExpanded = expanded;
    card.classList.toggle("is-collapsed", !expanded);
    toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  setExpanded(false);

  toggleBtn.addEventListener("click", () => setExpanded(!isExpanded));
  /* Clicking the collapsed preview row also expands */
  collapsedPreview.addEventListener("click", () => setExpanded(true));
  cardHeader.addEventListener("click", (e) => {
    /* Only trigger collapse from the header itself, not its child buttons */
    if (e.target === cardHeader || e.target === badge) {
      setExpanded(!isExpanded);
    }
  });

  /* Wire all visible inputs to renderPreview */
  card.querySelectorAll("input:not([type=hidden]), textarea").forEach((input) => {
    input.addEventListener("input",  App.renderPreview);
    input.addEventListener("change", App.renderPreview);
  });

  return card;
};

/* ── Public: add a row to the list ───────────────────────── */
App.addItem = (item = {}) => {
  const card = App.buildItemCard(item);
  App.$("itemsList").appendChild(card);
  App.renderPreview();
};

/* ── Re-read inclusions: hidden checkbox value "1" → included=true */
/* Override getItems to handle hidden checkbox correctly */
App.getItems = () => {
  return [...document.querySelectorAll(".item-card")].map((card) => {
    const type = card.dataset.type || "inclusion";
    const isInclusion = type === "inclusion";

    const finalPrice = isInclusion
      ? 0
      : Number(card.querySelector(".item-final")?.value) || 0;

    return {
      type,
      service:       card.querySelector(".item-service")?.value.trim() || "",
      description:   card.querySelector(".item-description")?.value.trim() || "",
      details:       (card.querySelector(".item-details")?.value || "")
                       .split("\n").map(x => x.trim()).filter(Boolean),
      originalPrice: isInclusion ? 0 : Number(card.querySelector(".item-original")?.value) || 0,
      finalPrice,
      included:      isInclusion,
      total:         finalPrice
    };
  });
};