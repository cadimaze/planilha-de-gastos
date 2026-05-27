const Calc = {
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

  summary(transactions, key) {
    const tx = this.txForMonth(transactions, key);
    const income   = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, balance: income - expenses, tx, count: tx.length };
  },

  categoryTotals(transactions, key, type) {
    const map = {};
    this.txForMonth(transactions, key)
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

  // Map of monthKey -> array of { amount, installment, totalInstallments, planned }
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

  // Projections for the next `months` months from today
  projections(transactions, plannedList, months = 6) {
    const now = new Date();
    const byMonth = this.plannedByMonth(plannedList);
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const s = this.summary(transactions, key);
      const impacts = byMonth[key] || [];
      const plannedTotal = impacts.reduce((a, x) => a + x.amount, 0);
      return { monthKey: key, ...s, impacts, plannedTotal, projected: s.balance - plannedTotal };
    });
  },
};
