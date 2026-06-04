window.App = window.App || {};

App.logoPath = "assets/vrxe-logo.png";
App.peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP"
});

App.fields = [
  "quoteCode", "quoteDate", "serviceAvailed", "servicePeriod", "preparedBy",
  "clientName", "clientCompany", "clientContact", "clientAddress",
  "eventDate", "eventTime", "eventVenue", "eventName", "eventService",
  "vatNote", "paymentBank", "paymentAccount", "extensionRate", "paymentTerms",
  // Payment Terms token fill-in fields
  "paymentTermsValue", "paymentTermsDays", "paymentTermsCost",
  "laborTerms", "cancellationPolicy", "damageLiability", "bookingRequirements",
  "servicesVerified"
];

App.tabOrder = ["quote", "client", "event", "services"];

App.state = {
  activeTab:    "quote",
  previewScale: 1,
  isFitMode:    true
};
