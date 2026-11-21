// Catálogo: filtros da listagem e galeria com foto ampliada.
(function () {
  var f = document.querySelector('[data-catfiltro]');
  if (f) {
    var cards = [].slice.call(document.querySelectorAll('#cat-grid .cat-card')), out = f.querySelector('.cat-count'), empty = document.getElementById('cat-empty');
    var label = out.textContent.replace(/^\d+\s*/, '');
    var run = function () {
      var fin = (f.querySelector('[name=fin]:checked') || {}).value || '', cat = (f.querySelector('[name=cat]:checked') || {}).value || '';
      var tipo = f.tipo ? f.tipo.value : '', q = f.quartos ? +f.quartos.value : 0, max = f.max ? +String(f.max.value).replace(/\D/g, '') : 0, n = 0;
      cards.forEach(function (c) {
        var d = c.dataset, ok = (!fin || d.fin === fin) && (!tipo || d.tipo === tipo) && (!q || +d.quartos >= q) && (!max || +d.preco <= max) && (!cat || d.cat === cat);
        c.hidden = !ok; if (ok) n++;
      });
      out.textContent = n + ' ' + label; if (empty) empty.hidden = n > 0;
    };
    f.addEventListener('input', run); f.addEventListener('change', run);
    if (f.max) f.max.addEventListener('input', function () { var v = f.max.value.replace(/\D/g, ''); f.max.value = v ? (+v).toLocaleString('pt-BR') : ''; });
  }
  var g = document.querySelector('[data-galeria]'), lb = document.querySelector('.cat-lightbox');
  if (g && lb) {
    var img = lb.querySelector('img'), last = null;
    var close = function () { lb.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
    g.addEventListener('click', function (e) { var b = e.target.closest('.cat-shot'); if (!b) return; last = b; img.src = b.dataset.src; img.alt = (b.querySelector('img') || {}).alt || ''; lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.cat-lb-x').focus(); });
    lb.addEventListener('click', function (e) { if (e.target !== img) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) close(); });
  }
})();
