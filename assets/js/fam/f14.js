/* Família f14 · Orgânico: revelação suave dos blocos e manchas que acompanham o cursor no topo. */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('fam-f14')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('f14-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
  document.querySelectorAll('.f14-rv').forEach(function (el) { io.observe(el); });

  // Manchas do topo se deslocam levemente com o cursor
  var art = document.querySelector('.f14-hero-art');
  if (art && window.matchMedia('(hover: hover)').matches) {
    var b1 = art.querySelector('.f14-b1'), b2 = art.querySelector('.f14-b2'), raf = 0, mx = 0, my = 0;
    art.parentNode.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (b1) b1.style.translate = (mx * 18).toFixed(1) + 'px ' + (my * 18).toFixed(1) + 'px';
        if (b2) b2.style.translate = (mx * -26).toFixed(1) + 'px ' + (my * -26).toFixed(1) + 'px';
      });
    });
  }
})();
