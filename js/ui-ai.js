const UIAI = {
  render() {
    const apiKey = localStorage.getItem('pg_claude_key');
    const el = document.getElementById('page-content');
    if (!apiKey) {
      el.innerHTML = `
        <div class="max-w-md mx-auto pt-6">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 text-center mb-1">Análise com IA</h3>
            <p class="text-xs text-gray-400 text-center mb-5">Receba dicas personalizadas baseadas nos seus gastos. Insira sua chave da API Anthropic para começar.</p>
            <div class="mb-4">
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Chave de API Anthropic *</label>
              <input id="ai-api-key" type="password" placeholder="sk-ant-api03-..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
              <p class="text-xs text-gray-400 mt-1.5">Sua chave é salva apenas localmente neste dispositivo e nunca é enviada para nossos servidores.</p>
            </div>
            <button onclick="UIAI.saveApiKey()"
              class="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Salvar e continuar
            </button>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Análise com IA</p>
                <p class="text-xs text-gray-400">Claude analisa seus últimos meses</p>
              </div>
            </div>
            <button onclick="UIAI.clearApiKey()" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Trocar chave</button>
          </div>
        </div>

        <button id="ai-analyze-btn" onclick="UIAI.analyzeData()"
          class="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Analisar meus gastos
        </button>

        <div id="ai-result"></div>
      `;
    }
  },

  saveApiKey() {
    const key = (document.getElementById('ai-api-key')?.value || '').trim();
    if (!key.startsWith('sk-ant-')) {
      alert('Chave inválida. A chave deve começar com "sk-ant-".');
      return;
    }
    localStorage.setItem('pg_claude_key', key);
    UIAI.render();
  },

  clearApiKey() {
    if (!confirm('Remover a chave de API salva?')) return;
    localStorage.removeItem('pg_claude_key');
    UIAI.render();
  },

  async analyzeData() {
    const apiKey = localStorage.getItem('pg_claude_key');
    if (!apiKey) return;

    const btn = document.getElementById('ai-analyze-btn');
    const res = document.getElementById('ai-result');
    if (btn) { btn.disabled = true; btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Analisando...`; }
    if (res) res.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div class="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-gray-500">Analisando seus dados financeiros...</p>
      </div>`;

    try {
      const prompt = this._buildPrompt();
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Chave de API inválida ou expirada.');
        throw new Error(err.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || 'Nenhuma resposta recebida.';

      if (res) res.innerHTML = `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
            <div class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Análise gerada por Claude</p>
          </div>
          <div class="prose-sm text-gray-700 leading-relaxed space-y-2">${UIAI._formatText(text)}</div>
          <p class="text-xs text-gray-300 mt-4 pt-3 border-t border-gray-50">Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>`;
    } catch (e) {
      console.error('AI error:', e);
      if (res) res.innerHTML = `
        <div class="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p class="text-sm font-semibold text-red-700 mb-1">Erro na análise</p>
          <p class="text-xs text-red-500">${e.message || 'Verifique sua conexão e tente novamente.'}</p>
        </div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Analisar novamente`; }
    }
  },

  _formatText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^## (.+)$/gm, '<p class="font-bold text-gray-900 mt-4 mb-1 text-sm">$1</p>')
      .replace(/^### (.+)$/gm, '<p class="font-semibold text-gray-800 mt-3 mb-1 text-xs uppercase tracking-wide">$1</p>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<div class="flex gap-2 text-sm"><span class="text-indigo-400 flex-shrink-0 mt-0.5">•</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 text-sm"><span class="text-indigo-500 font-semibold flex-shrink-0">$1.</span><span>$2</span></div>')
      .replace(/\n{2,}/g, '<div class="mt-2"></div>')
      .replace(/\n/g, ' ');
  },

  _buildPrompt() {
    const txAll  = Storage.getTransactions();
    const recAll = Storage.getRecurrentes();
    const invAll = Storage.getInvestimentos();
    const months = Calc.allMonths(txAll).slice(0, 4);

    let p = 'Você é um assistente financeiro pessoal. Analise os dados abaixo e forneça insights práticos em português brasileiro.\n\n';
    p += '## Dados financeiros dos últimos meses:\n\n';

    months.forEach(key => {
      const s      = Calc.bankSummary(txAll, key, recAll);
      const catExp = Calc.categoryTotals(txAll, key, 'expense', recAll)
        .filter(c => !Calc.VA_VR_CATS.includes(c.category));
      p += `### ${Calc.fmtMonthLong(key)}\n`;
      p += `Entradas: R$ ${s.income.toFixed(2)} | Saídas: R$ ${s.expenses.toFixed(2)} | Saldo: R$ ${s.balance.toFixed(2)}\n`;
      if (catExp.length > 0) {
        p += `Maiores gastos: ${catExp.slice(0, 5).map(c => `${c.category} R$${c.amount.toFixed(2)}`).join(', ')}\n`;
      }
      p += '\n';
    });

    const activeRec = recAll.filter(r => r.active !== false);
    if (activeRec.length > 0) {
      const totalRec = activeRec.reduce((s, r) => s + r.amount, 0);
      p += `## Gastos recorrentes mensais (total: R$ ${totalRec.toFixed(2)}):\n`;
      activeRec.forEach(r => { p += `- ${r.description} (${r.category}): R$ ${r.amount.toFixed(2)}\n`; });
      p += '\n';
    }

    const invSummary = Calc.investimentoSummary(invAll);
    if (invSummary.total > 0) {
      p += `## Patrimônio investido: R$ ${invSummary.total.toFixed(2)}\n`;
      invSummary.typeList.forEach(t => { p += `- ${t.type}: R$ ${t.amount.toFixed(2)}\n`; });
      p += '\n';
    }

    p += '## Responda com:\n';
    p += '1. **Comparativo mensal**: como o usuário evoluiu mês a mês\n';
    p += '2. **Pontos de atenção**: os 2-3 principais gastos que podem ser reduzidos\n';
    p += '3. **Dicas práticas**: 3 ações concretas para economizar mais\n';
    if (invSummary.total > 0) p += '4. **Investimentos**: comentário sobre diversificação e sugestão de melhoria\n';
    p += '\nSeja direto, use linguagem simples e valores em reais onde relevante.';
    return p;
  },
};
