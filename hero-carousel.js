(() => {
  'use strict';
  const carousel = document.querySelector('.home-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.home-carousel-slide')];
  const tabs = [...carousel.querySelectorAll('[data-feature-slide]')];
  let current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    carousel.dataset.feature = current === 0 ? 'wall' : 'report';
    slides.forEach((slide, i) => { slide.hidden = i !== current; slide.inert = i !== current; });
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === current)));
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(i));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      show(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
      tabs[current].focus();
    });
  });
  carousel.querySelectorAll('[data-feature-direction]').forEach(button => button.addEventListener('click', () => show(current + Number(button.dataset.featureDirection))));
  show(0);
})();
