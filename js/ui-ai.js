// Cole aqui a chave do Google AI Studio (aistudio.google.com → Get API key)
const GEMINI_API_KEY = 'AIzaSyAGIYLuVowYsmKvELf-MWOn_Q4n2Q3CYAw';

const UIAI = {
  render() {
    const el = document.getElementById('page-content');

    if (!GEMINI_API_KEY) {
      el.innerHTML = `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <p class="text-sm text-gray-400 font-medium">Análise IA não configurada</p>
          <p class="text-xs text-gray-300 mt-1">Configure a chave em js/ui-ai.js</p>
        </div>`;
      return;
    }

    el.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style="background:linear-gradient(135deg,#4285F4,#34A853)">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Análise com Gemini</p>
            <p class="text-xs text-gray-400">Analisa seus últimos 4 meses e dá dicas práticas</p>
          </div>
        </div>
      </div>

      <button id="ai-analyze-btn" onclick="UIAI.analyzeData()"
        class="w-full mb-4 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-sm font-semibold active:scale-95 transition-all shadow-sm"
        style="background:linear-gradient(135deg,#4285F4,#34A853)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        Analisar meus gastos
      </button>

      <div id="ai-result"></div>
    `;
  },

  async analyzeData() {
    const btn = document.getElementById('ai-analyze-btn');
    const res = document.getElementById('ai-result');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Analisando...`;
    }
    if (res) res.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div class="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-gray-500">Analisando seus dados financeiros...</p>
      </div>`;

    const models = [
      { version: 'v1beta', name: 'gemini-1.5-flash-latest' },
      { version: 'v1beta', name: 'gemini-1.5-flash' },
      { version: 'v1',     name: 'gemini-1.5-flash' },
      { version: 'v1beta', name: 'gemini-pro' },
    ];

    const prompt = this._buildPrompt();
    let lastError = '';

    for (const { version, name } of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
          }),
        });

        const data = await response.json();

        if (response.status === 404 || data?.error?.status === 'NOT_FOUND') {
          lastError = data?.error?.message || `${name} não encontrado`;
          continue;
        }

        if (!response.ok) {
          const msg = data?.error?.message || `Erro HTTP ${response.status}`;
          if (response.status === 401 || response.status === 403) throw new Error(`Chave inválida ou sem permissão: ${msg}`);
          if (response.status === 429) throw new Error(`Cota excedida, tente novamente em alguns segundos.`);
          throw new Error(msg);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';

        if (res) res.innerHTML = `
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style="background:linear-gradient(135deg,#4285F4,#34A853)">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-700">Análise gerada pelo Gemini</p>
            </div>
            <div class="text-gray-700 leading-relaxed space-y-1">${UIAI._formatText(text)}</div>
            <p class="text-xs text-gray-300 mt-4 pt-3 border-t border-gray-50">
              Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>`;

        if (btn) { btn.disabled = false; btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Analisar novamente`; }
        return;

      } catch (e) {
        if (res) res.innerHTML = `
          <div class="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
            <p class="text-sm font-semibold text-red-700 mb-1">Erro na análise</p>
            <p class="text-xs text-red-500">${e.message}</p>
          </div>`;
        if (btn) { btn.disabled = false; btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Tentar novamente`; }
        return;
      }
    }

    if (res) res.innerHTML = `
      <div class="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
        <p class="text-sm font-semibold text-red-700 mb-1">Nenhum modelo disponível</p>
        <p class="text-xs text-red-500">${lastError}</p>
      </div>`;
    if (btn) { btn.disabled = false; btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Tentar novamente`; }
  },

  _formatText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^## (.+)$/gm, '<p class="font-bold text-gray-900 mt-4 mb-1.5 text-sm">$1</p>')
      .replace(/^### (.+)$/gm, '<p class="font-semibold text-gray-700 mt-3 mb-1 text-xs uppercase tracking-wide">$1</p>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
      .replace(/^- (.+)$/gm, '<div class="flex gap-2 text-sm py-0.5"><span class="text-blue-400 flex-shrink-0">•</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 text-sm py-0.5"><span class="text-blue-500 font-bold flex-shrink-0 w-4">$1.</span><span>$2</span></div>')
      .replace(/\n{2,}/g, '<div class="mt-3"></div>')
      .replace(/\n/g, '<br>');
  },

  _buildPrompt() {
    const txAll  = Storage.getTransactions();
    const recAll = Storage.getRecurrentes();
    const invAll = Storage.getInvestimentos();
    const months = Calc.allMonths(txAll).slice(0, 4);

    let p = 'Você é um consultor financeiro pessoal. Analise os dados abaixo e responda em português brasileiro com linguagem direta e simples.\n\n';

    months.forEach(key => {
      const s      = Calc.bankSummary(txAll, key, recAll);
      const catExp = Calc.categoryTotals(txAll, key, 'expense', recAll)
        .filter(c => !Calc.VA_VR_CATS.includes(c.category));
      p += `**${Calc.fmtMonthLong(key)}:** entradas R$${s.income.toFixed(2)}, saídas R$${s.expenses.toFixed(2)}, saldo R$${s.balance.toFixed(2)}`;
      if (catExp.length > 0) p += `. Maiores gastos: ${catExp.slice(0, 4).map(c => `${c.category} R$${c.amount.toFixed(2)}`).join(', ')}`;
      p += '\n';
    });

    const activeRec = recAll.filter(r => r.active !== false);
    if (activeRec.length > 0) {
      const tot = activeRec.reduce((s, r) => s + r.amount, 0);
      p += `\nGastos fixos mensais (total R$${tot.toFixed(2)}): ${activeRec.map(r => `${r.description} R$${r.amount.toFixed(2)}`).join(', ')}\n`;
    }

    const inv = Calc.investimentoSummary(invAll);
    if (inv.total > 0) {
      p += `\nPatrimônio investido: R$${inv.total.toFixed(2)} — ${inv.typeList.map(t => `${t.type} R$${t.amount.toFixed(2)}`).join(', ')}\n`;
    }

    p += '\nResponda com estas seções:\n';
    p += '## 📊 Comparativo mensal\n## ⚠️ Pontos de atenção\n## 💡 Dicas práticas\n';
    if (inv.total > 0) p += '## 📈 Investimentos\n';
    p += '\nUse listas e **negrito**. Seja objetivo e cite valores em reais.';
    return p;
  },
};
