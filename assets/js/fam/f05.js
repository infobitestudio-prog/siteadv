// Família f05 · Divisão: progresso de leitura no painel, índice que acompanha a seção visível e entrada lateral.
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f05')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var panel = document.querySelector('.d-panel');

  // Progresso de leitura (barra fina na borda do painel)
  if (panel) {
    var tick = false;
    var upd = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      panel.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h).toFixed(4) : 0);
      tick = false;
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  if (!('IntersectionObserver' in window)) return;

  // Índice "Nesta página": destaca a seção em leitura
  var links = document.querySelectorAll('[data-d-spy]');
  if (links.length) {
    var map = {};
    links.forEach(function (a) { var s = document.getElementById(a.getAttribute('data-d-spy')); if (s) map[s.id] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !map[en.target.id]) return;
        links.forEach(function (a) { a.classList.remove('is-on'); });
        map[en.target.id].classList.add('is-on');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
    var top = document.getElementById('inicio');
    if (top) new IntersectionObserver(function (en) { if (en[0].isIntersecting) links.forEach(function (a) { a.classList.remove('is-on'); }); }, { rootMargin: '0px 0px -60% 0px' }).observe(top);
  }

  if (reduce) return;
  body.classList.add('d-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(i, 6) * 80) + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  document.querySelectorAll('.d-rv').forEach(function (el) { io.observe(el); });
})();
