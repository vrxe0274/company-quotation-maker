const ADMIN_PASSWORD = "vrxeadmin";
App.currentAdminTab = "payment";

App.openAdminModal = () => {
  const modal         = App.$("adminModal");
  const passwordInput = App.$("adminPasswordInput");
  const passwordError = App.$("adminPasswordError");

  if (!modal) return;

  App.showAdminPasswordView();
  if (passwordInput) passwordInput.value = "";
  if (passwordError) passwordError.textContent = "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => passwordInput?.focus(), 40);
};

App.closeAdminModal = () => {
  const modal = App.$("adminModal");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  App.renderPreview();
};

App.showAdminPasswordView = () => {
  App.$("adminPasswordView")?.removeAttribute("hidden");
  App.$("adminEditorView")?.setAttribute("hidden", "");
};

App.showAdminEditorView = () => {
  App.$("adminPasswordView")?.setAttribute("hidden", "");
  App.$("adminEditorView")?.removeAttribute("hidden");
  App.setAdminModalTab("payment");
  setTimeout(() => App.$("vatNote")?.focus(), 40);
};

App.setAdminModalTab = (tabName) => {
  App.currentAdminTab = tabName === "terms" ? "terms" : "payment";

  document.querySelectorAll(".modal-tab-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.adminTab === App.currentAdminTab);
  });

  App.$("adminPaymentPanel")?.classList.toggle("is-active", App.currentAdminTab === "payment");
  App.$("adminTermsPanel")?.classList.toggle("is-active",   App.currentAdminTab === "terms");
};

App.unlockAdminModal = () => {
  const passwordInput = App.$("adminPasswordInput");
  const passwordError = App.$("adminPasswordError");
  const password      = passwordInput?.value || "";

  if (password !== ADMIN_PASSWORD) {
    if (passwordError) passwordError.textContent = "Incorrect password. Please try again.";
    passwordInput?.focus();
    passwordInput?.select();
    return;
  }

  if (passwordError) passwordError.textContent = "";
  App.showAdminEditorView();
};

App.bindAdminModal = () => {
  App.$("openAdminSettingsBtn")?.addEventListener("click", App.openAdminModal);
  App.$("closeAdminModalBtn")?.addEventListener("click", App.closeAdminModal);
  App.$("cancelAdminModalBtn")?.addEventListener("click", App.closeAdminModal);
  App.$("unlockAdminBtn")?.addEventListener("click", App.unlockAdminModal);

  document.querySelectorAll(".modal-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => App.setAdminModalTab(btn.dataset.adminTab));
  });

  App.$("adminPasswordInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") App.unlockAdminModal();
  });

  document.querySelectorAll(".close-admin-editor").forEach((btn) => {
    btn.addEventListener("click", App.closeAdminModal);
  });

  App.$("adminModal")?.addEventListener("click", (e) => {
    if (e.target === App.$("adminModal")) App.closeAdminModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && App.$("adminModal")?.classList.contains("is-open")) {
      App.closeAdminModal();
    }
  });

  /* Wire token fill-in fields to re-render preview live */
  ["paymentTermsValue", "paymentTermsDays", "paymentTermsCost"].forEach((id) => {
    const field = App.$(id);
    field?.addEventListener("input",  App.renderPreview);
    field?.addEventListener("change", App.renderPreview);
  });
};
