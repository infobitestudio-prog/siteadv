// Família f24 · Conversa: mensagens do topo aparecem em sequência com "digitando…"
// e os balões das seções surgem como mensagens novas ao rolar.
(function () {
  'use strict';
  if (!document.body.classList.contains('fam-f24')) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var chat = document.querySelector('[data-f24-chat]');
  if (chat && !reduce) {
    var steps = Array.prototype.slice.call(chat.querySelectorAll('[data-seq]'));
    var body = chat.querySelector('.f24-chat-body'), typing = chat.querySelector('.f24-typing');
    chat.classList.add('is-seq');
    var i = 0;
    var next = function () {
      if (i >= steps.length) { chat.classList.remove('is-typing'); return; }
      var el = steps[i++];
      var isReplies = el.classList.contains('f24-replies');
      chat.classList.add('is-typing');
      if (typing) body.appendChild(typing); // indicador sempre no fim
      var wait = isReplies ? 500 : Math.min(1500, 550 + (el.textContent.length * 12));
      setTimeout(function () {
        chat.classList.remove('is-typing');
        el.classList.add('is-in');
        setTimeout(next, isReplies ? 0 : 380);
      }, wait);
    };
    // começa quando o chat aparece na tela
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); setTimeout(next, 350); } }, { threshold: .3 });
      io.observe(chat);
    } else next();
  }

  // Balões que entram como mensagens novas
  var pops = document.querySelectorAll('.f24-pop');
  if (!reduce && 'IntersectionObserver' in window && pops.length) {
    pops.forEach(function (el, k) { el.classList.add('f24-pre'); el.style.setProperty('--d', (k % 3) * 90 + 'ms'); });
    var po = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('f24-in'); po.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .12 });
    pops.forEach(function (el) { po.observe(el); });
  }
})();
