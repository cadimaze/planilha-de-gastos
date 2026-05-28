const UIPWAHint = {
  _shouldShow() {
    if (window.navigator.standalone === true) return false;
    if (localStorage.getItem('pg_pwa_dismissed')) return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  },

  getCard() {
    if (!this._shouldShow()) return '';
    return `
      <div id="pwa-hint-card" class="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-5">
        <div class="w-7 h-7 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-amber-800 leading-snug">Ainda não somos um app — mas quase.</p>
          <button onclick="UIPWAHint.showModal()" class="text-xs text-amber-600 font-medium mt-0.5 hover:text-amber-800 transition-colors">
            Saiba como usar na tela de início →
          </button>
        </div>
        <button onclick="UIPWAHint.dismiss()" class="flex-shrink-0 p-1 text-amber-300 hover:text-amber-500 transition-colors rounded-lg" title="Dispensar">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  },

  dismiss() {
    localStorage.setItem('pg_pwa_dismissed', '1');
    const card = document.getElementById('pwa-hint-card');
    if (card) {
      card.style.transition = 'opacity 0.25s ease, max-height 0.3s ease, margin 0.3s ease';
      card.style.opacity = '0';
      card.style.maxHeight = '0';
      card.style.marginBottom = '0';
      card.style.overflow = 'hidden';
      setTimeout(() => card.remove(), 320);
    }
  },

  showModal() {
    document.getElementById('modal-box').innerHTML = `
      <div class="px-5 py-5">

        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <img src="icon.png?v=2" class="w-10 h-10 rounded-2xl object-cover shadow-sm flex-shrink-0">
            <div>
              <p class="text-sm font-bold text-gray-900">Hive na tela de início</p>
              <p class="text-xs text-gray-400">Use como se fosse um app nativo</p>
            </div>
          </div>
          <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
          <p class="text-sm text-amber-900 leading-relaxed">
            O Hive ainda não está nas lojas de apps, mas dá pra chegar bem perto.
            Adicione-o à tela de início e ele abre direto, em tela cheia, sem a barra do Safari —
            praticamente um app.
          </p>
        </div>

        <div class="space-y-4 mb-6">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold text-amber-700">1</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800">Toque no ícone de Compartilhar</p>
              <p class="text-xs text-gray-400 mt-0.5">O quadrado com a seta pra cima, na barra inferior do Safari</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold text-amber-700">2</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800">Role a lista e toque em <span class="text-amber-700">"Adicionar à Tela de Início"</span></p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold text-amber-700">3</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800">Confirme tocando em <span class="text-amber-700">"Adicionar"</span></p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800">Pronto! O Hive fica na sua tela de início</p>
              <p class="text-xs text-gray-400 mt-0.5">Abre em tela cheia, sem barra do navegador</p>
            </div>
          </div>
        </div>

        <button onclick="UIPWAHint.dismiss(); Modal.close()"
          class="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 active:scale-95 transition-all">
          Entendido!
        </button>

      </div>
    `;
    Modal.open();
  },
};
