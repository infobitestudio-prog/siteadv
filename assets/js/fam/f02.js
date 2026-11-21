// Família f02 · Bento: entrada escalonada dos blocos e números que contam.
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f02')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var groups = document.querySelectorAll('.b-grid, .b-head');
  groups.forEach(function (g) {
    var tiles = g.querySelectorAll(':scope > .b-tile, :scope > .b-faq-list > .b-tile');
    tiles.forEach(function (t, i) { t.style.setProperty('--d', Math.min(i, 9)); });
  });
  body.classList.add('b-ready');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('b-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  groups.forEach(function (g) { io.observe(g); });

  // Números que contam até o valor (ex.: "15+", "2017", "100%")
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      co.unobserve(en.target);
      var el = en.target, m = /^(\D*)(\d+)(.*)$/.exec(el.textContent.trim());
      if (!m) return;
      var end = +m[2], start = end >= 1900 && end <= 2100 ? end - 25 : 0, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1300), v = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
        el.textContent = m[1] + v + m[3];
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-b-count]').forEach(function (n) { co.observe(n); });
})();
