/* ============================================================
   previewRenderer.js
   Renders the live two-page quotation preview.

   Row rendering by type:
   "main"       — bold header row with pricing
   "inclusion"  — green-left-border row, shows "Included"
   "additional" — dashed-top row with pricing
   ============================================================ */

App.shouldRenderItem = (item) => {
  // Render any row with a non-empty service name
  return Boolean(item.service && item.service.trim() !== "");
};

App.renderAmount = (item) => {
  if (item.included) return `<span class="final-price">Included</span>`;
  if (!item.finalPrice && !item.originalPrice) return `<span style="color:#bbb;font-style:italic;font-size:10px;">—</span>`;

  return `
    ${item.originalPrice ? `<span class="old-price">${App.peso.format(item.originalPrice)}</span>` : ""}
    ${item.finalPrice    ? `<span class="final-price">${App.peso.format(item.finalPrice)}</span>`  : ""}
    ${item.originalPrice && item.finalPrice && item.originalPrice !== item.finalPrice
      ? `<span class="discount-note">(discounted)</span>` : ""}
  `;
};

App.renderDetails = (details) => {
  if (!details || !details.length) return "";
  return `<ul class="details-list">${details.map((d) => `<li>${App.esc(d)}</li>`).join("")}</ul>`;
};

App.renderTableRow = (item) => {
  const type = item.type || (item.included ? "inclusion" : "additional");

  if (type === "main") {
    return `
      <tr style="background:#F5F5F3;">
        <td class="service-name" style="border-left:3px solid #0D0D0D;padding-left:8px;">
          ${App.esc(item.service || "VR Booth")}
        </td>
        <td>${App.esc(item.description || "")}</td>
        <td>${App.renderDetails(item.details)}</td>
        <td class="amount-cell">${App.renderAmount(item)}</td>
      </tr>`;
  }

  if (type === "inclusion") {
    return `
      <tr>
        <td class="service-name" style="border-left:3px solid #16A34A;padding-left:8px;font-weight:600;color:#374151;">
          ${App.esc(item.service || "")}
        </td>
        <td style="color:#555;">${App.esc(item.description || "")}</td>
        <td>${App.renderDetails(item.details)}</td>
        <td class="amount-cell"><span class="final-price" style="color:#16A34A;">Included</span></td>
      </tr>`;
  }

  // additional
  return `
    <tr style="border-top:1px dashed #DDD;">
      <td class="service-name" style="border-left:3px solid #D97706;padding-left:8px;">
        ${App.esc(item.service || "")}
      </td>
      <td>${App.esc(item.description || "")}</td>
      <td>${App.renderDetails(item.details)}</td>
      <td class="amount-cell">${App.renderAmount(item)}</td>
    </tr>`;
};

/* Interpolate {VALUE}, {COST}, {NUMBER OF DAYS/MONTHS} tokens */
App.interpolatePaymentTerms = (template, total) => {
  const paymentValue = (App.$("paymentTermsValue")?.value || "").trim();
  const paymentCost  = (App.$("paymentTermsCost")?.value  || "").trim();
  const paymentDays  = (App.$("paymentTermsDays")?.value  || "").trim();

  return template
    .replace(/\{VALUE\}/g,                  (paymentValue || "100") + "%")
    .replace(/\{COST\}/g,                   paymentCost  || App.peso.format(total))
    .replace(/\{NUMBER OF DAYS\/MONTHS\}/g, paymentDays  || "two (2) months")
    .replace(/\{NUMBER_OF_DAYS\}/g,         paymentDays  || "two (2) months");
};

App.renderPreview = () => {
  const data  = App.getValues();
  const items = App.getItems().filter(App.shouldRenderItem);
  const total = items.reduce((sum, item) => sum + (item.included ? 0 : item.total), 0);

  const paymentTermsRaw = data.paymentTerms ||
    `The client shall settle {VALUE} of the total contract price amounting to {COST} (${App.numberToWords(total)}) immediately upon confirmation or {NUMBER OF DAYS/MONTHS} prior to the event date, whichever comes first.`;

  const paymentTermsRendered = App.interpolatePaymentTerms(paymentTermsRaw, total);

  App.$("quotationPreview").innerHTML = `
    <section class="quotation-page">
      <img class="document-logo" src="${App.logoPath}" alt="VRXE Logo" />
      <div class="doc-head">
        <div class="client-box">
          <span class="to">TO:</span>
          <span class="client-lines">
            <strong>${App.esc(data.clientName || "Client Name")}</strong><br>
            ${App.esc(data.clientCompany || "Company")}<br>
            ${App.esc(data.clientAddress || "Client Address")}<br>
            ${App.esc(data.clientContact || "Contact No.")}
          </span>
        </div>
        <div class="ref-box">
          <div class="ref-label">Reference No.</div><div class="ref-value">${App.esc(data.quoteCode || "Reference No.")}</div>
          <div class="ref-label">Quotation Date</div><div class="ref-value">${data.quoteDate ? App.formatDateShort(data.quoteDate) : "Quotation Date"}</div>
        </div>
      </div>
      <div class="service-strip">
        <strong>Service Availed:</strong>
        <div class="service-value">${App.esc(data.serviceAvailed || "Service Availed")} &nbsp;&nbsp; | &nbsp;&nbsp; ${App.esc(data.servicePeriod || "Service Period")}</div>
      </div>

      <table class="quote-table">
        <thead>
          <tr>
            <th style="width:19%">Service</th>
            <th style="width:24%">Description</th>
            <th>Details</th>
            <th class="amount-head" style="width:22%">Amount<br><span style="font-weight:400">(Per Day Event)</span></th>
          </tr>
        </thead>
        <tbody>
          ${items.map(App.renderTableRow).join("")}
        </tbody>
      </table>

      <div class="total-box">
        <span>Total Amount Due:</span><span>${App.peso.format(total)}</span>
        <span class="words">In Words: ${App.esc(App.numberToWords(total))}</span>
      </div>
      <div class="cont-note">(cont. at the next page)</div>
      <div class="page-no">page 1 of 2</div>
    </section>

    <section class="quotation-page">
      <img class="document-logo" src="${App.logoPath}" alt="VRXE Logo" />
      <div class="doc-head">
        <div class="client-box">
          <span class="to">TO:</span>
          <span class="client-lines">
            <strong>${App.esc(data.clientName || "Client Name")}</strong><br>
            ${App.esc(data.clientCompany || "Company")}<br>
            ${App.esc(data.clientAddress || "Client Address")}<br>
            ${App.esc(data.clientContact || "Contact No.")}
          </span>
        </div>
        <div class="ref-box">
          <div class="ref-label">Reference No.</div><div class="ref-value">${App.esc(data.quoteCode || "Reference No.")}</div>
          <div class="ref-label">Quotation Date</div><div class="ref-value">${data.quoteDate ? App.formatDateShort(data.quoteDate) : "Quotation Date"}</div>
        </div>
      </div>

      <div class="terms-title">TERMS AND CONDITIONS</div>
      <div class="terms-grid">
        <div class="term-label">Service Details</div>
        <div class="term-content">
          <div class="kv"><strong>Date:</strong><span>${data.eventDate ? App.formatDateShort(data.eventDate) : "Event Date"}</span></div>
          <div class="kv"><strong>Time:</strong><span>${App.esc(data.eventTime || "Event Time")}</span></div>
          <div class="kv"><strong>Venue:</strong><span>${App.esc(data.eventVenue || "Event Venue")}</span></div>
          <div class="kv"><strong>Event:</strong><span>${App.esc(data.eventName || "Event Name")}</span></div>
          <div class="kv"><strong>Service:</strong><span>${App.esc(data.eventService || "Event Service")}</span></div>
        </div>

        <div class="term-label">Price</div>
        <div class="term-content">${App.esc(data.vatNote || "VAT Note")}</div>

        <div class="term-label">Payment Terms</div>
        <div class="term-content">${App.nl2br(paymentTermsRendered)}</div>

        <div class="term-label">Payment Details</div>
        <div class="term-content">
          The payment shall be paid to the following account:<br>
          <div class="kv"><strong>BANK / E-WALLET</strong><span>${App.esc(data.paymentBank || "Payment Account Type")}</span></div>
          <div class="kv"><strong>ACCOUNT NUMBER</strong><span>${App.esc(data.paymentAccount || "Account Number")}</span></div>
        </div>

        <div class="term-label">Labor &amp; Inclusions</div>
        <div class="term-content">${App.nl2br(data.laborTerms || "Labor & Inclusions")}</div>

        <div class="term-label">Cancellation Policy</div>
        <div class="term-content">${App.nl2br(data.cancellationPolicy || "Cancellation Policy")}</div>

        <div class="term-label">Service Extension</div>
        <div class="term-content">If the service provider will be required to extend the service hours, extension of service will be charged <strong>${App.peso.format(Number(data.extensionRate) || 0)}</strong> per hour.</div>

        <div class="term-label">Damage Liability</div>
        <div class="term-content">${App.nl2br(data.damageLiability || "Damage Liability")}</div>

        <div class="term-label">Booking Requirements</div>
        <div class="term-content">${App.nl2br(data.bookingRequirements || "Booking Requirements")}</div>
      </div>

      <div class="rule"></div>
      <p class="conforme-text">In placing this order, I hereby agree to the Terms &amp; Conditions stated above:</p>
      <div class="sign-row">
        <div>
          <p class="sign-caption">CONFORME:</p>
          <div class="sign-line"><strong>${App.esc(data.clientName || "Client Name")}</strong><br>${App.esc(data.clientCompany || "Company")}</div>
        </div>
        <div>
          <p class="sign-caption">DATE SIGNED:</p>
          <div class="sign-line"></div>
        </div>
      </div>
      <div class="small-footer">This document is confidential and intended solely for the named recipient. It may not be shared, reproduced, or disclosed to any third party without the prior written consent of the service provider.</div>
      <div class="page-no">page 2 of 2</div>
    </section>
  `;

  if (typeof App.updateTabProgress === "function") {
    App.updateTabProgress();
  }
};
