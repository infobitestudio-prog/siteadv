/* Família f11 · Camadas: painéis empilhados, índice lateral, revelações e citações. */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('fam-f11')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.classList.add('f11-js');

  // Cabeçalho que escurece ao rolar + barra de progresso
  var bar = document.createElement('div');
  bar.className = 'f11-progress'; bar.setAttribute('aria-hidden', 'true');
  body.appendChild(bar);

  // Título do topo palavra por palavra (máscara)
  var title = document.querySelector('.f11-hero-title[data-words]');
  if (title && !reduce) {
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', title.textContent.trim());
    title.textContent = '';
    words.forEach(function (w, i) {
      var o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden', 'true');
      var s = document.createElement('span'); s.textContent = w; s.style.setProperty('--i', i);
      o.appendChild(s); title.appendChild(o);
      if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
  }

  // Títulos que sobem de dentro de uma máscara
  document.querySelectorAll('[data-rise]').forEach(function (h) {
    var s = document.createElement('span');
    while (h.firstChild) s.appendChild(h.firstChild);
    h.appendChild(s);
  });

  // ---------- Camadas ----------
  var main = document.getElementById('conteudo');
  var hero = document.querySelector('.f11-hero');
  var panels = [];
  if (hero && main) {
    panels = Array.prototype.filter.call(main.children, function (el) { return el.tagName === 'SECTION'; });
    panels.forEach(function (p) {
      p.classList.add('f11-layer');
      if (!p.hasAttribute('data-stick')) p.setAttribute('data-stick', '0');
      var a = document.createElement('span'); a.className = 'f11-anchor'; a.setAttribute('aria-hidden', 'true');
      p.parentNode.insertBefore(a, p); p._anchor = a;
    });
  }
  var sticks = Array.prototype.slice.call(document.querySelectorAll('[data-stick]'));
  var stacking = !reduce && sticks.length > 0;
  if (stacking) body.classList.add('f11-stack');

  function layout() {
    if (!stacking) return;
    var vh = window.innerHeight;
    var hs = sticks.map(function (el) { return el.offsetHeight; });
    sticks.forEach(function (el, i) {
      var base = parseFloat(el.getAttribute('data-stick')) || 0;
      el.style.top = Math.min(base, vh - hs[i]) + 'px';
    });
  }

  // Índice lateral
  var dots = null, dotBtns = [];
  if (panels.length > 2) {
    dots = document.createElement('nav');
    dots.className = 'f11-dots'; dots.setAttribute('aria-label', 'Seções da página');
    panels.forEach(function (p, i) {
      var h = p.querySelector('h2');
      var label = p.getAttribute('data-label') || p.getAttribute('aria-label') || (h ? h.textContent.trim() : 'Seção ' + (i + 1));
      if (label.length > 34) label = label.slice(0, 32) + '…';
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Ir para: ' + label);
      b.innerHTML = '<i></i><span></span>'; b.querySelector('span').textContent = label;
      b.addEventListener('click', function () {
        var y = p._anchor.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      });
      dots.appendChild(b); dotBtns.push(b);
    });
    body.appendChild(dots);
  }

  var ticking = false, current = -1;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    body.classList.toggle('f11-scrolled', y > 40);
    if (!panels.length) return;
    // leitura
    var tops = panels.map(function (p) { return p._anchor.getBoundingClientRect().top; });
    var active = 0;
    for (var i = 0; i < tops.length; i++) if (tops[i] <= vh * .45) active = i;
    // escrita
    if (stacking) {
      for (var j = 0; j < panels.length - 1; j++) {
        var nextTop = tops[j + 1];
        var d = Math.max(0, Math.min(1, 1 - nextTop / vh));
        panels[j].style.setProperty('--dim', d.toFixed(3));
      }
    }
    if (active !== current && dotBtns.length) {
      dotBtns.forEach(function (b, k) { b.classList.toggle('is-on', k === active); if (k === active) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      current = active;
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { layout(); onScroll(); });
  if ('ResizeObserver' in window && stacking) {
    var ro = new ResizeObserver(function () { layout(); });
    sticks.forEach(function (el) { ro.observe(el); });
  }
  window.addEventListener('load', function () { layout(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout(); frame();

  // ---------- Revelações ----------
  var revs = document.querySelectorAll('.f11-rv, [data-rise], .f11-about');
  if (reduce || !('IntersectionObserver' in window)) {
    revs.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
    revs.forEach(function (el) { io.observe(el); });
  }

  // ---------- Números que contam ----------
  var nums = document.querySelectorAll('[data-f11-count]');
  function fmt(v, dec, sepT, sepD) {
    var s = v.toFixed(dec).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, sepT);
    return s.length > 1 ? s[0] + sepD + s[1] : s[0];
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; co.unobserve(en.target);
        var el = en.target, txt = el.textContent.trim();
        var m = /^(\D*?)(\d[\d.,]*)(.*)$/.exec(txt); if (!m) return;
        var raw = m[2], dec = 0, sepT = '.', sepD = ',', val;
        if (/,\d{1,2}$/.test(raw)) { dec = raw.split(',')[1].length; val = parseFloat(raw.replace(/\./g, '').replace(',', '.')); }
        else if (/\.\d{1,2}$/.test(raw) && raw.split('.').length === 2 && raw.split('.')[0].length <= 3 && raw.split('.')[1].length < 3) { dec = raw.split('.')[1].length; sepD = '.'; sepT = ','; val = parseFloat(raw); }
        else { val = parseFloat(raw.replace(/[.,]/g, '')); }
        if (!isFinite(val)) return;
        var t0 = null;
        el.setAttribute('aria-label', txt);
        function step(ts) {
          if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1600), e = 1 - Math.pow(1 - p, 4);
          el.textContent = m[1] + fmt(val * e, dec, sepT, sepD) + m[3];
          if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    nums.forEach(function (n) { co.observe(n); });
  }

  // ---------- Avaliações: uma por vez ----------
  document.querySelectorAll('[data-f11-quotes]').forEach(function (box) {
    var items = box.querySelectorAll('.f11-quote');
    if (items.length < 2) return;
    box.classList.add('is-ready');
    var cur = 0, timer = null, curEl = box.querySelector('[data-q-cur]');
    function show(i) {
      items[cur].classList.remove('is-on');
      cur = (i + items.length) % items.length;
      items[cur].classList.add('is-on');
      if (curEl) curEl.textContent = (cur + 1 < 10 ? '0' : '') + (cur + 1);
      restart();
    }
    function restart() {
      if (reduce) return;
      clearTimeout(timer); box.classList.remove('is-playing'); void box.offsetWidth; box.classList.add('is-playing');
      timer = setTimeout(function () { show(cur + 1); }, 7000);
    }
    function stop() { clearTimeout(timer); box.classList.remove('is-playing'); }
    box.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { show(cur + (+b.getAttribute('data-q'))); }); });
    box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', restart);
    box.addEventListener('focusin', stop);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) restart(); else stop(); }); }, { threshold: .3 }).observe(box);
    } else restart();
  });
})();
