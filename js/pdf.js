App.downloadPdf = async () => {
  const { jsPDF } = window.jspdf;
  const pages = [...document.querySelectorAll(".quotation-page")];
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  }

  const safeCode = (App.$("quoteCode").value || "VRXE-Quotation").replace(/[^a-z0-9-]/gi, "_");
  pdf.save(`${safeCode}.pdf`);
};
