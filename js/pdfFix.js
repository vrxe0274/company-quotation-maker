/* ============================================================
   pdfFix.js — Fixes PDF export quality on mobile.

   Root cause:
     html2canvas v1.4.x inherits CSS transforms from parent
     elements. On mobile the preview canvas is scaled down
     (transform: scale(0.3–0.5)) so html2canvas captures a tiny
     version of each page and jsPDF stretches it to A4, producing
     a blurry / corrupted result. On desktop the scale is near 1
     so the issue isn't visible there.

   Fix (wraps the existing App.downloadPdf — does not modify pdf.js):
     1. Save the current preview scale.
     2. Reset --preview-scale to 1 on #previewCanvas so
        html2canvas sees transform:scale(1) = no distortion.
     3. Add a body class that removes overflow clipping on all
        ancestor scroll containers so pages aren't cut off.
     4. Call the original App.downloadPdf (html2canvas → jsPDF).
     5. Restore the original scale and remove the body class.
   ============================================================ */
(function () {
  "use strict";

  /* pdf.js loads just before this file, so App.downloadPdf already
     exists by the time this IIFE runs — no polling needed.       */
  if (!window.App || typeof App.downloadPdf !== "function") {
    console.warn("pdfFix: App.downloadPdf not found — skipping patch.");
    return;
  }

  var original = App.downloadPdf;

  App.downloadPdf = async function () {
    var canvas     = document.getElementById("previewCanvas");
    var savedScale = App.state ? App.state.previewScale : 1;
    var savedFit   = App.state ? App.state.isFitMode   : true;

    /* ── 1. Reset transform: capture at native 794 × 1123 px ── */
    if (canvas) {
      canvas.style.setProperty("--preview-scale", "1");
      /* Also set explicit dimensions so the CSS calc() resolves
         to exactly 794 / 2310 regardless of previous var value. */
      canvas.style.width     = "794px";
      canvas.style.minHeight = "2310px";
    }

    /* ── 2. Expand overflow containers ── */
    document.body.classList.add("vrxe-pdf-rendering");

    try {
      await original.call(this);
    } finally {
      /* ── 3. Restore preview scale and remove body class ── */
      document.body.classList.remove("vrxe-pdf-rendering");

      if (canvas) {
        /* Clear the inline overrides so CSS vars take over again */
        canvas.style.width     = "";
        canvas.style.minHeight = "";
      }

      /* Re-apply the saved scale through the official helper so
         the zoom-level label and state are also restored.       */
      if (typeof App.applyPreviewScale === "function") {
        App.applyPreviewScale(savedScale, savedFit);
      }
    }
  };

})();
