const Calc = {
  VA_VR_CATS: ['Vale Alimentação', 'Vale Refeição', 'Alimentação (VA)', 'Refeição (VR)'],

  INVESTMENT_TYPES: [
    'Poupança', 'Tesouro Direto', 'Tesouro Selic', 'CDB', 'LCI/LCA',
    'Fundo Imobiliário', 'Ações', 'ETF', 'Câmbio Internacional',
    'Criptomoedas', 'Previdência Privada', 'Outros',
  ],

  fmt(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  },

  fmtDate(str) {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  },

  fmtMonthLong(key) {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  },

  fmtMonthShort(key) {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  },

  monthKey(dateStr) { return dateStr.slice(0, 7); },

  currentMonthKey() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  },

  txForMonth(transactions, key) {
    return transactions.filter(t => this.monthKey(t.date) === key);
  },

  // Generates virtual transaction objects for active recurrents in a given month
  recurrentForMonth(recorrentes, key) {
    if (!recorrentes || !recorrentes.length) return [];
    const [y, m] = key.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return recorrentes
      .filter(r => r.active !== false && (!r.startDate || r.startDate <= key))
      .map(r => ({
        id:           `rec_${r.id}`,
        type:         r.type,
        description:  r.description,
        amount:       r.amount,
        category:     r.category,
        notes:        r.notes || '',
        date:         `${key}-${String(Math.min(r.day || 1, lastDay)).padStart(2, '0')}`,
        isRecurrent:  true,
        recurrentId:  r.id,
      }));
  },

  // Full summary including recurrents (all wallets)
  summary(transactions, key, recorrentes = []) {
    const tx = [
      ...this.txForMonth(transactions, key),
      ...this.recurrentForMonth(recorrentes, key),
    ];
    const income   = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, balance: income - expenses, tx, count: tx.length };
  },

  // Bank-only summary — excludes VA/VR categories
  bankSummary(transactions, key, recorrentes = []) {
    const s = this.summary(transactions, key, recorrentes);
    const tx = s.tx.filter(t => !this.VA_VR_CATS.includes(t.category));
    const income   = tx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = tx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses, tx, count: tx.length };
  },

  // VA and VR wallet balances
  walletSummary(transactions, key, recorrentes = []) {
    const allTx = [
      ...this.txForMonth(transactions, key),
      ...this.recurrentForMonth(recorrentes, key),
    ];
    const wallet = (inCats, outCats) => {
      const inc = allTx.filter(t => inCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
      const exp = allTx.filter(t => outCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
      return { income: inc, expenses: exp, balance: inc - exp, has: inc > 0 || exp > 0 };
    };
    return {
      va: wallet(['Vale Alimentação'], ['Alimentação (VA)']),
      vr: wallet(['Vale Refeição'],    ['Refeição (VR)']),
    };
  },

  categoryTotals(transactions, key, type, recorrentes = []) {
    const map = {};
    [
      ...this.txForMonth(transactions, key),
      ...this.recurrentForMonth(recorrentes, key),
    ]
      .filter(t => t.type === type)
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  },

  allMonths(transactions) {
    const set = new Set(transactions.map(t => this.monthKey(t.date)));
    set.add(this.currentMonthKey());
    return Array.from(set).sort().reverse();
  },

  investimentoSummary(investimentos) {
    const total = (investimentos || []).reduce((s, i) => s + i.amount, 0);
    const byType = {};
    (investimentos || []).forEach(i => { byType[i.type] = (byType[i.type] || 0) + i.amount; });
    const typeList = Object.entries(byType)
      .map(([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { total, typeList };
  },

  // Cumulative bank balance minus investments up to and including upToMonthKey
  runningBalance(transactions, upToMonthKey, recorrentes = [], investimentos = []) {
    const months = this.allMonths(transactions).filter(m => m <= upToMonthKey);
    const bankBal = months.reduce((sum, key) => sum + this.bankSummary(transactions, key, recorrentes).balance, 0);
    const invTotal = (investimentos || [])
      .filter(i => this.monthKey(i.date) <= upToMonthKey)
      .reduce((s, i) => s + i.amount, 0);
    return bankBal - invTotal;
  },

  // Returns array of { monthKey, amount, installment?, totalInstallments? } for a planned expense
  plannedImpacts(planned) {
    const result = [];
    const start = new Date(planned.startDate + 'T12:00:00');
    if (planned.paymentType === 'lump') {
      result.push({ monthKey: this.monthKey(planned.startDate), amount: planned.totalAmount });
    } else {
      const n = parseInt(planned.installments) || 1;
      for (let i = 0; i < n; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const amount = planned.installmentAmounts && planned.installmentAmounts[i] != null
          ? planned.installmentAmounts[i]
          : planned.totalAmount / n;
        result.push({
          monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          amount,
          installment: i + 1,
          totalInstallments: n,
        });
      }
    }
    return result;
  },

  plannedByMonth(plannedList) {
    const map = {};
    plannedList.forEach(p => {
      this.plannedImpacts(p).forEach(impact => {
        if (!map[impact.monthKey]) map[impact.monthKey] = [];
        map[impact.monthKey].push({ ...impact, planned: p });
      });
    });
    return map;
  },

  // Projections use bank-only balance (VA/VR excluded) + recurrents
  projections(transactions, plannedList, months = 6, recorrentes = []) {
    const now = new Date();
    const byMonth = this.plannedByMonth(plannedList);
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const s = this.bankSummary(transactions, key, recorrentes);
      const impacts = byMonth[key] || [];
      const plannedTotal = impacts.reduce((a, x) => a + x.amount, 0);
      return { monthKey: key, ...s, impacts, plannedTotal, projected: s.balance - plannedTotal };
    });
  },
};
