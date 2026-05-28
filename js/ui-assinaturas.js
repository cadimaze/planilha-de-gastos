const UIAssinaturas = {
  _cats: {
    streaming: { label: 'Streaming', bg: 'bg-purple-100', text: 'text-purple-700' },
    musica:    { label: 'Música',    bg: 'bg-pink-100',   text: 'text-pink-700'   },
    ia:        { label: 'IA',        bg: 'bg-blue-100',   text: 'text-blue-700'   },
    software:  { label: 'Software',  bg: 'bg-indigo-50',  text: 'text-indigo-700' },
    jogos:     { label: 'Jogos',     bg: 'bg-green-100',  text: 'text-green-800'  },
    noticias:  { label: 'Notícias',  bg: 'bg-amber-100',  text: 'text-amber-700'  },
    saude:     { label: 'Saúde',     bg: 'bg-teal-100',   text: 'text-teal-700'   },
    outros:    { label: 'Outros',    bg: 'bg-gray-100',   text: 'text-gray-600'   },
  },

  render() {
    const list = Storage.getAssinaturas();
    const pc   = document.getElementById('page-content');
    if (!pc) return;

    if (list.length === 0) { pc.innerHTML = this._emptyState(); return; }

    const rate    = Calc._usdRate || 0;
    const active  = list.filter(a => a.active !== false);
    const totalBRL = active.reduce((s, a) => {
      if (a.currency === 'USD') return rate ? s + a.amount * rate : s;
      return s + a.amount;
    }, 0);
    const usdItems  = active.filter(a => a.currency === 'USD');
    const totalUSD  = usdItems.reduce((s, a) => s + a.amount, 0);
    const hasUSD    = usdItems.length > 0;

    const sorted = [...list].sort((a, b) => a.category.localeCompare(b.category));

    pc.innerHTML = `
      ${this._totalCard(totalBRL, active.length, hasUSD, totalUSD, rate)}
      <div class="mt-4 space-y-2">
        ${sorted.map(a => this._subCard(a, rate)).join('')}
      </div>
    `;
  },

  _totalCard(total, count, hasUSD, totalUSD, rate) {
    const usdNote = hasUSD && rate
      ? `<p class="text-xs text-gray-400 mt-0.5">Inclui $${totalUSD.toFixed(2)} convertido pelo câmbio atual</p>`
      : hasUSD
      ? `<p class="text-xs text-amber-600 mt-0.5">Câmbio indisponível — valores em USD não somados</p>`
      : '';
    return `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total mensal</p>
            <p class="text-2xl font-bold text-gray-900">${Calc.fmt(total)}</p>
            ${usdNote}
            <p class="text-xs text-gray-400 mt-1">${count} assinatura${count !== 1 ? 's' : ''} ativa${count !== 1 ? 's' : ''}</p>
          </div>
          <button onclick="UIAssinaturas.openForm()"
            class="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 active:scale-95 transition-all flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Nova
          </button>
        </div>
      </div>`;
  },

  _subCard(a, rate) {
    const cat    = this._cats[a.category] || this._cats.outros;
    const amtBRL = a.currency === 'USD' && rate ? a.amount * rate : (a.currency === 'BRL' ? a.amount : null);
    const amtStr = amtBRL !== null ? Calc.fmt(amtBRL) : `$${a.amount.toFixed(2)}`;
    const subStr = a.currency === 'USD' ? `$${a.amount.toFixed(2)} USD` : 'por mês';
    return `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3 card-hover cursor-pointer"
           onclick="UIAssinaturas.openForm('${a.id}')">
        <div class="w-9 h-9 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 ${cat.text}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${this._catIcon(a.category)}
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">${a.name}</p>
          <span class="inline-block text-[10px] font-semibold ${cat.bg} ${cat.text} px-1.5 py-0.5 rounded-md mt-0.5">${cat.label}</span>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-bold text-gray-900">${amtStr}</p>
          <p class="text-[10px] text-gray-400">${subStr}</p>
        </div>
      </div>`;
  },

  _catIcon(cat) {
    const icons = {
      streaming: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      musica:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>',
      ia:        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>',
      software:  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>',
      jogos:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>',
      noticias:  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>',
      saude:     '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>',
      outros:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>',
    };
    return icons[cat] || icons.outros;
  },

  _emptyState() {
    return `
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-800 mb-1">Nenhuma assinatura</h3>
        <p class="text-sm text-gray-400 mb-6 max-w-xs">Cadastre suas assinaturas para acompanhar quanto você gasta por mês.</p>
        <button onclick="UIAssinaturas.openForm()"
          class="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 active:scale-95 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Nova assinatura
        </button>
      </div>`;
  },

  openForm(id) {
    const a = id ? Storage.getAssinaturas().find(x => x.id === id) : null;
    const isEdit = !!a;
    const catOptions = Object.entries(this._cats)
      .map(([k, v]) => `<option value="${k}" ${a?.category === k ? 'selected' : ''}>${v.label}</option>`)
      .join('');

    document.getElementById('modal-box').innerHTML = `
      <div class="px-5 py-5">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">${isEdit ? 'Editar assinatura' : 'Nova assinatura'}</p>
              <p class="text-xs text-gray-400">${isEdit ? a.name : 'Preencha os dados'}</p>
            </div>
          </div>
          <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-5">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Nome da assinatura</label>
            <input id="ass-name" type="text" placeholder="Netflix, Spotify, ChatGPT..."
              value="${a ? a.name : ''}"
              class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Categoria</label>
            <select id="ass-category" class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400">
              ${catOptions}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Valor mensal</label>
              <input id="ass-amount" type="number" min="0" step="0.01" placeholder="0,00"
                value="${a ? a.amount : ''}"
                class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Moeda</label>
              <select id="ass-currency" class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="BRL" ${(!a || a.currency !== 'USD') ? 'selected' : ''}>R$ (BRL)</option>
                <option value="USD" ${a?.currency === 'USD' ? 'selected' : ''}>$ (USD)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <button id="ass-save-btn" onclick="UIAssinaturas.save('${a?.id || ''}')"
            class="w-full py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 active:scale-95 transition-all">
            ${isEdit ? 'Salvar alterações' : 'Adicionar assinatura'}
          </button>
          ${isEdit ? `
          <button onclick="UIAssinaturas.remove('${a.id}')"
            class="w-full py-2.5 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-all">
            Excluir assinatura
          </button>` : ''}
        </div>
      </div>`;
    Modal.open();
  },

  async save(id) {
    const name     = document.getElementById('ass-name').value.trim();
    const category = document.getElementById('ass-category').value;
    const amount   = parseFloat(document.getElementById('ass-amount').value);
    const currency = document.getElementById('ass-currency').value;

    if (!name)              { alert('Informe o nome da assinatura.'); return; }
    if (!amount || amount <= 0) { alert('Informe um valor válido.');  return; }

    const btn = document.getElementById('ass-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
    try {
      const data = { name, category, amount, currency };
      if (id) await Storage.updateAssinatura(id, data);
      else    await Storage.addAssinatura(data);
      Modal.close();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar: ' + (e.message || e));
      if (btn) { btn.disabled = false; btn.textContent = id ? 'Salvar alterações' : 'Adicionar assinatura'; }
    }
  },

  remove(id) {
    const a = Storage.getAssinaturas().find(x => x.id === id);
    if (!a) return;
    Confirm.show(`Excluir a assinatura "${a.name}"?`, async () => {
      try {
        await Storage.deleteAssinatura(id);
        Modal.close();
      } catch (e) {
        console.error(e);
        alert('Erro ao excluir: ' + (e.message || e));
      }
    });
  },
};
