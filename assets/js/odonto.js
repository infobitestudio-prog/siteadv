/* Ferramentas de odontologia: avaliação on-line (passo a passo), teste de tratamento,
   simulador de clareamento e simulador de parcelamento. Tudo roda no navegador. */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function num(v) { v = String(v || '').trim(); if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.'); var n = parseFloat(v.replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : 0; }
  var out = document.getElementById('resultado');
  var agendar = (document.querySelector('.nav-cta[href*="agendar"]') || {}).href || (out && out.dataset.contato) || '#';

  function maskTel(el) {
    el.addEventListener('input', function () {
      var v = el.value.replace(/\D/g, '').slice(0, 11);
      el.value = v.length > 6 ? '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4) : v.length > 2 ? '(' + v.slice(0, 2) + ') ' + v.slice(2) : v;
    });
  }

  /* ---------- Avaliação on-line ---------- */
  var wz = document.querySelector('form[data-wizard]');
  if (wz) {
    var steps = [].slice.call(wz.querySelectorAll('.av-step')), cur = 0;
    var bar = wz.querySelector('.av-progress span'), dots = wz.querySelectorAll('.av-dots li');
    var bPrev = wz.querySelector('[data-prev]'), bNext = wz.querySelector('[data-next]'), bSend = wz.querySelector('[type=submit]');
    function show(i) {
      cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k <= i); });
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      bPrev.hidden = i === 0; bNext.hidden = i === steps.length - 1; bSend.hidden = i !== steps.length - 1;
      var top = wz.getBoundingClientRect().top + scrollY - 110;
      if (scrollY > top) scrollTo({ top: top, behavior: 'smooth' });
    }
    bNext.addEventListener('click', function () { show(Math.min(cur + 1, steps.length - 1)); });
    bPrev.addEventListener('click', function () { show(Math.max(cur - 1, 0)); });
    var pain = wz.querySelector('.av-pain'), painOut = wz.querySelector('[name=dorOut]');
    function paint() { var v = +pain.value; painOut.textContent = v; pain.style.setProperty('--p', v * 10 + '%'); pain.style.setProperty('--hue', 150 - v * 15); }
    pain.addEventListener('input', paint); paint();
    var file = wz.querySelector('input[type=file]'), thumbs = wz.querySelector('.av-thumbs');
    file.addEventListener('change', function () {
      thumbs.innerHTML = '';
      var fs = [].slice.call(file.files);
      if (fs.length > 3) { thumbs.innerHTML = '<p class="av-warn">Escolha no máximo 3 fotos.</p>'; file.value = ''; return; }
      fs.forEach(function (f) {
        if (f.size > 10 * 1024 * 1024) { thumbs.insertAdjacentHTML('beforeend', '<p class="av-warn">' + esc(f.name) + ' passa de 10 MB.</p>'); return; }
        var u = URL.createObjectURL(f), im = new Image(); im.src = u; im.alt = ''; im.onload = function () { URL.revokeObjectURL(u); };
        thumbs.appendChild(im);
      });
    });
    wz.addEventListener('submit', function (e) {
      if (!wz.nome.value.trim() || wz.telefone.value.replace(/\D/g, '').length < 10 || !wz.lgpd.checked) {
        e.preventDefault(); wz.reportValidity && wz.reportValidity();
      } else { bSend.disabled = true; bSend.textContent = 'Enviando...'; }
    });
    maskTel(wz.telefone);
    show(0);
  }

  /* ---------- Qual tratamento ---------- */
  var qz = document.querySelector('[data-quiz]');
  if (qz) {
    var data = JSON.parse(qz.getAttribute('data-quiz')), stage = qz.querySelector('.quiz-stage'), qbar = qz.querySelector('.av-progress span');
    var score = {}, idx = 0, hist = [];
    function render() {
      qbar.style.width = (idx / data.q.length * 100) + '%';
      if (idx >= data.q.length) return result();
      var q = data.q[idx];
      var h = '<div class="quiz-card"><p class="quiz-k">Pergunta ' + (idx + 1) + ' de ' + data.q.length + '</p><h2>' + esc(q[0]) + '</h2><div class="quiz-opts">';
      q[1].forEach(function (o, k) { h += '<button type="button" class="quiz-opt" data-k="' + k + '" style="--d:' + k * 50 + 'ms"><span>' + String.fromCharCode(65 + k) + '</span>' + esc(o[0]) + '</button>'; });
      h += '</div>' + (idx ? '<button type="button" class="quiz-back">Voltar</button>' : '') + '</div>';
      stage.innerHTML = h;
    }
    function result() {
      var list = Object.keys(score).filter(function (s) { return data.a[s] && score[s] > 0; }).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 3);
      if (!list.length) list = Object.keys(data.a).slice(0, 1);
      var max = list.length ? score[list[0]] || 1 : 1;
      var h = '<div class="quiz-card quiz-res"><p class="quiz-k">Seu resultado</p><h2>' + esc(data.titulo || 'Relacionados às suas respostas') + '</h2><ol class="quiz-list">';
      list.forEach(function (s, i) {
        var a = data.a[s], pct = Math.max(35, Math.round((score[s] || 1) / max * 100));
        h += '<li style="--d:' + i * 120 + 'ms"><div><a href="' + esc(a.url) + '"><strong>' + esc(a.nome) + '</strong></a><p>' + esc(a.resumo) + '</p></div><span class="quiz-bar"><i style="--w:' + pct + '%"></i></span></li>';
      });
      h += '</ol><div class="quiz-actions"><a class="btn btn-accent btn-lg" href="' + esc(data.agendar) + '">' + esc(data.cta || 'Agendar') + '</a><button type="button" class="btn btn-outline quiz-again">Refazer o teste</button></div></div>';
      stage.innerHTML = h;
    }
    stage.addEventListener('click', function (e) {
      var o = e.target.closest('.quiz-opt');
      if (o) {
        var pts = data.q[idx][1][+o.dataset.k][1]; hist.push(pts);
        Object.keys(pts).forEach(function (s) { score[s] = (score[s] || 0) + pts[s]; });
        o.classList.add('on'); setTimeout(function () { idx++; render(); }, 220); return;
      }
      if (e.target.closest('.quiz-back')) { var p = hist.pop() || {}; Object.keys(p).forEach(function (s) { score[s] -= p[s]; }); idx--; render(); return; }
      if (e.target.closest('.quiz-again')) { score = {}; hist = []; idx = 0; render(); }
    });
    render();
  }

  /* ---------- Simulador de clareamento ---------- */
  var cl = document.querySelector('form[data-tool=clareamento]');
  if (cl && out) {
    var esc_ = JSON.parse(document.getElementById('shades-data').textContent);
    function upd() {
      var t = +(cl.querySelector('[name=tom]:checked') || { value: 8 }).value, p = +cl.passos.value;
      cl.passosOut.textContent = p + (p > 1 ? ' tons' : ' tom');
      var n = Math.max(0, t - p), a = esc_[t], b = esc_[n];
      out.innerHTML = '<div class="whiten"><div class="whiten-pair">' +
        '<figure><svg viewBox="0 0 120 70" aria-hidden="true">' + teeth(a[1]) + '</svg><figcaption>Hoje<br><strong>' + esc(a[0]) + '</strong></figcaption></figure>' +
        '<figure><svg viewBox="0 0 120 70" aria-hidden="true">' + teeth(b[1]) + '</svg><figcaption>Comparação<br><strong>' + esc(b[0]) + '</strong></figcaption></figure></div>' +
        '<ul class="result-notes"><li>Esta é apenas uma comparação visual da escala de cores. O resultado do clareamento varia de pessoa para pessoa.</li><li>Antes do clareamento é preciso avaliar cáries, gengiva, sensibilidade e restaurações, que não mudam de cor.</li><li>O dentista indica a técnica (consultório, caseira ou combinada) após a avaliação.</li></ul>' +
        '<div class="result-cta"><a class="btn btn-accent btn-block" href="' + esc(agendar) + '">Agendar avaliação para clareamento</a></div></div>';
    }
    function teeth(c) {
      var s = '<rect x="0" y="0" width="120" height="70" rx="12" fill="#c9737a" opacity=".35"/>', xs = [8, 26, 44, 62, 80, 98], ws = [14, 16, 18, 18, 16, 14];
      xs.forEach(function (x, i) { s += '<rect x="' + (x + (18 - ws[i]) / 2) + '" y="' + (i === 2 || i === 3 ? 8 : 12) + '" width="' + ws[i] + '" height="' + (i === 2 || i === 3 ? 46 : 40) + '" rx="6" fill="' + c + '" stroke="rgba(0,0,0,.08)"/>'; });
      return s;
    }
    cl.addEventListener('input', upd); cl.addEventListener('change', upd); upd();
  }

  /* ---------- Parcelamento ---------- */
  var pc = document.querySelector('form[data-tool=parcelamento]');
  if (pc && out) {
    function calc() {
      var v = num(pc.valor.value), en = Math.min(num(pc.entrada.value), v), n = +pc.n.value, j = num(pc.juros.value) / 100;
      pc.nOut.textContent = n + 'x';
      if (!v) { out.innerHTML = '<div class="result-empty"><p>Informe o valor do orçamento para ver as parcelas.</p></div>'; return; }
      var f = v - en, parc = j > 0 ? f * j / (1 - Math.pow(1 + j, -n)) : f / n, total = parc * n + en;
      var opts = [3, 6, 10, 12, 18, 24].filter(function (k) { return k !== n; }).slice(0, 4);
      var h = '<div class="result-total"><span>' + n + ' parcelas de</span><strong>' + brl.format(parc) + '</strong></div><table class="result-table"><tbody>' +
        (en ? '<tr><th>Entrada</th><td>' + brl.format(en) + '</td></tr>' : '') +
        '<tr><th>Valor financiado</th><td>' + brl.format(f) + '</td></tr><tr><th>Juros ao mês</th><td>' + (j * 100).toLocaleString('pt-BR') + '%</td></tr><tr class="sub"><th>Total pago</th><td>' + brl.format(total) + '</td></tr></tbody></table>' +
        '<table class="result-table"><caption>Outras opções</caption><tbody>';
      opts.forEach(function (k) { var p = j > 0 ? f * j / (1 - Math.pow(1 + j, -k)) : f / k; h += '<tr><th>' + k + 'x</th><td>' + brl.format(p) + '</td></tr>'; });
      h += '</tbody></table><ul class="result-notes"><li>Simulação com parcelas fixas. Confirme as condições com a recepção.</li></ul><div class="result-cta"><a class="btn btn-accent btn-block" href="' + esc(agendar) + '">Agendar avaliação</a></div>';
      out.innerHTML = h;
    }
    pc.addEventListener('input', calc); calc();
  }
})();
