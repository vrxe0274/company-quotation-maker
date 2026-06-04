App.applyPreviewScale = (scale, fitMode = false) => {
  App.state.previewScale = App.clamp(scale, 0.25, 3);
  App.state.isFitMode = fitMode;

  App.$("previewCanvas").style.setProperty("--preview-scale", App.state.previewScale.toFixed(3));
  App.$("zoomLevel").textContent = fitMode ? "Fit" : `${Math.round(App.state.previewScale * 100)}%`;
};

App.fitPreviewToPanel = () => {
  const scroll = App.$("previewScroll");
  const availableWidth = scroll.clientWidth - 28;
  const scale = Math.min(availableWidth / 794, 1);
  App.applyPreviewScale(scale, true);
};

App.zoomPreview = (delta) => {
  App.applyPreviewScale(App.state.previewScale + delta, false);
};
