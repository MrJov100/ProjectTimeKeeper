document.addEventListener("DOMContentLoaded", function () {
  const splitter = document.getElementById("splitter");
  const container = document.querySelector(".viewer-container");
  const leftPanel = document.querySelector(".left-panel");
  const rightPanel = document.querySelector(".right-panel");

  let isDragging = false;

  const isMobile = () => window.innerWidth <= 768;

  splitter.addEventListener("mousedown", function (e) {
    isDragging = true;
    document.body.style.cursor = isMobile() ? "ns-resize" : "ew-resize";
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    if (isMobile()) {
      const containerHeight = container.offsetHeight;
      const topHeight = (e.clientY / containerHeight) * 100;
      const bottomHeight = 100 - topHeight;

      if (topHeight > 10 && bottomHeight > 10) {
        leftPanel.style.height = `${topHeight}%`;
        rightPanel.style.height = `${bottomHeight}%`;
      }
    } else {
      const containerWidth = container.offsetWidth;
      const leftWidth = (e.clientX / containerWidth) * 100;
      const rightWidth = 100 - leftWidth;

      if (leftWidth > 10 && rightWidth > 10) {
        leftPanel.style.width = `${leftWidth}%`;
        rightPanel.style.width = `${rightWidth}%`;
      }
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    document.body.style.cursor = "default";
  });

  // Reset ukuran saat resize layar (desktop ↔ mobile)
  window.addEventListener("resize", () => {
    if (isMobile()) {
      leftPanel.style.width = "100%";
      rightPanel.style.width = "100%";
      leftPanel.style.height = "50%";
      rightPanel.style.height = "50%";
    } else {
      leftPanel.style.height = "100%";
      rightPanel.style.height = "100%";
      leftPanel.style.width = "50%";
      rightPanel.style.width = "50%";
    }
  });
});
