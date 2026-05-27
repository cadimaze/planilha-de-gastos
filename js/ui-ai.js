const UIAI = {
  _KEY: 'pg_gemini_key',

  render() {
    const apiKey = localStorage.getItem(this._KEY);
    const el = document.getElementById('page-content');

    if (!apiKey) {
      el.innerHTML = `
        <div class="max-w-md mx-auto pt-4">

          <!-- Header -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 text-center">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style="background:linear-gradient(135deg,#4285F4,#34A853)">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Análise com Google Gemini</h3>
            <p class="text-xs text-gray-400 leading-relaxed">Receba dicas financeiras personalizadas com IA. A chave é <strong>gratuita</strong> e fica salva apenas neste dispositivo.</p>
          </div>

          <!-- Passo a passo -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Como obter sua chave gratuita</p>
            <div class="space-y-4">

              <div class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Acesse o Google AI Studio</p>
                  <p class="text-xs text-gray-400 mt-0.5">Abra <span class="font-mono bg-gray-50 px-1 rounded text-indigo-600">aistudio.google.com</span> no navegador</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Faça login com o Google</p>
                  <p class="text-xs text-gray-400 mt-0.5">Use qualquer conta Google — é totalmente gratuito</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Clique em "Get API key"</p>
                  <p class="text-xs text-gray-400 mt-0.5">Fica no menu lateral esquerdo ou no canto superior direito</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Crie uma chave de API</p>
                  <p class="text-xs text-gray-400 mt-0.5">Clique em "Create API key" e confirme a criação</p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Copie e cole abaixo</p>
                  <p class="text-xs text-gray-400 mt-0.5">A chave começa com <span class="font-mono bg-gray-50 px-1 rounded text-gray-600">AIza...</span></p>
                </div>
              </div>

            </div>
          </div>

          <!-- Formulário -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Chave de API do Gemini *</label>
            <input id="ai-api-key" type="password" placeholder="AIzaSy..."
              autocomplete="off" spellcheck="false"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono mb-2">
            <p class="text-xs text-gray-400 mb-4">Sua chave fica salva <strong>somente neste dispositivo</strong> e nunca é enviada aos nossos servidores.</p>
            <button onclick="UIAI.saveApiKey()"
              class="w-full py-3 text-white rounded-xl text-sm font-semibold transition-colors"
              style="background:linear-gradient(135deg,#4285F4,#34A853)">
              Salvar e começar a analisar
            </button>
          </div>

        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style="background:linear-gradient(135deg,#4285F4,#34A853)">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Análise com Gemini</p>
                <p class="text-xs text-gray-400">Analisa seus últimos 4 meses</p>
              </div>
            </div>
            <button onclick="UIAI.clearApiKey()" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Trocar chave</button>
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
    }
  },

  saveApiKey() {
    const key = (document.getElementById('ai-api-key')?.value || '').trim();
    if (!key.startsWith('AIza')) {
      alert('Chave inválida. A chave do Gemini começa com "AIza". Verifique se copiou corretamente.');
      return;
    }
    localStorage.setItem(this._KEY, key);
    UIAI.render();
  },

  clearApiKey() {
    if (!confirm('Remover a chave de API salva neste dispositivo?')) return;
    localStorage.removeItem(this._KEY);
    UIAI.render();
  },

  async analyzeData() {
    const apiKey = localStorage.getItem(this._KEY);
    if (!apiKey) return;

    const btn = document.getElementById('ai-analyze-btn');
    const res = document.getElementById('ai-result');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Analisando...`;
    }
    if (res) res.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div class="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-gray-500">O Gemini está analisando seus dados...</p>
      </div>`;

    try {
      const prompt = this._buildPrompt();
      const models = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-8b-latest',
        'gemini-pro',
      ];

      let data, lastStatus;
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
          }),
        });
        data = await response.json();
        lastStatus = response.status;
        if (response.ok) break;
        if (response.status === 404 || (data?.error?.status === 'NOT_FOUND')) continue;
        const msg = data?.error?.message || '';
        if (response.status === 401 || response.status === 403) throw new Error(`Sem permissão. Verifique se a chave está correta no Google AI Studio. ${msg}`);
        if (response.status === 429) throw new Error(`Cota excedida. Aguarde alguns segundos e tente novamente. ${msg}`);
        throw new Error(msg || `Erro HTTP ${response.status}`);
      }

      if (!data?.candidates) {
        const msg = data?.error?.message || '';
        throw new Error(msg || `Nenhum modelo disponível para esta chave (HTTP ${lastStatus}). Verifique sua chave no Google AI Studio.`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nenhuma resposta recebida.';

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
          <p class="text-xs text-gray-300 mt-4 pt-3 border-t border-gray-50">Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>`;

    } catch (e) {
      console.error('Gemini error:', e);
      if (res) res.innerHTML = `
        <div class="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p class="text-sm font-semibold text-red-700 mb-1">Erro na análise</p>
          <p class="text-xs text-red-500">${e.message || 'Verifique sua conexão e tente novamente.'}</p>
        </div>`;
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Analisar novamente`;
      }
    }
  },

  _formatText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^## (.+)$/gm, '<p class="font-bold text-gray-900 mt-4 mb-1.5 text-sm">$1</p>')
      .replace(/^### (.+)$/gm, '<p class="font-semibold text-gray-700 mt-3 mb-1 text-xs uppercase tracking-wide">$1</p>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
      .replace(/^- (.+)$/gm, '<div class="flex gap-2 text-sm py-0.5"><span class="text-blue-400 flex-shrink-0 mt-0.5">•</span><span>$1</span></div>')
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
    p += '## Histórico financeiro:\n\n';

    months.forEach(key => {
      const s      = Calc.bankSummary(txAll, key, recAll);
      const catExp = Calc.categoryTotals(txAll, key, 'expense', recAll)
        .filter(c => !Calc.VA_VR_CATS.includes(c.category));
      p += `**${Calc.fmtMonthLong(key)}**\n`;
      p += `Entradas: R$ ${s.income.toFixed(2)} | Saídas: R$ ${s.expenses.toFixed(2)} | Saldo: R$ ${s.balance.toFixed(2)}\n`;
      if (catExp.length > 0) {
        p += `Categorias de gasto: ${catExp.slice(0, 5).map(c => `${c.category} (R$ ${c.amount.toFixed(2)})`).join(', ')}\n`;
      }
      p += '\n';
    });

    const activeRec = recAll.filter(r => r.active !== false);
    if (activeRec.length > 0) {
      const totalRec = activeRec.reduce((s, r) => s + r.amount, 0);
      p += `**Gastos fixos mensais — total R$ ${totalRec.toFixed(2)}:**\n`;
      activeRec.forEach(r => { p += `- ${r.description} (${r.category}): R$ ${r.amount.toFixed(2)}\n`; });
      p += '\n';
    }

    const invSummary = Calc.investimentoSummary(invAll);
    if (invSummary.total > 0) {
      p += `**Patrimônio investido — total R$ ${invSummary.total.toFixed(2)}:**\n`;
      invSummary.typeList.forEach(t => { p += `- ${t.type}: R$ ${t.amount.toFixed(2)}\n`; });
      p += '\n';
    }

    p += '## Responda com exatamente estas seções:\n';
    p += '## 📊 Comparativo mensal\n(como evoluiu mês a mês, com valores reais)\n\n';
    p += '## ⚠️ Pontos de atenção\n(2-3 categorias que mais pesam no orçamento e por quê)\n\n';
    p += '## 💡 Dicas práticas\n(3 ações concretas e específicas para economizar, com estimativa de economia)\n\n';
    if (invSummary.total > 0) p += '## 📈 Sobre seus investimentos\n(avalie a diversificação e sugira melhorias)\n\n';
    p += 'Use markdown com **negrito** e listas. Seja objetivo e use valores em reais.';
    return p;
  },
};
