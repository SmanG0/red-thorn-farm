/* ═══════════════════════════════════════════════════════════════
   RED THORN FARM — ENHANCEMENTS.JS

   TO REVERT: remove <script src="enhancements.js"> from HTML.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Enhancement gate ───────────────────────────────────────
     CSS hero/page-hero animations are gated on this class.
     Without JS, the class never appears → text always visible.
  ─────────────────────────────────────────────────────────────*/
  document.body.classList.add('rt-enhanced');


  /* ── Scroll progress bar ────────────────────────────────────
     Thin oxblood line at top that fills as you scroll.
  ─────────────────────────────────────────────────────────────*/
  var bar = document.createElement('div');
  bar.className = 'rt-progress';
  document.body.appendChild(bar);

  function updateProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();


  /* ── Scroll reveal ──────────────────────────────────────────
     JS adds .rt-reveal to matching elements, then observes
     each one. When 6% enters the viewport, .rt-visible fires.
     Siblings get a staggered transition-delay so grouped
     elements (pillars, cards) don't all pop in at once.
  ─────────────────────────────────────────────────────────────*/
  var groups = [
    /* Homepage */
    '.intro__lede',
    '.intro__body',
    '.pillars__cell',
    '.feature__media',
    '.feature__text',
    '.peek__head',
    '.peek__card',
    '.quote__inner',
    '.cta-band__inner',
    /* About */
    '.mag__text',
    '.mag__img',
    '.mag__pull blockquote',
    '.htimeline li',
    '.person-card',
    '.manifesto-grid li',
    /* Range */
    '.pc--hero',
    '.pc-grid .pc',
    '.pc-leberkase .pc',
    '.pc--wide',
    /* Order */
    '.products-section',
    '.checkout-section',
    '.cart-panel',
  ];

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('rt-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

  groups.forEach(function (selector) {
    var els = document.querySelectorAll(selector);
    els.forEach(function (el, i) {
      el.classList.add('rt-reveal');
      /* Stagger siblings: max 0.36s so it never feels slow */
      if (els.length > 1) {
        el.style.transitionDelay = Math.min(i * 0.09, 0.36) + 's';
      }
      io.observe(el);
    });
  });

})();
