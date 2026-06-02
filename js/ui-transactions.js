const UITransactions = {
  filter: 'all',
  search: '',
  _selectedCardId: null,
  _selectedCurrency: 'BRL',
  _filterCard: null,
  _filterCategory: null,

  INCOME_CATS:  ['Salário', 'Freelance', 'Investimentos', 'Aluguel Recebido', 'Venda', 'Bônus', 'Reembolso', 'Vale Alimentação', 'Vale Refeição', 'Outros'],
  EXPENSE_CATS: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Vestuário', 'Tecnologia', 'Serviços', 'Lazer', 'Alimentação (VA)', 'Refeição (VR)', 'Outros'],

  // ── Lista ─────────────────────────────────────────────────────────────────
  render(monthKey, dayFilter = null) {
    const txAll   = Storage.getTransactions();
    const recAll  = Storage.getRecurrentes();
    const recTx   = Calc.recurrentForMonth(recAll, monthKey, dayFilter);
    const cartoes = Storage.getCartoes();

    const txAllMonth = [...Calc.txForMonth(txAll, monthKey, dayFilter), ...recTx]
      .sort((a, b) => b.date.localeCompare(a.date));

    const incCount = txAllMonth.filter(t => t.type === 'income').length;
    const expCount = txAllMonth.filter(t => t.type === 'expense').length;

    let txFiltered = [...txAllMonth];
    if (this.filter !== 'all') txFiltered = txFiltered.filter(t => t.type === this.filter);
    if (this.search) {
      const q = this.search.toLowerCase();
      txFiltered = txFiltered.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }

    const usedCardIds = [...new Set(txFiltered.map(t => t.cardId).filter(Boolean))];
    const usedCards = usedCardIds.map(id => cartoes.find(c => c.id === id)).filter(Boolean);

    const txCardFiltered = this._filterCard
      ? txFiltered.filter(t => t.cardId === this._filterCard)
      : txFiltered;

    const uniqueCategories = [...new Set(txCardFiltered.map(t => t.category))].sort();

    const tx = this._filterCategory
      ? txCardFiltered.filter(t => t.category === this._filterCategory)
      : txCardFiltered;

    const catTotal = this._filterCategory !== null && tx.length > 0
      ? tx.reduce((s, t) => s + Calc.toBRL(t.amount, t.currency), 0)
      : null;
    const catIsExpense = tx.length > 0 && tx.every(t => t.type === 'expense');

    const cardChipsHTML = usedCards.length > 0 ? `
        <div id="chips-card-row" class="flex gap-1.5 overflow-x-auto pb-0.5" style="-webkit-overflow-scrolling:touch">
          <button onclick="UITransactions.setCardFilter(null)" class="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${!this._filterCard ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}">Todos</button>
          ${usedCards.map(c => `<button onclick="UITransactions.setCardFilter('${c.id}')" class="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${this._filterCard === c.id ? 'text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}" style="${this._filterCard === c.id ? `background:${c.color||'#374151'};border-color:${c.color||'#374151'}` : ''}">${_esc(c.name)}</button>`).join('')}
        </div>` : '';

    const catChipsHTML = uniqueCategories.length > 1 ? `
        <div id="chips-cat-row" class="flex gap-1.5 overflow-x-auto pb-0.5" style="-webkit-overflow-scrolling:touch">
          <button onclick="UITransactions.setCategoryFilter(null)" class="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${!this._filterCategory ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}">Todas</button>
          ${uniqueCategories.map(cat => `<button onclick="UITransactions.setCategoryFilter('${cat.replace(/'/g, "\\'")}')" class="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${this._filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}">${_esc(cat)}</button>`).join('')}
        </div>` : '';

    document.getElementById('page-content').innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4 space-y-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Buscar transação..." value="${this.search}"
            oninput="UITransactions.setSearch(this.value)"
            class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="flex gap-2">
          <button onclick="UITransactions.setFilter('all')" class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Todos (${txAllMonth.length})</button>
          <button onclick="UITransactions.setFilter('income')" class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Entradas (${incCount})</button>
          <button onclick="UITransactions.setFilter('expense')" class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Saídas (${expCount})</button>
        </div>
        ${cardChipsHTML}
        ${catChipsHTML}
      </div>

      ${catTotal !== null ? `
      <div class="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl mb-4">
        <div>
          <p class="text-xs font-semibold text-indigo-700">${_esc(this._filterCategory)}</p>
          <p class="text-xs text-indigo-500">${tx.length} lançamento${tx.length !== 1 ? 's' : ''} no mês</p>
        </div>
        <p class="text-base font-bold ${catIsExpense ? 'text-red-600' : 'text-green-600'}">${catIsExpense ? '−' : '+'}${Calc.fmt(catTotal)}</p>
      </div>
      ` : ''}

      <div class="grid grid-cols-2 gap-3 mb-3">
        <button onclick="UITransactions.openForm('income')" class="flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg> Entrada
        </button>
        <button onclick="UITransactions.openForm('expense')" class="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/></svg> Saída
        </button>
      </div>
      <button onclick="UITransactions.manageRecurrents()"
        class="w-full mb-4 flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <div class="text-left">
            <p class="text-xs font-semibold text-gray-700">Lançamentos recorrentes</p>
            <p class="text-xs text-gray-400">${recAll.filter(r=>r.active!==false).length} ativo${recAll.filter(r=>r.active!==false).length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        ${tx.length === 0 ? `
          <div class="py-12 text-center">
            <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            </div>
            <p class="text-sm text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ` : `
          <div class="divide-y divide-gray-50">
            ${tx.map(t => {
              const instBadge = t.installmentNumber
                ? `<span class="text-xs bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded-md ml-1">${t.installmentNumber}/${t.totalInstallments}</span>`
                : '';
              const recBadge = t.isRecurrent
                ? `<span class="text-xs bg-indigo-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-md ml-1">↻</span>`
                : '';
              const clickHandler = t.isRecurrent
                ? `UITransactions.openRecurrentForm('${t.recurrentId}')`
                : `UITransactions.openForm('${t.type}', '${t.id}')`;
              const txCard = t.cardId ? Storage.getCartoes().find(c => c.id === t.cardId) : null;
              const cardBadge = txCard
                ? `<span class="text-xs font-semibold px-1.5 py-0.5 rounded-md ml-1 text-white" style="background:${txCard.color || '#374151'}">${txCard.name}</span>`
                : '';
              const usdBadge = t.currency === 'USD'
                ? `<span class="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-md ml-1">US$${(t.amount||0).toFixed(2)}</span>`
                : '';
              return `
              <div class="flex items-center px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
                   onclick="${clickHandler}">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type==='income' ? 'bg-green-50' : 'bg-red-50'}">
                  ${categoryIcon(t.category, t.type)}
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="flex items-center gap-1 flex-wrap">
                    <p class="text-sm font-medium text-gray-900 truncate">${_esc(t.description)}</p>
                    ${instBadge}${recBadge}${cardBadge}${usdBadge}
                  </div>
                  <p class="text-xs text-gray-400">${t.category} · ${Calc.fmtDate(t.date)}</p>
                  ${t.notes ? `<p class="text-xs text-gray-300 truncate">${_esc(t.notes)}</p>` : ''}
                </div>
                <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                  <p class="text-sm font-bold ${t.type==='income' ? 'text-green-600' : 'text-red-600'}">
                    ${t.type==='income' ? '+' : '−'}${Calc.fmt(Calc.toBRL(t.amount, t.currency))}
                  </p>
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

  setFilter(f) {
    this.filter = f;
    this._filterCard = null;
    this._filterCategory = null;
    this.render(App.currentMonth, App.currentDayFilter);
  },
  setSearch(v) {
    const scrollY = window.scrollY;
    this.search = v;
    this.render(App.currentMonth, App.currentDayFilter);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  },
  setCardFilter(id) {
    const scrollY = window.scrollY;
    const cardScroll = document.getElementById('chips-card-row')?.scrollLeft || 0;
    this._filterCard = id || null;
    this._filterCategory = null;
    this.render(App.currentMonth, App.currentDayFilter);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      const row = document.getElementById('chips-card-row');
      if (row && cardScroll) row.scrollLeft = cardScroll;
    });
  },
  setCategoryFilter(cat) {
    const scrollY = window.scrollY;
    const catScroll = document.getElementById('chips-cat-row')?.scrollLeft || 0;
    this._filterCategory = cat || null;
    this.render(App.currentMonth, App.currentDayFilter);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      const row = document.getElementById('chips-cat-row');
      if (row && catScroll) row.scrollLeft = catScroll;
    });
  },

  // ── Formulário ────────────────────────────────────────────────────────────
  openForm(type, editId) {
    const tx    = editId ? Storage.getTransactions().find(t => t.id === editId) : null;
    const cats  = type === 'income' ? this.INCOME_CATS : this.EXPENSE_CATS;
    const today = new Date().toISOString().slice(0, 10);
    this._selectedCardId = tx?.cardId || null;
    this._selectedCurrency = tx?.currency || 'BRL';
    const _curBRL = this._selectedCurrency !== 'USD' ? 'background:#111827;border-color:#111827;color:white' : 'background:white;border-color:#e5e7eb;color:#4b5563';
    const _curUSD = this._selectedCurrency === 'USD' ? 'background:#111827;border-color:#111827;color:white' : 'background:white;border-color:#e5e7eb;color:#4b5563';
    const _amtPrefix = this._selectedCurrency === 'USD' ? 'US$' : 'R$';

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center ${type==='income' ? 'bg-green-100' : 'bg-red-100'}">
            <svg class="w-4 h-4 ${type==='income' ? 'text-green-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${type==='income' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>'}
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900">${tx ? 'Editar' : 'Nova'} ${type==='income' ? 'Entrada' : 'Saída'}</h3>
        </div>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      ${type === 'expense' && !tx ? `
      <!-- Tabs Única / Parcelada -->
      <div class="flex gap-0 px-4 pt-4">
        <button id="tab-single" onclick="UITransactions.switchTab('single')"
          class="flex-1 py-2 text-sm font-semibold rounded-l-xl border border-r-0 border-gray-200 bg-gray-900 text-white transition-colors">
          Única
        </button>
        <button id="tab-inst" onclick="UITransactions.switchTab('installment')"
          class="flex-1 py-2 text-sm font-semibold rounded-r-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
          Parcelada
        </button>
      </div>
      ` : ''}

      <!-- Formulário único -->
      <div id="form-single" class="${type === 'expense' && !tx ? '' : 'pt-4'}">
        <form id="tx-form" class="px-4 pb-6 pt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descrição *</label>
            <input name="description" type="text" required autocomplete="off"
              placeholder="${type==='income' ? 'Ex: Salário, Freelance...' : 'Ex: Supermercado, Conta...'}"
              value="${_esc(tx?.description || '')}"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-semibold text-gray-600">Valor *</label>
                <div class="flex">
                  <button type="button" id="cur-btn-brl" onclick="UITransactions._setCurrency('BRL')"
                    class="px-1.5 py-0.5 text-[10px] font-bold rounded-l border border-r-0 border-gray-200 transition-all"
                    style="${_curBRL}">R$</button>
                  <button type="button" id="cur-btn-usd" onclick="UITransactions._setCurrency('USD')"
                    class="px-1.5 py-0.5 text-[10px] font-bold rounded-r border border-gray-200 transition-all"
                    style="${_curUSD}">US$</button>
                </div>
              </div>
              <div class="relative">
                <span id="amount-prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">${_amtPrefix}</span>
                <input name="amount" type="number" required min="0.01" step="0.01" placeholder="0,00"
                  value="${tx?.amount || ''}"
                  oninput="UITransactions._updateUsdHint(this.value)"
                  class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <p id="usd-hint" class="${this._selectedCurrency === 'USD' ? '' : 'hidden'} text-xs text-blue-500 mt-1">≈ R$ <span id="usd-hint-val">${this._selectedCurrency === 'USD' ? Calc.fmt((parseFloat(tx?.amount)||0) * (Calc._usdRate||6)) : ''}</span></p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Data *</label>
              <input name="date" type="date" required value="${tx?.date || today}"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Categoria *</label>
            <select name="category" required class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Selecionar categoria...</option>
              ${cats.map(c => `<option value="${c}" ${tx?.category===c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          ${type === 'expense' ? this._cardChipsHTML() : ''}
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
            <textarea name="notes" rows="2" placeholder="Opcional..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none">${_esc(tx?.notes || '')}</textarea>
          </div>
          <div class="flex gap-3 pt-1">
            <button type="button" onclick="Modal.close()" class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
            <button type="button" id="tx-submit-btn" onclick="UITransactions.submitForm('${type}', '${editId || ''}')"
              class="flex-1 py-3 ${type==='income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              ${tx ? 'Salvar alterações' : 'Adicionar'}
            </button>
          </div>
          ${tx ? `
          <div class="pt-1">
            <button type="button" onclick="UITransactions.confirmDelete('${tx.id}', '${tx.groupId || ''}', ${tx.totalInstallments || 0})"
              class="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
              Excluir lançamento
            </button>
          </div>` : ''}
        </form>
      </div>

      <!-- Formulário parcelado (só para expense sem edição) -->
      ${type === 'expense' && !tx ? `
      <div id="form-inst" class="hidden px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descrição *</label>
          <input id="inst-desc" type="text" autocomplete="off" placeholder="Ex: TV 4K, Notebook, Viagem..."
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Categoria *</label>
          <select id="inst-cat" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Selecionar categoria...</option>
            ${this.EXPENSE_CATS.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nº de parcelas *</label>
            <input id="inst-count" type="number" min="2" max="120" placeholder="Ex: 12"
              oninput="UITransactions.buildInstallmentRows(); UITransactions.onInstCountChange();"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">1ª parcela *</label>
            <input id="inst-start" type="date" value="${today}"
              oninput="UITransactions.buildInstallmentRows()"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>

        <!-- Modo de valores -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-gray-600">Valores das parcelas</label>
            <div class="flex gap-0">
              <button id="mode-equal" onclick="UITransactions.setInstMode('equal')"
                class="px-2.5 py-1 text-xs font-semibold rounded-l-lg border border-r-0 border-gray-200 bg-gray-900 text-white">
                Iguais
              </button>
              <button id="mode-custom" onclick="UITransactions.setInstMode('custom')"
                class="px-2.5 py-1 text-xs font-semibold rounded-r-lg border border-gray-200 bg-white text-gray-600">
                Individuais
              </button>
            </div>
          </div>

          <!-- Modo iguais -->
          <div id="equal-mode" class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-xs text-gray-400 mb-1">Por parcela</p>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                <input id="inst-equal-val" type="number" min="0.01" step="0.01" placeholder="0,00"
                  oninput="UITransactions.onInstValChange()"
                  class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">Total</p>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                <input id="inst-total-input" type="number" min="0.01" step="0.01" placeholder="0,00"
                  oninput="UITransactions.onInstTotalChange()"
                  class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
          </div>

          <!-- Modo individual -->
          <div id="custom-mode" class="hidden">
            <div id="inst-rows" class="space-y-1.5 max-h-48 overflow-y-auto pr-1"></div>
          </div>

          <div id="inst-total-line" class="hidden mt-2 flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
            <span class="text-xs font-semibold text-gray-600">Total</span>
            <span id="inst-total" class="text-sm font-bold text-gray-900"></span>
          </div>
        </div>

        ${this._cardChipsHTML('inst')}
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="Modal.close()" class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
          <button type="button" id="inst-submit-btn" onclick="UITransactions.submitInstallment()"
            class="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
            Registrar parcelas
          </button>
        </div>
      </div>
      ` : ''}
    `;
    Modal.open();
    this._instMode = 'equal';
  },

  _instMode: 'equal',

  _cardChipsHTML(prefix) {
    const cartoes = Storage.getCartoes();
    if (!cartoes.length) return '';
    const sel = this._selectedCardId;
    const none = `<button type="button" onclick="UITransactions._selectCard(null)"
      class="card-chip flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
      style="${!sel ? 'background:#111827;border-color:#111827;color:white' : 'background:white;border-color:#e5e7eb;color:#4b5563'}"
      data-card-id="">Sem cartão</button>`;
    const chips = cartoes.map(c => {
      const active = sel === c.id;
      return `<button type="button" onclick="UITransactions._selectCard('${c.id}')"
        class="card-chip flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
        style="${active ? `background:${c.color||'#374151'};border-color:${c.color||'#374151'};color:white` : 'background:white;border-color:#e5e7eb;color:#4b5563'}"
        data-card-id="${c.id}"
        data-card-color="${c.color||'#374151'}">${c.name}</button>`;
    }).join('');
    return `<div>
      <label class="block text-xs font-semibold text-gray-600 mb-1.5">Cartão <span class="font-normal text-gray-400">(opcional)</span></label>
      <div class="flex gap-2 flex-wrap">${none}${chips}</div>
    </div>`;
  },

  _selectCard(id) {
    this._selectedCardId = id || null;
    document.querySelectorAll('.card-chip').forEach(btn => {
      const cid   = btn.dataset.cardId || null;
      const color = btn.dataset.cardColor;
      const active = (id && id === cid) || (!id && !cid);
      if (active) {
        btn.style.cssText = cid && color
          ? `background:${color};border-color:${color};color:white`
          : 'background:#111827;border-color:#111827;color:white';
      } else {
        btn.style.cssText = 'background:white;border-color:#e5e7eb;color:#4b5563';
      }
    });
  },

  _setCurrency(c) {
    this._selectedCurrency = c;
    const brlBtn = document.getElementById('cur-btn-brl');
    const usdBtn = document.getElementById('cur-btn-usd');
    const prefix = document.getElementById('amount-prefix');
    const hint   = document.getElementById('usd-hint');
    const active = 'background:#111827;border-color:#111827;color:white';
    const inact  = 'background:white;border-color:#e5e7eb;color:#4b5563';
    if (brlBtn) brlBtn.style.cssText = c === 'BRL' ? active : inact;
    if (usdBtn) usdBtn.style.cssText = c === 'USD' ? active : inact;
    if (prefix) prefix.textContent = c === 'USD' ? 'US$' : 'R$';
    if (hint)   hint.classList.toggle('hidden', c !== 'USD');
    if (c === 'USD') {
      const amtEl = document.querySelector('[name="amount"]');
      this._updateUsdHint(amtEl?.value || '');
    }
  },

  _updateUsdHint(val) {
    const el = document.getElementById('usd-hint-val');
    if (!el) return;
    el.textContent = Calc.fmt((parseFloat(val) || 0) * (Calc._usdRate || 6));
  },

  switchTab(tab) {
    const single = document.getElementById('form-single');
    const inst   = document.getElementById('form-inst');
    const tSingle = document.getElementById('tab-single');
    const tInst   = document.getElementById('tab-inst');
    if (tab === 'single') {
      single?.classList.remove('hidden');
      inst?.classList.add('hidden');
      tSingle?.classList.replace('bg-white', 'bg-gray-900'); tSingle?.classList.replace('text-gray-600', 'text-white');
      tInst?.classList.replace('bg-gray-900', 'bg-white'); tInst?.classList.replace('text-white', 'text-gray-600');
    } else {
      single?.classList.add('hidden');
      inst?.classList.remove('hidden');
      tInst?.classList.replace('bg-white', 'bg-gray-900'); tInst?.classList.replace('text-gray-600', 'text-white');
      tSingle?.classList.replace('bg-gray-900', 'bg-white'); tSingle?.classList.replace('text-white', 'text-gray-600');
    }
  },

  setInstMode(mode) {
    this._instMode = mode;
    const eqBtn  = document.getElementById('mode-equal');
    const cuBtn  = document.getElementById('mode-custom');
    const eqDiv  = document.getElementById('equal-mode');
    const cuDiv  = document.getElementById('custom-mode');
    if (mode === 'equal') {
      eqBtn?.classList.replace('bg-white','bg-gray-900'); eqBtn?.classList.replace('text-gray-600','text-white');
      cuBtn?.classList.replace('bg-gray-900','bg-white'); cuBtn?.classList.replace('text-white','text-gray-600');
      eqDiv?.classList.remove('hidden'); cuDiv?.classList.add('hidden');
      this.updateEqualTotal();
    } else {
      cuBtn?.classList.replace('bg-white','bg-gray-900'); cuBtn?.classList.replace('text-gray-600','text-white');
      eqBtn?.classList.replace('bg-gray-900','bg-white'); eqBtn?.classList.replace('text-white','text-gray-600');
      cuDiv?.classList.remove('hidden'); eqDiv?.classList.add('hidden');
      this.buildInstallmentRows();
      this.updateCustomTotal();
    }
  },

  buildInstallmentRows() {
    if (this._instMode !== 'custom') return;
    const n     = parseInt(document.getElementById('inst-count')?.value);
    const start = document.getElementById('inst-start')?.value;
    const rows  = document.getElementById('inst-rows');
    if (!rows || !n || n < 2 || !start) return;
    rows.innerHTML = Array.from({ length: n }, (_, i) => {
      const d = new Date(start + 'T12:00:00');
      d.setMonth(d.getMonth() + i);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      return `
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 w-16 flex-shrink-0">${i+1}/${n} ${label}</span>
          <div class="relative flex-1">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
            <input type="number" min="0" step="0.01" placeholder="0,00"
              oninput="UITransactions.updateCustomTotal()"
              class="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              data-inst-row="${i}">
          </div>
        </div>`;
    }).join('');
    this.updateCustomTotal();
  },

  updateEqualTotal() {
    // total-line is only used for custom mode; equal mode shows total inline
    const line = document.getElementById('inst-total-line');
    if (line) line.classList.add('hidden');
  },

  onInstValChange() {
    const n   = parseInt(document.getElementById('inst-count')?.value) || 0;
    const val = parseFloat(document.getElementById('inst-equal-val')?.value) || 0;
    const el  = document.getElementById('inst-total-input');
    if (el) el.value = (n > 0 && val > 0) ? (n * val).toFixed(2) : '';
  },

  onInstTotalChange() {
    const n     = parseInt(document.getElementById('inst-count')?.value) || 0;
    const total = parseFloat(document.getElementById('inst-total-input')?.value) || 0;
    const el    = document.getElementById('inst-equal-val');
    if (el) el.value = (n > 0 && total > 0) ? (total / n).toFixed(2) : '';
  },

  onInstCountChange() {
    const n       = parseInt(document.getElementById('inst-count')?.value) || 0;
    const val     = parseFloat(document.getElementById('inst-equal-val')?.value) || 0;
    const total   = parseFloat(document.getElementById('inst-total-input')?.value) || 0;
    const valEl   = document.getElementById('inst-equal-val');
    const totalEl = document.getElementById('inst-total-input');
    if (val > 0 && totalEl) {
      totalEl.value = n > 0 ? (n * val).toFixed(2) : '';
    } else if (total > 0 && valEl) {
      valEl.value = n > 0 ? (total / n).toFixed(2) : '';
    }
  },

  updateCustomTotal() {
    const inputs = document.querySelectorAll('[data-inst-row]');
    const total  = Array.from(inputs).reduce((s, el) => s + (parseFloat(el.value) || 0), 0);
    const line   = document.getElementById('inst-total-line');
    const tot    = document.getElementById('inst-total');
    if (line) line.classList.remove('hidden');
    if (tot) tot.textContent = Calc.fmt(total);
  },

  // ── Salvar transação única ────────────────────────────────────────────────
  async submitForm(type, editId) {
    const form = document.getElementById('tx-form');
    if (!form?.checkValidity()) { form?.reportValidity(); return; }
    const data = {
      type,
      description: form.description.value.trim(),
      amount:      parseFloat(form.amount.value),
      date:        form.date.value,
      category:    form.category.value,
      notes:       form.notes.value.trim(),
      cardId:      type === 'expense' ? (this._selectedCardId || null) : null,
      currency:    this._selectedCurrency || 'BRL',
    };
    const btn = document.getElementById('tx-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
    try {
      if (editId) await Storage.updateTransaction(editId, data);
      else        await Storage.addTransaction(data);
      Modal.close();
      App.goToMonth(data.date);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique sua conexão.');
      if (btn) { btn.disabled = false; btn.textContent = editId ? 'Salvar' : 'Adicionar'; }
    }
  },

  // ── Salvar parcelado ──────────────────────────────────────────────────────
  async submitInstallment() {
    const desc  = document.getElementById('inst-desc')?.value?.trim();
    const cat   = document.getElementById('inst-cat')?.value;
    const n     = parseInt(document.getElementById('inst-count')?.value);
    const start = document.getElementById('inst-start')?.value;

    if (!desc)           { alert('Informe a descrição.'); return; }
    if (!cat)            { alert('Selecione a categoria.'); return; }
    if (!n || n < 2)     { alert('Informe o número de parcelas (mínimo 2).'); return; }
    if (!start)          { alert('Informe a data da 1ª parcela.'); return; }

    let amounts = [];
    if (this._instMode === 'equal') {
      const val = parseFloat(document.getElementById('inst-equal-val')?.value);
      if (!val || val <= 0) { alert('Informe o valor de cada parcela.'); return; }
      amounts = Array(n).fill(val);
    } else {
      const inputs = document.querySelectorAll('[data-inst-row]');
      amounts = Array.from(inputs).map(el => parseFloat(el.value) || 0);
      if (amounts.some(v => v <= 0)) { alert('Preencha o valor de todas as parcelas.'); return; }
    }

    const btn = document.getElementById('inst-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    const groupId = _genId();
    const transactions = amounts.map((amount, i) => {
      const d = new Date(start + 'T12:00:00');
      d.setMonth(d.getMonth() + i);
      const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return {
        type:              'expense',
        description:       `${desc} (${i+1}/${n})`,
        amount,
        date,
        category:          cat,
        notes:             '',
        groupId,
        cardId:            this._selectedCardId || null,
        currency:          this._selectedCurrency || 'BRL',
        installmentNumber: i + 1,
        totalInstallments: n,
      };
    });

    try {
      await Storage.addTransactionBatch(transactions);
      Modal.close();
      App.goToMonth(start);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar parcelas. Verifique sua conexão.');
      if (btn) { btn.disabled = false; btn.textContent = 'Registrar parcelas'; }
    }
  },

  // ── Deletar ───────────────────────────────────────────────────────────────
  confirmDelete(id, groupId, totalInstallments) {
    if (groupId && totalInstallments > 1) {
      // Mostra modal de escolha: só esta ou todas
      document.getElementById('modal-box').innerHTML = `
        <div class="p-6">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <p class="text-sm font-bold text-gray-900 text-center mb-1">Excluir parcela</p>
          <p class="text-sm text-gray-500 text-center mb-6">Esta transação faz parte de um grupo de ${totalInstallments} parcelas.</p>
          <div class="space-y-2">
            <button onclick="UITransactions.deleteSingle('${id}')"
              class="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50">
              Excluir só esta parcela
            </button>
            <button onclick="UITransactions.deleteGroup('${groupId}')"
              class="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
              Excluir todas as ${totalInstallments} parcelas
            </button>
            <button onclick="Modal.close()" class="w-full py-2 text-gray-400 text-sm">Cancelar</button>
          </div>
        </div>
      `;
      Modal.open();
    } else {
      Confirm.show('Esta transação será removida permanentemente.', async () => {
        try { await Storage.deleteTransaction(id); }
        catch (e) { alert('Erro ao excluir.'); }
      });
    }
  },

  async deleteSingle(id) {
    Modal.close();
    try { await Storage.deleteTransaction(id); }
    catch (e) { alert('Erro ao excluir.'); }
  },

  async deleteGroup(groupId) {
    Modal.close();
    try { await Storage.deleteTransactionGroup(groupId); }
    catch (e) { alert('Erro ao excluir parcelas.'); }
  },

  // ── Recorrentes: lista ────────────────────────────────────────────────────
  manageRecurrents() {
    const recAll = Storage.getRecurrentes();
    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900">Lançamentos Recorrentes</h3>
        </div>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="px-4 pt-3 pb-4">
        <button onclick="UITransactions.openRecurrentForm()"
          class="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 mb-3">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Novo recorrente
        </button>
        ${recAll.length === 0 ? `
          <div class="py-8 text-center">
            <p class="text-sm text-gray-400">Nenhum lançamento recorrente</p>
            <p class="text-xs text-gray-300 mt-1">Adicione entradas e saídas fixas do mês</p>
          </div>
        ` : `
          <div class="space-y-2 max-h-80 overflow-y-auto">
            ${recAll.map(r => `
              <button onclick="UITransactions.openRecurrentForm('${r.id}')"
                class="w-full flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-left transition-colors ${r.active === false ? 'opacity-50' : ''}">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.type === 'income' ? 'bg-green-50' : 'bg-red-50'}">
                  ${categoryIcon(r.category, r.type, true)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">${_esc(r.description)}</p>
                  <p class="text-xs text-gray-400">${r.category} · dia ${r.day || 1}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-sm font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}">${r.type === 'income' ? '+' : '−'}${Calc.fmt(r.amount)}</p>
                  <p class="text-xs ${r.active === false ? 'text-gray-300' : 'text-indigo-500'}">${r.active === false ? 'Inativo' : 'Ativo'}</p>
                </div>
              </button>
            `).join('')}
          </div>
        `}
      </div>
    `;
    Modal.open();
  },

  // ── Recorrentes: formulário ───────────────────────────────────────────────
  openRecurrentForm(id) {
    const rec  = id ? Storage.getRecurrentes().find(r => r.id === id) : null;
    const type = rec?.type || 'expense';
    const cats = type === 'income' ? this.INCOME_CATS : this.EXPENSE_CATS;
    const curMonth = new Date().toISOString().slice(0, 7);

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <button onclick="UITransactions.manageRecurrents()"
            class="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h3 class="text-base font-bold text-gray-900">${rec ? 'Editar' : 'Novo'} Recorrente</h3>
        </div>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Tipo *</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="rec-btn-income" onclick="UITransactions._setRecType('income')"
              class="py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${type === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}">
              Entrada
            </button>
            <button type="button" id="rec-btn-expense" onclick="UITransactions._setRecType('expense')"
              class="py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}">
              Saída
            </button>
          </div>
          <input type="hidden" id="rec-type" value="${type}">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descrição *</label>
          <input id="rec-desc" type="text" autocomplete="off"
            placeholder="Ex: Aluguel, Salário, Netflix..."
            value="${_esc(rec?.description || '')}"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Valor *</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input id="rec-amount" type="number" min="0.01" step="0.01" placeholder="0,00"
                value="${rec?.amount || ''}"
                class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Dia do mês *</label>
            <input id="rec-day" type="number" min="1" max="28" placeholder="Ex: 5"
              value="${rec?.day || ''}"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Categoria *</label>
          <select id="rec-category"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Selecionar categoria...</option>
            ${cats.map(c => `<option value="${c}" ${rec?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Início (mês/ano)</label>
          <input id="rec-start" type="month" value="${rec?.startDate || curMonth}"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <p class="text-xs text-gray-400 mt-1">A partir de qual mês este recorrente entra em vigor.</p>
        </div>
        ${rec ? `
        <label class="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
          <input type="checkbox" id="rec-active" ${rec.active !== false ? 'checked' : ''}
            class="w-4 h-4 accent-indigo-600 cursor-pointer rounded">
          <div>
            <p class="text-sm font-semibold text-gray-700">Recorrente ativo</p>
            <p class="text-xs text-gray-400">Desmarque para pausar sem excluir</p>
          </div>
        </label>
        ` : ''}
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
          <textarea id="rec-notes" rows="2" placeholder="Opcional..."
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none">${_esc(rec?.notes || '')}</textarea>
        </div>
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="UITransactions.manageRecurrents()"
            class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Cancelar
          </button>
          <button type="button" id="rec-submit-btn" onclick="UITransactions.submitRecurrent('${id || ''}')"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
            ${rec ? 'Salvar' : 'Criar'}
          </button>
        </div>
        ${rec ? `
        <button type="button" onclick="UITransactions.deleteRecurrent('${id}')"
          class="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
          Excluir recorrente
        </button>` : ''}
      </div>
    `;
    Modal.open();
  },

  _setRecType(type) {
    document.getElementById('rec-type').value = type;
    const incBtn = document.getElementById('rec-btn-income');
    const expBtn = document.getElementById('rec-btn-expense');
    const base   = 'py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors';
    if (type === 'income') {
      if (incBtn) incBtn.className = `${base} border-green-500 bg-green-50 text-green-700`;
      if (expBtn) expBtn.className = `${base} border-gray-200 text-gray-600 bg-white hover:bg-gray-50`;
    } else {
      if (expBtn) expBtn.className = `${base} border-red-500 bg-red-50 text-red-700`;
      if (incBtn) incBtn.className = `${base} border-gray-200 text-gray-600 bg-white hover:bg-gray-50`;
    }
    const cats = type === 'income' ? this.INCOME_CATS : this.EXPENSE_CATS;
    const sel  = document.getElementById('rec-category');
    if (sel) {
      const cur = sel.value;
      sel.innerHTML = '<option value="">Selecionar categoria...</option>' +
        cats.map(c => `<option value="${c}" ${c === cur ? 'selected' : ''}>${c}</option>`).join('');
    }
  },

  async submitRecurrent(id) {
    const type   = document.getElementById('rec-type')?.value;
    const desc   = document.getElementById('rec-desc')?.value?.trim();
    const amount = parseFloat(document.getElementById('rec-amount')?.value);
    const day    = parseInt(document.getElementById('rec-day')?.value);
    const cat    = document.getElementById('rec-category')?.value;
    const start  = document.getElementById('rec-start')?.value || null;
    const notes  = document.getElementById('rec-notes')?.value?.trim() || '';
    const activeEl = document.getElementById('rec-active');
    const active = activeEl ? activeEl.checked : true;

    if (!desc)                       { alert('Informe a descrição.'); return; }
    if (!amount || amount <= 0)      { alert('Informe um valor válido.'); return; }
    if (!day || day < 1 || day > 28) { alert('Informe o dia do mês (1 a 28).'); return; }
    if (!cat)                        { alert('Selecione a categoria.'); return; }

    const data = { type, description: desc, amount, day, category: cat, notes, active, startDate: start };
    const btn  = document.getElementById('rec-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
    try {
      if (id) await Storage.updateRecurrent(id, data);
      else    await Storage.addRecurrent(data);
      UITransactions.manageRecurrents();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique sua conexão.');
      if (btn) { btn.disabled = false; btn.textContent = id ? 'Salvar' : 'Criar'; }
    }
  },

  deleteRecurrent(id) {
    Confirm.show('Este lançamento recorrente será removido permanentemente.', async () => {
      try {
        await Storage.deleteRecurrent(id);
        Modal.close();
      } catch (e) {
        alert('Erro ao excluir.');
      }
    });
  },
};

function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
