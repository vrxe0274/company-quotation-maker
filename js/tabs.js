App.requiredFieldsByTab = {
  quote:   ["quoteCode", "quoteDate", "serviceAvailed", "servicePeriod", "preparedBy"],
  client:  ["clientName", "clientCompany", "clientContact", "clientAddress"],
  event:   ["eventDate", "eventTime", "eventVenue", "eventName", "eventService"],
  payment: ["vatNote", "paymentBank", "paymentAccount", "extensionRate"],
  terms:   ["laborTerms", "cancellationPolicy", "damageLiability", "bookingRequirements"]
};

App.isFieldFilled = (fieldId) => {
  const field = App.$(fieldId);
  if (!field) return false;
  if (field.type === "checkbox") return field.checked;
  return field.value.trim() !== "";
};

App.isServiceSectionComplete = () => {
  if (!App.isFieldFilled("servicesVerified")) return false;
  if (typeof App.getItems !== "function") return false;

  const items = App.getItems();
  if (!items.length) return false;

  return items.some((item) => {
    if (typeof App.shouldRenderItem === "function" && !App.shouldRenderItem(item)) {
      return false;
    }
    const hasServiceName = item.service && item.service.trim() !== "";
    const hasIncluded    = Boolean(item.included);
    const hasPrice       = Number(item.originalPrice) > 0 || Number(item.finalPrice) > 0;
    return hasServiceName && (hasIncluded || hasPrice);
  });
};

App.isSectionComplete = (tabName) => {
  if (tabName === "services") return App.isServiceSectionComplete();
  const requiredFields = App.requiredFieldsByTab[tabName];
  if (!requiredFields) return false;
  return requiredFields.every(App.isFieldFilled);
};

App.updateTabProgress = () => {
  document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
    const tabName = btn.dataset.tab;
    const number  = btn.querySelector(".tab-number");
    if (!number) return;

    const tabIndex  = App.tabOrder.indexOf(tabName) + 1;
    const isComplete = App.isSectionComplete(tabName);

    number.textContent = isComplete ? "✓" : tabIndex;
    number.classList.toggle("is-complete", isComplete);
    btn.classList.toggle("is-complete", isComplete);
  });

  const adminButton = App.$("openAdminSettingsBtn");
  if (adminButton) {
    const number     = adminButton.querySelector(".tab-number");
    const isComplete = App.isSectionComplete("payment") && App.isSectionComplete("terms");
    if (number) {
      number.textContent = isComplete ? "✓" : "!";
      number.classList.toggle("is-complete", isComplete);
    }
    adminButton.classList.toggle("is-complete", isComplete);
  }
};

App.setActiveTab = (tabName) => {
  if (!App.tabOrder.includes(tabName)) return;
  App.state.activeTab = tabName;

  document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `tab-${tabName}`);
  });

  const currentIndex = App.tabOrder.indexOf(tabName);
  App.$("prevTabBtn").disabled = currentIndex === 0;
  App.$("nextTabBtn").textContent =
    currentIndex === App.tabOrder.length - 1 ? "Back to Start" : "Next";

  App.updateTabProgress();
};

App.goToNextTab = () => {
  const currentIndex = App.tabOrder.indexOf(App.state.activeTab);
  App.setActiveTab(App.tabOrder[(currentIndex + 1) % App.tabOrder.length]);
};

App.goToPrevTab = () => {
  const currentIndex = App.tabOrder.indexOf(App.state.activeTab);
  App.setActiveTab(App.tabOrder[Math.max(currentIndex - 1, 0)]);
};
