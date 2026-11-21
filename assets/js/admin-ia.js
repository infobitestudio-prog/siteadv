(function () {
  'use strict';
  var form = document.getElementById('ia-form');
  var review = document.getElementById('review');
  if (review) {
    review.querySelectorAll('[data-all]').forEach(function (b) {
      b.addEventListener('click', function () { var on = b.getAttribute('data-all') === '1'; review.querySelectorAll('input[name="aplicar[]"]').forEach(function (c) { c.checked = on; }); });
    });
    review.querySelectorAll('.rev-new textarea, .rev-new input').forEach(function (el) {
      el.addEventListener('input', function () { var c = el.closest('.rev-row').querySelector('input[type=checkbox]'); if (c) c.checked = true; });
    });
  }
  if (!form) return;
  var list = document.getElementById('ia-steps');
  var names = { base: 'Textos gerais, contato e perguntas frequentes', equipe: 'Equipe e histórias dos advogados', fim: 'Preparando a revisão' };
  function label(step) { if (names[step]) return names[step]; var m = /^areas:(\d+)$/.exec(step); return m ? 'Áreas de atuação (parte ' + (+m[1] + 1) + ')' : step; }
  function addItem(step) { var li = document.createElement('li'); li.textContent = label(step); li.dataset.step = step; list.appendChild(li); return li; }
  function post(url, fd) {
    return fetch(url, { method: 'POST', body: fd, credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } })
      .then(function (r) { return r.json().catch(function () { throw new Error('Resposta inválida do servidor (' + r.status + ').'); }); })
      .then(function (j) { if (!j.ok) throw new Error(j.erro || 'Falha na geração.'); return j; });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var txt = form.querySelector('[name=briefing]').value.trim(), files = form.querySelector('[name="arquivos[]"]').files.length;
    if (!txt && !files) { alert('Escreva as informações do escritório ou importe um arquivo.'); return; }
    btn.disabled = true; btn.textContent = 'Gerando...';
    document.getElementById('ia-progress').hidden = false;
    var csrf = form.querySelector('[name=_csrf]').value;
    post(form.action, new FormData(form)).then(function (j) {
      var queue = j.etapas.slice();
      var run = function () {
        if (!queue.length) { location.reload(); return; }
        var step = queue.shift(), li = list.querySelector('[data-step="' + step + '"]') || addItem(step);
        li.className = 'run';
        var fd = new FormData(); fd.append('_csrf', csrf); fd.append('etapa', step);
        return post(form.dataset.step, fd).then(function (r) {
          li.className = 'done';
          (r.novas || []).forEach(function (s) { queue.push(s); addItem(s); });
          return run();
        });
      };
      j.etapas.forEach(addItem);
      return run();
    }).catch(function (err) {
      var li = list.querySelector('.run'); if (li) li.className = 'fail';
      alert(err.message); btn.disabled = false; btn.textContent = 'Tentar de novo';
    });
  });
})();
