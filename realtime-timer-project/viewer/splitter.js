document.addEventListener("DOMContentLoaded", function () {
  const splitter = document.getElementById("splitter");
  const container = document.querySelector(".viewer-container");
  const leftPanel = document.querySelector(".left-panel");
  const rightPanel = document.querySelector(".right-panel");

  let isDragging = false;
  const minLeftPx = 300; // Batas minimum lebar panel kiri (timer)

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
      const minTopPx = 200; // Batas minimum tinggi panel atas (timer)
      const topHeight = e.clientY;
      const bottomHeight = containerHeight - topHeight;

      if (topHeight >= minTopPx && bottomHeight >= 0) {
        const topPercent = (topHeight / containerHeight) * 100;
        const bottomPercent = 100 - topPercent;
        leftPanel.style.height = `${topPercent}%`;
        rightPanel.style.height = `${bottomPercent}%`;
      }
    } else {
      const containerWidth = container.offsetWidth;
      const leftWidthPx = e.clientX;
      const rightWidthPx = containerWidth - leftWidthPx;

      if (leftWidthPx >= minLeftPx && rightWidthPx >= 0) {
        const leftPercent = (leftWidthPx / containerWidth) * 100;
        const rightPercent = 100 - leftPercent;
        leftPanel.style.width = `${leftPercent}%`;
        rightPanel.style.width = `${rightPercent}%`;

        // Nonaktifkan interaksi dengan rightPanel jika terlalu kecil
        rightPanel.style.pointerEvents = rightPercent < 5 ? "none" : "auto";
      }
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    document.body.style.cursor = "default";
  });

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
