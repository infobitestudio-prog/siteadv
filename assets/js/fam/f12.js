/* Família f12 · Horizonte: trilho horizontal fixo, panorama que desliza, faixa da equipe. */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('fam-f12')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 1024px)');
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var pan = document.querySelector('[data-f12-pan]');
  var drifts = Array.prototype.slice.call(document.querySelectorAll('[data-f12-drift]'));
  var hs = [];

  // ---------- Seções horizontais ----------
  document.querySelectorAll('[data-f12-h]').forEach(function (sec) {
    var o = {
      sec: sec, pin: sec.querySelector('.f12-pin'), rail: sec.querySelector('[data-f12-rail]'), track: sec.querySelector('[data-f12-track]'),
      bar: sec.querySelector('[data-f12-bar]'), cur: sec.querySelector('[data-f12-cur]'), pinned: false, dist: 0
    };
    o.slides = o.track ? o.track.children : [];
    o.n = Math.max(1, o.slides.length - 1); // o último cartão é "ver todos"
    if (!o.pin || !o.rail || !o.track) return;
    o.rail.addEventListener('scroll', function () { if (!o.pinned) update(o); }, { passive: true });
    // Teclado: ao focar um cartão escondido, rola a página até ele
    o.track.addEventListener('focusin', function (e) {
      if (!o.pinned) return;
      var li = e.target.closest('.f12-slide'); if (!li) return;
      o.rail.scrollLeft = 0;
      var padL = parseFloat(getComputedStyle(o.track).paddingLeft) || 0;
      var p = o.dist ? clamp((li.offsetLeft - padL) / o.dist, 0, 1) : 0;
      var top = o.sec.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + p * o.dist);
    });
    hs.push(o);
  });

  function measure(o) {
    var want = wide.matches && !reduce && window.innerHeight >= 560;
    o.pinned = want;
    o.sec.classList.toggle('is-pinned', want);
    o.track.style.transform = '';
    if (want) {
      o.dist = Math.max(0, o.track.scrollWidth - o.rail.clientWidth);
      o.sec.style.height = (window.innerHeight + o.dist) + 'px';
    } else {
      o.dist = 0; o.sec.style.height = '';
    }
    update(o);
  }
  function update(o) {
    var p;
    if (o.pinned) {
      var r = o.sec.getBoundingClientRect();
      p = o.dist ? clamp(-r.top / o.dist, 0, 1) : 0;
      o.track.style.transform = 'translate3d(' + (-p * o.dist).toFixed(1) + 'px,0,0)';
    } else {
      var m = o.rail.scrollWidth - o.rail.clientWidth;
      p = m > 0 ? clamp(o.rail.scrollLeft / m, 0, 1) : 0;
    }
    if (o.bar) o.bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (o.cur) o.cur.textContent = pad(Math.min(o.n, Math.round(p * (o.n - 1)) + 1));
  }

  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    body.classList.toggle('f12-scrolled', y > 10);
    hs.forEach(function (o) { if (o.pinned) update(o); });
    if (reduce) return;
    if (pan && y < vh * 1.5) pan.style.setProperty('--pan', (-Math.min(y * 0.12, pan.offsetWidth * 0.07)).toFixed(1) + 'px');
    drifts.forEach(function (d) {
      var r = d.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      var range = Math.max(120, d.scrollWidth - d.parentNode.clientWidth);
      d.style.setProperty('--drift', (-p * range).toFixed(1) + 'px');
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function relayout() { hs.forEach(measure); fitWord(); frame(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(relayout, 120); });
  if (wide.addEventListener) wide.addEventListener('change', relayout);
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  // ---------- Película da equipe ----------
  document.querySelectorAll('[data-f12-filmstrip]').forEach(function (film) {
    var box = film.closest('section');
    var chk = function () { box.classList.toggle('no-over', film.scrollWidth <= film.clientWidth + 4); };
    chk(); window.addEventListener('resize', chk); window.addEventListener('load', chk);
    box.querySelectorAll('[data-f12-film]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = film.firstElementChild;
        film.scrollBy({ left: +b.getAttribute('data-f12-film') * ((c ? c.offsetWidth : 280) + 20), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  });

  // ---------- Nome gigante do rodapé ocupa a largura ----------
  var word = document.querySelector('.f12-foot-word');
  function fitWord() {
    if (!word) return;
    word.style.fontSize = '';
    var cs = getComputedStyle(word), avail = word.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var probe = document.createElement('span'); probe.textContent = word.textContent; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit';
    word.appendChild(probe);
    var w = probe.offsetWidth; word.removeChild(probe);
    if (w > 0) word.style.fontSize = Math.min(parseFloat(cs.fontSize) * avail / w, 260) + 'px';
  }

  relayout();
})();
