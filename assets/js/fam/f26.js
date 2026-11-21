/* Família f26 · Aurora: borda luminosa que segue o mouse, revelação com desfoque, números que contam. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f26')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Componentes das páginas internas também viram vidro com borda luminosa
  var glass = '.area-card2, .tool, .person, .side-box, .calc-box, .calc-result, .form-box, .ag-step, .verify-box, .av-form, .quiz, .ag-done, .at-panel';
  document.querySelectorAll(glass).forEach(function (el) { el.classList.add('au-card'); });

  // Cabeçalho compacto ao rolar
  var onScroll = function () { body.classList.toggle('au-scrolled', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Luz que acompanha o ponteiro em todos os cartões próximos
  var cards = [].slice.call(document.querySelectorAll('.au-card'));
  if (!reduce && window.matchMedia('(hover: hover)').matches && cards.length) {
    var px = 0, py = 0, pending = false;
    var paint = function () {
      pending = false;
      var vh = window.innerHeight;
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        cards[i].style.setProperty('--mx', (px - r.left) + 'px');
        cards[i].style.setProperty('--my', (py - r.top) + 'px');
      }
    };
    document.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (!pending) { pending = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener('scroll', function () { if (!pending) { pending = true; requestAnimationFrame(paint); } }, { passive: true });
  }

  // Números que contam (preserva prefixo/sufixo: "20+", "100%", "1 min")
  function count(el) {
    var txt = el.textContent.trim(), m = /^(\D*?)(\d[\d.]*)(.*)$/.exec(txt);
    if (!m) return;
    var raw = m[2].replace(/\./g, ''), end = parseInt(raw, 10);
    if (!isFinite(end) || end === 0) return;
    var isYear = end > 1900 && end < 2100 && raw.length === 4;
    var from = isYear ? end - 40 : 0, t0 = null, dur = 1600;
    var fmt = function (v) { return (m[2].indexOf('.') > -1 && !isYear) ? v.toLocaleString('pt-BR') : String(v); };
    el.textContent = m[1] + fmt(from) + m[3];
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = m[1] + fmt(Math.round(from + (end - from) * e)) + m[3];
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (reduce || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-au-line]').forEach(function (l) { l.classList.add('au-in'); });
    return;
  }

  var counters = document.querySelectorAll('[data-count]');
  var co = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { co.unobserve(x.target); count(x.target); } });
  }, { threshold: .5 });
  counters.forEach(function (c) { co.observe(c); });

  // Revelação ao rolar (com desfoque) — fora do topo
  body.classList.add('au-js');
  var sel = '.au-head, .au-acard, .au-step, .au-tool, .au-year, .au-prose, .au-princ li, .au-member, .au-review, .au-score, .au-faq details, .au-cta, .au-facts-in, .au-conv-list li, ' +
    '.section-head, .area-card2, .tool, .person, .principles li, .gallery-item, .side-box, .calc-box, .calc-result, .form-box, .contact-info li, .cta-in, .igf-post, .igf-bar, [data-au-line]';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.au-hero, .page-head, .profile-head'); });
  var groups = new Map();
  els.forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0; groups.set(p, n + 1);
    el.classList.add('au-rv'); el.style.setProperty('--d', Math.min(n, 6) * 80 + 'ms');
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('au-in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  els.forEach(function (el) { io.observe(el); });
})();
