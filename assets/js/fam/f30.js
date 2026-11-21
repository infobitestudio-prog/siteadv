/* Família f30 · Executivo: sombra do cabeçalho ao rolar, indicadores que contam e entradas discretas. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f30')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var onScroll = function () { body.classList.toggle('ex-scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (reduce || !('IntersectionObserver' in window)) return;

  function count(el) {
    var m = /^(\D*?)(\d+)(.*)$/.exec(el.textContent.trim()); if (!m) return;
    var end = +m[2], isYear = end > 1900 && end < 2100, from = isYear ? end - 25 : 0, t0 = null;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = m[1] + Math.round(from + (end - from) * e) + m[3]; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var co = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { co.unobserve(x.target); count(x.target); } }); }, { threshold: .6 });
  document.querySelectorAll('[data-ex-count]').forEach(function (c) { co.observe(c); });

  body.classList.add('ex-js');
  var sel = '.ex-shead, .ex-tr:not(.ex-th), .ex-process li, .ex-tool, .ex-about > *, .ex-gal figure, .ex-card, .ex-conv-list, .ex-rev-score, .ex-review, .ex-faq, .ex-help, .ex-cta > *, ' +
    '.section-head, .area-num li, .tool, .person, .side-box, .calc-box, .calc-result, .form-box, .gallery-item, .contact-info, .cta-in > div, .igf-post';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.ex-hero, .page-head, .profile-head'); });
  var n = new Map();
  els.forEach(function (el) { var p = el.parentElement, k = n.get(p) || 0; n.set(p, k + 1); el.classList.add('ex-rv'); el.style.setProperty('--d', Math.min(k, 8) * 50 + 'ms'); });
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('ex-in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  els.forEach(function (el) { io.observe(el); });
})();
