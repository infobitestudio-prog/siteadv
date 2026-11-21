/* Família f17 · Cartas */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f17')) return;
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Equipe: botão que vira a carta (toque e teclado)
  $$('.f17-flip-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = b.closest('.f17-flip');
      var on = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });
  $$('.f17-flip').forEach(function (card) {
    card.addEventListener('mouseleave', function () { card.classList.remove('is-flipped'); var b = card.querySelector('.f17-flip-btn'); if (b) b.setAttribute('aria-pressed', 'false'); });
  });

  // Avaliações: pilha de cartas que gira
  $$('[data-f17-pile]').forEach(function (pile) {
    var cards = $$('.f17-rcard', pile);
    if (cards.length < 2) return;
    var sec = pile.closest('section');
    var pos = sec.querySelector('[data-f17-pos]');
    var order = cards.map(function (_, i) { return i; });
    var busy = false;
    pile.classList.add('is-js');
    function paint() {
      order.forEach(function (ci, k) {
        var c = cards[ci];
        c.style.setProperty('--k', k);
        c.classList.toggle('is-deep', k > 3);
        if (k) c.setAttribute('aria-hidden', 'true'); else c.removeAttribute('aria-hidden');
      });
      if (pos) pos.textContent = order[0] + 1;
    }
    function go(dir) {
      if (busy) return; busy = true;
      if (dir > 0) {
        var top = cards[order[0]];
        top.classList.add('is-out');
        setTimeout(function () { order.push(order.shift()); top.classList.remove('is-out'); paint(); busy = false; }, reduce ? 0 : 480);
      } else {
        order.unshift(order.pop()); paint(); busy = false;
      }
    }
    $$('[data-f17-deck]', sec).forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-f17-deck')); }); });
    pile.addEventListener('click', function (e) { if (!e.target.closest('a')) go(1); });
    paint();
  });

  if (reduce) return;

  // Leque do topo acompanha o ponteiro
  var fan = document.querySelector('[data-f17-fan]');
  if (fan && matchMedia('(hover: hover)').matches) {
    fan.addEventListener('pointermove', function (e) {
      var r = fan.getBoundingClientRect();
      fan.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      fan.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    fan.addEventListener('pointerleave', function () { fan.style.setProperty('--px', 0); fan.style.setProperty('--py', 0); });
  }

  // Cartas empilhadas: a de baixo encolhe e escurece enquanto a próxima cobre
  var stack = $$('[data-f17-stack]');
  if (stack.length > 1) {
    var tick = false;
    var upd = function () {
      tick = false;
      for (var i = 0; i < stack.length; i++) {
        var cur = stack[i], next = stack[i + 1];
        var p = 0;
        if (next) {
          var a = cur.getBoundingClientRect(), b = next.getBoundingClientRect();
          p = Math.max(0, Math.min(1, 1 - (b.top - a.top - 16) / Math.max(1, a.height)));
        }
        var depth = 0;
        for (var j = i + 1; j < stack.length; j++) {
          var aa = cur.getBoundingClientRect(), bb = stack[j].getBoundingClientRect();
          if (bb.top - aa.top < aa.height * .6) depth++;
        }
        var s = 1 - p * .05 - Math.max(0, depth - 1) * .03;
        var rot = (i % 2 ? 1 : -1) * p * 1.1;
        cur.style.transform = p > 0 ? 'scale(' + s.toFixed(4) + ') rotate(' + rot.toFixed(2) + 'deg)' : '';
        cur.style.setProperty('--dim', (p * .38).toFixed(3));
      }
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  if (!('IntersectionObserver' in window)) return;

  // Entrada dos blocos
  var inner = '.page-head .wrap, .profile-head .wrap, .area-card2, .tool, .person, .service-list li, .side-box, .form-box, .calc-box, .ag-step, .ag-sum-card, .gallery-item, .cv-list li, .igf-post, .jr-step, .timeline li, .verify-box, .contact-info li, .f17-faq-list details';
  $$(inner).forEach(function (el) { if (!el.closest('.f17-hero')) el.setAttribute('data-f17-rv', ''); });
  var els = $$('[data-f17-rv]');
  els.forEach(function (el) {
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(sib, 5) * 80 + 'ms');
  });
  root.classList.add('f17-js');
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach(function (el) { io.observe(el); });
})();
