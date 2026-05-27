const UITransactions = {
  filter: 'all',
  search: '',

  INCOME_CATS:  ['Salário', 'Freelance', 'Investimentos', 'Aluguel Recebido', 'Venda', 'Bônus', 'Reembolso', 'Outros'],
  EXPENSE_CATS: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Vestuário', 'Tecnologia', 'Serviços', 'Lazer', 'Outros'],

  // ── Lista ─────────────────────────────────────────────────────────────────
  render(monthKey) {
    const txAll = Storage.getTransactions();
    let tx = Calc.txForMonth(txAll, monthKey).sort((a, b) => b.date.localeCompare(a.date));
    if (this.filter !== 'all') tx = tx.filter(t => t.type === this.filter);
    if (this.search) {
      const q = this.search.toLowerCase();
      tx = tx.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    const all      = Calc.txForMonth(txAll, monthKey);
    const incCount = all.filter(t => t.type === 'income').length;
    const expCount = all.filter(t => t.type === 'expense').length;

    document.getElementById('page-content').innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4 space-y-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Buscar transação..." value="${this.search}"
            oninput="UITransactions.setSearch(this.value)"
            class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="flex gap-2">
          <button onclick="UITransactions.setFilter('all')" class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Todos (${all.length})</button>
          <button onclick="UITransactions.setFilter('income')" class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Entradas (${incCount})</button>
          <button onclick="UITransactions.setFilter('expense')" class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Saídas (${expCount})</button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <button onclick="UITransactions.openForm('income')" class="flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg> Entrada
        </button>
        <button onclick="UITransactions.openForm('expense')" class="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/></svg> Saída
        </button>
      </div>

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
              return `
              <div class="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type==='income' ? 'bg-green-50' : 'bg-red-50'}">
                  ${categoryIcon(t.category, t.type)}
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="flex items-center gap-1 flex-wrap">
                    <p class="text-sm font-medium text-gray-900 truncate">${t.description}</p>
                    ${instBadge}
                  </div>
                  <p class="text-xs text-gray-400">${t.category} · ${Calc.fmtDate(t.date)}</p>
                  ${t.notes ? `<p class="text-xs text-gray-300 truncate">${t.notes}</p>` : ''}
                </div>
                <div class="flex items-center gap-1 ml-2">
                  <p class="text-sm font-bold flex-shrink-0 ${t.type==='income' ? 'text-green-600' : 'text-red-600'}">
                    ${t.type==='income' ? '+' : '−'}${Calc.fmt(t.amount)}
                  </p>
                  <div class="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity">
                    <button onclick="UITransactions.openForm('${t.type}', '${t.id}')"
                      class="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="UITransactions.confirmDelete('${t.id}', '${t.groupId || ''}', ${t.totalInstallments || 0})"
                      class="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  setFilter(f) { this.filter = f; this.render(App.currentMonth); },
  setSearch(v) { this.search = v; this.render(App.currentMonth); },

  // ── Formulário ────────────────────────────────────────────────────────────
  openForm(type, editId) {
    const tx    = editId ? Storage.getTransactions().find(t => t.id === editId) : null;
    const cats  = type === 'income' ? this.INCOME_CATS : this.EXPENSE_CATS;
    const today = new Date().toISOString().slice(0, 10);

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
              value="${tx?.description || ''}"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Valor *</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                <input name="amount" type="number" required min="0.01" step="0.01" placeholder="0,00"
                  value="${tx?.amount || ''}"
                  class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
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
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
            <textarea name="notes" rows="2" placeholder="Opcional..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none">${tx?.notes || ''}</textarea>
          </div>
          <div class="flex gap-3 pt-1">
            <button type="button" onclick="Modal.close()" class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
            <button type="button" id="tx-submit-btn" onclick="UITransactions.submitForm('${type}', '${editId || ''}')"
              class="flex-1 py-3 ${type==='income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              ${tx ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
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
              oninput="UITransactions.buildInstallmentRows()"
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
          <div id="equal-mode">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input id="inst-equal-val" type="number" min="0.01" step="0.01" placeholder="Valor por parcela"
                oninput="UITransactions.updateEqualTotal()"
                class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
    } else {
      cuBtn?.classList.replace('bg-white','bg-gray-900'); cuBtn?.classList.replace('text-gray-600','text-white');
      eqBtn?.classList.replace('bg-gray-900','bg-white'); eqBtn?.classList.replace('text-white','text-gray-600');
      cuDiv?.classList.remove('hidden'); eqDiv?.classList.add('hidden');
      this.buildInstallmentRows();
    }
    this.updateEqualTotal();
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
    const n   = parseInt(document.getElementById('inst-count')?.value) || 0;
    const val = parseFloat(document.getElementById('inst-equal-val')?.value) || 0;
    const line = document.getElementById('inst-total-line');
    const tot  = document.getElementById('inst-total');
    if (n >= 2 && val > 0) {
      if (line) line.classList.remove('hidden');
      if (tot) tot.textContent = Calc.fmt(n * val);
    } else {
      if (line) line.classList.add('hidden');
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
        type:             'expense',
        description:      `${desc} (${i+1}/${n})`,
        amount,
        date,
        category:         cat,
        notes:            '',
        groupId,
        installmentNumber:  i + 1,
        totalInstallments:  n,
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
};

function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
