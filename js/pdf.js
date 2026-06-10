App.downloadPdf = async () => {
  const canvas     = document.getElementById("previewCanvas");
  const savedScale = App.state ? App.state.previewScale : 1;
  const savedFit   = App.state ? App.state.isFitMode   : true;

  /* Reset transform so html2canvas captures at native 794×1123 px.
     On mobile the preview is scaled down (0.3–0.5×); without this
     fix html2canvas inherits the transform and produces a blurry PDF. */
  if (canvas) {
    canvas.style.setProperty("--preview-scale", "1");
    canvas.style.width     = "794px";
    canvas.style.minHeight = "2310px";
  }
  document.body.classList.add("vrxe-pdf-rendering");

  try {
    const { jsPDF } = window.jspdf;
    const pages      = [...document.querySelectorAll(".quotation-page")];
    const pdf        = new jsPDF("p", "mm", "a4");
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const cvs = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0
      });
      const imgData = cvs.toDataURL("image/png");
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    }

    const safeCode = (App.$("quoteCode").value || "VRXE-Quotation").replace(/[^a-z0-9-]/gi, "_");
    pdf.save(`${safeCode}.pdf`);
  } finally {
    document.body.classList.remove("vrxe-pdf-rendering");

    if (canvas) {
      canvas.style.width     = "";
      canvas.style.minHeight = "";
    }
    if (typeof App.applyPreviewScale === "function") {
      App.applyPreviewScale(savedScale, savedFit);
    }
  }
};
