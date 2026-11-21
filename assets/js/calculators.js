/* Calculadoras jurídicas – todo o cálculo acontece no navegador. */
(function () {
  'use strict';

  var form = document.querySelector('form[data-calc]');
  var out = document.getElementById('resultado');
  if (!form || !out) return;

  /* ---------- utilidades ---------- */
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function money(v) { return brl.format(Math.round(v * 100) / 100); }
  function num(name) {
    var el = form.elements[name];
    if (!el) return 0;
    var raw = String(el.value || '').trim();
    if (!raw) return 0;
    // aceita "1.234,56", "1234,56" e "1234.56"
    if (raw.indexOf(',') > -1) raw = raw.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(raw.replace(/[^\d.\-]/g, ''));
    return isFinite(n) ? n : 0;
  }
  function val(name) { var el = form.elements[name]; return el ? el.value : ''; }
  function checked(name) { var el = form.elements[name]; return !!(el && el.checked); }
  function date(name, scope) {
    var el = (scope || form).querySelector('[name="' + name + '"]');
    if (!el || !el.value) return null;
    var p = el.value.split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  var DAY = 86400000;
  function addDays(t, d) { return t + d * DAY; }
  function ymd(t) { var d = new Date(t); return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()]; }
  function utc(y, m, d) { return Date.UTC(y, m, d); }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function fmtDate(t) { var a = ymd(t); return pad(a[2]) + '/' + pad(a[1] + 1) + '/' + a[0]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /** Anos completos entre duas datas. */
  function fullYears(a, b) {
    var A = ymd(a), B = ymd(b);
    var y = B[0] - A[0];
    if (B[1] < A[1] || (B[1] === A[1] && B[2] < A[2])) y--;
    return Math.max(0, y);
  }

  /** Mesmo dia/mês somando meses (ajusta para o último dia quando necessário). */
  function addMonths(t, n) {
    var a = ymd(t);
    var m = a[1] + n, y = a[0] + Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    return utc(y, m, Math.min(a[2], daysInMonth(y, m)));
  }

  function error(msg) {
    out.innerHTML = '<div class="alert alert-error" role="alert">' + esc(msg) + '</div>';
    if (window.innerWidth < 1000) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Monta o painel de resultado.
   * rows: [label, valor, {note, neg, sub}] ; groups: [{caption, rows}]
   */
  function render(totalLabel, total, groups, notes) {
    var h = '<div class="result-total"><span>' + esc(totalLabel) + '</span><strong>' + (typeof total === 'number' ? money(total) : esc(total)) + '</strong></div>';
    groups.forEach(function (g) {
      h += '<table class="result-table">' + (g.caption ? '<caption>' + esc(g.caption) + '</caption>' : '') + '<tbody>';
      g.rows.forEach(function (r) {
        var o = r[2] || {};
        var cls = (o.neg ? 'neg ' : '') + (o.sub ? 'sub' : '');
        var v = typeof r[1] === 'number' ? (o.neg ? '− ' + money(Math.abs(r[1])) : money(r[1])) : esc(r[1]);
        h += '<tr class="' + cls + '"><th>' + esc(r[0]) + (o.note ? '<small>' + esc(o.note) + '</small>' : '') + '</th><td>' + v + '</td></tr>';
      });
      h += '</tbody></table>';
    });
    if (notes && notes.length) {
      h += '<ul class="result-notes">' + notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    }
    var cta = out.getAttribute('data-contato');
    if (cta) h += '<div class="result-cta"><a class="btn btn-accent btn-block" href="' + esc(cta) + '">Pedir análise do meu caso</a></div>';
    out.innerHTML = h;
    if (window.innerWidth < 1000) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- campos condicionais ---------- */
  function toggleConditional() {
    var key = form.elements.tipo ? val('tipo') : (form.elements.regime ? val('regime') : '');
    form.querySelectorAll('[data-show-for]').forEach(function (el) {
      el.hidden = el.getAttribute('data-show-for').split(' ').indexOf(key) === -1;
    });
    form.querySelectorAll('[data-hide-for]').forEach(function (el) {
      el.hidden = el.getAttribute('data-hide-for').split(' ').indexOf(key) > -1;
    });
    var noKids = form.querySelector('[data-only-no-kids]');
    if (noKids) noKids.hidden = num('filhos') > 0;
  }
  form.addEventListener('change', toggleConditional);
  form.addEventListener('input', function (e) {
    if (e.target.name === 'filhos') toggleConditional();
    if (e.target.name === 'pct' && form.elements.pctOut) form.elements.pctOut.value = e.target.value + '%';
  });
  toggleConditional();

  /* =====================================================================
     Rescisão trabalhista
     ===================================================================== */
  function rescisao() {
    var sal = num('salario'), adm = date('admissao'), dem = date('demissao');
    var tipo = val('tipo'), aviso = val('aviso'), venc = +val('vencidas');
    if (!sal || !adm || !dem) return error('Informe salário, data de admissão e último dia trabalhado.');
    if (dem < adm) return error('O último dia trabalhado não pode ser anterior à admissão.');

    var anos = fullYears(adm, dem);
    var diasAvisoProp = Math.min(90, 30 + 3 * anos); // Lei 12.506/2011
    var diasAvisoPago = 0, desconto = 0;

    if (tipo === 'sem_justa' && aviso === 'indenizado') diasAvisoPago = diasAvisoProp;
    if (tipo === 'acordo' && aviso === 'indenizado') diasAvisoPago = Math.round(diasAvisoProp / 2);
    if (tipo === 'pedido' && aviso === 'nao_cumprido') desconto = sal; // 30 dias

    // O aviso indenizado projeta o fim do contrato (art. 487, §1º, CLT).
    var fim = addDays(dem, diasAvisoPago);

    // Saldo de salário: dias trabalhados no último mês (base de 30 dias).
    var D = ymd(dem), A = ymd(adm);
    var inicioMes = (A[0] === D[0] && A[1] === D[1]) ? A[2] : 1;
    var diasSaldo = Math.min(30, D[2] - inicioMes + 1);
    var saldo = sal / 30 * diasSaldo;

    // 13º proporcional: meses do ano com 15 dias ou mais trabalhados.
    var avos13 = 0;
    if (tipo !== 'justa') {
      var F = ymd(fim);
      var startYear = D[0];
      for (var y = startYear; y <= F[0]; y++) {
        for (var m = 0; m < 12; m++) {
          var ms = utc(y, m, 1), me = utc(y, m, daysInMonth(y, m));
          var a = Math.max(ms, adm), b = Math.min(me, fim);
          if (b >= a && (b - a) / DAY + 1 >= 15) avos13++;
        }
      }
    }
    var decimo = sal / 12 * avos13;

    // Férias proporcionais: meses desde o último aniversário do contrato.
    var avosFerias = 0;
    if (tipo !== 'justa') {
      var anosAteFim = fullYears(adm, fim);
      var aquis = addMonths(adm, anosAteFim * 12);
      var cursor = aquis, meses = 0;
      while (addMonths(aquis, meses + 1) <= addDays(fim, 1)) meses++;
      cursor = addMonths(aquis, meses);
      var resto = (fim - cursor) / DAY + 1;
      avosFerias = Math.min(12, meses + (resto >= 15 ? 1 : 0));
    }
    var ferias = sal / 12 * avosFerias;
    var feriasV = sal * venc;
    var terco = (ferias + feriasV) / 3;

    var avisoValor = sal / 30 * diasAvisoPago;

    // FGTS: saldo informado ou estimativa de 8% ao mês (incluindo 13º).
    var mesesContrato = Math.max(1, Math.round((dem - adm) / DAY / 30.4375));
    var fgtsInformado = num('fgts');
    var fgtsBase = fgtsInformado || sal * 0.08 * mesesContrato * (13 / 12);
    var fgtsRescisorio = (saldo + avisoValor + decimo) * 0.08;
    var multaPct = tipo === 'sem_justa' ? 0.4 : (tipo === 'acordo' ? 0.2 : 0);
    var multa = (fgtsBase + fgtsRescisorio) * multaPct;

    var rows = [['Saldo de salário', saldo, { note: diasSaldo + ' dias' }]];
    if (diasAvisoPago) rows.push(['Aviso prévio indenizado', avisoValor, { note: diasAvisoPago + ' dias' + (tipo === 'acordo' ? ' (metade, por acordo)' : '') }]);
    if (avos13) rows.push(['13º salário proporcional', decimo, { note: avos13 + '/12 avos' }]);
    if (venc) rows.push(['Férias vencidas', feriasV, { note: venc + (venc > 1 ? ' períodos' : ' período') }]);
    if (avosFerias) rows.push(['Férias proporcionais', ferias, { note: avosFerias + '/12 avos' }]);
    if (terco) rows.push(['1/3 constitucional sobre férias', terco]);
    if (multa) rows.push(['Multa do FGTS (' + (multaPct * 100) + '%)', multa, { note: fgtsInformado ? 'sobre o saldo informado' : 'sobre saldo estimado de ' + money(fgtsBase) }]);
    if (desconto) rows.push(['Desconto do aviso não cumprido', -desconto, { neg: true, note: '30 dias' }]);

    var total = rows.reduce(function (s, r) { return s + r[1]; }, 0);

    var saque = { sem_justa: 'Saque de 100% do FGTS e direito ao seguro-desemprego, se cumpridos os requisitos.', acordo: 'Saque de até 80% do FGTS. Não há direito ao seguro-desemprego.', pedido: 'Sem saque do FGTS e sem seguro-desemprego.', justa: 'Sem saque do FGTS e sem seguro-desemprego.', termino: 'Saque do FGTS permitido. Sem multa de 40% quando o contrato termina no prazo.' }[tipo];

    var notes = [
      'Valores brutos, sem descontos de INSS e Imposto de Renda.',
      saque,
      'Tempo de casa: ' + anos + (anos === 1 ? ' ano' : ' anos') + '. Aviso prévio proporcional de ' + diasAvisoProp + ' dias.'
    ];
    if (diasAvisoPago) notes.push('Com a projeção do aviso, o contrato termina oficialmente em ' + fmtDate(fim) + '.');
    if (venc === 2) notes.push('Férias vencidas há mais de um ano podem ter de ser pagas em dobro (art. 137 da CLT).');
    notes.push('Também são devidos o depósito de FGTS do mês da rescisão (estimado em ' + money(fgtsRescisorio) + ') e eventuais diferenças previstas em convenção coletiva.');

    render('Total estimado a receber', total, [{ rows: rows }], notes);
  }

  /* =====================================================================
     Horas extras
     ===================================================================== */
  function horasExtras() {
    var sal = num('salario'), div = +val('divisor');
    var h1 = num('h1'), p1 = +val('p1') / 100, h2 = num('h2'), p2 = +val('p2') / 100;
    var uteis = Math.max(1, num('uteis')), dsr = num('dsr'), meses = Math.min(60, Math.max(1, Math.round(num('meses'))));
    if (!sal) return error('Informe o salário bruto mensal.');
    if (!h1 && !h2) return error('Informe a quantidade de horas extras por mês.');

    var hora = sal / div;
    var v1 = h1 * hora * (1 + p1), v2 = h2 * hora * (1 + p2);
    var he = v1 + v2;
    var reflexoDsr = he / uteis * dsr;
    var mensal = he + reflexoDsr;

    var groups = [{
      caption: 'Por mês', rows: [
        ['Valor da hora normal', hora, { note: 'salário ÷ ' + div }],
        h1 ? ['Horas extras a ' + Math.round(p1 * 100) + '%', v1, { note: fmtNum(h1) + ' h × ' + money(hora * (1 + p1)) }] : null,
        h2 ? ['Horas extras a ' + Math.round(p2 * 100) + '%', v2, { note: fmtNum(h2) + ' h × ' + money(hora * (1 + p2)) }] : null,
        ['Reflexo no descanso semanal', reflexoDsr, { note: 'horas extras ÷ ' + uteis + ' dias úteis × ' + dsr }],
        ['Total mensal', mensal, { sub: true }]
      ].filter(Boolean)
    }];

    var total = mensal;
    if (meses > 1) {
      var periodo = mensal * meses;
      var r13 = periodo / 12;
      var rFerias = periodo / 12 * (4 / 3);
      var fgts = (periodo + r13) * 0.08;
      total = periodo + r13 + rFerias + fgts;
      groups.push({
        caption: 'No período de ' + meses + ' meses', rows: [
          ['Horas extras e descanso semanal', periodo],
          ['Reflexo no 13º salário', r13],
          ['Reflexo nas férias + 1/3', rFerias],
          ['FGTS (8%)', fgts],
          ['Total do período', total, { sub: true }]
        ]
      });
    }
    render(meses > 1 ? 'Total estimado no período' : 'Valor estimado por mês', total, groups, [
      'Valores brutos, sem descontos de INSS e Imposto de Renda.',
      'Convenções coletivas podem prever adicionais maiores que os legais.',
      'Na Justiça do Trabalho, é possível cobrar diferenças dos últimos 5 anos, desde que a ação seja proposta em até 2 anos após o fim do contrato.'
    ]);
  }
  function fmtNum(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }

  /* =====================================================================
     Inventário e partilha (simplificado, art. 1.829 e seguintes do CC)
     ===================================================================== */
  function inventario() {
    var regime = val('regime');
    var temConjuge = regime !== 'sem';
    var comuns = (regime === 'parcial' || regime === 'uniao' || regime === 'universal') ? num('comuns') : 0;
    var part = num('particulares'), dividas = num('dividas');
    var filhos = Math.max(0, Math.round(num('filhos'))), pais = +val('pais');
    var aliq = num('itcmd') / 100;
    if (!comuns && !part) return error('Informe o valor dos bens.');

    var temMeacao = comuns > 0;
    var meacao = temMeacao ? comuns / 2 : 0;
    var patrimonio = comuns - meacao + part;          // o que pertencia a quem faleceu
    var heranca = Math.max(0, patrimonio - dividas);  // herança líquida
    var fator = patrimonio ? heranca / patrimonio : 0;

    var quinhoes = [];  // [nome, valor, nota]
    var notes = [];

    if (filhos > 0) {
      // Base sobre a qual o cônjuge concorre com os filhos
      var baseConc = 0;
      if (temConjuge) {
        if (regime === 'parcial' || regime === 'uniao') baseConc = part * fator;
        else if (regime === 'sep_conv') baseConc = heranca;
      }
      var parteConj = 0;
      if (baseConc > 0) {
        var cota = 1 / (filhos + 1);
        if (checked('comum') && filhos >= 3) cota = Math.max(cota, 0.25); // art. 1.832
        parteConj = baseConc * cota;
      }
      var porFilho = (heranca - parteConj) / filhos;
      if (temConjuge) quinhoes.push(['Cônjuge ou companheiro (herança)', parteConj, parteConj ? 'concorre com os filhos' + (regime === 'sep_conv' ? '' : ' nos bens particulares') : 'não herda neste regime, apenas a meação']);
      for (var i = 1; i <= filhos; i++) quinhoes.push(['Filho ' + i, porFilho, '']);
      if (regime === 'universal' || regime === 'sep_obrig') notes.push('Neste regime, o cônjuge não concorre com os filhos na herança (art. 1.829, I, do Código Civil).');
      if ((regime === 'parcial' || regime === 'uniao') && !part) notes.push('Sem bens particulares, o cônjuge fica apenas com a meação e não herda junto com os filhos.');
    } else if (pais > 0) {
      var cotaConj = temConjuge ? (pais === 2 ? 1 / 3 : 1 / 2) : 0; // art. 1.837
      var pc = heranca * cotaConj;
      if (temConjuge) quinhoes.push(['Cônjuge ou companheiro (herança)', pc, pais === 2 ? '1/3 da herança' : 'metade da herança']);
      for (var j = 1; j <= pais; j++) quinhoes.push([pais === 1 ? 'Pai ou mãe' : (j === 1 ? 'Pai' : 'Mãe'), (heranca - pc) / pais, '']);
    } else if (temConjuge) {
      quinhoes.push(['Cônjuge ou companheiro (herança)', heranca, 'herda tudo na falta de filhos e pais (art. 1.838)']);
    } else {
      notes.push('Sem filhos, pais ou cônjuge, a herança vai para avós e, depois, para irmãos, sobrinhos e tios. Fale com o escritório para simular este caso.');
    }

    var itcmd = heranca * aliq;
    var rows = [];
    if (temMeacao) rows.push(['Meação do cônjuge ou companheiro', meacao, { note: 'metade dos bens do casal; não é herança e não paga ITCMD' }]);
    rows.push(['Patrimônio de quem faleceu', patrimonio]);
    if (dividas) rows.push(['Dívidas', -Math.min(dividas, patrimonio), { neg: true }]);
    rows.push(['Herança a partilhar', heranca, { sub: true }]);

    var partilha = quinhoes.map(function (q) {
      return [q[0], q[1], { note: q[2] + (q[1] && aliq ? (q[2] ? '; ' : '') + 'ITCMD aprox. ' + money(q[1] * aliq) : '') }];
    });

    var groups = [{ caption: 'Patrimônio', rows: rows }];
    if (partilha.length) groups.push({ caption: 'Divisão da herança', rows: partilha });
    groups.push({ caption: 'Imposto', rows: [['ITCMD estimado (' + fmtNum(aliq * 100) + '%)', itcmd, { note: 'pago pelos herdeiros, sobre a herança' }]] });

    notes.unshift('Simulação sem testamento. Doações em vida, testamento e bens no exterior alteram a partilha.');
    notes.push('Desde a Reforma Tributária (EC 132/2023), o ITCMD deve ser progressivo: confira a tabela do seu estado.');
    notes.push('O inventário pode ser feito em cartório quando há acordo entre os herdeiros. Além do imposto, há custas, emolumentos e honorários.');
    notes.push('Na união estável, a lei aplica as mesmas regras do casamento em comunhão parcial (STF, RE 878.694).');

    render('Herança a partilhar', heranca, groups, notes);
  }

  /* =====================================================================
     Pensão alimentícia
     ===================================================================== */
  function pensao() {
    var renda = num('renda'), filhos = Math.max(1, Math.round(num('filhos'))), pct = num('pct') / 100;
    var gastos = num('gastos'), renda2 = num('renda2');
    if (!renda) return error('Informe a renda líquida mensal de quem vai pagar.');

    var total = renda * pct;
    var groups = [{
      caption: 'Pelo percentual da renda', rows: [
        ['Pensão total (' + Math.round(pct * 100) + '%)', total, { sub: true }],
        filhos > 1 ? ['Por filho', total / filhos, { note: filhos + ' filhos' }] : null,
        ['Faixa usual (15% a 33%)', money(renda * 0.15) + ' a ' + money(renda * 0.33)]
      ].filter(Boolean)
    }];

    if (gastos && renda2 >= 0 && (renda + renda2) > 0) {
      var prop = renda / (renda + renda2);
      groups.push({
        caption: 'Pela divisão proporcional dos gastos', rows: [
          ['Gastos mensais dos filhos', gastos],
          ['Parte de quem paga', gastos * prop, { note: Math.round(prop * 100) + '% dos gastos, proporcional à renda', sub: true }],
          ['Parte do outro genitor', gastos * (1 - prop)]
        ]
      });
    }

    render('Pensão estimada por mês', total, groups, [
      'A lei não fixa um percentual. O juiz equilibra a necessidade de quem recebe e a possibilidade de quem paga (art. 1.694 do Código Civil).',
      'Despesas extras, como plano de saúde e escola, podem ser divididas à parte.',
      'O valor pode ser revisto quando a situação financeira de qualquer das partes muda.'
    ]);
  }

  /* =====================================================================
     Tempo de contribuição
     ===================================================================== */
  var list = document.getElementById('periods');
  var tpl = document.getElementById('period-tpl');
  function addPeriod() {
    if (!list || !tpl) return;
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('button').addEventListener('click', function () {
      if (list.children.length > 1) node.remove();
      else node.querySelectorAll('input').forEach(function (i) { i.value = ''; });
    });
    list.appendChild(node);
  }
  if (list) {
    addPeriod();
    document.getElementById('add-period').addEventListener('click', function () { addPeriod(); list.lastElementChild.querySelector('input').focus(); });
  }

  function tempoContribuicao() {
    var nasc = date('nasc'), sexo = val('sexo'), antes = checked('antes');
    var periods = [];
    var invalid = false;
    list.querySelectorAll('.period').forEach(function (p) {
      var a = date('ini', p), b = date('fim', p);
      if (!a && !b) return;
      if (!a || !b || b < a) { invalid = true; return; }
      periods.push([a, b]);
    });
    if (!nasc) return error('Informe a data de nascimento.');
    if (invalid) return error('Confira os períodos: cada um precisa de início e fim, e o fim não pode ser anterior ao início.');
    if (!periods.length) return error('Adicione pelo menos um período de contribuição.');

    // Une períodos sobrepostos
    periods.sort(function (x, y) { return x[0] - y[0]; });
    var merged = [periods[0].slice()];
    var overlapDays = 0;
    for (var i = 1; i < periods.length; i++) {
      var last = merged[merged.length - 1], cur = periods[i];
      if (cur[0] <= addDays(last[1], 1)) {
        if (cur[0] <= last[1]) overlapDays += (Math.min(cur[1], last[1]) - cur[0]) / DAY + 1;
        last[1] = Math.max(last[1], cur[1]);
      } else merged.push(cur.slice());
    }
    var days = merged.reduce(function (s, p) { return s + (p[1] - p[0]) / DAY + 1; }, 0);
    var anos = Math.floor(days / 365), mesesT = Math.floor((days % 365) / 30), diasT = Math.round(days % 365 % 30);

    var hoje = Date.now();
    var idade = fullYears(nasc, hoje);
    var idadeMin = sexo === 'F' ? 62 : 65;
    var tempoMin = (sexo === 'M' && !antes) ? 20 : 15;
    var faltaTempoDias = Math.max(0, tempoMin * 365 - days);
    var faltaIdade = Math.max(0, idadeMin - idade);
    var pctTempo = Math.min(100, days / (tempoMin * 365) * 100);

    var status = (faltaTempoDias === 0 && faltaIdade === 0) ? 'Requisitos da regra geral atingidos' : 'Ainda não atingiu a regra geral';

    var rows = [
      ['Tempo total', anos + ' anos, ' + mesesT + ' meses e ' + diasT + ' dias', { sub: true }],
      ['Períodos considerados', String(periods.length)],
    ];
    if (overlapDays) rows.push(['Dias sobrepostos descontados', String(Math.round(overlapDays))]);
    rows.push(['Idade atual', idade + ' anos']);

    var req = [
      ['Idade mínima', idadeMin + ' anos', { note: faltaIdade ? 'faltam ' + faltaIdade + (faltaIdade === 1 ? ' ano' : ' anos') : 'atingida' }],
      ['Tempo mínimo de contribuição', tempoMin + ' anos', { note: faltaTempoDias ? 'faltam cerca de ' + Math.ceil(faltaTempoDias / 30) + ' meses' : 'atingido' }]
    ];

    render('Tempo de contribuição', anos + ' anos e ' + mesesT + ' meses', [
      { rows: rows },
      { caption: 'Aposentadoria por idade, regra geral (EC 103/2019)', rows: req }
    ], [
      status + '. Progresso do tempo mínimo: ' + Math.round(pctTempo) + '%.',
      'Quem já contribuía antes de 13/11/2019 pode se encaixar em regras de transição mais vantajosas.',
      'Períodos especiais (insalubridade), rurais, de serviço militar ou como aluno-aprendiz podem aumentar o tempo.',
      'Confira os vínculos no CNIS, pelo app Meu INSS. Períodos que não aparecem lá precisam ser comprovados.'
    ]);
  }

  /* ---------- envio ---------- */
  var handlers = { 'rescisao': rescisao, 'horas-extras': horasExtras, 'inventario': inventario, 'pensao': pensao, 'tempo-contribuicao': tempoContribuicao };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fn = handlers[form.getAttribute('data-calc')];
    if (fn) fn();
  });
})();
