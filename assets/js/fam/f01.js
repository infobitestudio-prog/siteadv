// Família f01 · Revista: revelação de texto palavra por palavra e fios que se desenham.
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f01')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  // Quebra os títulos em palavras (mantém o texto acessível no próprio elemento)
  document.querySelectorAll('.r-split').forEach(function (el) {
    if (el.children.length) return;
    var words = el.textContent.split(/(\s+)/), frag = document.createDocumentFragment(), k = 0;
    words.forEach(function (w) {
      if (!w) return;
      if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
      var outer = document.createElement('span'); outer.className = 'w';
      var inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--i', k++);
      outer.appendChild(inner); frag.appendChild(outer);
    });
    el.textContent = ''; el.appendChild(frag);
  });

  body.classList.add('r-ready');
  var targets = document.querySelectorAll('.r-split, .r-rv, .r-sec');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      // pequena cascata entre itens irmãos
      if (el.classList.contains('r-rv') && el.parentElement) {
        var sib = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = Math.min(sib, 6) * 70 + 'ms';
      }
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  targets.forEach(function (el) { io.observe(el); });
})();
