(function () {
  'use strict';
  var form = document.getElementById('color-form');
  if (!form) return;
  var frame = document.getElementById('preview');
  var csrf = form.querySelector('[name=_csrf]').value;

  /* ---------- conversões ---------- */
  function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      var d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
    }
    return [h * 360, s, l];
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
    var r, g, b;
    if (s === 0) { r = g = b = l; } else { var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); }
    return rgbToHex(r * 255, g * 255, b * 255);
  }
  function lum(hex) { return hexToRgb(hex).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [.2126, .7152, .0722][i]; }, 0); }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  var valid = function (v) { return /^#[0-9a-f]{6}$/i.test(v); };

  /* ---------- campos ---------- */
  function setColor(name, hex) {
    var c = form.querySelector('input[type=color][name="' + name + '"]');
    var t = form.querySelector('[data-color-for="' + name + '"]');
    if (c && hex) c.value = hex;
    if (t) t.value = hex || '';
    if (c) c.removeAttribute('data-empty');
  }
  function get(name) { var t = form.querySelector('[data-color-for="' + name + '"]'); return t ? t.value.trim() : ''; }

  form.querySelectorAll('input[type=color]').forEach(function (c) {
    var t = form.querySelector('[data-color-for="' + c.name + '"]');
    c.addEventListener('input', function () { if (t) t.value = c.value; c.removeAttribute('data-empty'); changed(); });
    if (t) t.addEventListener('input', function () { if (valid(t.value)) { c.value = t.value; changed(); } else if (t.value === '') changed(); });
  });
  form.addEventListener('change', changed);
  var ang = form.querySelector('[name=degrade_angulo]');
  ang.addEventListener('input', function () { document.getElementById('ang-out').textContent = ang.value + '°'; changed(); });

  /* ---------- paletas prontas ---------- */
  document.querySelectorAll('.palette').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = JSON.parse(b.getAttribute('data-p'));
      setColor('cor_primaria', p.p); setColor('cor_destaque', p.a); setColor('cor_fundo', p.f); setColor('cor_texto', p.t);
      var on = form.querySelector('[name=degrade_ativo]');
      if (p.g) {
        on.checked = true; setColor('degrade_cor0', p.g[0]); setColor('degrade_cor1', p.g[1]); setColor('degrade_cor2', p.g[2] || '');
        ang.value = p.g[3]; document.getElementById('ang-out').textContent = p.g[3] + '°';
      } else { on.checked = false; }
      document.querySelectorAll('.palette').forEach(function (x) { x.classList.toggle('on', x === b); });
      changed();
    });
  });

  /* ---------- harmonia a partir de uma cor ---------- */
  document.querySelectorAll('[data-harmony]').forEach(function (b) {
    b.addEventListener('click', function () {
      var seed = document.getElementById('seed').value, hsl = rgbToHsl.apply(null, hexToRgb(seed)), h = hsl[0], s = Math.max(.35, hsl[1]);
      var mode = b.getAttribute('data-harmony'), primary, accent, g2, g3;
      var accentL = Math.min(.5, Math.max(.32, hsl[2]));
      accent = hslToHex(h, s, accentL);
      if (mode === 'mono') { primary = hslToHex(h, Math.min(s, .45), .13); g2 = hslToHex(h, s, .28); g3 = accent; }
      if (mode === 'analoga') { primary = hslToHex(h - 30, Math.min(s, .5), .14); g2 = hslToHex(h - 15, s, .3); g3 = hslToHex(h + 30, s, .45); }
      if (mode === 'complementar') { primary = hslToHex(h + 180, Math.min(s, .45), .14); g2 = hslToHex(h + 180, s, .3); g3 = accent; }
      if (mode === 'triade') { primary = hslToHex(h + 120, Math.min(s, .45), .14); g2 = accent; g3 = hslToHex(h + 240, s, .45); }
      setColor('cor_primaria', primary); setColor('cor_destaque', accent);
      setColor('cor_fundo', hslToHex(h, .12, .97)); setColor('cor_texto', hslToHex(h, .25, .12));
      setColor('degrade_cor0', primary); setColor('degrade_cor1', g2); setColor('degrade_cor2', g3);
      changed();
    });
  });

  /* ---------- cores do logotipo ---------- */
  var logo = document.getElementById('logo-src');
  if (logo) {
    var extract = function () {
      try {
        var cv = document.createElement('canvas'), w = 120, hgt = Math.max(1, Math.round(120 * logo.naturalHeight / logo.naturalWidth));
        cv.width = w; cv.height = hgt; var cx = cv.getContext('2d'); cx.drawImage(logo, 0, 0, w, hgt);
        var d = cx.getImageData(0, 0, w, hgt).data, bins = {};
        for (var i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 128) continue;
          var hsl = rgbToHsl(d[i], d[i + 1], d[i + 2]);
          if (hsl[2] > .95 || (hsl[1] < .08 && hsl[2] > .85)) continue; // ignora fundo branco
          var k = [d[i] >> 4, d[i + 1] >> 4, d[i + 2] >> 4].join(',');
          bins[k] = bins[k] || { n: 0, r: 0, g: 0, b: 0 }; bins[k].n++; bins[k].r += d[i]; bins[k].g += d[i + 1]; bins[k].b += d[i + 2];
        }
        var cols = Object.keys(bins).map(function (k) { var b = bins[k]; return { n: b.n, hex: rgbToHex(b.r / b.n, b.g / b.n, b.b / b.n) }; }).sort(function (a, b) { return b.n - a.n; });
        var picked = [];
        cols.forEach(function (c) { if (picked.length < 6 && picked.every(function (p) { var a = hexToRgb(p), b = hexToRgb(c.hex); return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 60; })) picked.push(c.hex); });
        var box = document.getElementById('logo-swatches');
        box.innerHTML = '';
        picked.forEach(function (hex) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'swatch'; b.style.background = hex; b.title = hex; b.setAttribute('aria-label', 'Usar a cor ' + hex);
          b.addEventListener('click', function (e) { setColor(e.shiftKey ? 'cor_primaria' : 'cor_destaque', hex); document.getElementById('seed').value = hex; changed(); });
          box.appendChild(b);
        });
        if (!picked.length) box.textContent = 'Não encontrei cores no logotipo.';
      } catch (err) { document.getElementById('logo-swatches').textContent = 'Não foi possível ler as cores do logotipo.'; }
    };
    if (logo.complete) extract(); else logo.addEventListener('load', extract);
  }

  /* ---------- contraste ---------- */
  function checkContrast() {
    var p = get('cor_primaria'), a = get('cor_destaque'), f = get('cor_fundo'), t = get('cor_texto'), out = [];
    function row(label, r, min) { var ok = r >= min; out.push('<li class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓' : '!') + ' ' + label + ': ' + r.toFixed(1) + ':1' + (ok ? '' : ' (recomendado ' + min + ':1 ou mais)') + '</li>'); }
    if (valid(t) && valid(f)) row('Texto sobre o fundo', contrast(t, f), 4.5);
    if (valid(a)) row('Texto dos botões', Math.max(contrast('#ffffff', a), contrast('#111111', a)), 4.5);
    if (valid(p)) row('Texto sobre a cor principal', Math.max(contrast('#ffffff', p), contrast('#111111', p)), 4.5);
    if (valid(a) && valid(f)) row('Links e ícones sobre o fundo', contrast(a, f), 3);
    document.getElementById('contrast').innerHTML = '<ul>' + out.join('') + '</ul>';
  }

  /* ---------- pré-visualização ---------- */
  var timer;
  function gradPreview() {
    var cs = ['degrade_cor0', 'degrade_cor1', 'degrade_cor2'].map(get).filter(valid);
    var el = document.getElementById('grad-preview');
    el.style.background = cs.length >= 2 ? 'linear-gradient(' + ang.value + 'deg,' + cs.join(',') + ')' : 'var(--bg)';
  }
  function changed() {
    checkContrast(); gradPreview();
    clearTimeout(timer);
    timer = setTimeout(function () {
      var fd = new FormData(form);
      fd.set('_csrf', csrf);
      fetch(form.getAttribute('data-preview'), { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (frame.contentWindow) frame.contentWindow.postMessage({ type: 'theme', css: j.css, grad: j.grad }, location.origin); })
        .catch(function () {});
    }, 180);
  }
  frame.addEventListener('load', function () { changed(); try { var c = frame.contentDocument.getElementById('cookie'); if (c) c.hidden = true; } catch (e) {} });
  document.getElementById('preview-page').addEventListener('change', function () { frame.src = this.value; });
  checkContrast(); gradPreview();
})();
