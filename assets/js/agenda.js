// Calendário do agendamento on-line: dias e horários vêm prontos do servidor (data-agenda).
(function () {
  var form = document.querySelector('form[data-agenda]');
  if (!form) return;
  var dias = []; try { dias = JSON.parse(form.getAttribute('data-agenda')) || []; } catch (e) {}
  var wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var mes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var mesL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var box = form.querySelector('.ag-days'), times = form.querySelector('.ag-times');
  var inData = form.querySelector('[name=data]'), inHora = form.querySelector('[name=hora]');
  var step3 = form.querySelector('[data-step="3"]'), step4 = form.querySelector('[data-step="4"]');
  var submit = form.querySelector('button[type=submit]');
  var sumDia = form.querySelector('[data-sum=dia]'), sumHora = form.querySelector('[data-sum=hora]');

  var hoje = new Date(); hoje = hoje.getFullYear() + '-' + ('0' + (hoje.getMonth() + 1)).slice(-2) + '-' + ('0' + hoje.getDate()).slice(-2);
  dias = dias.filter(function (d) { return d.d > hoje || (d.d === hoje && d.s.length); });
  function parse(d) { var p = d.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  if (!dias.length) { box.innerHTML = '<p class="muted">Não há horários on-line nos próximos dias. Fale conosco pelo WhatsApp.</p>'; return; }

  dias.forEach(function (d, i) {
    var dt = parse(d.d), livres = d.s.filter(function (s) { return s[1]; }).length;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ag-day'; b.setAttribute('role', 'option'); b.dataset.i = i;
    b.innerHTML = '<small>' + wd[dt.getDay()] + '</small><strong>' + dt.getDate() + '</strong><small>' + mes[dt.getMonth()] + '</small><i>' + (livres ? livres + ' livre' + (livres > 1 ? 's' : '') : 'lotado') + '</i>';
    if (!livres) b.disabled = true;
    b.style.setProperty('--d', (i % 14) * 25 + 'ms');
    box.appendChild(b);
  });

  form.querySelectorAll('.ag-nav').forEach(function (n) {
    n.addEventListener('click', function () { box.scrollBy({ left: +n.dataset.dir * box.clientWidth * 0.8, behavior: 'smooth' }); });
  });

  box.addEventListener('click', function (e) {
    var b = e.target.closest('.ag-day'); if (!b || b.disabled) return;
    box.querySelectorAll('.ag-day').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    var d = dias[+b.dataset.i], dt = parse(d.d);
    inData.value = d.d; inHora.value = '';
    sumDia.textContent = wd[dt.getDay()] + ', ' + dt.getDate() + ' de ' + mesL[dt.getMonth()];
    sumHora.textContent = '—';
    step3.disabled = false; step4.disabled = true; check();
    var turnos = { 'Manhã': [], 'Tarde': [], 'Noite': [] };
    d.s.forEach(function (s) { var h = +s[0].slice(0, 2); turnos[h < 12 ? 'Manhã' : h < 18 ? 'Tarde' : 'Noite'].push(s); });
    times.innerHTML = '';
    Object.keys(turnos).forEach(function (t) {
      if (!turnos[t].length) return;
      var g = document.createElement('div'); g.className = 'ag-turno';
      g.innerHTML = '<p>' + t + '</p>';
      var wrap = document.createElement('div'); wrap.className = 'ag-chips';
      turnos[t].forEach(function (s, k) {
        var c = document.createElement('button'); c.type = 'button'; c.className = 'ag-time'; c.textContent = s[0];
        c.setAttribute('role', 'option'); c.style.setProperty('--d', k * 30 + 'ms');
        if (!s[1]) { c.disabled = true; c.title = 'Horário reservado'; }
        wrap.appendChild(c);
      });
      g.appendChild(wrap); times.appendChild(g);
    });
    if (window.matchMedia('(max-width: 860px)').matches) step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  times.addEventListener('click', function (e) {
    var c = e.target.closest('.ag-time'); if (!c || c.disabled) return;
    times.querySelectorAll('.ag-time').forEach(function (x) { x.setAttribute('aria-selected', x === c ? 'true' : 'false'); });
    inHora.value = c.textContent; sumHora.textContent = c.textContent;
    step4.disabled = false; check();
    var nome = form.querySelector('[name=nome]');
    if (window.matchMedia('(max-width: 860px)').matches) step4.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else setTimeout(function () { nome.focus({ preventScroll: true }); }, 200);
  });

  function check() {
    var ok = inData.value && inHora.value && form.nome.value.trim() && form.telefone.value.replace(/\D/g, '').length >= 10 && form.lgpd.checked;
    submit.disabled = !ok;
  }
  form.addEventListener('input', check);
  form.addEventListener('change', check);
  var tel = form.querySelector('[name=telefone]');
  tel.addEventListener('input', function () {
    var v = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = v.length > 6 ? '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4) : v.length > 2 ? '(' + v.slice(0, 2) + ') ' + v.slice(2) : v;
  });
})();
