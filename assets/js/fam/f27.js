/* Família f27 · Papel: traços SVG que se desenham ao entrar na tela e papéis que assentam na mesa. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f27')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  // Prepara os traços: cada caminho começa "apagado" e é desenhado quando aparece
  var draws = [].slice.call(document.querySelectorAll('[data-pa-draw]'));
  draws.forEach(function (svg) {
    svg.querySelectorAll('path').forEach(function (p) {
      var len = 0; try { len = Math.ceil(p.getTotalLength()) + 2; } catch (e) { len = 400; }
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    });
    svg.getBoundingClientRect(); svg.classList.add('pa-draw-ready');
  });
  var dio = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { var t = x.target; setTimeout(function () { t.classList.add('pa-drawn'); }, t.closest('.pa-hero') ? 700 : 150); dio.unobserve(t); } });
  }, { threshold: .4 });
  draws.forEach(function (d) { dio.observe(d); });

  // Papéis que assentam (fichas, notas, polaroides, cartas)
  body.classList.add('pa-js');
  var sel = '.pa-shead, .pa-card, .pa-step, .pa-ticket, .pa-sheet, .pa-about-side > *, .pa-member, .pa-receipt, .pa-sticky, .pa-notebook, .pa-postcard, .pa-facts-in, ' +
    '.section-head, .area-row, .tool, .person, .side-box, .gallery-item, .calc-box, .calc-result, .form-box, .cta-in, .principles li, .igf-post';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.pa-hero, .page-head, .profile-head'); });
  var count = new Map();
  els.forEach(function (el) {
    var p = el.parentElement, n = count.get(p) || 0; count.set(p, n + 1);
    el.classList.add('pa-rv'); el.style.setProperty('--d', Math.min(n, 5) * 90 + 'ms');
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('pa-in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
  els.forEach(function (el) { io.observe(el); });
})();
