// Família f25 · Projeto: cotas e desenhos em SVG que se traçam quando entram na tela.
(function () {
  'use strict';
  if (!document.body.classList.contains('fam-f25')) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var svgs = [];
  document.querySelectorAll('.f25-draw').forEach(function (p, i) {
    p.setAttribute('pathLength', '1');
    p.style.setProperty('--len', '1');
    var svg = p.ownerSVGElement;
    if (svgs.indexOf(svg) < 0) svgs.push(svg);
    var k = Array.prototype.indexOf.call(svg.querySelectorAll('.f25-draw'), p);
    p.style.setProperty('--dd', (k * 0.25) + 's');
  });
  document.documentElement.classList.add('f25-js');
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); } });
  }, { threshold: .25 });
  svgs.forEach(function (s) { io.observe(s); });
})();
