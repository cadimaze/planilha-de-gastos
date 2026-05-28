const UIPWAHint = {
  _prompt: null,

  init() {
    if (this._isInstalled()) return;

    // Android Chrome: captura o evento nativo de instalação
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._prompt = e;
      this._refreshCard();
    });

    // Após instalação bem-sucedida, dispensa o card
    window.addEventListener('appinstalled', () => this.dismiss());
  },

  // ── Detecção ──────────────────────────────────────────────────
  _isIOS()       { return /iphone|ipad|ipod/i.test(navigator.userAgent); },
  _isAndroid()   { return /android/i.test(navigator.userAgent); },
  _isInstalled() {
    return window.navigator.standalone === true ||
           window.matchMedia('(display-mode: standalone)').matches;
  },

  _shouldShow() {
    if (this._isInstalled()) return false;
    if (localStorage.getItem('pg_pwa_dismissed')) return false;
    return this._isIOS() || this._isAndroid();
  },

  // ── Card ──────────────────────────────────────────────────────
  _refreshCard() {
    const card = document.getElementById('pwa-hint-card');
    if (!card) return;
    const temp = document.createElement('div');
    temp.innerHTML = this.getCard();
    const next = temp.firstElementChild;
    if (next) card.replaceWith(next); else card.remove();
  },

  getCard() {
    if (!this._shouldShow()) return '';
    const hasNative = this._isAndroid() && this._prompt;
    return `
      <div id="pwa-hint-card" class="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-5">
        <div class="w-7 h-7 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-amber-800 leading-snug">Ainda não somos um app — mas quase.</p>
          <button onclick="UIPWAHint.${hasNative ? 'installNative' : 'showModal'}()"
            class="text-xs text-amber-600 font-medium mt-0.5 hover:text-amber-800 transition-colors">
            ${hasNative ? 'Instalar o Hive →' : 'Saiba como usar na tela de início →'}
          </button>
        </div>
        <button onclick="UIPWAHint.dismiss()" title="Dispensar"
          class="flex-shrink-0 p-1 text-amber-300 hover:text-amber-500 transition-colors rounded-lg">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  },

  // ── Instalação nativa Android Chrome ─────────────────────────
  async installNative() {
    if (!this._prompt) { this.showModal(); return; }
    try {
      await this._prompt.prompt();
      const { outcome } = await this._prompt.userChoice;
      this._prompt = null;
      if (outcome === 'accepted') this.dismiss();
      else this._refreshCard(); // prompt consumido, atualiza botão
    } catch {
      this.showModal(); // fallback se algo falhar
    }
  },

  // ── Dispensar ─────────────────────────────────────────────────
  dismiss() {
    localStorage.setItem('pg_pwa_dismissed', '1');
    const card = document.getElementById('pwa-hint-card');
    if (card) {
      Object.assign(card.style, {
        transition: 'opacity 0.25s ease, max-height 0.3s ease, margin 0.3s ease',
        opacity: '0', maxHeight: '0', overflow: 'hidden', marginBottom: '0',
      });
      setTimeout(() => card.remove(), 320);
    }
  },

  // ── Modal ─────────────────────────────────────────────────────
  showModal() {
    this._isIOS() ? this._modalIOS() : this._modalAndroid();
    Modal.open();
  },

  _header(title, sub) {
    return `
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <img src="icon.png?v=2" class="w-10 h-10 rounded-2xl object-cover shadow-sm flex-shrink-0">
          <div>
            <p class="text-sm font-bold text-gray-900">${title}</p>
            <p class="text-xs text-gray-400">${sub}</p>
          </div>
        </div>
        <button onclick="Modal.close()"
          class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  },

  _steps(items) {
    return items.map((item, i) => {
      const last = i === items.length - 1;
      const badge = last
        ? `<div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
             <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
             </svg>
           </div>`
        : `<div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
             <span class="text-xs font-bold text-amber-700">${i + 1}</span>
           </div>`;
      return `
        <div class="flex items-start gap-3">
          ${badge}
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800">${item.t}</p>
            ${item.s ? `<p class="text-xs text-gray-400 mt-0.5">${item.s}</p>` : ''}
          </div>
        </div>`;
    }).join('');
  },

  _intro(text) {
    return `
      <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
        <p class="text-sm text-amber-900 leading-relaxed">${text}</p>
      </div>`;
  },

  _footer() {
    return `
      <button onclick="UIPWAHint.dismiss(); Modal.close()"
        class="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 active:scale-95 transition-all">
        Entendido!
      </button>`;
  },

  _modalIOS() {
    document.getElementById('modal-box').innerHTML = `
      <div class="px-5 py-5">
        ${this._header('Hive no iPhone', 'Adicionar à tela de início via Safari')}
        ${this._intro('O Hive ainda não está nas lojas, mas dá pra chegar bem perto. Adicione-o à tela de início e ele abre em tela cheia, sem a barra do Safari — praticamente um app.')}
        <div class="space-y-4 mb-6">
          ${this._steps([
            { t: 'Abra este site no <span class="text-amber-700">Safari</span>', s: 'Não funciona pelo Chrome ou outro navegador no iOS' },
            { t: 'Toque no ícone de <span class="text-amber-700">Compartilhar</span>', s: 'O quadrado com a seta pra cima na barra inferior' },
            { t: 'Role a lista e toque em <span class="text-amber-700">"Adicionar à Tela de Início"</span>' },
            { t: 'Confirme tocando em <span class="text-amber-700">"Adicionar"</span>' },
            { t: 'Pronto! O Hive aparece na sua tela de início', s: 'Abre em tela cheia, sem barra do navegador' },
          ])}
        </div>
        ${this._footer()}
      </div>
    `;
  },

  _modalAndroid() {
    document.getElementById('modal-box').innerHTML = `
      <div class="px-5 py-5">
        ${this._header('Hive no Android', 'Adicionar à tela de início via Chrome')}
        ${this._intro('O Hive ainda não está nas lojas, mas dá pra chegar bem perto. Adicione-o à tela de início e ele abre em tela cheia, sem a barra do Chrome — praticamente um app.')}
        <div class="space-y-4 mb-6">
          ${this._steps([
            { t: 'Toque nos <span class="text-amber-700">três pontinhos ⋮</span>', s: 'No canto superior direito do Chrome' },
            { t: 'Toque em <span class="text-amber-700">"Adicionar à tela inicial"</span>' },
            { t: 'Confirme tocando em <span class="text-amber-700">"Adicionar"</span>' },
            { t: 'Pronto! O Hive aparece na sua tela de início', s: 'Abre em tela cheia, sem barra do navegador' },
          ])}
        </div>
        ${this._footer()}
      </div>
    `;
  },
};

UIPWAHint.init();
