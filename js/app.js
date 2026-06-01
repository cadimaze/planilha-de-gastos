const App = {
  currentPage:       'dashboard',
  currentMonth:      '',
  currentDayFilter:  null,
  currentUser:       null,
  currentPlanilha:   null,
  currentPlanilhaId: null,
  planilhas:         [],
  transactions:      [],
  planned:           [],
  recorrentes:       [],
  investimentos:     [],
  cartoes:           [],
  assinaturas:       [],

  _initialized: false,
  _loadCount:   0,
  _unsubTx:     null,
  _unsubPl:     null,
  _unsubRec:    null,
  _unsubInv:    null,
  _unsubCard:   null,
  _unsubAss:    null,

  // ── Boot ──────────────────────────────────────────────────────────────────
  init() {
    auth.onAuthStateChanged(user => {
      if (user) { this.currentUser = user; this._onLogin(); }
      else       { this.currentUser = null; this._onLogout(); }
    });

    let _hiddenAt = null;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        _hiddenAt = Date.now();
      } else if (_hiddenAt && Date.now() - _hiddenAt >= 5 * 60 * 1000) {
        location.reload();
      }
    });
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  async signIn() {
    const btn = document.getElementById('btn-google-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked') {
        alert('O navegador bloqueou o popup de login. Permita popups para este site e tente novamente.');
      } else if (e.code !== 'auth/popup-closed-by-user') {
        console.error(e);
        alert('Erro ao fazer login: ' + (e.message || e));
      }
      if (btn) { btn.disabled = false; btn.innerHTML = _googleBtnInner(); }
    }
  },

  async signOut() {
    if (!confirm('Deseja sair da conta?')) return;
    await auth.signOut();
  },

  // ── Login / Logout ────────────────────────────────────────────────────────
  async _onLogin() {
    // Show loading (may have been hidden after a previous logout)
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden', 'fade-out');
    loading.style.opacity = '';
    document.getElementById('login-screen').classList.add('hidden');

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
    const cachedRate = Currency._getCached();
    if (cachedRate) Calc._usdRate = cachedRate;
    Currency.getRate().then(rate => {
      Calc._usdRate = rate;
      if (this._initialized) this.refresh();
    }).catch(() => {});
    this.switchPlanilha(found.id);
  },

  switchPlanilha(planilhaId) {
    if (this._unsubTx)   { this._unsubTx();   this._unsubTx   = null; }
    if (this._unsubPl)   { this._unsubPl();   this._unsubPl   = null; }
    if (this._unsubRec)  { this._unsubRec();  this._unsubRec  = null; }
    if (this._unsubInv)  { this._unsubInv();  this._unsubInv  = null; }
    if (this._unsubCard) { this._unsubCard(); this._unsubCard = null; }
    if (this._unsubAss)  { this._unsubAss();  this._unsubAss  = null; }

    this.currentPlanilhaId = planilhaId;
    this.currentPlanilha   = this.planilhas.find(p => p.id === planilhaId) || null;
    this.currentMonth      = Calc.currentMonthKey();
    this.currentDayFilter  = new Date().getDate();
    this._initialized      = false;
    this._loadCount        = 0;

    localStorage.setItem('pg_last_planilha', planilhaId);
    this._updatePlanilhaDisplay();

    const onLoad = () => {
      this._loadCount++;
      if (this._loadCount >= 3 && !this._initialized) {
        this._initialized = true;
        this._showApp();
      }
    };

    this._unsubTx = db.collection('planilhas').doc(planilhaId)
      .collection('transactions').onSnapshot(snap => {
        this.transactions = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id:                doc.id,
            type:              d.type,
            description:       d.description,
            amount:            d.amount,
            date:              d.date,
            category:          d.category,
            notes:             d.notes || '',
            groupId:           d.groupId           || null,
            installmentNumber: d.installmentNumber || null,
            totalInstallments: d.totalInstallments || null,
            cardId:            d.cardId            || null,
            currency:          d.currency          || 'BRL',
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
            id:                 doc.id,
            description:        d.description,
            totalAmount:        d.totalAmount,
            paymentType:        d.paymentType,
            installments:       d.installments,
            installmentAmounts: d.installmentAmounts || null,
            startDate:          d.startDate,
          };
        });
        if (!this._initialized) onLoad();
        else if (['dashboard', 'simulator'].includes(this.currentPage)) this.refresh();
      }, err => console.error('planned snapshot:', err));

    this._unsubRec = db.collection('planilhas').doc(planilhaId)
      .collection('recorrentes').onSnapshot(snap => {
        this.recorrentes = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id:          doc.id,
            type:        d.type,
            description: d.description,
            amount:      d.amount,
            category:    d.category,
            day:         d.day || 1,
            notes:       d.notes || '',
            active:      d.active !== false,
            startDate:   d.startDate || null,
          };
        });
        if (!this._initialized) onLoad();
        else this.refresh();
      }, err => {
        console.error('recorrentes snapshot:', err);
        if (!this._initialized) onLoad();
      });

    this._unsubInv = db.collection('planilhas').doc(planilhaId)
      .collection('investimentos').onSnapshot(snap => {
        this.investimentos = snap.docs.map(doc => {
          const d = doc.data();
          return { id: doc.id, type: d.type, description: d.description || '', amount: d.amount, date: d.date, notes: d.notes || '', currency: d.currency || 'BRL' };
        });
        if (this._initialized) this.refresh();
      }, err => console.error('investimentos snapshot:', err));

    this._unsubCard = db.collection('planilhas').doc(planilhaId)
      .collection('cartoes').onSnapshot(snap => {
        this.cartoes = snap.docs.map(doc => {
          const d = doc.data();
          return { id: doc.id, name: d.name, type: d.type, color: d.color || '#374151', dueDay: d.dueDay || null, closingDay: d.closingDay || null };
        });
        if (this._initialized) this.refresh();
      }, err => console.error('cartoes snapshot:', err));

    this._unsubAss = db.collection('planilhas').doc(planilhaId)
      .collection('assinaturas').onSnapshot(snap => {
        this.assinaturas = snap.docs.map(doc => {
          const d = doc.data();
          return { id: doc.id, name: d.name, category: d.category || 'outros', amount: d.amount, currency: d.currency || 'BRL', active: d.active !== false };
        });
        if (this._initialized) this.refresh();
      }, err => console.error('assinaturas snapshot:', err));
  },

  _showApp() {
    const loading = document.getElementById('loading');
    loading.classList.add('fade-out');
    setTimeout(() => loading.classList.add('hidden'), 350);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-layout').classList.remove('hidden');
    this._buildMonthSelector();
    this._updateSidebarMonth();
    const inp = document.getElementById('day-filter-input');
    if (inp && this.currentDayFilter) {
      inp.value = this.currentDayFilter;
      inp.style.borderColor = '#f59e0b';
    }
    UIPrivacy.checkAndShow(() => this.navigateTo('dashboard'));
  },

  _onLogout() {
    if (this._unsubTx)   { this._unsubTx();   this._unsubTx   = null; }
    if (this._unsubPl)   { this._unsubPl();   this._unsubPl   = null; }
    if (this._unsubRec)  { this._unsubRec();  this._unsubRec  = null; }
    if (this._unsubInv)  { this._unsubInv();  this._unsubInv  = null; }
    if (this._unsubCard) { this._unsubCard(); this._unsubCard = null; }
    if (this._unsubAss)  { this._unsubAss();  this._unsubAss  = null; }
    this.transactions = []; this.planned = []; this.recorrentes = []; this.investimentos = []; this.cartoes = []; this.assinaturas = []; this.planilhas = [];
    this.currentPlanilha = null; this.currentPlanilhaId = null;
    this._initialized = false; this._loadCount = 0;
    const loading = document.getElementById('loading');
    loading.classList.remove('fade-out');
    loading.classList.add('hidden');
    document.getElementById('main-layout').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  },

  // ── Navegação ─────────────────────────────────────────────────────────────
  navigateTo(page) {
    this.currentPage = page;
    Charts.destroyAll();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    document.querySelectorAll('.drawer-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));

    const meta = {
      dashboard:    ['Dashboard',          () => Calc.fmtMonthLong(this.currentMonth)],
      transactions: ['Transações',         () => Calc.fmtMonthLong(this.currentMonth)],
      simulator:    ['Simulador de Gastos','Planeje grandes despesas'],
      history:      ['Histórico',          'Todos os meses'],
      investimentos:['Investimentos',      'Controle de aportes'],
      cartoes:      ['Cartões',            'Gerencie seus cartões'],
      assinaturas:  ['Assinaturas',        'Gerencie suas assinaturas'],
    };
    const [title, subtitle] = meta[page] || ['', ''];
    document.getElementById('page-title').textContent    = title;
    document.getElementById('page-subtitle').textContent = typeof subtitle === 'function' ? subtitle() : subtitle;
    document.getElementById('month-selector-wrap').style.display =
      ['dashboard', 'transactions'].includes(page) ? '' : 'none';

    switch (page) {
      case 'dashboard':    UIDashboard.render(this.currentMonth, this.currentDayFilter);    break;
      case 'transactions': UITransactions.render(this.currentMonth, this.currentDayFilter); break;
      case 'simulator':    UISimulator.render();                     break;
      case 'history':      UIHistory.render();                       break;
      case 'investimentos':UIInvestimentos.render();                 break;
      case 'cartoes':      UICartoes.render();                       break;
      case 'assinaturas':  UIAssinaturas.render();                   break;
    }
  },

  changeMonth(key) {
    this.currentMonth = key;
    const isCurrentMonth = key === Calc.currentMonthKey();
    const todayDay = new Date().getDate();
    this.currentDayFilter = isCurrentMonth ? todayDay : null;
    const inp = document.getElementById('day-filter-input');
    if (inp) {
      inp.value = isCurrentMonth ? todayDay : '';
      inp.style.borderColor = isCurrentMonth ? '#f59e0b' : '';
      inp.placeholder = isCurrentMonth ? String(todayDay) : 'dia';
    }
    Charts.destroyAll();
    this._updateSidebarMonth();
    document.getElementById('page-subtitle').textContent = Calc.fmtMonthLong(key);
    const df = this.currentDayFilter;
    if (this.currentPage === 'dashboard')    UIDashboard.render(key, df);
    if (this.currentPage === 'transactions') UITransactions.render(key, df);
  },

  setDayFilter(val) {
    const n = parseInt(val);
    this.currentDayFilter = (!val || isNaN(n)) ? null : Math.min(31, Math.max(1, n));
    const inp = document.getElementById('day-filter-input');
    if (inp) inp.style.borderColor = this.currentDayFilter ? '#f59e0b' : '';
    Charts.destroyAll();
    if (this.currentPage === 'dashboard')    UIDashboard.render(this.currentMonth, this.currentDayFilter);
    if (this.currentPage === 'transactions') UITransactions.render(this.currentMonth, this.currentDayFilter);
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
      case 'dashboard':    UIDashboard.render(this.currentMonth, this.currentDayFilter);    break;
      case 'transactions': UITransactions.render(this.currentMonth, this.currentDayFilter); break;
      case 'simulator':    UISimulator.render();                     break;
      case 'history':      UIHistory.render();                       break;
      case 'investimentos':UIInvestimentos.render();                 break;
      case 'cartoes':      UICartoes.render();                       break;
      case 'assinaturas':  UIAssinaturas.render();                   break;
    }
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  _getMonthList() {
    return [...new Set([...Calc.allMonths(this.transactions), Calc.currentMonthKey()])].sort();
  },

  _buildMonthSelector() {
    const months = this._getMonthList();
    const sel = document.getElementById('month-selector');
    if (!sel) return;
    sel.innerHTML = months.map(m => {
      const d = new Date(m + '-02');
      const short = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const label = short.charAt(0).toUpperCase() + short.slice(1) + ' ' + m.slice(0, 4);
      return `<option value="${m}" ${m === this.currentMonth ? 'selected' : ''}>${label}</option>`;
    }).join('');
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
    const dAvatar = document.getElementById('drawer-avatar');
    const dName   = document.getElementById('drawer-username');
    if (dAvatar) {
      if (user.photoURL) { dAvatar.src = user.photoURL; dAvatar.classList.remove('hidden'); }
      else dAvatar.classList.add('hidden');
    }
    if (dName) dName.textContent = user.displayName || user.email;
  },
};

function navigateTo(page) { App.navigateTo(page); }

function _googleBtnInner() {
  return `<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Entrar com Google`;
}

document.addEventListener('DOMContentLoaded', () => App.init());
