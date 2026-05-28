const UIInvestimentos = {
  _typeColor(type) {
    const map = {
      'Poupança':           { bg: 'bg-green-100',   text: 'text-green-700',   bar: '#22c55e' },
      'Tesouro Direto':     { bg: 'bg-blue-100',    text: 'text-blue-700',    bar: '#3b82f6' },
      'Tesouro Selic':      { bg: 'bg-sky-100',     text: 'text-sky-700',     bar: '#0ea5e9' },
      'CDB':                { bg: 'bg-teal-100',    text: 'text-teal-700',    bar: '#14b8a6' },
      'LCI/LCA':            { bg: 'bg-cyan-100',    text: 'text-cyan-700',    bar: '#06b6d4' },
      'Fundo Imobiliário':  { bg: 'bg-purple-100',  text: 'text-purple-700',  bar: '#a855f7' },
      'Ações':              { bg: 'bg-orange-100',  text: 'text-orange-700',  bar: '#f97316' },
      'ETF':                { bg: 'bg-rose-100',    text: 'text-rose-700',    bar: '#f43f5e' },
      'Câmbio Internacional': { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: '#eab308' },
      'Criptomoedas':       { bg: 'bg-amber-100',   text: 'text-amber-700',   bar: '#f59e0b' },
      'Previdência Privada':{ bg: 'bg-indigo-100',  text: 'text-indigo-700',  bar: '#6366f1' },
      'Outros':             { bg: 'bg-gray-100',    text: 'text-gray-700',    bar: '#9ca3af' },
    };
    return map[type] || { bg: 'bg-gray-100', text: 'text-gray-700', bar: '#9ca3af' };
  },

  _typeIcon(type) {
    const piggy = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`;
    const badge = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`;
    const card  = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`;
    const house = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`;
    const trend = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`;
    const globe = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>`;
    const coin  = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    const shield= `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
    const icons = {
      'Poupança': piggy, 'Tesouro Direto': badge, 'Tesouro Selic': badge,
      'CDB': card, 'LCI/LCA': card, 'Fundo Imobiliário': house,
      'Ações': trend, 'ETF': trend, 'Câmbio Internacional': globe,
      'Criptomoedas': coin, 'Previdência Privada': shield,
    };
    return icons[type] || `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  },

  render() {
    const inv   = Storage.getInvestimentos();
    const total = inv.reduce((s, i) => s + Calc.toBRL(i.amount, i.currency), 0);

    const byType = {};
    inv.forEach(i => { byType[i.type] = (byType[i.type] || 0) + Calc.toBRL(i.amount, i.currency); });
    const typeList = Object.entries(byType)
      .map(([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount);

    const sorted = [...inv].sort((a, b) => b.date.localeCompare(a.date));

    document.getElementById('page-content').innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Patrimônio Investido</p>
        <p class="text-3xl font-bold text-indigo-600 mb-1">${Calc.fmt(total)}</p>
        <p class="text-xs text-gray-400">${inv.length} aporte${inv.length !== 1 ? 's' : ''} registrado${inv.length !== 1 ? 's' : ''}</p>

        ${typeList.length > 0 ? `
        <div class="mt-4 space-y-2.5">
          ${typeList.map(({ type, amount }) => {
            const pct  = total > 0 ? Math.round((amount / total) * 100) : 0;
            const col  = this._typeColor(type);
            return `
            <div>
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-1.5">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${col.bg} ${col.text}">${type}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-gray-700">${Calc.fmt(amount)}</span>
                  <span class="text-xs text-gray-400 w-8 text-right">${pct}%</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div class="h-1.5 rounded-full transition-all duration-500" style="width:${pct}%;background:${col.bar}"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
        ` : ''}
      </div>

      <button onclick="UIInvestimentos.openForm()"
        class="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Novo Investimento
      </button>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        ${sorted.length === 0 ? `
          <div class="py-14 text-center">
            <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <p class="text-sm text-gray-400 font-medium">Nenhum investimento ainda</p>
            <p class="text-xs text-gray-300 mt-1">Adicione aportes para acompanhar seu patrimônio</p>
          </div>
        ` : `
          <div class="divide-y divide-gray-50">
            ${sorted.map(inv => {
              const col = this._typeColor(inv.type);
              const invAmtDisplay = inv.currency === 'USD'
                ? `<span class="text-xs font-semibold text-blue-600">US$${(inv.amount||0).toFixed(2)}</span><span class="text-[10px] text-gray-400 ml-1">≈ ${Calc.fmt(Calc.toBRL(inv.amount,'USD'))}</span>`
                : Calc.fmt(inv.amount);
              return `
              <div class="flex items-center px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
                   onclick="UIInvestimentos.openForm('${inv.id}')">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${col.bg}">
                  <span class="${col.text}">${this._typeIcon(inv.type)}</span>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <p class="text-sm font-medium text-gray-900 truncate">${_esc(inv.description || inv.type)}</p>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold ${col.bg} ${col.text} flex-shrink-0">${inv.type}</span>
                  </div>
                  <p class="text-xs text-gray-400">${Calc.fmtDate(inv.date)}${inv.notes ? ' · ' + _esc(inv.notes) : ''}</p>
                </div>
                <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                  <p class="text-sm font-bold text-indigo-600">${invAmtDisplay}</p>
                  <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>`;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  _selectedCurrency: 'BRL',

  openForm(id) {
    const inv   = id ? Storage.getInvestimentos().find(i => i.id === id) : null;
    const today = new Date().toISOString().slice(0, 10);
    const types = Calc.INVESTMENT_TYPES;
    this._selectedCurrency = inv?.currency || 'BRL';
    const _curBRL = this._selectedCurrency !== 'USD' ? 'background:#111827;border-color:#111827;color:white' : 'background:white;border-color:#e5e7eb;color:#4b5563';
    const _curUSD = this._selectedCurrency === 'USD' ? 'background:#111827;border-color:#111827;color:white' : 'background:white;border-color:#e5e7eb;color:#4b5563';
    const _amtPrefix = this._selectedCurrency === 'USD' ? 'US$' : 'R$';

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900">${inv ? 'Editar Investimento' : 'Novo Investimento'}</h3>
        </div>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Tipo *</label>
          <select id="inv-type" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Selecionar tipo...</option>
            ${types.map(t => `<option value="${t}" ${inv?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
          <input id="inv-description" type="text" autocomplete="off"
            placeholder="Ex: Tesouro IPCA+ 2029, Ação PETR4..."
            value="${_esc(inv?.description || '')}"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-gray-600">Valor *</label>
              <div class="flex">
                <button type="button" id="inv-cur-brl" onclick="UIInvestimentos._setCurrency('BRL')"
                  class="px-1.5 py-0.5 text-[10px] font-bold rounded-l border border-r-0 border-gray-200 transition-all"
                  style="${_curBRL}">R$</button>
                <button type="button" id="inv-cur-usd" onclick="UIInvestimentos._setCurrency('USD')"
                  class="px-1.5 py-0.5 text-[10px] font-bold rounded-r border border-gray-200 transition-all"
                  style="${_curUSD}">US$</button>
              </div>
            </div>
            <div class="relative">
              <span id="inv-amount-prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">${_amtPrefix}</span>
              <input id="inv-amount" type="number" min="0.01" step="0.01" placeholder="0,00"
                value="${inv?.amount || ''}"
                oninput="UIInvestimentos._updateUsdHint(this.value)"
                class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <p id="inv-usd-hint" class="${this._selectedCurrency === 'USD' ? '' : 'hidden'} text-xs text-blue-500 mt-1">≈ R$ <span id="inv-usd-hint-val">${this._selectedCurrency === 'USD' ? Calc.fmt((parseFloat(inv?.amount)||0) * (Calc._usdRate||6)) : ''}</span></p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Data *</label>
            <input id="inv-date" type="date"
              value="${inv?.date || today}"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
          <textarea id="inv-notes" rows="2" placeholder="Opcional..."
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none">${_esc(inv?.notes || '')}</textarea>
        </div>
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="Modal.close()"
            class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="button" id="inv-submit-btn" onclick="UIInvestimentos.submitForm('${id || ''}')"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
            ${inv ? 'Salvar alterações' : 'Adicionar'}
          </button>
        </div>
        ${inv ? `
        <div class="pt-1">
          <button type="button" onclick="UIInvestimentos.deleteInvestimento('${inv.id}')"
            class="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            Excluir investimento
          </button>
        </div>` : ''}
      </div>
    `;
    Modal.open();
  },

  async submitForm(id) {
    const type   = document.getElementById('inv-type')?.value;
    const desc   = document.getElementById('inv-description')?.value?.trim() || '';
    const amount = parseFloat(document.getElementById('inv-amount')?.value);
    const date   = document.getElementById('inv-date')?.value;
    const notes  = document.getElementById('inv-notes')?.value?.trim() || '';

    if (!type)               { alert('Selecione o tipo de investimento.'); return; }
    if (!amount || amount <= 0) { alert('Informe um valor válido.'); return; }
    if (!date)               { alert('Informe a data.'); return; }

    const data = { type, description: desc, amount, date, notes, currency: this._selectedCurrency || 'BRL' };
    const btn  = document.getElementById('inv-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      if (id) await Storage.updateInvestimento(id, data);
      else    await Storage.addInvestimento(data);
      Modal.close();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique sua conexão.');
      if (btn) { btn.disabled = false; btn.textContent = id ? 'Salvar alterações' : 'Adicionar'; }
    }
  },

  _setCurrency(c) {
    this._selectedCurrency = c;
    const brlBtn = document.getElementById('inv-cur-brl');
    const usdBtn = document.getElementById('inv-cur-usd');
    const prefix = document.getElementById('inv-amount-prefix');
    const hint   = document.getElementById('inv-usd-hint');
    const active = 'background:#111827;border-color:#111827;color:white';
    const inact  = 'background:white;border-color:#e5e7eb;color:#4b5563';
    if (brlBtn) brlBtn.style.cssText = c === 'BRL' ? active : inact;
    if (usdBtn) usdBtn.style.cssText = c === 'USD' ? active : inact;
    if (prefix) prefix.textContent = c === 'USD' ? 'US$' : 'R$';
    if (hint)   hint.classList.toggle('hidden', c !== 'USD');
    if (c === 'USD') {
      const amtEl = document.getElementById('inv-amount');
      this._updateUsdHint(amtEl?.value || '');
    }
  },

  _updateUsdHint(val) {
    const el = document.getElementById('inv-usd-hint-val');
    if (!el) return;
    el.textContent = Calc.fmt((parseFloat(val) || 0) * (Calc._usdRate || 6));
  },

  deleteInvestimento(id) {
    Confirm.show('Este investimento será removido permanentemente.', async () => {
      try {
        await Storage.deleteInvestimento(id);
      } catch (e) {
        console.error(e);
        alert('Erro ao excluir. Verifique sua conexão.');
      }
    });
  },
};
