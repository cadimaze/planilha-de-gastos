const UIDashboard = {
  render(monthKey) {
    const txAll    = Storage.getTransactions();
    const recAll   = Storage.getRecurrentes();
    const planned  = Storage.getPlanned();
    const s        = Calc.bankSummary(txAll, monthKey, recAll);
    const wallet   = Calc.walletSummary(txAll, monthKey, recAll);
    const catExp   = Calc.categoryTotals(txAll, monthKey, 'expense', recAll).filter(c => !Calc.VA_VR_CATS.includes(c.category));
    const catInc   = Calc.categoryTotals(txAll, monthKey, 'income',  recAll).filter(c => !Calc.VA_VR_CATS.includes(c.category));
    const recent   = [...Calc.summary(txAll, monthKey, recAll).tx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const pByMonth = Calc.plannedByMonth(planned);
    const pImpact  = pByMonth[monthKey] || [];
    const pTotal   = pImpact.reduce((a, x) => a + x.amount, 0);
    const projected = s.balance - pTotal;

    const totalFlow = s.income + s.expenses;
    const incPct = totalFlow > 0 ? Math.round((s.income / totalFlow) * 100) : 0;
    const expPct = totalFlow > 0 ? Math.round((s.expenses / totalFlow) * 100) : 0;
    const savRate  = s.income > 0 ? Math.round((s.balance / s.income) * 100) : null;

    const balColor  = s.balance >= 0 ? 'text-green-600' : 'text-red-600';
    const balBadge  = s.balance >= 0
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-red-50 text-red-700 border border-red-200';

    document.getElementById('page-content').innerHTML = `

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

        <!-- Balance -->
        <div class="col-span-2 lg:col-span-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-start justify-between mb-3">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saldo do mês</p>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${balBadge}">
              ${s.balance >= 0 ? 'Positivo' : 'Negativo'}
            </span>
          </div>
          <p class="text-3xl font-bold ${balColor} mb-3">${Calc.fmt(s.balance)}</p>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-green-400 h-1.5 rounded-full balance-bar" style="width:${incPct}%"></div>
              </div>
              <span class="text-xs text-gray-400 w-8 text-right">${incPct}%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-red-400 h-1.5 rounded-full balance-bar" style="width:${expPct}%"></div>
              </div>
              <span class="text-xs text-gray-400 w-8 text-right">${expPct}%</span>
            </div>
          </div>
        </div>

        <!-- Income -->
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Entradas</p>
          <p class="text-xl font-bold text-green-600">${Calc.fmt(s.income)}</p>
          ${s.income > 0 ? `<p class="text-xs text-gray-400 mt-1">${s.tx.filter(t=>t.type==='income').length} lançamentos</p>` : '<p class="text-xs text-gray-300 mt-1">Nenhuma</p>'}
        </div>

        <!-- Expenses -->
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Saídas</p>
          <p class="text-xl font-bold text-red-600">${Calc.fmt(s.expenses)}</p>
          ${s.expenses > 0 ? `<p class="text-xs text-gray-400 mt-1">${s.tx.filter(t=>t.type==='expense').length} lançamentos</p>` : '<p class="text-xs text-gray-300 mt-1">Nenhuma</p>'}
        </div>
      </div>

      ${wallet.va.has || wallet.vr.has ? `
      <!-- VA/VR Wallet Cards -->
      <div class="grid grid-cols-1 ${wallet.va.has && wallet.vr.has ? 'sm:grid-cols-2' : ''} gap-3 mb-5">
        ${wallet.va.has ? `
        <div class="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vale Alimentação</p>
          </div>
          <p class="text-xl font-bold ${wallet.va.balance >= 0 ? 'text-green-600' : 'text-red-600'}">${Calc.fmt(wallet.va.balance)}</p>
          <div class="flex justify-between mt-2 text-xs text-gray-400">
            <span>Recebido: <span class="font-semibold text-green-600">+${Calc.fmt(wallet.va.income)}</span></span>
            <span>Usado: <span class="font-semibold text-red-500">−${Calc.fmt(wallet.va.expenses)}</span></span>
          </div>
        </div>
        ` : ''}
        ${wallet.vr.has ? `
        <div class="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vale Refeição</p>
          </div>
          <p class="text-xl font-bold ${wallet.vr.balance >= 0 ? 'text-green-600' : 'text-red-600'}">${Calc.fmt(wallet.vr.balance)}</p>
          <div class="flex justify-between mt-2 text-xs text-gray-400">
            <span>Recebido: <span class="font-semibold text-green-600">+${Calc.fmt(wallet.vr.income)}</span></span>
            <span>Usado: <span class="font-semibold text-red-500">−${Calc.fmt(wallet.vr.expenses)}</span></span>
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3 mb-5">
        <button onclick="UITransactions.openForm('income')"
          class="flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Nova Entrada
        </button>
        <button onclick="UITransactions.openForm('expense')"
          class="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/></svg>
          Nova Saída
        </button>
      </div>

      ${pImpact.length > 0 ? `
      <!-- Planned Warning -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-amber-800">Gastos planejados: ${Calc.fmt(pTotal)}</p>
            <p class="text-xs text-amber-700 mt-0.5">
              Saldo projetado:
              <span class="font-bold ${projected >= 0 ? 'text-green-700' : 'text-red-700'}">${Calc.fmt(projected)}</span>
            </p>
            <button onclick="navigateTo('simulator')" class="text-xs text-amber-800 font-medium underline mt-1">Ver simulação →</button>
          </div>
        </div>
      </div>
      ` : ''}

      ${catExp.length > 0 || catInc.length > 0 ? `
      <!-- Charts -->
      <div class="grid grid-cols-1 ${catExp.length > 0 && catInc.length > 0 ? 'lg:grid-cols-2' : ''} gap-4 mb-5">
        ${catExp.length > 0 ? `
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Saídas por categoria</p>
          <div class="flex gap-4 items-center">
            <div class="w-28 h-28 flex-shrink-0 relative">
              <canvas id="chart-exp-donut"></canvas>
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p class="text-xs font-bold text-gray-700">${catExp.length}</p>
              </div>
            </div>
            <div class="flex-1 space-y-1.5 min-w-0">
              ${catExp.slice(0, 6).map((c, i) => {
                const colors = ['#f43f5e','#f97316','#eab308','#8b5cf6','#6366f1','#ec4899'];
                const total = catExp.reduce((s, x) => s + x.amount, 0);
                const pct = Math.round((c.amount / total) * 100);
                return `
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${colors[i%colors.length]}"></div>
                  <span class="text-xs text-gray-600 truncate flex-1">${c.category}</span>
                  <span class="text-xs font-semibold text-gray-800">${pct}%</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        ${catInc.length > 0 ? `
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Entradas por categoria</p>
          <div class="flex gap-4 items-center">
            <div class="w-28 h-28 flex-shrink-0 relative">
              <canvas id="chart-inc-donut"></canvas>
            </div>
            <div class="flex-1 space-y-1.5 min-w-0">
              ${catInc.slice(0, 6).map((c, i) => {
                const colors = ['#22c55e','#14b8a6','#3b82f6','#06b6d4','#84cc16','#10b981'];
                const total = catInc.reduce((s, x) => s + x.amount, 0);
                const pct = Math.round((c.amount / total) * 100);
                return `
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${colors[i%colors.length]}"></div>
                  <span class="text-xs text-gray-600 truncate flex-1">${c.category}</span>
                  <span class="text-xs font-semibold text-gray-800">${pct}%</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Recent Transactions -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <p class="text-sm font-semibold text-gray-700">Últimas transações</p>
          <button onclick="navigateTo('transactions')" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">
            Ver todas →
          </button>
        </div>
        ${recent.length === 0 ? `
          <div class="px-4 py-10 text-center">
            <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p class="text-sm text-gray-400 font-medium">Nenhuma transação</p>
            <p class="text-xs text-gray-300 mt-1">Adicione uma entrada ou saída para começar</p>
          </div>
        ` : `
          <div class="divide-y divide-gray-50">
            ${recent.map(t => `
              <div class="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type==='income' ? 'bg-green-50' : 'bg-red-50'}">
                  ${categoryIcon(t.category, t.type)}
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">${t.description}</p>
                  <p class="text-xs text-gray-400">${t.category} · ${Calc.fmtDate(t.date)}</p>
                </div>
                <p class="text-sm font-bold ml-2 flex-shrink-0 ${t.type==='income' ? 'text-green-600' : 'text-red-600'}">
                  ${t.type==='income' ? '+' : '−'}${Calc.fmt(t.amount)}
                </p>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Charts
    if (catExp.length > 0) {
      const colors = ['#f43f5e','#f97316','#eab308','#8b5cf6','#6366f1','#ec4899'];
      Charts.donut('chart-exp-donut', catExp.map(c=>c.amount), catExp.map(c=>c.category), colors.slice(0, catExp.length));
    }
    if (catInc.length > 0) {
      const colors = ['#22c55e','#14b8a6','#3b82f6','#06b6d4','#84cc16','#10b981'];
      Charts.donut('chart-inc-donut', catInc.map(c=>c.amount), catInc.map(c=>c.category), colors.slice(0, catInc.length));
    }
  },
};
