// Família f21 · Clínico: aumentar fonte e alto contraste (lembra a escolha do visitante)
(function () {
  'use strict';
  if (!document.body.classList.contains('fam-f21')) return;
  var KEY = 'f21-a11y', html = document.documentElement, pref = {};
  try { pref = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { pref = {}; }
  var map = { fonte: 'f21-fg', contraste: 'f21-hc' };
  function apply() {
    Object.keys(map).forEach(function (k) {
      html.classList.toggle(map[k], !!pref[k]);
      document.querySelectorAll('[data-f21="' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', pref[k] ? 'true' : 'false'); });
    });
  }
  document.querySelectorAll('[data-f21]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-f21');
      pref[k] = !pref[k];
      try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) {}
      apply();
    });
  });
  apply();
})();
