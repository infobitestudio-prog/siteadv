/* Família f08 · App: saudação pelo horário do visitante, filtro em segmentos, galeria com pontos, "ler mais" e entradas suaves. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f08')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var g = document.querySelector('[data-ap-greet]');
  if (g) { var h = new Date().getHours(); g.textContent = h < 12 ? 'Bom dia' : (h < 18 ? 'Boa tarde' : 'Boa noite'); }

  // Destaques | Todos
  document.querySelectorAll('[data-ap-seg]').forEach(function (b, _, all) {
    b.addEventListener('click', function () {
      var list = b.closest('.ap-sec').querySelector('[data-ap-list]');
      all.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (list) list.classList.toggle('ap-all', b.getAttribute('data-ap-seg') === 'all');
    });
  });

  // Galeria com pontos
  document.querySelectorAll('[data-ap-gal]').forEach(function (gal) {
    var tr = gal.querySelector('.ap-gal-track'), dots = gal.querySelectorAll('.ap-dots i');
    if (!tr || !dots.length) return;
    tr.addEventListener('scroll', function () {
      var i = Math.round(tr.scrollLeft / tr.clientWidth);
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }, { passive: true });
  });

  // Ler mais
  document.querySelectorAll('[data-ap-more]').forEach(function (box) {
    var btn = box.parentNode.querySelector('[data-ap-more-btn]');
    if (box.scrollHeight <= box.clientHeight + 4) { box.classList.add('short'); return; }
    if (!btn) return;
    btn.hidden = false;
    btn.addEventListener('click', function () { var o = box.classList.toggle('open'); btn.textContent = o ? 'Mostrar menos' : 'Ler mais'; });
  });

  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('ap-ready');
  var els = [].slice.call(document.querySelectorAll('.ap-sec .ap-row-head, .ap-sec .ap-card, .ap-stat, .ap-seg, .ap-sec .ap-intro'));
  els.forEach(function (el) { el.classList.add('ap-rv'); });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ap-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach(function (el) { io.observe(el); });
})();
