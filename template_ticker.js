(function (global) {
  "use strict";

  function Ticker(el, options) {
    this.el = el;
    this.speed = Number(options.speed) || 0;
    this.pauseOnHover = !!options.pauseOnHover;
    this.itemSelector = options.item || "div";
    this.offset = 0;
    this.paused = 0;
    this.running = false;
    this.rafId = null;
    this.lastTime = 0;
    this.firstItemWidth = 0;
    this.destroyed = false;
    this.build();
    this.bind();
    this._tick = this.tick.bind(this);
    this.resume();
  }

  Ticker.prototype.build = function () {
    var el = this.el;
    var track = document.createElement("div");
    var items = el.querySelectorAll(this.itemSelector);
    track.className = "js-ticker-track";
    el.classList.add("js-ticker", "active");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.add("js-ticker-item");
      track.appendChild(items[i]);
    }
    el.appendChild(track);
    this.track = track;
    if (this.speed > 0) {
      this.fill();
      this.measure();
    }
  };

  Ticker.prototype.fill = function () {
    var track = this.track;
    var count = track.children.length;
    if (count === 0) return;

    var containerWidth = this.el.offsetWidth;
    var itemWidth = track.children[0] ? track.children[0].offsetWidth : 0;
    var currentWidth = track.scrollWidth;
    var target = containerWidth + itemWidth;

    if (itemWidth === 0 || currentWidth >= target) return;

    var fragment = document.createDocumentFragment();
    var guard = 0;
    while (currentWidth < target && guard < 100 && count > 0) {
      for (var i = 0; i < count; i++) {
        fragment.appendChild(track.children[i].cloneNode(true));
        currentWidth += itemWidth;
      }
      guard++;
    }
    track.appendChild(fragment);
  };

  Ticker.prototype.measure = function () {
    var first = this.track.children[0];
    this.firstItemWidth = first ? first.offsetWidth : 0;
  };

  Ticker.prototype.tick = function (now) {
    if (!this.running) return;
    var dt = now - this.lastTime;
    this.lastTime = now;
    this.offset += (this.speed / 1000) * dt;
    if (this.firstItemWidth > 0 && this.offset >= this.firstItemWidth) {
      this.offset -= this.firstItemWidth;
    }
    this.track.style.transform =
      "translate3d(" + (-this.offset).toFixed(2) + "px,0,0)";
    this.rafId = requestAnimationFrame(this._tick);
  };

  Ticker.prototype.resume = function () {
    if (this.destroyed || this.speed <= 0 || this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._tick);
  };

  Ticker.prototype.pause = function () {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  Ticker.prototype.stop = function () {
    this.paused++;
    this.pause();
  };

  Ticker.prototype.start = function () {
    if (this.paused > 0) this.paused--;
    if (this.paused === 0) this.resume();
  };

  Ticker.prototype.destroy = function () {
    this.destroyed = true;
    this.pause();
    if (this._observer) {
      this._observer.disconnect();
    }
    if (this._hoverIn) {
      this.el.removeEventListener("mouseenter", this._hoverIn);
      this.el.removeEventListener("mouseleave", this._hoverOut);
    }
    if (this._resize) {
      global.removeEventListener("resize", this._resize);
    }
  };

  Ticker.prototype.bind = function () {
    var self = this;
    if (this.pauseOnHover && this.speed > 0) {
      this._hoverIn = function () {
        self.stop();
      };
      this._hoverOut = function () {
        self.start();
      };
      this.el.addEventListener("mouseenter", this._hoverIn);
      this.el.addEventListener("mouseleave", this._hoverOut);
    }
    if (this.speed > 0) {
      this._resize = function () {
        self.measure();
      };
      global.addEventListener("resize", this._resize);

      if ("IntersectionObserver" in global) {
        this._observer = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            self.resume();
          } else {
            self.pause();
          }
        });
        this._observer.observe(this.el);
      }
    }
  };

  global.AppTicker = {
    create: function (el, options) {
      return new Ticker(el, options || {});
    }
  };
})(window);