// Família f04 · Luxo: fades lentos ao rolar e depoimentos que se alternam com transição suave.
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f04')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Depoimentos: um por vez
  document.querySelectorAll('[data-l-quotes]').forEach(function (box) {
    var slides = box.querySelectorAll('.l-q'), dots = box.querySelectorAll('.l-quotes-nav button'), cur = 0, timer = null;
    if (slides.length < 2) return;
    function show(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-on', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      dots.forEach(function (d, k) { if (k === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function play() { if (reduce) return; stop(); timer = setInterval(function () { show(cur + 1); }, 7000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); play(); }); });
    box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', play);
    box.addEventListener('focusin', stop); box.addEventListener('focusout', play);
    play();
  });

  if (reduce || !('IntersectionObserver' in window)) return;
  body.classList.add('l-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(i, 6) * 140) + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.l-rv').forEach(function (el) { io.observe(el); });
})();
