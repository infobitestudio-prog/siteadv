/* Família f09 · Colagem: papéis que caem na mesa, rabiscos e marca-texto que se desenham ao aparecer. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f09')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('cg-ready');
  var els = [].slice.call(document.querySelectorAll('.cg-rv, .cg-sec .cg-doodle, .cg-final .cg-doodle, .cg-sec .cg-mark'));
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('cg-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  els.forEach(function (el, i) { if (el.classList.contains('cg-rv')) el.style.transitionDelay = ((i % 3) * 90) + 'ms'; io.observe(el); });
})();
