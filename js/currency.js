const Currency = {
  _KEY: 'pg_usd_rate',
  _TTL: 30 * 60 * 1000,

  _getCached() {
    try {
      const s = localStorage.getItem(this._KEY);
      if (!s) return null;
      const { rate, ts } = JSON.parse(s);
      return (Date.now() - ts < this._TTL) ? rate : null;
    } catch { return null; }
  },

  _getAny() {
    try {
      const s = localStorage.getItem(this._KEY);
      return s ? JSON.parse(s).rate : null;
    } catch { return null; }
  },

  async getRate() {
    const cached = this._getCached();
    if (cached) return cached;
    try {
      const res  = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await res.json();
      const rate = parseFloat(data.USDBRL.bid);
      localStorage.setItem(this._KEY, JSON.stringify({ rate, ts: Date.now() }));
      return rate;
    } catch {
      return this._getAny() || 6.0;
    }
  },

  fmtRate(rate) {
    return rate ? `R$ ${rate.toFixed(2)}` : 'R$ 6,00';
  },
};
