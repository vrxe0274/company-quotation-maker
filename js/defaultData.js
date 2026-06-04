App.defaultServices = [
  /* ── Main product: always has pricing ── */
  {
    type:        "main",
    service:     "VR Booth",
    description: "",
    details:     [],
    originalPrice: "",
    finalPrice:    ""
  },

  /* ── Inclusions: no pricing, always shown as "Included" ── */
  { type: "inclusion", service: "VR Application",  description: "", details: [], included: true },
  { type: "inclusion", service: "Accessories",      description: "", details: [], included: true },
  { type: "inclusion", service: "Sanitization",     description: "", details: [], included: true },
  { type: "inclusion", service: "Labor",             description: "", details: [], included: true },
  { type: "inclusion", service: "Transportation",    description: "", details: [], included: true },
  { type: "inclusion", service: "VR Peripherals",   description: "", details: [], included: true },
  { type: "inclusion", service: "Ingress",           description: "", details: [], included: true },
  { type: "inclusion", service: "Egress",            description: "", details: [], included: true },

  /* ── Additionals: separate pricing, optional ── */
  { type: "additional", service: "*VR Mock Demo", description: "", details: [], originalPrice: "", finalPrice: "" },
  { type: "additional", service: "*Additional",   description: "", details: [], originalPrice: "", finalPrice: "" }
];

App.defaultFields = {
  vatNote:              "Quoted VR Service is in Philippine Peso and are exclusive of 12% VAT.",
  paymentBank:          "GCASH",
  paymentAccount:       "09760244320",
  extensionRate:        "1000",
  paymentTerms:         "The client shall settle {VALUE} of the total contract price amounting to {COST} immediately upon confirmation or {NUMBER OF DAYS/MONTHS} months prior to the event date, whichever comes first.",
  laborTerms:           "The amount indicated in this quotation does not include additional labor, unless otherwise stated.",
  cancellationPolicy:   "Upon signing the Conforme / Quotation, all orders are considered firm and non-refundable.",
  damageLiability:      "Client is responsible for any loss or damage to VR units or accessories while in use. Repair or replacement costs must be settled immediately.",
  bookingRequirements:  "Full confirmation and required documents must be completed at least two (2) months prior to the event date, whichever comes first."
};
