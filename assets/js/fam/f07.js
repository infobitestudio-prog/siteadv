/* Família f07 · Tipo: palavras que giram, números que contam, entradas em máscara e nome do rodapé ajustado à largura. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f07')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rotação dos nomes dos serviços no topo
  var items = [].slice.call(document.querySelectorAll('.tp-rot-item'));
  if (items.length > 1 && !reduce) {
    var k = 0, paused = false;
    var box = items[0].parentNode;
    box.addEventListener('mouseenter', function () { paused = true; });
    box.addEventListener('mouseleave', function () { paused = false; });
    setInterval(function () {
      if (paused || document.hidden) return;
      var cur = items[k]; k = (k + 1) % items.length; var nx = items[k];
      cur.classList.remove('on'); cur.classList.add('out'); cur.tabIndex = -1;
      nx.classList.remove('out'); nx.classList.add('on'); nx.tabIndex = 0;
      setTimeout(function () { cur.classList.remove('out'); }, 750);
    }, 2400);
  }

  // Nome gigante do rodapé ocupa a largura
  var fit = document.querySelector('.tp-foot-name');
  function fitName() {
    if (!fit) return;
    fit.style.fontSize = '';
    var w = fit.parentNode.clientWidth, s = parseFloat(getComputedStyle(fit).fontSize);
    if (fit.scrollWidth > 0) fit.style.fontSize = Math.min(s * w / fit.scrollWidth, 320) + 'px';
  }
  fitName();
  window.addEventListener('resize', fitName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);

  if (reduce || !('IntersectionObserver' in window)) return;

  // Entradas em máscara
  body.classList.add('tp-ready');
  var els = [].slice.call(document.querySelectorAll('.tp-rv'));
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('tp-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });

  // Números que contam
  var nums = document.querySelectorAll('[data-tp-count]');
  var co = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, m = /^(\D*)(\d+)(.*)$/.exec(el.textContent.trim()); if (!m) return;
      var end = +m[2], t0 = null;
      function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400); el.textContent = m[1] + Math.round(end * (1 - Math.pow(1 - p, 4))) + m[3]; if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  nums.forEach(function (n) { co.observe(n); });
})();
