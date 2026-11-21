/* Família f20 · Bairro */
(function () {
  'use strict';
  var body = document.body;
  if (!body.classList.contains('fam-f20')) return;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // ---------- Aberto agora: lê o texto de horário (ex.: "Segunda a sexta, das 9h às 20h. Sábados, das 9h às 15h") ----------
  var KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  var SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function parse(txt) {
    var sch = [[], [], [], [], [], [], []], found = false;
    norm(txt).split(/[.;\n]+/).forEach(function (seg) {
      var days = [];
      var rg = /\b(dom|seg|ter|qua|qui|sex|sab)[a-z]*(?:-feira)?s?\s*(?:a|ate|-)\s*(dom|seg|ter|qua|qui|sex|sab)/.exec(seg);
      if (rg) {
        var a = KEYS.indexOf(rg[1]), b = KEYS.indexOf(rg[2]);
        for (var i = a, n = 0; n < 7; i = (i + 1) % 7, n++) { days.push(i); if (i === b) break; }
      } else {
        var re = /\b(dom|seg|ter|qua|qui|sex|sab)[a-z]*/g, m;
        while ((m = re.exec(seg))) if (days.indexOf(KEYS.indexOf(m[1])) < 0) days.push(KEYS.indexOf(m[1]));
      }
      if (/todos os dias|diariamente/.test(seg)) days = [0, 1, 2, 3, 4, 5, 6];
      var hr = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?\s*(?:as|a|-|ate)\s*(\d{1,2})\s*(?:h|:)?\s*(\d{2})?/g, h, ivs = [];
      while ((h = hr.exec(seg))) {
        var s = +h[1] * 60 + (+h[2] || 0), e = +h[3] * 60 + (+h[4] || 0);
        if (e <= s) e += 24 * 60;
        if (s < 24 * 60) ivs.push([s, e]);
      }
      if (!days.length || !ivs.length) return;
      days.forEach(function (d) { sch[d] = sch[d].concat(ivs); });
      found = true;
    });
    return found ? sch : null;
  }
  function fmt(min) { min = min % (24 * 60); var hh = Math.floor(min / 60), mm = min % 60; return hh + 'h' + (mm ? String(mm).padStart(2, '0') : ''); }
  function nowSP() {
    try {
      var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + (+p.minute) };
    } catch (e) { var d = new Date(); return { d: d.getDay(), m: d.getHours() * 60 + d.getMinutes() }; }
  }
  function status(sch) {
    var n = nowSP(), today = sch[n.d] || [];
    // Intervalo que começou ontem e passa da meia-noite
    var y = sch[(n.d + 6) % 7] || [];
    for (var k = 0; k < y.length; k++) if (y[k][1] > 1440 && n.m < y[k][1] - 1440) return { open: true, txt: 'fecha às ' + fmt(y[k][1]) };
    for (var i = 0; i < today.length; i++) if (n.m >= today[i][0] && n.m < today[i][1]) return { open: true, txt: 'fecha às ' + fmt(today[i][1]) };
    var later = today.filter(function (iv) { return iv[0] > n.m; }).sort(function (a, b) { return a[0] - b[0]; });
    if (later.length) return { open: false, txt: 'abre hoje às ' + fmt(later[0][0]) };
    for (var j = 1; j <= 7; j++) {
      var d = (n.d + j) % 7, ivs = (sch[d] || []).slice().sort(function (a, b) { return a[0] - b[0]; });
      if (ivs.length) return { open: false, txt: 'abre ' + (j === 1 ? 'amanhã' : SHORT[d]) + ' às ' + fmt(ivs[0][0]) };
    }
    return { open: false, txt: '' };
  }
  function paint() {
    $$('[data-f20-status]').forEach(function (el) {
      var sch = parse(el.getAttribute('data-horario') || '');
      if (!sch) return;
      var st = status(sch), span = el.querySelector('span');
      el.classList.toggle('is-open', st.open); el.classList.toggle('is-closed', !st.open);
      span.innerHTML = '';
      var b = document.createElement('b'); b.textContent = st.open ? 'Aberto agora' : 'Fechado agora';
      span.appendChild(b);
      if (st.txt) span.appendChild(document.createTextNode(' · ' + st.txt));
      el.hidden = false;
    });
    $$('[data-f20-week]').forEach(function (ul) {
      var box = ul.closest('.f20-card') || ul.parentNode, src = box.querySelector('[data-f20-status]');
      var sch = src && parse(src.getAttribute('data-horario') || '');
      if (!sch) return;
      var today = nowSP().d;
      ul.innerHTML = '';
      [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
        var li = document.createElement('li'); if (d === today) li.className = 'is-today';
        var a = document.createElement('span'); a.textContent = LONG[d] + (d === today ? ' (hoje)' : '');
        var c = document.createElement('span'); c.textContent = sch[d].length ? sch[d].map(function (iv) { return fmt(iv[0]) + '–' + fmt(iv[1]); }).join(', ') : 'Fechado';
        li.appendChild(a); li.appendChild(c); ul.appendChild(li);
      });
      ul.hidden = false;
      var dt = ul.closest('details'); if (dt) dt.hidden = false;
    });
  }
  paint();
  setInterval(paint, 60000);

  // ---------- Entrada dos blocos ----------
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  $$('.am-tile, .area-row, .tool, .person, .service-list li, .side-box, .form-box, .calc-box, .ag-step, .ag-sum-card, .gallery-item, .cv-list li, .igf-post, .jr-step, .timeline li, .verify-box, .contact-info li').forEach(function (el) { if (!el.closest('.f20-hero')) el.setAttribute('data-f20-rv', ''); });
  var els = $$('[data-f20-rv]');
  els.forEach(function (el) {
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sib, 5) * 70 + 'ms');
  });
  document.documentElement.classList.add('f20-js');
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach(function (el) { io.observe(el); });
})();
