const UISimulator = {
  render() {
    const planned  = Storage.getPlanned();
    const tx       = Storage.getTransactions();
    const recAll   = Storage.getRecurrentes();
    const projs    = Calc.projections(tx, planned, 6, recAll);
    const hasAny   = planned.length > 0;

    document.getElementById('page-content').innerHTML = `

      <!-- Intro card -->
      <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-indigo-900">Como funciona o Simulador?</p>
            <p class="text-xs text-indigo-700 mt-0.5 leading-relaxed">
              Adicione um gasto grande planejado (à vista ou parcelado) e veja automaticamente o impacto no saldo dos próximos meses — indicando quais meses ficarão no vermelho.
            </p>
          </div>
        </div>
      </div>

      <!-- Planned list + add -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <p class="text-sm font-semibold text-gray-700">Gastos planejados</p>
          <button onclick="UISimulator.openAdd()"
            class="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Adicionar
          </button>
        </div>

        ${planned.length === 0 ? `
          <div class="py-10 text-center">
            <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <p class="text-sm text-gray-400 font-medium">Nenhum gasto planejado</p>
            <p class="text-xs text-gray-300 mt-1">Clique em "Adicionar" para simular uma compra grande</p>
          </div>
        ` : `
          <div class="divide-y divide-gray-50">
            ${planned.map(p => {
              const hasCustom = p.installmentAmounts && p.installmentAmounts.length > 0;
              const instLabel = p.paymentType === 'installment'
                ? hasCustom
                  ? `${p.installments}x (valores variáveis)`
                  : `${p.installments}x de ${Calc.fmt(p.totalAmount / p.installments)}`
                : null;
              const endDate = p.paymentType === 'installment' ? (() => {
                const d = new Date(p.startDate + 'T12:00:00');
                d.setMonth(d.getMonth() + p.installments - 1);
                return Calc.fmtDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
              })() : null;
              return `
              <div class="flex items-start gap-3 px-4 py-3">
                <div class="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-semibold text-gray-900">${p.description}</p>
                    <span class="text-xs px-1.5 py-0.5 rounded-md font-medium ${p.paymentType==='lump' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                      ${p.paymentType==='lump' ? 'À vista' : `${p.installments}x parcelas`}
                    </span>
                  </div>
                  <p class="text-base font-bold text-red-600 mt-0.5">${Calc.fmt(p.totalAmount)}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    ${instLabel ? `${instLabel} · ` : ''}
                    Início: ${Calc.fmtDate(p.startDate)}
                    ${endDate ? ` · Fim: ${endDate}` : ''}
                  </p>
                  <button onclick="UISimulator.confirmAsTransactions('${p.id}')"
                    class="mt-1.5 flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Lançar nas transações
                  </button>
                </div>
                <button onclick="UISimulator.confirmDelete('${p.id}')"
                  class="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            `}).join('')}
          </div>
        `}
      </div>

      <!-- Projections -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-4 py-3 border-b border-gray-50">
          <p class="text-sm font-semibold text-gray-700">Projeção dos próximos 6 meses</p>
          ${hasAny ? '<p class="text-xs text-gray-400 mt-0.5">Saldo real + impacto dos gastos planejados</p>' : ''}
        </div>

        ${hasAny ? `
        <div class="p-4 border-b border-gray-50">
          <div class="h-44">
            <canvas id="chart-proj"></canvas>
          </div>
        </div>
        ` : ''}

        <div class="divide-y divide-gray-50">
          ${projs.map(p => {
            const hasPlan = p.plannedTotal > 0;
            const bal = hasPlan ? p.projected : p.balance;
            const inRed = bal < 0;
            const rowBg   = !hasPlan ? '' : inRed ? 'bg-red-50' : 'bg-green-50';
            const badgeCls = inRed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
            const balCol   = inRed ? 'text-red-700' : 'text-green-700';

            return `
            <div class="${rowBg} px-4 py-3">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-semibold text-gray-900 capitalize">${Calc.fmtMonthLong(p.monthKey)}</p>
                ${hasPlan ? `
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeCls}">
                  ${inRed ? '⚠ Vermelho' : '✓ Positivo'}
                </span>` : ''}
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Entradas</p>
                  <p class="text-sm font-bold text-green-600">${Calc.fmt(p.income)}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Saídas</p>
                  <p class="text-sm font-bold text-red-600">${Calc.fmt(p.expenses)}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">${hasPlan ? 'Projetado' : 'Saldo'}</p>
                  <p class="text-sm font-bold ${balCol}">${Calc.fmt(bal)}</p>
                </div>
              </div>
              ${hasPlan ? `
              <div class="mt-2.5 pt-2.5 border-t ${inRed ? 'border-red-100' : 'border-green-100'} space-y-1">
                ${p.impacts.map(imp => `
                  <div class="flex justify-between text-xs text-gray-600">
                    <span class="truncate">
                      📌 ${imp.planned.description}${imp.installment ? ` (${imp.installment}/${imp.totalInstallments})` : ''}
                    </span>
                    <span class="font-semibold text-red-600 ml-2 flex-shrink-0">−${Calc.fmt(imp.amount)}</span>
                  </div>
                `).join('')}
                <div class="flex justify-between text-xs pt-1 border-t ${inRed ? 'border-red-100' : 'border-green-100'}">
                  <span class="text-gray-500">Saldo sem planejados</span>
                  <span class="font-semibold ${p.balance >= 0 ? 'text-green-700' : 'text-red-700'}">${Calc.fmt(p.balance)}</span>
                </div>
              </div>
              ` : ''}
            </div>
          `}).join('')}
        </div>
      </div>
    `;

    if (hasAny) {
      const labels = projs.map(p => Calc.fmtMonthShort(p.monthKey));
      Charts.bar('chart-proj', labels, [
        { label: 'Entradas', data: projs.map(p => p.income), backgroundColor: '#22c55e', borderRadius: 4 },
        { label: 'Saídas reais', data: projs.map(p => p.expenses), backgroundColor: '#f97316', borderRadius: 4 },
        { label: 'Planejado', data: projs.map(p => p.plannedTotal), backgroundColor: '#f43f5e', borderRadius: 4 },
      ]);
    }
  },

  openAdd() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h3 class="text-base font-bold text-gray-900">Novo Gasto Planejado</h3>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form id="plan-form" class="px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Descrição *</label>
          <input name="description" type="text" required autocomplete="off"
            placeholder="Ex: Notebook novo, Viagem, Carro..."
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Valor total *</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">R$</span>
            <input name="totalAmount" type="number" required min="0.01" step="0.01" placeholder="0,00"
              oninput="UISimulator.updatePreview()"
              class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-2">Forma de pagamento *</label>
          <div class="grid grid-cols-2 gap-3">
            <div id="card-lump" class="radio-card selected border-2 border-indigo-500 bg-indigo-50 rounded-xl p-3 cursor-pointer" onclick="UISimulator.selectType('lump')">
              <p class="text-sm font-bold text-gray-900">À vista</p>
              <p class="text-xs text-gray-500 mt-0.5">Pagamento único</p>
            </div>
            <div id="card-inst" class="radio-card border-2 border-gray-200 rounded-xl p-3 cursor-pointer" onclick="UISimulator.selectType('installment')">
              <p class="text-sm font-bold text-gray-900">Parcelado</p>
              <p class="text-xs text-gray-500 mt-0.5">Distribuído em meses</p>
            </div>
          </div>
          <input type="hidden" name="paymentType" id="paymentType" value="lump">
        </div>
        <div id="inst-field" class="hidden space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">Número de parcelas *</label>
            <input name="installments" type="number" min="2" max="120" placeholder="Ex: 12"
              oninput="UISimulator.updatePreview(); UISimulator.buildInstRows()"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <p id="inst-preview" class="text-xs text-indigo-600 font-semibold mt-1"></p>
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" id="custom-amounts-toggle" onchange="UISimulator.toggleCustom(this.checked)"
              class="w-4 h-4 rounded accent-indigo-600">
            <span class="text-xs font-semibold text-gray-600">Definir valor de cada parcela individualmente</span>
          </label>
          <div id="custom-amounts-section" class="hidden space-y-2">
            <p class="text-xs text-gray-400">Informe o valor exato de cada parcela (útil para parcelas com juros variáveis).</p>
            <div id="custom-amounts-rows" class="space-y-1.5 max-h-52 overflow-y-auto pr-1"></div>
            <div class="flex justify-between items-center pt-1.5 border-t border-gray-100">
              <span class="text-xs text-gray-500 font-medium">Total calculado</span>
              <span id="custom-total" class="text-xs font-bold text-indigo-600"></span>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Mês de início *</label>
          <input name="startDate" type="date" required value="${today}"
            onchange="UISimulator.buildInstRows()"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="Modal.close()"
            class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="button" onclick="UISimulator.submit()"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Simular
          </button>
        </div>
      </form>
    `;
    Modal.open();
  },

  selectType(type) {
    document.getElementById('paymentType').value = type;
    const lump = document.getElementById('card-lump');
    const inst = document.getElementById('card-inst');
    const instField = document.getElementById('inst-field');
    const instInput = document.querySelector('[name="installments"]');

    if (type === 'lump') {
      lump.className = 'radio-card selected border-2 border-indigo-500 bg-indigo-50 rounded-xl p-3 cursor-pointer';
      inst.className = 'radio-card border-2 border-gray-200 rounded-xl p-3 cursor-pointer';
      instField.classList.add('hidden');
      if (instInput) { instInput.required = false; instInput.value = ''; }
      const p = document.getElementById('inst-preview');
      if (p) p.textContent = '';
      const toggle = document.getElementById('custom-amounts-toggle');
      if (toggle) { toggle.checked = false; }
      const section = document.getElementById('custom-amounts-section');
      if (section) section.classList.add('hidden');
    } else {
      inst.className = 'radio-card selected border-2 border-indigo-500 bg-indigo-50 rounded-xl p-3 cursor-pointer';
      lump.className = 'radio-card border-2 border-gray-200 rounded-xl p-3 cursor-pointer';
      instField.classList.remove('hidden');
      if (instInput) instInput.required = true;
    }
  },

  toggleCustom(checked) {
    const section = document.getElementById('custom-amounts-section');
    if (!section) return;
    if (checked) {
      section.classList.remove('hidden');
      this.buildInstRows();
    } else {
      section.classList.add('hidden');
    }
    this.updatePreview();
  },

  buildInstRows() {
    const toggle = document.getElementById('custom-amounts-toggle');
    if (!toggle?.checked) return;
    const n = parseInt(document.querySelector('[name="installments"]')?.value);
    const startDate = document.querySelector('[name="startDate"]')?.value;
    const rowsDiv = document.getElementById('custom-amounts-rows');
    if (!rowsDiv) return;
    if (!n || n < 2 || !startDate) { rowsDiv.innerHTML = ''; return; }

    const start = new Date(startDate + 'T12:00:00');
    const existing = {};
    rowsDiv.querySelectorAll('[data-inst-row]').forEach(inp => {
      existing[inp.dataset.instRow] = inp.value;
    });

    rowsDiv.innerHTML = Array.from({ length: n }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const val = existing[i] || '';
      return `
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 w-20 flex-shrink-0">${i + 1}ª (${label})</span>
          <div class="relative flex-1">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
            <input type="number" min="0.01" step="0.01" placeholder="0,00" value="${val}"
              oninput="UISimulator.updateCustomTotal()"
              class="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              data-inst-row="${i}">
          </div>
        </div>
      `;
    }).join('');

    this.updateCustomTotal();
  },

  updateCustomTotal() {
    const inputs = document.querySelectorAll('[data-inst-row]');
    const total = Array.from(inputs).reduce((s, inp) => s + (parseFloat(inp.value) || 0), 0);
    const el = document.getElementById('custom-total');
    if (el) el.textContent = total > 0 ? Calc.fmt(total) : '';
  },

  updatePreview() {
    const total = parseFloat(document.querySelector('[name="totalAmount"]')?.value);
    const n     = parseInt(document.querySelector('[name="installments"]')?.value);
    const p     = document.getElementById('inst-preview');
    if (!p) return;
    const customToggle = document.getElementById('custom-amounts-toggle');
    if (customToggle?.checked) { p.textContent = ''; return; }
    p.textContent = (total > 0 && n >= 2) ? `${n}x de ${Calc.fmt(total / n)} por mês` : '';
  },

  async submit() {
    const form = document.getElementById('plan-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const paymentType = document.getElementById('paymentType').value;
    const instInput   = form.installments;
    if (paymentType === 'installment' && (!instInput?.value || parseInt(instInput.value) < 2)) {
      instInput?.setCustomValidity('Informe o número de parcelas (mínimo 2)');
      form.reportValidity();
      instInput?.setCustomValidity('');
      return;
    }

    let installmentAmounts = null;
    if (paymentType === 'installment') {
      const toggle = document.getElementById('custom-amounts-toggle');
      if (toggle?.checked) {
        const inputs = document.querySelectorAll('[data-inst-row]');
        installmentAmounts = Array.from(inputs).map(inp => parseFloat(inp.value) || 0);
        if (installmentAmounts.some(a => a <= 0)) {
          alert('Informe o valor de todas as parcelas.');
          return;
        }
      }
    }

    const btn = document.querySelector('#plan-form button:last-of-type');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      await Storage.addPlanned({
        description:        form.description.value.trim(),
        totalAmount:        installmentAmounts
          ? installmentAmounts.reduce((s, a) => s + a, 0)
          : parseFloat(form.totalAmount.value),
        paymentType,
        installments:       paymentType === 'installment' ? parseInt(instInput.value) : 1,
        startDate:          form.startDate.value,
        installmentAmounts,
      });
      Modal.close();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Verifique sua conexão e tente novamente.');
      if (btn) { btn.disabled = false; btn.textContent = 'Simular'; }
    }
  },

  confirmDelete(id) {
    Confirm.show('Este gasto planejado será removido da simulação.', async () => {
      try { await Storage.deletePlanned(id); }
      catch (e) { alert('Erro ao excluir. Tente novamente.'); }
    });
  },

  // ── Converter simulação em transações reais ───────────────────────────────
  confirmAsTransactions(id) {
    const p = Storage.getPlanned().find(x => x.id === id);
    if (!p) return;
    const impacts = Calc.plannedImpacts(p);

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h3 class="text-base font-bold text-gray-900">Lançar nas Transações</h3>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="px-4 pb-6 pt-4 space-y-4">
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <p class="text-sm font-semibold text-indigo-900">${p.description}</p>
          <p class="text-xs text-indigo-600 mt-0.5">${impacts.length === 1 ? 'Lançamento único' : `${impacts.length} parcelas`} · ${Calc.fmt(p.totalAmount)}</p>
        </div>
        <div class="space-y-1.5 max-h-40 overflow-y-auto">
          ${impacts.map(imp => `
            <div class="flex justify-between text-xs px-3 py-1.5 bg-gray-50 rounded-lg">
              <span class="text-gray-600">${Calc.fmtMonthLong(imp.monthKey)}${imp.installment ? ` (${imp.installment}/${imp.totalInstallments})` : ''}</span>
              <span class="font-semibold text-red-600">−${Calc.fmt(imp.amount)}</span>
            </div>
          `).join('')}
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Categoria *</label>
          <select id="confirm-cat"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Selecionar categoria...</option>
            ${UITransactions.EXPENSE_CATS.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <label class="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" id="remove-planned" checked class="w-4 h-4 accent-indigo-600 rounded">
          <span class="text-sm text-gray-700">Remover da simulação após confirmar</span>
        </label>
        <div class="flex gap-3 pt-1">
          <button type="button" onclick="Modal.close()"
            class="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Cancelar
          </button>
          <button type="button" id="confirm-exec-btn" onclick="UISimulator.executeConfirm('${id}')"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
            Confirmar
          </button>
        </div>
      </div>
    `;
    Modal.open();
  },

  async executeConfirm(id) {
    const p = Storage.getPlanned().find(x => x.id === id);
    if (!p) { Modal.close(); return; }
    const cat = document.getElementById('confirm-cat')?.value;
    if (!cat) { alert('Selecione uma categoria.'); return; }

    const impacts  = Calc.plannedImpacts(p);
    const groupId  = impacts.length > 1 ? _genId() : null;
    const startDay = new Date(p.startDate + 'T12:00:00').getDate();

    const transactions = impacts.map(imp => {
      const [y, m] = imp.monthKey.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const day = String(Math.min(startDay, lastDay)).padStart(2, '0');
      return {
        type:        'expense',
        description: imp.installment ? `${p.description} (${imp.installment}/${imp.totalInstallments})` : p.description,
        amount:      imp.amount,
        date:        `${imp.monthKey}-${day}`,
        category:    cat,
        notes:       '',
        ...(groupId ? { groupId, installmentNumber: imp.installment, totalInstallments: imp.totalInstallments } : {}),
      };
    });

    const removePlanned = document.getElementById('remove-planned')?.checked;
    const btn = document.getElementById('confirm-exec-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      await Storage.addTransactionBatch(transactions);
      if (removePlanned) await Storage.deletePlanned(id);
      Modal.close();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Tente novamente.');
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar'; }
    }
  },
};
