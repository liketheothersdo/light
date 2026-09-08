function initLenis() {
  const lenis = new Lenis({
    wrapper: document.querySelector(".caroussel"),
    content: document.querySelector(".caroussel-trail"),
    smoothWheel: true,
    lerp: 0.1,
    direction: "horizontal",
    gestureDirection: "horizontal",
    orientation: "horizontal"
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenis;
}
/*
class SplitTextAnimator {
  constructor(blockElement) {
    this.$el = $(blockElement);
    this.cells = [];
    this.events = {
      beforeAnimate: [],
      onHide: []
    };

    this.init();
  }

  init() {
    this.$el.attr("data-splittext", true);
    this.splitText();
    this.animateText();
  }

  splitText() {
    const $texts = this.$el.find("span");
    $texts.each((i, item) => {
      const split = new SplitText(item, { type: "chars" });
      this.cells[i] = split;
    });
  }

  animateText(duration = 1) {
    this.triggerEvent("beforeAnimate");
    this.cells.forEach((item, i) => {
      const chars = item.chars;
      gsap.fromTo(
        chars,
        {
          "will-change": "transform",
          transformOrigin: "0% 50%",
          yPercent: 110
        },
        {
          duration,
          ease: "expo",
          yPercent: 0,
          stagger: 0.042,
          delay: 0 + i * 0.25
        }
      );
    });
  }

  hide(duration = 1) {
    this.cells.forEach((item, i) => {
      const chars = item.chars;
      gsap.to(chars, {
        duration,
        ease: "expo",
        yPercent: 110,
        stagger: 0.042,
        delay: 0 + i * 0.25,
        onComplete: () => {
          if (i === this.cells.length - 1) {
            this.triggerEvent("onHide");
          }
        }
      });
    });
  }

  on(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName].push(callback);
    }
  }

  triggerEvent(eventName) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => callback(this));
    }
  }
}
*/
$(document).ready(function () {
  const lenis = initLenis();
  let running = false;
  $(".caroussel-item").on("click", function () {
    if (running) return;
    const $clickedImg = $(this).find("img");
    // Navigate to slide
    const total = $(".caroussel-item").length;
    const position = $(this).data("id") && Number($(this).data("id")); // 0 index based
    const lastIndex = total - 1; // Use this for 0 based index

    let currentPercentage = position / total;

    let distance = 0;
    const totalWidth = lenis.limit;
    const itemWidth = $(this).outerWidth(true);

    if (position == 0) {
      distance = "start";
    } else if (position == lastIndex) {
      distance = "end";
    } else {
      distance = totalWidth * currentPercentage + itemWidth / 3;
    }

    running = true;

    lenis.scrollTo(distance, {
      duration: 0.6,
      onComplete: function () {
        lenis.stop();

        const imgSrc = $clickedImg.attr("src");
        const imgOffset = $clickedImg.offset();
        const imgWidth = $clickedImg.width();
        const imgHeight = $clickedImg.height();

        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        // Create a copy of the selected image
        const $pagePreview = $(
          `<div id="pagePreview" class="fullscreen-image-modal">
            <div class="modal-wrapper">
              <div class="modal-title title-spaced" stle="font-size: 1.3rem;"><span>Skin Spa New York</span></div>
            </div>
            <picture class="fullscreen-image">
              <img src="${imgSrc}" alt="">
              <div class="img-overlay"></div>
            </picture>
           </div>`
        ).appendTo("body");

        const splitTextAnimator =
          typeof SplitTextAnimator !== "undefined" &&
          new SplitTextAnimator("#pagePreview .modal-title", false);

        if (splitTextAnimator) {
          splitTextAnimator.on("beforeAnimate", (component) => {
            component.$el.css("opacity", 1);
          });

          splitTextAnimator.on("onHide", (component) => {
            component.$el.css("opacity", 0);
          });
        }

        // Apply position and original size of the image
        $pagePreview.css({
          position: "fixed",
          top: imgOffset.top - $(window).scrollTop(),
          left: imgOffset.left - $(window).scrollLeft(),
          width: imgWidth,
          height: imgHeight,
          zIndex: 1000,
          cursor: "pointer"
        });

        // Animation timeline
        const tl = gsap.timeline({
          onComplete: function () {
            running = false;
            if (splitTextAnimator) splitTextAnimator.init();
           
            $("body").addClass("no-scroll");
          }
        });

        // animate the other cards
        tl.to($(".tile img").not($clickedImg), {
          y: -400,
          duration: 0.5,
          ease: "power2.inOut",
          stagger: 0.1
        }).to(
          $(".tile img").not($clickedImg),
          {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            stagger: 0.1
          },
          "-=0.3"
        ); // Adjust this value to define the delay between animations

        // Full screen image once images are animated
          tl.to($pagePreview, {
          top: 0,
          left: 0,
          width: windowWidth,
          height: windowHeight,
          duration: 1,
          ease: "expo.inOut"
        })
          .to($($pagePreview).find(".img-overlay"), {
            opacity: 1,
            duration: 0.5,
            ease: "expo.inOut",
            stagger: 0.1
          })
          .to($($pagePreview).find(".modal-wrapper"), {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            stagger: 0.1
          });

        // Close the image with a click
        $pagePreview.on("click", function () {
          if (running) return;
          running = true;

          const closeTl = gsap.timeline({
            onComplete: function () {
              lenis.start();
              $pagePreview.remove();
              // Remove class no-scroll from body
              $("body").removeClass("no-scroll");
              running = false;
            }
          });

          // Animate the image to go back to its original size
          if (splitTextAnimator) splitTextAnimator.hide(0.5);
          closeTl
            .to($($pagePreview).find(".modal-wrapper"), {
              y: -48,
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
              stagger: 0.1
            })
            .to($($pagePreview).find(".img-overlay"), {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
              stagger: 0.1
            })
            .to($pagePreview, {
              top: imgOffset.top - $(window).scrollTop(),
              left: imgOffset.left - $(window).scrollLeft(),
              width: imgWidth,
              height: imgHeight,
              duration: 1,
              ease: "expo.inOut"
            });

          // Animate images once they are back to their original format
          closeTl.to(
            $(".tile img").not($clickedImg),
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power2.inOut",
              stagger: 0.1
            },
            "-=0.5"
          ); // Adjust with valut to overlap animations if needed
        });
      }
    });
  });
});
