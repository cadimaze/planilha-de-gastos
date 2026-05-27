const App = {
  currentPage:       'dashboard',
  currentMonth:      '',
  currentUser:       null,
  currentPlanilha:   null,
  currentPlanilhaId: null,
  planilhas:         [],
  transactions:      [],
  planned:           [],

  _initialized: false,
  _loadCount:   0,
  _unsubTx:     null,
  _unsubPl:     null,

  // ── Boot ──────────────────────────────────────────────────────────────────
  init() {
    auth.onAuthStateChanged(user => {
      if (user) { this.currentUser = user; this._onLogin(); }
      else       { this.currentUser = null; this._onLogout(); }
    });
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  async signIn() {
    const btn = document.getElementById('btn-google-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
    try {
      await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (e) {
      console.error(e);
      alert('Erro ao fazer login: ' + (e.message || e));
      if (btn) { btn.disabled = false; btn.innerHTML = _googleBtnInner(); }
    }
  },

  async signOut() {
    if (!confirm('Deseja sair da conta?')) return;
    await auth.signOut();
  },

  // ── Login / Logout ────────────────────────────────────────────────────────
  async _onLogin() {
    this._updateUserInfo();
    try {
      this.planilhas = await Storage.getUserPlanilhas();
    } catch (e) {
      console.error('Erro ao carregar planilhas:', e);
      this.planilhas = [];
    }

    if (this.planilhas.length === 0) {
      document.getElementById('loading').classList.add('hidden');
      UIPlanilhas.showCreate(true);
      return;
    }

    const lastId = localStorage.getItem('pg_last_planilha');
    const found  = this.planilhas.find(p => p.id === lastId) || this.planilhas[0];
    this.switchPlanilha(found.id);
  },

  switchPlanilha(planilhaId) {
    if (this._unsubTx) { this._unsubTx(); this._unsubTx = null; }
    if (this._unsubPl) { this._unsubPl(); this._unsubPl = null; }

    this.currentPlanilhaId = planilhaId;
    this.currentPlanilha   = this.planilhas.find(p => p.id === planilhaId) || null;
    this.currentMonth      = Calc.currentMonthKey();
    this._initialized      = false;
    this._loadCount        = 0;

    localStorage.setItem('pg_last_planilha', planilhaId);
    this._updatePlanilhaDisplay();

    const onLoad = () => {
      this._loadCount++;
      if (this._loadCount >= 2 && !this._initialized) {
        this._initialized = true;
        this._showApp();
      }
    };

    this._unsubTx = db.collection('planilhas').doc(planilhaId)
      .collection('transactions').onSnapshot(snap => {
        this.transactions = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id:               doc.id,
            type:             d.type,
            description:      d.description,
            amount:           d.amount,
            date:             d.date,
            category:         d.category,
            notes:            d.notes || '',
            groupId:          d.groupId          || null,
            installmentNumber: d.installmentNumber || null,
            totalInstallments: d.totalInstallments || null,
          };
        });
        if (!this._initialized) onLoad();
        else this.refresh();
      }, err => console.error('tx snapshot:', err));

    this._unsubPl = db.collection('planilhas').doc(planilhaId)
      .collection('planned').onSnapshot(snap => {
        this.planned = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id:                doc.id,
            description:       d.description,
            totalAmount:       d.totalAmount,
            paymentType:       d.paymentType,
            installments:      d.installments,
            installmentAmounts: d.installmentAmounts || null,
            startDate:         d.startDate,
          };
        });
        if (!this._initialized) onLoad();
        else if (['dashboard', 'simulator'].includes(this.currentPage)) this.refresh();
      }, err => console.error('planned snapshot:', err));
  },

  _showApp() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-layout').classList.remove('hidden');
    this._buildMonthSelector();
    this._updateSidebarMonth();
    this.navigateTo('dashboard');
  },

  _onLogout() {
    if (this._unsubTx) { this._unsubTx(); this._unsubTx = null; }
    if (this._unsubPl) { this._unsubPl(); this._unsubPl = null; }
    this.transactions = []; this.planned = []; this.planilhas = [];
    this.currentPlanilha = null; this.currentPlanilhaId = null;
    this._initialized = false; this._loadCount = 0;
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('main-layout').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  },

  // ── Navegação ─────────────────────────────────────────────────────────────
  navigateTo(page) {
    this.currentPage = page;
    Charts.destroyAll();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));

    const meta = {
      dashboard:    ['Dashboard',          () => Calc.fmtMonthLong(this.currentMonth)],
      transactions: ['Transações',         () => Calc.fmtMonthLong(this.currentMonth)],
      simulator:    ['Simulador de Gastos','Planeje grandes despesas'],
      history:      ['Histórico',          'Todos os meses'],
    };
    const [title, subtitle] = meta[page] || ['', ''];
    document.getElementById('page-title').textContent    = title;
    document.getElementById('page-subtitle').textContent = typeof subtitle === 'function' ? subtitle() : subtitle;
    document.getElementById('month-selector-wrap').style.display =
      ['dashboard', 'transactions'].includes(page) ? '' : 'none';

    switch (page) {
      case 'dashboard':    UIDashboard.render(this.currentMonth);    break;
      case 'transactions': UITransactions.render(this.currentMonth); break;
      case 'simulator':    UISimulator.render();                     break;
      case 'history':      UIHistory.render();                       break;
    }
  },

  changeMonth(key) {
    this.currentMonth = key;
    Charts.destroyAll();
    this._updateSidebarMonth();
    document.getElementById('page-subtitle').textContent = Calc.fmtMonthLong(key);
    if (this.currentPage === 'dashboard')    UIDashboard.render(key);
    if (this.currentPage === 'transactions') UITransactions.render(key);
  },

  goToMonth(date) {
    const key = Calc.monthKey(date);
    if (key !== this.currentMonth) {
      this.currentMonth = key;
      const sel = document.getElementById('month-selector');
      if (sel) sel.value = key;
      this._updateSidebarMonth();
      document.getElementById('page-subtitle').textContent = Calc.fmtMonthLong(key);
    }
  },

  refresh() {
    this._buildMonthSelector();
    Charts.destroyAll();
    switch (this.currentPage) {
      case 'dashboard':    UIDashboard.render(this.currentMonth);    break;
      case 'transactions': UITransactions.render(this.currentMonth); break;
      case 'simulator':    UISimulator.render();                     break;
      case 'history':      UIHistory.render();                       break;
    }
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  _buildMonthSelector() {
    const months = Calc.allMonths(this.transactions);
    const sel = document.getElementById('month-selector');
    if (!sel) return;
    sel.innerHTML = months.map(m =>
      `<option value="${m}" ${m === this.currentMonth ? 'selected' : ''}>${Calc.fmtMonthLong(m)}</option>`
    ).join('');
  },

  _updateSidebarMonth() {
    const el = document.getElementById('sidebar-month');
    if (el) el.textContent = Calc.fmtMonthLong(this.currentMonth);
  },

  _updatePlanilhaDisplay() {
    const name = this.currentPlanilha?.name || '';
    const els = document.querySelectorAll('[data-planilha-name]');
    els.forEach(el => { el.textContent = name; });
  },

  _updateUserInfo() {
    const user = this.currentUser;
    if (!user) return;
    const avatar = document.getElementById('user-avatar');
    const name   = document.getElementById('user-name');
    if (avatar) {
      if (user.photoURL) { avatar.src = user.photoURL; avatar.classList.remove('hidden'); }
      else avatar.classList.add('hidden');
    }
    if (name) name.textContent = user.displayName || user.email;
  },
};

function navigateTo(page) { App.navigateTo(page); }

function _googleBtnInner() {
  return `<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Entrar com Google`;
}

document.addEventListener('DOMContentLoaded', () => App.init());
