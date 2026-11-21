/* Família f18 · Retrô */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f18')) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // Entrada com "pulo" (home e páginas internas)
  $$('.area-card2, .tool, .person, .side-box, .form-box, .calc-box, .ag-step, .ag-sum-card, .gallery-item, .cv-list li, .igf-post, .jr-step, .timeline li, .verify-box, .service-list li, .profile-photo, .profile-copy').forEach(function (el) { el.setAttribute('data-f18-rv', ''); });
  var els = $$('[data-f18-rv]');
  els.forEach(function (el) {
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sib, 6) * 70 + 'ms');
  });
  document.documentElement.classList.add('f18-js');
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach(function (el) { io.observe(el); });

})();
