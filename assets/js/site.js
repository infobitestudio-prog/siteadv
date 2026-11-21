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

  // Cookies e medição de anúncios (carrega só com consentimento)
  var cookie = document.getElementById('cookie');
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var cfg = null;
  if (cookie && cookie.getAttribute('data-track')) { try { cfg = JSON.parse(cookie.getAttribute('data-track')); } catch (e) {} }
  var KEY = cfg ? 'consent-medicao' : 'cookie-ok';

  function addScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function startTracking() {
    if (!cfg || window.__tracking) return;
    window.__tracking = true;
    if (cfg.ga4 || cfg.gads) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      gtag('js', new Date());
      if (cfg.ga4) gtag('config', cfg.ga4, { anonymize_ip: true });
      if (cfg.gads) gtag('config', cfg.gads);
      addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4 || cfg.gads));
    }
    if (cfg.pixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', cfg.pixel); fbq('track', 'PageView');
    }
    // Conversão: formulário enviado
    if (/[?&]enviado=1/.test(location.search)) track('lead');
  }
  function track(type) {
    if (!window.__tracking) return;
    if (window.gtag) {
      gtag('event', type === 'lead' ? 'generate_lead' : 'contato_whatsapp');
      if (type === 'lead' && cfg.gads && cfg.conv) gtag('event', 'conversion', { send_to: cfg.gads + '/' + cfg.conv });
    }
    if (window.fbq) fbq('track', type === 'lead' ? 'Lead' : 'Contact');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="wa.me"]');
    if (a) track('whatsapp');
  });
  if (cookie) {
    var choice = store.get(KEY);
    if (choice === 'sim' || (!cfg && choice === '1')) startTracking();
    else if (!choice) cookie.hidden = false;
    var ok = document.getElementById('cookie-ok'), no = document.getElementById('cookie-no');
    ok.addEventListener('click', function () { cookie.hidden = true; store.set(KEY, cfg ? 'sim' : '1'); startTracking(); });
    if (no) no.addEventListener('click', function () { cookie.hidden = true; store.set(KEY, 'nao'); });
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

// Pré-visualização de cores enviada pelo painel (mesma origem)
window.addEventListener('message', function (e) {
  if (e.origin !== location.origin || !e.data || e.data.type !== 'theme') return;
  var st = document.getElementById('theme');
  if (st) st.textContent = e.data.css;
  document.body.setAttribute('data-grad', e.data.grad || '');
});

// Galeria: ampliar fotos
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb || !lb.showModal) return;
  var img = lb.querySelector('img'), cap = lb.querySelector('p');
  document.querySelectorAll('[data-lightbox]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      img.src = a.getAttribute('href');
      var fc = a.parentNode.querySelector('figcaption');
      img.alt = fc ? fc.textContent : ''; cap.textContent = fc ? fc.textContent : '';
      lb.showModal();
    });
  });
  lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
})();

// Ano do rodapé sempre atual (também nas versões estáticas do site)
document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

// ---------- Modelos: abas, cabeçalho sobreposto, animações ----------
(function () {
  var body = document.body;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Abas das áreas (com teclado: setas esquerda/direita)
  document.querySelectorAll('[data-abas]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role=tab]'));
    function select(t) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
        if (j === null) return; e.preventDefault(); var n = tabs[(j + tabs.length) % tabs.length]; select(n); n.focus();
      });
    });
  });

  // Cabeçalho transparente que ganha fundo ao rolar
  if (body.classList.contains('cab-sobreposto') && body.classList.contains('hero-escuro')) {
    var onScroll = function () { body.classList.toggle('rolou', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  var anim = /anim-(surgir|deslizar|paralaxe|contadores)/.exec(body.className);
  if (!anim || reduce || !('IntersectionObserver' in window)) return;

  // Entrada dos blocos ao aparecer na tela
  var sel = '.section-head, .area-row, .tool, .person, .feature, .fact, .principles li, .steps li, .faq details, .gallery-item, .at-panel, .about-aside, .prose-lg, .cta-in > div';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.hero, .hero-cheio, .hero-editorial, .hero-dividido, .hero-cartao, .lp-hero'); });
  els.forEach(function (el, i) { el.classList.add('rv'); if (anim[1] === 'deslizar' && i % 2) el.classList.add('rv-dir'); el.style.transitionDelay = ((i % 4) * 70) + 'ms'; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(function (el) { io.observe(el); });

  // Números que contam até o valor (ex.: "15+", "100%")
  if (anim[1] === 'contadores') {
    var nums = document.querySelectorAll('.fact strong, [data-contar]');
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return; co.unobserve(en.target);
        var el = en.target, m = /^(\D*)(\d+)(.*)$/.exec(el.textContent.trim()); if (!m) return;
        var end = +m[2], t0 = null;
        function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = m[1] + v + m[3]; if (p < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      });
    }, { threshold: .6 });
    nums.forEach(function (n) { co.observe(n); });
  }

  // Paralaxe suave no topo
  if (anim[1] === 'paralaxe') {
    var layers = document.querySelectorAll('[data-paralaxe]');
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { var y = window.scrollY; layers.forEach(function (l) { l.style.transform = 'translate3d(0,' + (y * 0.25) + 'px,0)'; }); tick = false; });
    }, { passive: true });
  }
})();
