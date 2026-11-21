/* Família f06 · Trilha: espinha que se desenha com a rolagem, marcos que acendem e entradas suaves. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f06')) return;
  var main = document.getElementById('conteudo');
  var spine = document.querySelector('.tr-spine');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!main || !spine) return;

  var fill = spine.querySelector('i');
  var origin = document.querySelector('.tr-origin');
  var end = document.querySelector('.tr-end');
  var marks = [].slice.call(document.querySelectorAll('.tr-node, .tr-item, .tr-year, .tr-end'));
  var geo = { top: 0, height: 1, marks: [] };

  function absTop(el) { var r = el.getBoundingClientRect(); return r.top + window.scrollY; }
  function measure() {
    var mainTop = absTop(main);
    var top = 70;
    var heroIn = document.querySelector('.tr-hero-in');
    if (heroIn) top = Math.max(40, absTop(heroIn) - mainTop + 36);
    var bottom = 0;
    if (end && end.offsetParent) bottom = Math.max(0, main.offsetHeight - (absTop(end) - mainTop + end.offsetHeight / 2));
    main.style.setProperty('--tr-top', top + 'px');
    main.style.setProperty('--tr-bottom', bottom + 'px');
    geo.top = mainTop + top;
    geo.height = Math.max(1, main.offsetHeight - top - bottom);
    geo.marks = marks.map(function (m) {
      var off = m.classList.contains('tr-item') ? 44 : m.offsetHeight / 2;
      return { el: m, y: absTop(m) + off };
    });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var line = window.scrollY + window.innerHeight * 0.62;
    var p = reduce ? 1 : Math.min(1, Math.max(0, (line - geo.top) / geo.height));
    if (fill) fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    geo.marks.forEach(function (m) { m.el.classList.toggle('on', reduce || m.y < line); });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  // Entradas
  if (!reduce && 'IntersectionObserver' in window) {
    body.classList.add('tr-ready');
    var els = [].slice.call(document.querySelectorAll('.tr-head-txt, .tr-item, .tr-step-txt, .tr-step-n, .tr-member-photo, .tr-member-txt, .tr-about-side, .tr-about-txt, .tr-fact, .tr-conv-list, .tr-conv-side, .tr-ig-post, .tr-faq-head, .tr-faq-list, .tr-final-in > *:not(.tr-end)'));
    els.forEach(function (el, i) { el.classList.add('tr-rv'); el.style.transitionDelay = ((i % 3) * 90) + 'ms'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('tr-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  measure(); update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); });
  window.addEventListener('load', function () { measure(); update(); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { measure(); update(); }).observe(main);
})();
