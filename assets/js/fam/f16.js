/* Família f16 · Fashion */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f16')) return;
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barra fixa: mostra o nome pequeno quando a mancheteira sai da tela
  var mast = document.querySelector('.f16-mast');
  if (mast && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { body.classList.toggle('f16-stuck', !en[0].isIntersecting); }).observe(mast);
  } else body.classList.add('f16-stuck');

  // Trava a rolagem com o menu aberto (celular)
  var toggle = document.querySelector('.f16-toggle');
  if (toggle) new MutationObserver(function () { root.classList.toggle('nav-open-f16', toggle.getAttribute('aria-expanded') === 'true'); }).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });

  if (reduce || !('IntersectionObserver' in window)) return;

  // Entrada dos blocos (home e páginas internas)
  var inner = '.page-head .wrap > *, .area-num li, .area-cards > *, .person, .tool, .service-list li, .faq details, .contact-info li, .gallery-item, .profile-photo, .profile-copy, .timeline li, .calc-box, .form-box, .ag-step, .cv-list li, .igf-post, .jr-step';
  [].forEach.call(document.querySelectorAll(inner), function (el) { if (!el.closest('.f16-sec, .f16-hero')) el.setAttribute('data-f16-rv', ''); });
  var els = document.querySelectorAll('[data-f16-rv]');
  [].forEach.call(els, function (el) {
    var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sib, 5) * 90 + 'ms');
  });
  root.classList.add('f16-js');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
  [].forEach.call(els, function (el) { io.observe(el); });

  // Foto que segue o cursor no índice de áreas
  [].forEach.call(document.querySelectorAll('[data-f16-idx] a'), function (a) {
    a.addEventListener('pointermove', function (e) {
      var r = a.getBoundingClientRect();
      a.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      a.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Paralaxe suave na foto do topo
  var par = document.querySelector('[data-f16-par]');
  if (par) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight * 1.2);
        par.style.transform = 'translate3d(0,' + (y * 0.12) + 'px,0)';
        tick = false;
      });
    }, { passive: true });
  }
})();
