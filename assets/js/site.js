(function () {
  'use strict';

  // Menu no celular
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  // Busca na página de áreas
  var filter = document.getElementById('area-filter');
  if (filter) {
    var rows = document.querySelectorAll('#area-list [data-busca]');
    var empty = document.getElementById('area-empty');
    var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    filter.addEventListener('input', function () {
      var q = norm(filter.value.trim());
      var shown = 0;
      rows.forEach(function (r) {
        var ok = !q || norm(r.getAttribute('data-busca')).indexOf(q) > -1;
        r.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  // Aviso de cookies essenciais
  var cookie = document.getElementById('cookie');
  if (cookie) {
    var seen = false;
    try { seen = localStorage.getItem('cookie-ok') === '1'; } catch (e) {}
    if (!seen) cookie.hidden = false;
    document.getElementById('cookie-ok').addEventListener('click', function () {
      cookie.hidden = true;
      try { localStorage.setItem('cookie-ok', '1'); } catch (e) {}
    });
  }

  // Máscara simples de telefone
  document.querySelectorAll('input[type=tel]').forEach(function (el) {
    el.addEventListener('input', function () {
      var d = el.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 10) el.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      else if (d.length > 6) el.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      else if (d.length > 2) el.value = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else if (d.length) el.value = '(' + d;
    });
  });
})();
