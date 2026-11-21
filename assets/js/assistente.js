(function () {
  'use strict';
  var root = document.getElementById('as');
  if (!root) return;
  var csrf = root.dataset.csrf;
  var frame = document.getElementById('as-frame');
  var status = document.getElementById('as-status');
  var pending = {}, timer = null, saving = null;

  function setStatus(t, cls) { status.textContent = t; status.className = 'as-status ' + (cls || ''); }
  function post(url, data) {
    var fd = new FormData(); fd.append('_csrf', csrf);
    Object.keys(data).forEach(function (k) {
      if (data[k] && typeof data[k] === 'object') Object.keys(data[k]).forEach(function (p) { fd.append(k + '[' + p + ']', data[k][p]); });
      else fd.append(k, data[k]);
    });
    return fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { throw new Error('Resposta inválida do servidor (' + r.status + ').'); }); })
      .then(function (j) { if (!j.ok) throw new Error(j.erro || 'Não foi possível concluir.'); return j; });
  }
  function refresh() {
    try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; }
  }
  function valueOf(el) { return el.hasAttribute('data-bool') ? (el.checked ? '1' : '0') : el.value; }

  function flush() {
    clearTimeout(timer);
    var keys = Object.keys(pending);
    if (!keys.length) return saving || Promise.resolve();
    var batch = pending; pending = {};
    setStatus('Salvando...', 'busy');
    saving = post(root.dataset.urlSave, { campos: batch })
      .then(function () { setStatus('Rascunho salvo', 'ok'); refresh(); })
      .catch(function (e) { setStatus('Falha ao salvar: ' + e.message, 'err'); Object.assign(pending, batch); })
      .then(function () { saving = null; });
    return saving;
  }
  function queue(el) {
    pending[el.dataset.path] = valueOf(el);
    setStatus('Alterações não salvas...', 'busy');
    clearTimeout(timer);
    timer = setTimeout(flush, el.hasAttribute('data-bool') ? 50 : 650);
  }

  document.querySelectorAll('[data-path]').forEach(function (el) {
    el.addEventListener(el.hasAttribute('data-bool') ? 'change' : 'input', function () {
      if (el.hasAttribute('data-bool')) { var box = el.closest('.as-area'); if (box) box.classList.toggle('on', el.checked); }
      queue(el);
    });
  });

  // Antes de trocar de etapa, salva o que estiver pendente
  document.querySelectorAll('.as-nav a, .as-steps a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!Object.keys(pending).length && !saving) return;
      e.preventDefault(); flush().then(function () { location.href = a.href; });
    });
  });
  window.addEventListener('beforeunload', function (e) { if (Object.keys(pending).length) { flush(); e.preventDefault(); e.returnValue = ''; } });

  // IA
  root.querySelectorAll('button[data-ia]').forEach(function (b) {
    b.addEventListener('click', function () {
      var label = b.innerHTML;
      flush().then(function () {
        b.disabled = true; b.textContent = 'Gerando com IA...'; setStatus('A IA está escrevendo...', 'busy');
        return post(root.dataset.urlIa, { etapa: b.dataset.ia });
      }).then(function (j) {
        Object.keys(j.campos || {}).forEach(function (path) {
          var el = document.querySelector('[data-path="' + path.replace(/"/g, '\\"') + '"]');
          if (el) { el.value = j.campos[path]; el.classList.add('as-filled'); setTimeout(function () { el.classList.remove('as-filled'); }, 2200); }
        });
        setStatus('Textos gerados e salvos no rascunho', 'ok'); refresh();
      }).catch(function (e) { setStatus('IA: ' + e.message, 'err'); alert(e.message); })
        .then(function () { b.disabled = false; b.innerHTML = label; });
    });
  });

  // Equipe
  var add = document.querySelector('[data-add-membro]');
  if (add) add.addEventListener('click', function () { flush().then(function () { return post(root.dataset.urlMembro, { op: 'add' }); }).then(function () { location.reload(); }).catch(function (e) { alert(e.message); }); });
  document.querySelectorAll('[data-del-membro]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!confirm('Remover este profissional do site?')) return;
      flush().then(function () { return post(root.dataset.urlMembro, { op: 'del', id: b.dataset.delMembro }); }).then(function () { location.reload(); }).catch(function (e) { alert(e.message); });
    });
  });

  // Publicar / descartar
  var pub = root.querySelector('button[data-publicar]');
  if (pub) pub.addEventListener('click', function () {
    if (!confirm('Publicar estas alterações no site?')) return;
    pub.disabled = true;
    flush().then(function () { return post(root.dataset.urlPublicar, {}); }).then(function (j) {
      setStatus(j.msg, 'ok');
      document.getElementById('as-form').innerHTML = '<div class="as-done"><h1>' + (j.publicado ? 'Site publicado' : 'Enviado') + '</h1><p>' + j.msg + '</p>' + (j.publicado ? '<p><a class="b b-primary" href="' + root.dataset.urlPreview.split('?')[0] + '" target="_blank">Abrir o site</a></p>' : '') + '</div>';
      if (j.publicado) frame.src = root.dataset.urlPreview.split('?')[0];
    }).catch(function (e) { alert(e.message); pub.disabled = false; });
  });
  var desc = root.querySelector('button[data-descartar]');
  if (desc) desc.addEventListener('click', function () {
    if (!confirm('Descartar o rascunho? Tudo o que foi preenchido e não publicado será perdido.')) return;
    post(root.dataset.urlDescartar, {}).then(function () { location.reload(); });
  });

  // Pré-visualização: computador ou celular, e página exibida
  var wrap = document.getElementById('as-frame-wrap');
  document.querySelectorAll('[data-device]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-device]').forEach(function (x) { x.classList.toggle('on', x === b); });
      wrap.classList.toggle('mobile', b.dataset.device === 'mobile');
    });
  });
  document.getElementById('as-pv-page').addEventListener('change', function () {
    var base = root.dataset.urlPreview.split('?'), path = this.value;
    frame.src = base[0].replace(/\/$/, '') + '/' + path + '?' + base[1];
  });
})();
