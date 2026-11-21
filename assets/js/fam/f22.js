// Família f22 · Galeria: ampliação de fotos (lightbox), menu em tela cheia,
// paralaxe do mosaico, avaliações uma a uma, prévia de foto nas áreas e assinatura do rodapé.
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f22')) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;

  // Menu em tela cheia: trava a rolagem enquanto aberto
  var toggle = document.querySelector('.f22-burger'), nav = document.getElementById('nav');
  if (toggle && nav) {
    var sync = function () { html.classList.toggle('f22-lock', nav.classList.contains('open')); };
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['class'] });
  }

  // ---------- Lightbox ----------
  var tiles = Array.prototype.slice.call(document.querySelectorAll('[data-f22-lb]'));
  if (tiles.length) {
    var arrow = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var close = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var lb = document.createElement('div');
    lb.className = 'f22-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Foto ampliada');
    lb.hidden = true;
    lb.innerHTML = '<button type="button" class="f22-lb-close" aria-label="Fechar (Esc)">' + close + '</button>' +
      (tiles.length > 1 ? '<button type="button" class="f22-lb-prev" aria-label="Foto anterior">' + arrow + '</button><button type="button" class="f22-lb-next" aria-label="Próxima foto">' + arrow + '</button>' : '') +
      '<figure><img alt=""></figure><figcaption><span class="f22-lb-cap"></span><span class="f22-lb-count" aria-live="polite"></span></figcaption>';
    body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('.f22-lb-cap'), count = lb.querySelector('.f22-lb-count');
    var cur = 0, opener = null;
    var show = function (i) {
      cur = (i + tiles.length) % tiles.length;
      var t = tiles[cur], inner = t.querySelector('img');
      img.classList.remove('is-ready');
      img.onload = function () { img.classList.add('is-ready'); };
      img.src = (inner && (inner.currentSrc || inner.src)) || t.getAttribute('href');
      img.alt = t.getAttribute('data-cap') || (inner ? inner.alt : '');
      if (img.complete) img.classList.add('is-ready');
      cap.textContent = t.getAttribute('data-cap') || '';
      count.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(tiles.length).padStart(2, '0');
    };
    var open = function (i, from) {
      opener = from; lb.hidden = false; show(i);
      requestAnimationFrame(function () { lb.classList.add('is-open'); setTimeout(function () { lb.querySelector('.f22-lb-close').focus(); }, 30); });
      html.classList.add('f22-lock');
    };
    var shut = function () {
      lb.classList.remove('is-open');
      html.classList.remove('f22-lock');
      setTimeout(function () { lb.hidden = true; }, reduce ? 0 : 400);
      if (opener) opener.focus();
    };
    tiles.forEach(function (t, i) { t.addEventListener('click', function (e) { e.preventDefault(); open(i, t); }); });
    lb.querySelector('.f22-lb-close').addEventListener('click', shut);
    var pv = lb.querySelector('.f22-lb-prev'), nx = lb.querySelector('.f22-lb-next');
    if (pv) pv.addEventListener('click', function () { show(cur - 1); });
    if (nx) nx.addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') shut(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); shut(); }
      else if (e.key === 'ArrowRight' && tiles.length > 1) show(cur + 1);
      else if (e.key === 'ArrowLeft' && tiles.length > 1) show(cur - 1);
      else if (e.key === 'Tab') { // mantém o foco dentro da janela
        var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var x0 = null; // deslizar no celular
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50 && tiles.length > 1) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  // ---------- Mosaico (masonry com grid) ----------
  var wall = document.querySelector('[data-f22-wall]');
  var masonry = function () {
    if (!wall) return;
    wall.classList.add('is-masonry');
    var cs = getComputedStyle(wall), gap = parseFloat(cs.columnGap) || 10;
    var n = cs.gridTemplateColumns.split(' ').filter(Boolean).length || 1, hs = [];
    for (var c = 0; c < n; c++) hs.push(0);
    wall.style.height = '';
    Array.prototype.forEach.call(wall.children, function (el) {
      el.style.gridRowEnd = ''; el.style.gridRowStart = ''; el.style.gridColumn = '';
    });
    Array.prototype.forEach.call(wall.children, function (el) {
      if (el.offsetParent === null) return;
      var h = el.getBoundingClientRect().height, span = Math.max(1, Math.ceil((h + gap) / 2));
      var k = hs.indexOf(Math.min.apply(null, hs)); // coluna mais curta
      el.style.gridColumn = String(k + 1);
      el.style.gridRowStart = String(hs[k] + 1);
      el.style.gridRowEnd = 'span ' + span;
      hs[k] += span;
    });
    // corta as colunas mais longas na altura da mais curta (com esmaecimento)
    var pad = parseFloat(cs.paddingTop) || 0, minH = Math.min.apply(null, hs) * 2, maxH = Math.max.apply(null, hs) * 2;
    var clip = Math.min(maxH, minH + 140);
    wall.style.height = (clip + pad * 2) + 'px';
    Array.prototype.forEach.call(wall.children, function (el) {
      var top = (parseInt(el.style.gridRowStart, 10) - 1) * 2;
      if (top > clip - 60) el.setAttribute('tabindex', '-1'); else el.removeAttribute('tabindex');
    });
  };
  masonry();
  window.addEventListener('resize', masonry);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(masonry);

  // ---------- Paralaxe do mosaico (colunas em velocidades diferentes) ----------
  if (wall && !reduce) {
    var cols = [], ticking = false;
    var measure = function () {
      var xs = {};
      cols = [];
      Array.prototype.forEach.call(wall.children, function (el) { el.style.transform = ''; if (el.offsetParent === null) return; var x = Math.round(el.offsetLeft / 10); (xs[x] = xs[x] || []).push(el); });
      Object.keys(xs).sort(function (a, b) { return a - b; }).forEach(function (k, i) { cols.push({ els: xs[k], v: [0.06, -0.04, 0.1, -0.02][i % 4] }); });
    };
    var run = function () {
      var y = window.scrollY, h = wall.offsetHeight;
      if (y < h + 200) cols.forEach(function (c) { c.els.forEach(function (el) { el.style.transform = 'translate3d(0,' + (y * c.v).toFixed(1) + 'px,0)'; }); });
      ticking = false;
    };
    setTimeout(function () { measure(); run(); }, 1300);
    window.addEventListener('resize', function () { measure(); run(); });
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  }

  // ---------- Chamada final: paralaxe suave da foto ----------
  var ctaBg = document.querySelector('.f22-cta-bg');
  if (ctaBg && !reduce) {
    var sec = ctaBg.parentElement;
    window.addEventListener('scroll', function () {
      var r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      ctaBg.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
    }, { passive: true });
  }

  // ---------- Avaliações: uma por vez ----------
  document.querySelectorAll('[data-f22-quotes]').forEach(function (box) {
    var qs = box.querySelectorAll('.f22-quote'), n = qs.length, i = 0, timer = null;
    if (n < 2) return;
    var cnt = box.querySelector('.f22-quotes-count b');
    var go = function (j) {
      qs[i].classList.remove('is-on'); qs[i].setAttribute('aria-hidden', 'true');
      i = (j + n) % n;
      qs[i].classList.add('is-on'); qs[i].setAttribute('aria-hidden', 'false');
      if (cnt) cnt.textContent = String(i + 1).padStart(2, '0');
    };
    box.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { go(i + +b.getAttribute('data-q')); restart(); }); });
    var restart = function () { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 7000); };
    box.addEventListener('mouseenter', function () { clearInterval(timer); });
    box.addEventListener('mouseleave', restart);
    box.addEventListener('focusin', function () { clearInterval(timer); });
    restart();
  });

  // ---------- Áreas: foto que acompanha o cursor ----------
  var list = document.querySelector('[data-f22-hover]');
  if (list && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var peek = document.createElement('div'); peek.className = 'f22-peek'; peek.setAttribute('aria-hidden', 'true');
    var pimg = document.createElement('img'); pimg.alt = ''; peek.appendChild(pimg); body.appendChild(peek);
    var px = 0, py = 0, tx = 0, ty = 0, raf = null;
    var loop = function () { px += (tx - px) * .18; py += (ty - py) * .18; peek.style.left = px + 'px'; peek.style.top = py + 'px'; raf = requestAnimationFrame(loop); };
    list.querySelectorAll('a[data-img]').forEach(function (a) {
      a.addEventListener('mouseenter', function (e) { pimg.src = a.getAttribute('data-img'); tx = px = e.clientX + 160; ty = py = e.clientY; peek.classList.add('is-on'); if (!raf) loop(); });
      a.addEventListener('mousemove', function (e) { tx = e.clientX + 160; ty = e.clientY; });
      a.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); cancelAnimationFrame(raf); raf = null; });
    });
  }

  // ---------- Assinatura do rodapé: ajusta o nome à largura ----------
  var wm = document.querySelector('.f22-wordmark span');
  if (wm) {
    var fit = function () {
      wm.style.setProperty('--f22-wm', '100px');
      var w = wm.parentElement.clientWidth - parseFloat(getComputedStyle(wm.parentElement).paddingLeft) * 2;
      var size = Math.max(40, Math.min(260, 100 * w / wm.scrollWidth));
      wm.style.setProperty('--f22-wm', size.toFixed(1) + 'px');
    };
    fit(); window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }
})();
