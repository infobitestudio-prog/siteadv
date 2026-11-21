/* Família f28 · Energia: faixas que aceleram com a rolagem, paralaxe lateral, entradas inclinadas,
   contadores e cabeçalho que some ao descer. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f28')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');

  // Cabeçalho: some ao descer, volta ao subir
  var lastY = window.scrollY, vel = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY, d = y - lastY;
    vel = vel * .6 + d * .4;
    if (!(nav && nav.classList.contains('open'))) body.classList.toggle('en-hide', d > 4 && y > 240);
    if (d < -4 || y < 120) body.classList.remove('en-hide');
    lastY = y;
  }, { passive: true });

  if (reduce) return;

  // Faixas em movimento (aceleram e invertem com a rolagem) + paralaxe + inclinação dos títulos
  var tracks = [].slice.call(document.querySelectorAll('[data-en-marquee]')).map(function (t) { return { el: t, dir: +t.getAttribute('data-en-marquee') || 1, x: 0, w: 0 }; });
  var pars = [].slice.call(document.querySelectorAll('[data-en-par]'));
  var measure = function () { tracks.forEach(function (t) { var s = t.el.firstElementChild; t.w = s ? s.getBoundingClientRect().width : 0; }); };
  measure(); window.addEventListener('resize', measure);
  var skewNow = 0;
  (function loop() {
    var boost = Math.min(18, Math.abs(vel)) * .55, sign = vel < -1 ? -1 : 1;
    tracks.forEach(function (t) {
      if (!t.w) return;
      t.x -= (0.7 + boost) * t.dir * sign;
      if (t.x <= -t.w) t.x += t.w; if (t.x > 0) t.x -= t.w;
      t.el.style.transform = 'translate3d(' + t.x.toFixed(1) + 'px,0,0)';
    });
    var vh = window.innerHeight;
    pars.forEach(function (p) {
      var r = p.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      p.style.transform = 'translate3d(' + ((r.top - vh / 2) * (+p.getAttribute('data-en-par'))).toFixed(1) + 'px,0,0)';
    });
    var target = Math.max(-7, Math.min(7, -vel * .35));
    skewNow += (target - skewNow) * .12;
    body.style.setProperty('--en-v', skewNow.toFixed(2) + 'deg');
    vel *= .92;
    requestAnimationFrame(loop);
  })();

  if (!('IntersectionObserver' in window)) return;

  // Contadores
  function count(el) {
    var m = /^(\D*?)(\d+)(.*)$/.exec(el.textContent.trim()); if (!m) return;
    var end = +m[2], isYear = end > 1900 && end < 2100, from = isYear ? end - 30 : 0, t0 = null;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1300), e = 1 - Math.pow(1 - p, 3); el.textContent = m[1] + Math.round(from + (end - from) * e) + m[3]; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var co = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { co.unobserve(x.target); count(x.target); } }); }, { threshold: .6 });
  document.querySelectorAll('[data-en-count]').forEach(function (c) { co.observe(c); });

  // Entradas laterais inclinadas, alternando o lado
  body.classList.add('en-js');
  var sel = '.en-head, .en-tile, .en-plan-step, .en-row, .en-player, .en-rev, .en-faq details, .en-princ li, .en-shot, .en-chips li, .en-cta-in > *, .en-prose, .en-score, ' +
    '.section-head, .area-card2, .tool, .person, .side-box, .calc-box, .calc-result, .form-box, .gallery-item, .principles li, .contact-info li, .cta-in > div, .igf-post';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.en-hero, .page-head, .profile-head'); });
  var n = new Map();
  els.forEach(function (el, i) {
    var p = el.parentElement, k = n.get(p) || 0; n.set(p, k + 1);
    el.classList.add('en-rv');
    if (k % 2) { el.style.setProperty('--dx', '60px'); el.style.setProperty('--sk', '-8deg'); }
    el.style.setProperty('--d', Math.min(k, 5) * 70 + 'ms');
  });
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('en-in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(function (el) { io.observe(el); });
})();
