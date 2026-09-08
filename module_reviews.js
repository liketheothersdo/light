(function () {
  if (typeof window.AppTicker === "undefined") return;

  document.addEventListener("DOMContentLoaded", function () {
    var slider = document.querySelector(".testimonial-slider");
    if (!slider) return;

    var isMobile = window.innerWidth <= 767;
    var newsTicker;
    var isDragging = false;
    var startPosition = 0;
    var startY = 0;
    var dragOrigin = 0;
    var currentOffset = 0;

    function stopTicker() {
      if (newsTicker) newsTicker.stop();
    }

    function startTicker() {
      if (newsTicker) newsTicker.start();
    }

    function pointerStart(event) {
      isDragging = true;
      startPosition = event.touches ? event.touches[0].clientX : event.clientX;
      startY = event.touches ? event.touches[0].clientY : event.clientY;
      dragOrigin = currentOffset;
      stopTicker();
    }

    function pointerMove(event) {
      if (!isDragging) return;
      var position = event.touches
        ? event.touches[0].clientX
        : event.clientX;
      var posY = event.touches ? event.touches[0].clientY : event.clientY;
      var delta = position - startPosition;
      if (Math.abs(delta) > Math.abs(posY - startY)) {
        if (event.cancelable) event.preventDefault();
      } else {
        return;
      }
      var track = slider.querySelector(".js-ticker-track");
      if (!track) return;
      var maxOffset = Math.max(0, track.scrollWidth - slider.offsetWidth);
      currentOffset = dragOrigin + delta;
      currentOffset = Math.max(-maxOffset, Math.min(0, currentOffset));
      track.style.transform =
        "translate3d(" + currentOffset.toFixed(2) + "px,0,0)";
    }

    function pointerEnd() {
      if (isDragging) {
        isDragging = false;
        startTicker();
      }
    }

    if (isMobile) {
      slider.style.overflow = "hidden";
      slider.style.touchAction = "pan-y";
      slider.addEventListener("touchstart", pointerStart, { passive: true });
      slider.addEventListener("touchmove", pointerMove, { passive: false });
      slider.addEventListener("touchend", pointerEnd);
      slider.addEventListener("mousedown", pointerStart);
      slider.addEventListener("mousemove", pointerMove);
      slider.addEventListener("mouseup", pointerEnd);
    }

    newsTicker = AppTicker.create(slider, {
      speed: isMobile ? 0 : 50,
      pauseOnHover: true,
      item: ".three-column-cards-col"
    });

    if (isMobile) {
      currentOffset = 0;
      var track = slider.querySelector(".js-ticker-track");
      if (track) track.style.transform = "translate3d(0px,0,0)";
    }
  });
})();