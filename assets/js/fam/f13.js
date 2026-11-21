/* Família f13 · Suíço: linhas que se desenham ao entrar na tela. */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('fam-f13')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('f13-js');
  var els = document.querySelectorAll('.f13-in, .f13-sh');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .05 });
  els.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 60) + 'ms'; io.observe(el); });
})();
