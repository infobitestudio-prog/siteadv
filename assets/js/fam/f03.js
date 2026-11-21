// Família f03 · Brutal: blocos que "batem" no lugar ao entrar na tela.
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f03')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('x-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(i, 8) * 60) + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  document.querySelectorAll('.x-rv').forEach(function (el) { io.observe(el); });
})();
