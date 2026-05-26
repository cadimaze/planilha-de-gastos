const UITransactions = {
  filter: 'all',
  search: '',

  INCOME_CATS: ['Salário', 'Freelance', 'Investimentos', 'Aluguel Recebido', 'Venda', 'Bônus', 'Reembolso', 'Outros'],
  EXPENSE_CATS: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Vestuário', 'Tecnologia', 'Serviços', 'Lazer', 'Outros'],

  render(monthKey) {
    const txAll = Storage.getTransactions();
    let tx = Calc.txForMonth(txAll, monthKey).sort((a, b) => b.date.localeCompare(a.date));

    if (this.filter !== 'all') tx = tx.filter(t => t.type === this.filter);
    if (this.search) {
      const q = this.search.toLowerCase();
      tx = tx.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }

    const all = Calc.txForMonth(txAll, monthKey);
    const incCount  = all.filter(t => t.type === 'income').length;
    const expCount  = all.filter(t => t.type === 'expense').length;

    document.getElementById('page-content').innerHTML = `

      <!-- Search + Filters -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4 space-y-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Buscar transação..." value="${this.search}"
            oninput="UITransactions.setSearch(this.value)"
            class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="flex gap-2">
          <button onclick="UITransactions.setFilter('all')"
            class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
            Todos (${all.length})
          </button>
          <button onclick="UITransactions.setFilter('income')"
            class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
            Entradas (${incCount})
          </button>
          <button onclick="UITransactions.setFilter('expense')"
            class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${this.filter==='expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
            Saídas (${expCount})
          </button>
        </div>
      </div>

      <!-- Add buttons -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <button onclick="UITransactions.openForm('income')"
          class="flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Entrada
        </button>
        <button onclick="UITransactions.openForm('expense')"
          class="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/></svg>
          Saída
        </button>
      </div>

      <!-- List -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        ${tx.length === 0 ? `
          <div class="py-12 text-center">
            <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </div>
            <p class="text-sm text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ` : `
          <div class="divide-y divide-gray-50">
            ${tx.map(t => `
              <div class="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type==='income' ? 'bg-green-50' : 'bg-red-50'}">
                  ${categoryIcon(t.category, t.type)}
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">${t.description}</p>
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
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button onclick="UITransactions.confirmDelete('${t.id}')"
                      class="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  setFilter(f) { this.filter = f; this.render(App.currentMonth); },
  setSearch(v) { this.search = v; this.render(App.currentMonth); },

  openForm(type, editId) {
    const tx = editId ? Storage.getTransactions().find(t => t.id === editId) : null;
    const cats = type === 'income' ? this.INCOME_CATS : this.EXPENSE_CATS;
    const today = new Date().toISOString().slice(0, 10);

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center ${type==='income' ? 'bg-green-100' : 'bg-red-100'}">
            <svg class="w-4 h-4 ${type==='income' ? 'text-green-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${type==='income'
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>'}
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900">
            ${tx ? 'Editar' : 'Nova'} ${type==='income' ? 'Entrada' : 'Saída'}
          </h3>
        </div>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form id="tx-form" class="px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descrição *</label>
          <input name="description" type="text" required autocomplete="off"
            placeholder="${type==='income' ? 'Ex: Salário, Freelance...' : 'Ex: Supermercado, Conta de luz...'}"
            value="${tx?.description || ''}"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Valor *</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">R$</span>
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
          <select name="category" required
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Selecionar categoria...</option>
            ${cats.map(c => `<option value="${c}" ${tx?.category===c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
          <textarea name="notes" rows="2" placeholder="Opcional..."
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none">${tx?.notes || ''}</textarea>
        </div>
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="Modal.close()"
            class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="button" id="tx-submit-btn" onclick="UITransactions.submitForm('${type}', '${editId || ''}')"
            class="flex-1 py-3 ${type==='income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            ${tx ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    `;
    Modal.open();
  },

  async submitForm(type, editId) {
    const form = document.getElementById('tx-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }

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
      App.goToMonth(data.date); // navega pro mês da transação se diferente
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique sua conexão e tente novamente.');
      if (btn) { btn.disabled = false; btn.textContent = editId ? 'Salvar' : 'Adicionar'; }
    }
  },

  confirmDelete(id) {
    Confirm.show('Esta transação será removida permanentemente.', async () => {
      try { await Storage.deleteTransaction(id); }
      catch (e) { alert('Erro ao excluir. Tente novamente.'); }
    });
  },
};
