const UICartoes = {
  _COLORS: [
    { value: '#374151', label: 'Chumbo' },
    { value: '#1e3a8a', label: 'Azul Escuro' },
    { value: '#4f46e5', label: 'Índigo' },
    { value: '#7c3aed', label: 'Violeta' },
    { value: '#0f766e', label: 'Verde Escuro' },
    { value: '#b45309', label: 'Âmbar' },
    { value: '#b91c1c', label: 'Vermelho' },
    { value: '#0e7490', label: 'Ciano' },
  ],

  render() {
    const cartoes = Storage.getCartoes();
    const txAll   = Storage.getTransactions();
    const creditCards = cartoes.filter(c => c.type === 'credito');

    document.getElementById('page-content').innerHTML = `
      <div class="mb-4">
        <button onclick="UICartoes.openForm()"
          class="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Adicionar Cartão
        </button>
      </div>

      ${cartoes.length === 0 ? `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-500 mb-1">Nenhum cartão cadastrado</p>
          <p class="text-xs text-gray-400">Adicione seus cartões de crédito e débito</p>
        </div>
      ` : `
        <div class="space-y-3">
          ${cartoes.map(card => {
            const fatura = Calc.faturaAtual(txAll, card);
            const dias   = Calc.diasAteVencimento(card.dueDay);
            const period = card.type === 'credito' ? Calc.billingPeriod(card) : null;
            const diasLabel = dias === null ? '' : dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias} dias`;
            const diasColor = dias !== null && dias <= 3 ? 'text-red-500' : dias !== null && dias <= 7 ? 'text-amber-500' : 'text-gray-400';
            return `
              <div class="rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                   onclick="UICartoes.openForm('${card.id}')">
                <div class="p-4 relative" style="background: ${card.color || '#374151'}">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-white font-bold text-base leading-tight">${card.name}</p>
                      <span class="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                        ${card.type === 'credito' ? 'Crédito' : 'Débito'}
                      </span>
                    </div>
                    <svg class="w-9 h-9 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                </div>
                ${card.type === 'credito' ? `
                <div class="bg-white px-4 py-3 border border-gray-100 border-t-0 rounded-b-2xl">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-gray-400 mb-0.5">Fatura atual</p>
                      <p class="text-xl font-bold text-gray-900">${Calc.fmt(fatura || 0)}</p>
                      ${period ? `<p class="text-xs text-gray-400 mt-0.5">${Calc.fmtDate(period.from)} a ${Calc.fmtDate(period.to)}</p>` : ''}
                    </div>
                    ${card.dueDay ? `
                    <div class="text-right">
                      <p class="text-xs text-gray-400 mb-0.5">Vencimento</p>
                      <p class="text-sm font-bold text-gray-900">Dia ${card.dueDay}</p>
                      <p class="text-xs font-semibold ${diasColor}">${diasLabel}</p>
                    </div>
                    ` : ''}
                  </div>
                </div>
                ` : `
                <div class="bg-white px-4 py-3 border border-gray-100 border-t-0 rounded-b-2xl">
                  <p class="text-xs text-gray-400 text-center">Cartão de débito</p>
                </div>
                `}
              </div>`;
          }).join('')}
        </div>
      `}
    `;
  },

  openForm(editId) {
    const card     = editId ? Storage.getCartoes().find(c => c.id === editId) : null;
    const selColor = card?.color || '#374151';
    const selType  = card?.type  || 'credito';

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900">${card ? 'Editar' : 'Novo'} Cartão</h3>
        </div>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nome do cartão *</label>
          <input id="card-name" type="text" autocomplete="off" placeholder="Ex: Nubank, Itaú Visa..."
            value="${card?.name || ''}"
            oninput="document.getElementById('card-preview-name').textContent = this.value || 'Nome do cartão'"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Tipo *</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="card-btn-credito" onclick="UICartoes._setType('credito')"
              class="py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${selType === 'credito' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}">
              Crédito
            </button>
            <button type="button" id="card-btn-debito" onclick="UICartoes._setType('debito')"
              class="py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${selType === 'debito' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}">
              Débito
            </button>
          </div>
          <input type="hidden" id="card-type" value="${selType}">
        </div>
        <div id="card-credit-fields" class="${selType !== 'credito' ? 'hidden' : ''}">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Dia de fechamento</label>
              <input id="card-closing" type="number" min="1" max="28" placeholder="Ex: 22"
                value="${card?.closingDay || ''}"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Dia de vencimento</label>
              <input id="card-due" type="number" min="1" max="28" placeholder="Ex: 2"
                value="${card?.dueDay || ''}"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-1">Dias de fechamento e vencimento da fatura.</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-2">Cor do cartão</label>
          <div class="flex gap-2 flex-wrap">
            ${this._COLORS.map(c => `
              <button type="button" onclick="UICartoes._selectColor('${c.value}')"
                title="${c.label}"
                id="color-btn-${c.value.replace('#','')}"
                style="background:${c.value}; border-width:3px; border-style:solid; border-color:${selColor === c.value ? '#111827' : 'transparent'}; width:2rem; height:2rem; border-radius:0.75rem; transition:all 0.1s; transform:${selColor === c.value ? 'scale(1.15)' : 'scale(1)'}">
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="card-color" value="${selColor}">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Pré-visualização</label>
          <div id="card-preview" class="rounded-xl p-4 flex items-center justify-between" style="background:${selColor}">
            <div>
              <p id="card-preview-name" class="text-white font-bold text-sm">${card?.name || 'Nome do cartão'}</p>
              <span id="card-preview-type" class="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                ${selType === 'credito' ? 'Crédito' : 'Débito'}
              </span>
            </div>
            <svg class="w-7 h-7 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
        </div>
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="Modal.close()" class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
          <button type="button" id="card-submit-btn" onclick="UICartoes.submitForm('${editId || ''}')"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
            ${card ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
        ${card ? `
        <button type="button" onclick="UICartoes.deleteCartao('${editId}')"
          class="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
          Excluir cartão
        </button>` : ''}
      </div>
    `;
    Modal.open();
  },

  _setType(type) {
    document.getElementById('card-type').value = type;
    const base = 'py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors';
    const creditoBtn   = document.getElementById('card-btn-credito');
    const debitoBtn    = document.getElementById('card-btn-debito');
    const creditFields = document.getElementById('card-credit-fields');
    const previewType  = document.getElementById('card-preview-type');
    if (type === 'credito') {
      if (creditoBtn) creditoBtn.className = `${base} border-indigo-500 bg-indigo-50 text-indigo-700`;
      if (debitoBtn)  debitoBtn.className  = `${base} border-gray-200 text-gray-600 bg-white hover:bg-gray-50`;
      creditFields?.classList.remove('hidden');
      if (previewType) previewType.textContent = 'Crédito';
    } else {
      if (debitoBtn)  debitoBtn.className  = `${base} border-indigo-500 bg-indigo-50 text-indigo-700`;
      if (creditoBtn) creditoBtn.className = `${base} border-gray-200 text-gray-600 bg-white hover:bg-gray-50`;
      creditFields?.classList.add('hidden');
      if (previewType) previewType.textContent = 'Débito';
    }
  },

  _selectColor(hex) {
    document.getElementById('card-color').value = hex;
    const preview = document.getElementById('card-preview');
    if (preview) preview.style.background = hex;
    this._COLORS.forEach(c => {
      const btn = document.getElementById('color-btn-' + c.value.replace('#', ''));
      if (!btn) return;
      const selected = c.value === hex;
      btn.style.borderColor = selected ? '#111827' : 'transparent';
      btn.style.transform   = selected ? 'scale(1.15)' : 'scale(1)';
    });
  },

  async submitForm(editId) {
    const name    = document.getElementById('card-name')?.value?.trim();
    const type    = document.getElementById('card-type')?.value;
    const color   = document.getElementById('card-color')?.value || '#374151';
    const closing = parseInt(document.getElementById('card-closing')?.value) || null;
    const due     = parseInt(document.getElementById('card-due')?.value) || null;

    if (!name) { alert('Informe o nome do cartão.'); return; }

    const data = {
      name,
      type,
      color,
      closingDay: type === 'credito' ? closing : null,
      dueDay:     type === 'credito' ? due     : null,
    };
    const btn = document.getElementById('card-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
    try {
      if (editId) await Storage.updateCartao(editId, data);
      else        await Storage.addCartao(data);
      Modal.close();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique sua conexão.');
      if (btn) { btn.disabled = false; btn.textContent = editId ? 'Salvar' : 'Adicionar'; }
    }
  },

  deleteCartao(id) {
    Confirm.show('Este cartão será removido. As transações vinculadas não serão afetadas.', async () => {
      try { await Storage.deleteCartao(id); Modal.close(); }
      catch (e) { alert('Erro ao excluir.'); }
    });
  },
};
