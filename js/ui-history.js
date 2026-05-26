const UIHistory = {
  render() {
    const tx        = Storage.getTransactions();
    const allMonths = Calc.allMonths(tx);
    const last6     = [...allMonths].sort().slice(-6);

    document.getElementById('page-content').innerHTML = `

      ${last6.length > 1 ? `
      <!-- Overview chart -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Visão geral</p>
        <div class="h-44">
          <canvas id="chart-hist"></canvas>
        </div>
      </div>
      ` : ''}

      <!-- Running balance -->
      ${allMonths.length > 0 ? (() => {
        let running = 0;
        const rows = [...allMonths].sort().map(key => {
          const s = Calc.summary(tx, key);
          running += s.balance;
          return { key, s, running };
        }).reverse();
        const latestRunning = rows[0]?.running ?? 0;
        return `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo acumulado</p>
            <p class="text-lg font-bold ${latestRunning >= 0 ? 'text-green-600' : 'text-red-600'}">${Calc.fmt(latestRunning)}</p>
          </div>
        </div>
        `;
      })() : ''}

      <!-- Monthly cards -->
      <div class="space-y-3">
        ${allMonths.length === 0 ? `
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
            <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p class="text-sm text-gray-400 font-medium">Nenhum histórico ainda</p>
            <p class="text-xs text-gray-300 mt-1">Adicione transações para construir seu histórico</p>
          </div>
        ` : allMonths.map(key => {
          const s = Calc.summary(tx, key);
          const balColor = s.balance >= 0 ? 'text-green-600' : 'text-red-600';
          const savRate  = s.income > 0 ? Math.round((s.balance / s.income) * 100) : null;
          const catExp   = Calc.categoryTotals(tx, key, 'expense');
          const topCat   = catExp[0];

          return `
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button onclick="UIHistory.toggle('${key}')"
              class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
              <div>
                <p class="text-sm font-bold text-gray-900 capitalize">${Calc.fmtMonthLong(key)}</p>
                <p class="text-xs text-gray-400 mt-0.5">${s.count} transações${topCat ? ` · maior: ${topCat.category}` : ''}</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-bold ${balColor}">${Calc.fmt(s.balance)}</p>
                  ${savRate !== null ? `<p class="text-xs text-gray-400">${savRate}% poupado</p>` : ''}
                </div>
                <svg id="arr-${key}" class="w-4 h-4 text-gray-300 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </button>

            <div id="det-${key}" class="hidden">
              <!-- Stats row -->
              <div class="grid grid-cols-3 divide-x divide-gray-50 border-t border-gray-50">
                <div class="px-3 py-3 text-center">
                  <p class="text-xs text-gray-400 mb-1">Entradas</p>
                  <p class="text-sm font-bold text-green-600">${Calc.fmt(s.income)}</p>
                </div>
                <div class="px-3 py-3 text-center">
                  <p class="text-xs text-gray-400 mb-1">Saídas</p>
                  <p class="text-sm font-bold text-red-600">${Calc.fmt(s.expenses)}</p>
                </div>
                <div class="px-3 py-3 text-center">
                  <p class="text-xs text-gray-400 mb-1">Saldo</p>
                  <p class="text-sm font-bold ${balColor}">${Calc.fmt(s.balance)}</p>
                </div>
              </div>

              <!-- Transactions -->
              ${s.tx.length > 0 ? `
              <div class="border-t border-gray-50 divide-y divide-gray-50">
                ${[...s.tx].sort((a,b) => b.date.localeCompare(a.date)).map(t => `
                  <div class="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type==='income' ? 'bg-green-50' : 'bg-red-50'}">
                      ${categoryIcon(t.category, t.type, true)}
                    </div>
                    <div class="ml-2.5 flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-800 truncate">${t.description}</p>
                      <p class="text-xs text-gray-400">${t.category} · ${Calc.fmtDate(t.date)}</p>
                    </div>
                    <p class="text-xs font-bold ml-2 flex-shrink-0 ${t.type==='income' ? 'text-green-600' : 'text-red-600'}">
                      ${t.type==='income' ? '+' : '−'}${Calc.fmt(t.amount)}
                    </p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    `;

    if (last6.length > 1) {
      const labels = last6.map(k => Calc.fmtMonthShort(k));
      const sums   = last6.map(k => Calc.summary(tx, k));
      Charts.bar('chart-hist', labels, [
        { label: 'Entradas', data: sums.map(s => s.income),   backgroundColor: '#22c55e', borderRadius: 4 },
        { label: 'Saídas',   data: sums.map(s => s.expenses), backgroundColor: '#f43f5e', borderRadius: 4 },
      ]);
    }
  },

  toggle(key) {
    const det = document.getElementById(`det-${key}`);
    const arr = document.getElementById(`arr-${key}`);
    if (!det) return;
    const open = det.classList.toggle('hidden');
    if (arr) arr.style.transform = open ? '' : 'rotate(180deg)';
  },
};
