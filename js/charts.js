const Charts = {
  _instances: {},

  destroy(id) {
    if (this._instances[id]) { this._instances[id].destroy(); delete this._instances[id]; }
  },

  destroyAll() {
    Object.keys(this._instances).forEach(id => this.destroy(id));
  },

  _fmtTooltip(val) { return ' ' + Calc.fmt(val); },

  donut(id, data, labels, colors) {
    this.destroy(id);
    const el = document.getElementById(id);
    if (!el) return;
    this._instances[id] = new Chart(el, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                return ` ${Calc.fmt(ctx.raw)}  (${((ctx.raw / total) * 100).toFixed(1)}%)`;
              },
            },
          },
        },
      },
    });
  },

  bar(id, labels, datasets, stacked) {
    this.destroy(id);
    const el = document.getElementById(id);
    if (!el) return;
    this._instances[id] = new Chart(el, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11, family: 'Inter' }, padding: 12, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => this._fmtTooltip(ctx.raw) } },
        },
        scales: {
          x: { stacked: !!stacked, grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { stacked: !!stacked, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => Calc.fmt(v) } },
        },
      },
    });
  },

  line(id, labels, datasets) {
    this.destroy(id);
    const el = document.getElementById(id);
    if (!el) return;
    this._instances[id] = new Chart(el, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11, family: 'Inter' }, padding: 12, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => this._fmtTooltip(ctx.raw) } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => Calc.fmt(v) } },
        },
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    });
  },
};
