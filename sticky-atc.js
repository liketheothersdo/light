/**
 * Sticky Add-to-Cart Bar
 *
 * Uses a button + AJAX cart request rather than a second /cart/add form.
 * This avoids interfering with Dawn's native primary product form.
 *
 * Requirements:
 * - #StickyATC
 * - #ProductDescription
 * - #StickyATCProductData
 * - data-main-product-form-id on #StickyATC
 */

document.addEventListener('DOMContentLoaded', () => {
  const stickyATC = document.getElementById('StickyATC');
  const productDescription = document.getElementById('ProductDescription');
  const stickyButton = document.getElementById('StickyATCButton');
  const stickyPrice = document.getElementById('StickyATCPrice');
  const stickyVariantTitle = document.getElementById('StickyATCVariant');
  const stickyImage = document.getElementById('StickyATCImage');
  const productDataScript = document.getElementById('StickyATCProductData');
  const mainProductFormId = stickyATC?.dataset.mainProductFormId;

  if (!stickyATC || !productDescription || !stickyButton) {
    console.warn('[Sticky ATC] Required elements were not found.');
    return;
  }

  /*
    Make the bar viewport-fixed even if the main-product section uses
    transform, containment, or sticky-layout behavior.
  */
  if (stickyATC.parentElement !== document.body) {
    document.body.appendChild(stickyATC);
  }

  const showStickyATC = () => {
    stickyATC.classList.add('is-visible');
    stickyATC.setAttribute('aria-hidden', 'false');
  };

  const hideStickyATC = () => {
    stickyATC.classList.remove('is-visible');
    stickyATC.setAttribute('aria-hidden', 'true');
  };

  const updateStickyVisibility = () => {
    const descriptionRect = productDescription.getBoundingClientRect();

    if (descriptionRect.top <= window.innerHeight * 0.55) {
      showStickyATC();
    } else {
      hideStickyATC();
    }
  };

  let visibilityFrame = null;

  const requestVisibilityUpdate = () => {
    if (visibilityFrame) return;

    visibilityFrame = window.requestAnimationFrame(() => {
      updateStickyVisibility();
      visibilityFrame = null;
    });
  };

  window.addEventListener('scroll', requestVisibilityUpdate, {
    passive: true
  });

  window.addEventListener('resize', requestVisibilityUpdate);

  let productData = null;
  let variants = [];

  if (productDataScript) {
    try {
      productData = JSON.parse(productDataScript.textContent);
      variants = Array.isArray(productData.variants)
        ? productData.variants
        : [];
    } catch (error) {
      console.warn('[Sticky ATC] Could not parse product JSON.', error);
    }
  }

  const originalImageSrc = stickyImage?.currentSrc || stickyImage?.src || '';
  const originalImageAlt = stickyImage?.alt || productData?.title || '';

  const getVariantById = (variantId) => {
    return variants.find((variant) => {
      return String(variant.id) === String(variantId);
    }) || null;
  };

  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney) {
      return window.Shopify.formatMoney(
        cents,
        window.money_format || '${{amount}}'
      );
    }

    return new Intl.NumberFormat(
      document.documentElement.lang || 'en-US',
      {
        style: 'currency',
        currency: window.Shopify?.currency?.active || 'USD'
      }
    ).format(Number(cents || 0) / 100);
  };

  const updateStickyImage = (variant) => {
    if (!stickyImage || !variant) return;

    const variantImage = variant.featured_image || variant.image || null;
    const imageSrc = variantImage?.src || variantImage?.url || '';

    if (imageSrc) {
      stickyImage.removeAttribute('srcset');
      stickyImage.removeAttribute('sizes');
      stickyImage.src = imageSrc;
      stickyImage.alt =
        variantImage.alt ||
        variant.title ||
        productData?.title ||
        '';

      return;
    }

    if (originalImageSrc) {
      stickyImage.src = originalImageSrc;
      stickyImage.alt = originalImageAlt;
    }
  };

  const updateStickyCTA = (variant) => {
    if (!variant?.id) return;

    const activeVariant = getVariantById(variant.id) || variant;

    stickyButton.dataset.variantId = activeVariant.id;

    if (stickyVariantTitle) {
      const isDefaultTitle = activeVariant.title === 'Default Title';

      stickyVariantTitle.textContent = isDefaultTitle
        ? ''
        : (activeVariant.title || '');

      stickyVariantTitle.hidden = isDefaultTitle;
    }

    if (stickyPrice && typeof activeVariant.price !== 'undefined') {
      stickyPrice.textContent = formatMoney(activeVariant.price);
    }

    /*
      Explicitly false is sold out. Missing availability stays enabled
      rather than falsely marking the variant unavailable.
    */
    const isAvailable =
      activeVariant.available !== false &&
      activeVariant.available !== 'false';

    stickyButton.disabled = !isAvailable;
    stickyButton.textContent = isAvailable
      ? 'Add to Cart'
      : 'Sold Out';

    updateStickyImage(activeVariant);
  };

  const getMainVariantInput = () => {
    if (mainProductFormId) {
      const mainForm = document.getElementById(mainProductFormId);
      const formInput = mainForm?.querySelector('input[name="id"]');

      if (formInput) return formInput;
    }

    return document.querySelector(
      'form[action*="/cart/add"] input[name="id"]'
    );
  };

  const syncFromMainProductForm = () => {
    const mainVariantInput = getMainVariantInput();

    if (!mainVariantInput?.value) return;

    const selectedVariant = getVariantById(mainVariantInput.value);

    if (selectedVariant) {
      updateStickyCTA(selectedVariant);
    } else {
      stickyButton.dataset.variantId = mainVariantInput.value;
    }
  };

  const requestVariantSync = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(syncFromMainProductForm);
    });
  };

  /*
    Observe, but never change, the main product form.
  */
  const mainVariantInput = getMainVariantInput();

  if (mainVariantInput) {
    const observer = new MutationObserver(requestVariantSync);

    observer.observe(mainVariantInput, {
      attributes: true,
      attributeFilter: ['value']
    });

    mainVariantInput.addEventListener('change', requestVariantSync);
    mainVariantInput.addEventListener('input', requestVariantSync);
  }

  document.addEventListener('variant:change', (event) => {
    if (event.detail?.variant?.id) {
      updateStickyCTA(event.detail.variant);
    } else {
      requestVariantSync();
    }
  });

  document.addEventListener('variant:changed', (event) => {
    if (event.detail?.variant?.id) {
      updateStickyCTA(event.detail.variant);
    } else {
      requestVariantSync();
    }
  });

  /*
    Adds the selected sticky variant directly to Shopify's AJAX cart.
  */
  stickyButton.addEventListener('click', async () => {
    const variantId = stickyButton.dataset.variantId;

    if (!variantId || stickyButton.disabled) return;

    const originalLabel = stickyButton.textContent;

    stickyButton.disabled = true;
    stickyButton.textContent = 'Adding…';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          id: Number(variantId),
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Cart request failed.');
      }

      window.location.href = '/cart';
    } catch (error) {
      console.error('[Sticky ATC] Could not add variant to cart.', error);
      stickyButton.disabled = false;
      stickyButton.textContent = originalLabel;
    }
  });

  updateStickyVisibility();
  syncFromMainProductForm();
});
