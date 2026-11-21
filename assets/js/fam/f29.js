/* Família f29 · Zen: ensō que se desenha devagar, pinceladas que se revelam e entradas lentas. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f29')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var draws = [].slice.call(document.querySelectorAll('[data-zn-draw]'));
  draws.forEach(function (svg) {
    svg.querySelectorAll('path').forEach(function (p) {
      var len = 0; try { len = Math.ceil(p.getTotalLength()) + 4; } catch (e) { len = 1200; }
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    });
    svg.getBoundingClientRect(); svg.classList.add('zn-draw-ready');
  });

  body.classList.add('zn-js');
  var sel = '.zn-head, .zn-fact, .zn-stairs li, .zn-path li, .zn-tools li, .zn-about-text > *, .zn-about-side > *, .zn-person, .zn-quote, .zn-faq details, .zn-cta-text, .zn-conv-in > *, ' +
    '.section-head, .area-row, .tool, .person, .side-box, .principles li, .gallery-item, .calc-box, .calc-result, .form-box, .contact-info li, .cta-in > div, .igf-post';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.zn-hero, .page-head, .profile-head'); });
  var n = new Map();
  els.forEach(function (el) { var p = el.parentElement, k = n.get(p) || 0; n.set(p, k + 1); el.classList.add('zn-rv'); el.style.setProperty('--d', Math.min(k, 6) * 180 + 'ms'); });
  var brushes = [].slice.call(document.querySelectorAll('.zn-brush'));
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return;
      var t = x.target; io.unobserve(t);
      if (t.hasAttribute('data-zn-draw')) setTimeout(function () { t.classList.add('zn-drawn'); }, t.closest('.zn-hero') ? 900 : 200);
      else t.classList.add('zn-in');
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
  els.concat(brushes, draws).forEach(function (el) { io.observe(el); });
})();
