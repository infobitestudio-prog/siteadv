/* Ferramentas dos segmentos: vale-presente, IMC e gasto energético, financiamento imobiliário,
   capacidade de financiamento, calendário de vacinas, idade do pet, estimativa de obra e preparo de exames. */
(function () {
  'use strict';
  var out = document.getElementById('resultado');
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var brl2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function num(v) { v = String(v || '').trim(); if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.'); var n = parseFloat(v.replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var cta = (document.querySelector('.nav-cta[href*="agendar"]') || {}).href || (out && out.dataset.contato) || '#';
  var ctaTxt = ((document.querySelector('.nav-cta[href*="agendar"]') || {}).textContent || 'Falar com a equipe').trim();
  function empty(msg) { out.innerHTML = '<div class="result-empty"><p>' + esc(msg) + '</p></div>'; }
  function table(rows) { return '<table class="result-table"><tbody>' + rows.map(function (r) { return '<tr' + (r[2] ? ' class="sub"' : '') + '><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>'; }
  function notes(n) { return '<ul class="result-notes">' + n.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function btn(label) { return '<div class="result-cta"><a class="btn btn-accent btn-block" href="' + esc(cta) + '">' + esc(label || ctaTxt) + '</a></div>'; }
  function bind(f, fn) { f.addEventListener('input', fn); f.addEventListener('change', fn); fn(); }
  function mensal(aa) { return Math.pow(1 + aa / 100, 1 / 12) - 1; }

  /* Vale-presente */
  var vp = document.querySelector('[data-tool=vale]');
  if (vp) {
    var f0 = vp.querySelector('form'), send = vp.querySelector('.vp-send');
    var up = function () {
      var d = { de: f0.de.value.trim() || 'você', para: f0.para.value.trim() || 'alguém especial', serv: f0.serv.value || 'Um momento de cuidado', msg: f0.msg.value.trim() || 'Sua mensagem aparece aqui.' };
      vp.querySelectorAll('[data-v]').forEach(function (el) { el.textContent = d[el.dataset.v]; });
      var txt = 'Olá! Quero um vale-presente' + (f0.serv.value ? ' de ' + f0.serv.value : '') + ' para ' + d.para + '. De: ' + d.de + (f0.msg.value.trim() ? '. Mensagem do cartão: "' + f0.msg.value.trim() + '"' : '') + '.';
      var n = send.dataset.wa; send.href = n ? 'https://wa.me/' + (n.length <= 11 ? '55' : '') + n + '?text=' + encodeURIComponent(txt) : cta;
    };
    bind(f0, up);
  }

  /* IMC e gasto energético */
  var imc = document.querySelector('form[data-tool=imc]');
  if (imc && out) bind(imc, function () {
    var p = num(imc.peso.value), h = num(imc.alt.value) / 100, a = +imc.idade.value, fa = +imc.ativ.value;
    if (!p || !h) return empty('Informe peso e altura.');
    var v = p / (h * h), cls = v < 18.5 ? 'Abaixo do peso' : v < 25 ? 'Peso adequado' : v < 30 ? 'Sobrepeso' : v < 35 ? 'Obesidade grau I' : v < 40 ? 'Obesidade grau II' : 'Obesidade grau III';
    var rows = [['Classificação (OMS)', esc(cls), 1], ['Faixa de peso adequado para a sua altura', Math.round(18.5 * h * h) + ' a ' + Math.round(24.9 * h * h) + ' kg']];
    if (a >= 18) {
      var tmb = 10 * p + 6.25 * h * 100 - 5 * a + (imc.sexo.value === 'm' ? 5 : -161);
      rows.push(['Metabolismo basal (estimado)', Math.round(tmb).toLocaleString('pt-BR') + ' kcal/dia'], ['Gasto energético total (estimado)', Math.round(tmb * fa).toLocaleString('pt-BR') + ' kcal/dia', 1]);
    }
    out.innerHTML = '<div class="result-total"><span>Seu IMC</span><strong>' + v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '</strong></div>' + table(rows) +
      notes(['O IMC não diferencia massa muscular de gordura nem considera a composição corporal.', 'Metas de alimentação são calculadas de forma individual na consulta, com avaliação completa.']) + btn();
  });

  /* Financiamento: SAC e Price */
  var fi = document.querySelector('form[data-tool=financ]');
  if (fi && out) bind(fi, function () {
    var v = num(fi.valor.value), en = num(fi.entrada.value), n = +fi.prazo.value * 12, i = mensal(num(fi.juros.value));
    fi.prazoOut.textContent = fi.prazo.value + ' anos';
    if (!v) return empty('Informe o valor do imóvel.');
    var pv = Math.max(0, v - en);
    if (!pv) return empty('A entrada cobre o valor do imóvel.');
    var price = i ? pv * i / (1 - Math.pow(1 + i, -n)) : pv / n, am = pv / n, sac1 = am + pv * i, sacN = am + am * i;
    var totP = price * n, totS = am * n + i * pv * (n + 1) / 2;
    var nt = [];
    if (pv > v * .8) nt.push('O valor financiado passa de 80% do imóvel; a maioria dos bancos pede pelo menos 20% de entrada.');
    nt.push('Renda familiar recomendada para a 1ª parcela do SAC (30% da renda): ' + brl.format(sac1 / .3) + '.', 'Não inclui seguros obrigatórios, taxa de administração e avaliação do imóvel.');
    out.innerHTML = '<div class="result-total"><span>Valor financiado</span><strong>' + brl.format(pv) + '</strong></div>' +
      table([['<b>SAC</b><small>parcelas decrescentes</small>', '', 0], ['1ª parcela', brl2.format(sac1)], ['Última parcela', brl2.format(sacN)], ['Total pago (aprox.)', brl.format(totS), 1],
        ['<b>Price</b><small>parcelas fixas</small>', ''], ['Parcela', brl2.format(price)], ['Total pago (aprox.)', brl.format(totP), 1]]) + notes(nt) + btn();
  });

  /* Quanto posso financiar */
  var cp = document.querySelector('form[data-tool=capacidade]');
  if (cp && out) bind(cp, function () {
    var r = num(cp.renda.value), en = num(cp.entrada.value), n = +cp.prazo.value * 12, i = mensal(num(cp.juros.value));
    cp.prazoOut.textContent = cp.prazo.value + ' anos';
    if (!r) return empty('Informe a renda familiar.');
    var p = r * .3, pvS = p / (1 / n + i), pvP = i ? p * (1 - Math.pow(1 + i, -n)) / i : p * n;
    var lim = function (pv) { return en > 0 ? Math.min(pv + en, en / .2) : pv / .8; };
    var imS = lim(pvS), imP = lim(pvP);
    out.innerHTML = '<div class="result-total"><span>Imóvel de até (tabela SAC)</span><strong>' + brl.format(imS) + '</strong></div>' +
      table([['Parcela máxima (30% da renda)', brl2.format(p)], ['Financiamento possível (SAC)', brl.format(pvS)], ['Financiamento possível (Price)', brl.format(pvP)], ['Imóvel de até (Price)', brl.format(imP), 1]]) +
      notes([en > 0 && en < (pvS + en) * .2 ? 'A entrada informada limita o valor do imóvel, porque os bancos costumam exigir 20% de entrada.' : 'Os bancos costumam financiar até 80% do imóvel.', 'Estimativa sem análise de crédito, seguros e taxas.']) + btn('Ver imóveis nessa faixa');
  });

  /* Calendário de vacinas */
  var vc = document.querySelector('form[data-tool=vacinas]');
  if (vc && out) bind(vc, function () {
    var esp = (vc.querySelector('[name=esp]:checked') || {}).value, nasc = vc.nasc.value;
    if (!nasc) return empty('Informe a data de nascimento.');
    var b = new Date(nasc + 'T12:00:00'), add = function (d) { var x = new Date(b); x.setDate(x.getDate() + d); return x.toLocaleDateString('pt-BR'); };
    var L = esp === 'gato'
      ? [['Polivalente felina (V3, V4 ou V5) – 1ª dose', 60], ['Polivalente felina – 2ª dose', 81], ['Polivalente felina – 3ª dose', 102], ['Antirrábica', 120], ['FeLV (leucemia felina), após teste negativo', 120], ['Reforço anual das vacinas', 365 + 60]]
      : [['Polivalente (V8 ou V10) – 1ª dose', 45], ['Polivalente – 2ª dose', 66], ['Polivalente – 3ª dose', 87], ['Gripe canina (tosse dos canis)', 90], ['Antirrábica', 120], ['Reforço anual das vacinas', 365 + 45]];
    out.innerHTML = '<div class="result-total"><span>Calendário de referência</span><strong>' + (esp === 'gato' ? 'Gato' : 'Cão') + '</strong></div>' +
      table(L.map(function (x) { return [esc(x[0]), add(x[1])]; })) + notes(['Doses e intervalos podem mudar conforme a vacina, a região e a saúde do filhote. Vermifugação também faz parte do protocolo.', 'Leve a carteirinha de vacinação em todas as consultas.']) + btn();
  });

  /* Idade do pet */
  var ip = document.querySelector('form[data-tool=idadepet]');
  if (ip && out) bind(ip, function () {
    var esp = (ip.querySelector('[name=esp]:checked') || {}).value, a = +ip.anos.value, por = ip.porte.value;
    ip.anosOut.textContent = a + (a > 1 ? ' anos' : ' ano');
    ip.porte.disabled = esp === 'gato';
    var inc = esp === 'gato' ? 4 : { p: 4, m: 5, g: 6, gg: 7 }[por];
    var h = a === 1 ? 15 : 24 + (a - 2) * inc;
    var fase = h < 20 ? 'Jovem' : h < 50 ? 'Adulto' : h < 70 ? 'Maduro' : 'Idoso';
    out.innerHTML = '<div class="result-total"><span>Em anos humanos, aproximadamente</span><strong>' + h + ' anos</strong></div>' + table([['Fase da vida', fase, 1]]) +
      notes([h >= 50 ? 'Nesta fase, check-ups a cada 6 meses ajudam a identificar alterações cedo.' : 'Check-up anual e vacinas em dia mantêm o pet protegido.', 'Comparação aproximada; cada raça envelhece de um jeito.']) + btn();
  });

  /* Estimativa de obra */
  var ob = document.querySelector('form[data-tool=obra]');
  if (ob && out) bind(ob, function () {
    var a = num(ob.area.value), t = ob.tipo.value, pd = +((ob.querySelector('[name=padrao]:checked') || {}).value || 1);
    if (!a) return empty('Informe a área em m².');
    var R = { construcao: [[2600, 3500], [3500, 5000], [5000, 8500]], reforma: [[1200, 2000], [2000, 3500], [3500, 6500]], leve: [[350, 700], [700, 1200], [1200, 2200]], interiores: [[700, 1300], [1300, 2500], [2500, 5000]] }[t][pd];
    out.innerHTML = '<div class="result-total"><span>Custo estimado da obra</span><strong>' + brl.format(a * R[0]) + ' a ' + brl.format(a * R[1]) + '</strong></div>' +
      table([['Referência por m²', brl.format(R[0]) + ' a ' + brl.format(R[1])], ['Área', a.toLocaleString('pt-BR') + ' m²']]) +
      notes(['O valor real depende do projeto, dos materiais, do estado do imóvel e da mão de obra.', 'Um projeto bem detalhado reduz imprevistos e ajuda a controlar o orçamento da obra.']) + btn();
  });

  /* Preparo de exames */
  var pr = document.querySelector('[data-tool=prep]');
  if (pr) {
    var q = pr.querySelector('[name=q]'), items = [].slice.call(pr.querySelectorAll('.prep-list li'));
    var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    q.addEventListener('input', function () { var v = norm(q.value.trim()); items.forEach(function (li) { li.hidden = v && norm(li.dataset.n).indexOf(v) < 0; }); });
  }
})();
