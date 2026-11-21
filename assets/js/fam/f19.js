/* Família f19 · Mono */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f19')) return;
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  if (!('IntersectionObserver' in window)) return;

  // Em telas de toque, as fotos ganham cor quando passam pelo centro da tela
  if (!matchMedia('(hover: hover)').matches) {
    var co = new IntersectionObserver(function (en) {
      en.forEach(function (x) { x.target.classList.toggle('is-color', x.isIntersecting); });
    }, { rootMargin: '-35% 0px -35% 0px' });
    $$('.f19-mono-img, .person-photo, .profile-photo, .gallery-item a, .igf-post').forEach(function (el) { co.observe(el); });
  }

  if (reduce) return;

  // Números gigantes contam até o valor (ex.: "20+", "1 min", "2017")
  var cnt = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return; cnt.unobserve(x.target);
      var el = x.target, txt = el.textContent.trim(), m = /^(\D*)(\d[\d.]*)(.*)$/.exec(txt);
      if (!m) return;
      var raw = m[2].replace(/\./g, ''), end = parseInt(raw, 10);
      if (!end || raw.length > 6) return;
      var dots = m[2].indexOf('.') > -1, start = end >= 1900 && end <= 2100 ? end - 40 : 0, t0 = null;
      function fmt(v) { var s = String(v); return dots ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s; }
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1600), e = 1 - Math.pow(1 - p, 4);
        el.textContent = m[1] + fmt(Math.round(start + (end - start) * e)) + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      }
      requestAnimationFrame(step);
    });
  }, { threshold: .5 });
  $$('[data-f19-count]').forEach(function (el) { cnt.observe(el); });

  // Entrada dos blocos
  $$('.page-head .wrap > *, .area-row, .tool, .person, .service-list li, .side-box, .form-box, .calc-box, .ag-step, .ag-sum-card, .gallery-item, .cv-list li, .igf-post, .jr-step, .timeline li, .verify-box, .contact-info li, .profile-copy, .profile-photo').forEach(function (el) { if (!el.closest('.f19-hero')) el.setAttribute('data-f19-rv', ''); });
  var els = $$('[data-f19-rv]');
  els.forEach(function (el) {
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sib, 5) * 90 + 'ms');
  });
  root.classList.add('f19-js');
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach(function (el) { io.observe(el); });
})();
