// Família f23 · Índice: barra de abas fixa com indicação da seção atual (scroll-spy) e rolagem suave.
(function () {
  'use strict';
  if (!document.body.classList.contains('fam-f23')) return;
  var bar = document.querySelector('[data-f23-tabs]');
  if (!bar) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var list = bar.querySelector('ol'), ind = bar.querySelector('.f23-tabs-bar');
  var links = Array.prototype.slice.call(bar.querySelectorAll('[data-f23-tab]'));
  var items = [];
  links.forEach(function (a) {
    var sec = document.getElementById(a.getAttribute('data-f23-tab'));
    if (!sec) { a.parentNode.remove(); return; } // seção sem conteúdo
    items.push({ a: a, sec: sec });
  });
  items.forEach(function (it, i) { var sm = it.a.querySelector('small'); if (sm) sm.textContent = String(i + 1).padStart(2, '0'); });
  if (!items.length) { bar.hidden = true; return; }

  var current = null;
  function place() {
    if (!current || !ind) return;
    var r = current.a.getBoundingClientRect(), rb = bar.querySelector('.f23-tabs-in').getBoundingClientRect();
    ind.style.width = (r.width - 20) + 'px';
    ind.style.transform = 'translateX(' + (r.left - rb.left + 10) + 'px)';
  }
  function activate(it) {
    if (current === it) return;
    if (current) current.a.removeAttribute('aria-current');
    current = it;
    if (!it) { if (ind) ind.style.width = '0'; list.scrollTo({ left: 0 }); return; }
    it.a.setAttribute('aria-current', 'true');
    // mantém a aba visível na barra (celular)
    var l = it.a.offsetLeft, w = it.a.offsetWidth;
    if (l < list.scrollLeft || l + w > list.scrollLeft + list.clientWidth) list.scrollTo({ left: l - 24, behavior: reduce ? 'auto' : 'smooth' });
    place();
  }
  function spy() {
    var line = bar.getBoundingClientRect().bottom + 80, found = null;
    items.forEach(function (it) { if (it.sec.getBoundingClientRect().top <= line) found = it; });
    if (found && found.sec.getBoundingClientRect().bottom < bar.getBoundingClientRect().bottom) found = null;
    // fim da página: última aba
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) found = items[items.length - 1];
    activate(found);
  }
  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { spy(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', function () { place(); spy(); });
  list.addEventListener('scroll', place, { passive: true });

  items.forEach(function (it) {
    it.a.addEventListener('click', function (e) {
      e.preventDefault();
      var y = it.sec.getBoundingClientRect().top + window.scrollY - bar.offsetHeight + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + it.sec.id);
      activate(it);
      it.sec.setAttribute('tabindex', '-1');
      setTimeout(function () { it.sec.focus({ preventScroll: true }); }, reduce ? 0 : 500);
    });
  });
  // seções ganham margem de rolagem igual à altura da barra
  items.forEach(function (it) { it.sec.style.scrollMarginTop = (bar.offsetHeight) + 'px'; });
  spy();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();
