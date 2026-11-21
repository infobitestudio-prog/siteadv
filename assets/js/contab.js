/* Simuladores contábeis: regime tributário (MEI, Simples Nacional, Lucro Presumido) e custo de funcionário CLT.
   Tabelas: LC 123/2006 (anexos do Simples, redação da LC 155/2016); MEI 2026: teto R$ 81 mil/ano,
   INSS 5% do salário mínimo (R$ 1.621) + R$ 1 de ICMS e/ou R$ 5 de ISS. */
(function () {
  'use strict';
  var out = document.getElementById('resultado');
  if (!out) return;
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var pct = function (v) { return (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%'; };
  function num(v) { v = String(v || '').trim(); if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.'); var n = parseFloat(v.replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var cta = (document.querySelector('.nav-cta[href*="agendar"]') || {}).href || out.dataset.contato || '#';

  var SM = 1621, MEI_TETO = 81000;
  // [limite da faixa (receita bruta em 12 meses), alíquota nominal, parcela a deduzir]
  var ANEXO = {
    I:   [[180000, .04, 0], [360000, .073, 5940], [720000, .095, 13860], [1800000, .107, 22500], [3600000, .143, 87300], [4800000, .19, 378000]],
    II:  [[180000, .045, 0], [360000, .078, 5940], [720000, .10, 13860], [1800000, .112, 22500], [3600000, .147, 85500], [4800000, .30, 720000]],
    III: [[180000, .06, 0], [360000, .112, 9360], [720000, .135, 17640], [1800000, .16, 35640], [3600000, .21, 125640], [4800000, .33, 648000]],
    V:   [[180000, .155, 0], [360000, .18, 4500], [720000, .195, 9900], [1800000, .205, 17100], [3600000, .23, 62100], [4800000, .305, 540000]]
  };
  function simples(anexo, rbt12) {
    var t = ANEXO[anexo];
    for (var i = 0; i < t.length; i++) if (rbt12 <= t[i][0]) return Math.max(0, (rbt12 * t[i][1] - t[i][2]) / rbt12);
    return null;
  }

  var rg = document.querySelector('form[data-tool=regime]');
  if (rg) {
    var calc = function () {
      var fat = num(rg.fat.value), folha = num(rg.folha.value), ativ = rg.ativ.value, iss = num(rg.iss.value) / 100;
      rg.issOut.textContent = (iss * 100).toLocaleString('pt-BR') + '%';
      if (!fat) { out.innerHTML = '<div class="result-empty"><p>Informe o faturamento médio por mês.</p></div>'; return; }
      var ano = fat * 12, linhas = [], notas = [];
      // MEI
      if (ano <= MEI_TETO && ativ !== 'intelectual') {
        var das = SM * .05 + (ativ === 'servico' ? 5 : 1);
        linhas.push(['MEI', das, 'DAS fixo de ' + brl.format(das) + ' por mês']);
      } else notas.push(ativ === 'intelectual' && ano <= MEI_TETO ? 'Profissões intelectuais regulamentadas, em geral, não podem ser MEI.' : 'O faturamento passa do teto do MEI (R$ 81 mil por ano).');
      // Simples
      var anexo = ativ === 'comercio' ? 'I' : ativ === 'industria' ? 'II' : 'III', fr = fat ? folha / fat : 0;
      if (ativ === 'intelectual' && fr < .28) anexo = 'V';
      var al = simples(anexo, ano);
      if (al !== null) {
        linhas.push(['Simples Nacional (Anexo ' + anexo + ')', fat * al, 'Alíquota efetiva de ' + pct(al)]);
        if (ativ === 'intelectual') notas.push('Fator R de ' + pct(fr) + ': ' + (fr >= .28 ? 'a partir de 28% a atividade vai para o Anexo III.' : 'abaixo de 28% a atividade fica no Anexo V. Aumentar o pró-labore pode mudar o anexo.'));
      } else notas.push('O faturamento passa do teto do Simples Nacional (R$ 4,8 milhões por ano).');
      // Lucro Presumido
      var serv = ativ === 'servico' || ativ === 'intelectual';
      var baseIr = fat * (serv ? .32 : .08), baseCs = fat * (serv ? .32 : .12);
      var irpj = baseIr * .15 + Math.max(0, baseIr - 20000) * .10, csll = baseCs * .09, pis = fat * .0065, cofins = fat * .03;
      var issV = serv ? fat * iss : 0, inss = folha * .20;
      var lp = irpj + csll + pis + cofins + issV + inss;
      linhas.push(['Lucro Presumido', lp, 'IRPJ, CSLL, PIS, COFINS' + (serv ? ', ISS' : '') + ' e 20% de INSS sobre a folha']);
      if (!serv) notas.push('Em comércio e indústria, o ICMS (e o IPI) entra à parte no Lucro Presumido.');
      linhas.sort(function (a, b) { return a[1] - b[1]; });
      var h = '<div class="result-total"><span>Menor carga estimada: ' + esc(linhas[0][0]) + '</span><strong>' + brl.format(linhas[0][1]) + '<small style="font-size:.4em"> /mês</small></strong></div><table class="result-table"><tbody>';
      linhas.forEach(function (l, i) { h += '<tr' + (i === 0 ? ' class="sub"' : '') + '><th>' + esc(l[0]) + '<small>' + esc(l[2]) + '</small></th><td>' + brl.format(l[1]) + '<br><small style="color:var(--muted);font-weight:400">' + brl.format(l[1] * 12) + '/ano</small></td></tr>'; });
      h += '</tbody></table><ul class="result-notes">' + notas.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '<li>Estimativa de impostos sobre o faturamento; o regime ideal depende de margem, despesas, atividade exata (CNAE) e município.</li></ul>';
      h += '<div class="result-cta"><a class="btn btn-accent btn-block" href="' + esc(cta) + '">Fazer o planejamento com um contador</a></div>';
      out.innerHTML = h;
    };
    rg.addEventListener('input', calc); rg.addEventListener('change', calc); calc();
  }

  var clt = document.querySelector('form[data-tool=clt]');
  if (clt) {
    var calc2 = function () {
      var s = num(clt.sal.value), simplesN = clt.reg.value === 'simples', vt = num(clt.vt.value), vr = num(clt.vr.value), ou = num(clt.outros.value);
      if (!s) { out.innerHTML = '<div class="result-empty"><p>Informe o salário bruto.</p></div>'; return; }
      var ferias = s / 12 * (4 / 3), dec = s / 12, base = s + ferias + dec;
      var fgts = base * .08;
      var inss = simplesN ? 0 : base * .278; // 20% patronal + RAT médio 2% + terceiros 5,8%
      var vtE = Math.max(0, vt - s * .06);
      var total = s + ferias + dec + fgts + inss + vtE + vr + ou;
      var rows = [['Salário', s], ['Férias + 1/3 (provisão)', ferias], ['13º salário (provisão)', dec], ['FGTS (8%)', fgts]];
      if (!simplesN) rows.push(['INSS patronal, RAT e terceiros (27,8%)', inss]);
      if (vt) rows.push(['Vale-transporte (menos 6% descontado do salário)', vtE]);
      if (vr) rows.push(['Vale-refeição/alimentação', vr]);
      if (ou) rows.push(['Outros benefícios', ou]);
      var h = '<div class="result-total"><span>Custo mensal estimado</span><strong>' + brl.format(total) + '</strong></div><table class="result-table"><tbody>';
      rows.forEach(function (r) { h += '<tr><th>' + esc(r[0]) + '</th><td>' + brl.format(r[1]) + '</td></tr>'; });
      h += '<tr class="sub"><th>Custo por ano</th><td>' + brl.format(total * 12) + '</td></tr><tr><th>Quanto o custo representa sobre o salário</th><td>' + pct(total / s) + '</td></tr></tbody></table>';
      h += '<ul class="result-notes"><li>' + (simplesN ? 'No Simples (Anexos I, II, III e V) a contribuição patronal já está no DAS.' : 'RAT varia de 1% a 3% e terceiros conforme a atividade; usamos médias.') + '</li><li>Não inclui multa rescisória, horas extras, adicionais ou acordos da convenção coletiva.</li></ul>';
      h += '<div class="result-cta"><a class="btn btn-accent btn-block" href="' + esc(cta) + '">Falar com o departamento pessoal</a></div>';
      out.innerHTML = h;
    };
    clt.addEventListener('input', calc2); clt.addEventListener('change', calc2); calc2();
  }
})();
