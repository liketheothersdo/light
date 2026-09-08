document.addEventListener('DOMContentLoaded', () => {
  let index = 0;

  document
    .querySelectorAll('#page-error-404 .error-404__copy span, #page-error-404 .error-404__title, #page-error-404 .error-404__eyebrow')
    .forEach((el) => {
      el.style.setProperty('--delay', `-${index * 0.35}s`);
      index++;
    });
});