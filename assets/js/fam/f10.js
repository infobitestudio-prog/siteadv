/* Família f10 · Painel: filtro da tabela de serviços e entrada dos cartões. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f10')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-pn-tab]').forEach(function (b, _, all) {
    b.addEventListener('click', function () {
      var t = b.closest('.pn-table-card').querySelector('[data-pn-table]');
      all.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (t) t.classList.toggle('pn-all', b.getAttribute('data-pn-tab') === 'all');
    });
  });

  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('pn-ready');
  var els = [].slice.call(document.querySelectorAll('.pn-sec .pn-head, .pn-sec .pn-card, .pn-banner, .pn-alert'));
  els.forEach(function (el, i) { el.classList.add('pn-rv'); el.style.transitionDelay = ((i % 4) * 60) + 'ms'; });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pn-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
})();
