const Feedback = {
  _KEY:    'hive_feedback_ts',
  _TTL:    30 * 24 * 60 * 60 * 1000, // reapresenta após 30 dias
  _DELAY:  3 * 60 * 1000,             // aparece 3 min após login
  _rating: 0,

  EMOJIS: [
    { n: 1, e: '😞', label: 'Péssimo'   },
    { n: 2, e: '😕', label: 'Ruim'      },
    { n: 3, e: '😐', label: 'Regular'   },
    { n: 4, e: '🙂', label: 'Bom'       },
    { n: 5, e: '😍', label: 'Excelente' },
  ],

  schedule() {
    const last = parseInt(localStorage.getItem(this._KEY) || '0');
    if (last && Date.now() - last < this._TTL) return;
    setTimeout(() => this._tryShow(), this._DELAY);
  },

  _tryShow() {
    // Não interrompe se outro modal estiver aberto
    if (!document.getElementById('modal-overlay')?.classList.contains('hidden')) {
      setTimeout(() => this._tryShow(), 60 * 1000);
      return;
    }
    this.show();
  },

  show() {
    this._rating = 0;
    this._renderContent();
    const overlay = document.getElementById('feedback-overlay');
    const card    = document.getElementById('feedback-card');
    if (!overlay || !card) return;
    overlay.classList.remove('hidden');
    card.style.transform = 'translateY(20px) scale(0.97)';
    card.style.opacity   = '0';
    requestAnimationFrame(() => {
      card.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease';
      card.style.transform  = 'translateY(0) scale(1)';
      card.style.opacity    = '1';
    });
  },

  close() {
    const card = document.getElementById('feedback-card');
    if (card) {
      card.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      card.style.transform  = 'translateY(16px) scale(0.97)';
      card.style.opacity    = '0';
    }
    setTimeout(() => {
      document.getElementById('feedback-overlay')?.classList.add('hidden');
    }, 220);
    localStorage.setItem(this._KEY, Date.now().toString());
  },

  _renderContent() {
    const el = document.getElementById('feedback-content');
    if (!el) return;
    el.innerHTML = `
      <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl leading-none">🐝</span>
          <div>
            <p class="text-sm font-bold text-gray-900 leading-tight">Está gostando do Hive?</p>
            <p class="text-xs text-gray-400 mt-0.5">Sua opinião nos ajuda a melhorar</p>
          </div>
        </div>
        <button onclick="Feedback.close()"
          class="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="px-5 py-4">
        <div class="flex justify-between items-end mb-4 px-1">
          ${this.EMOJIS.map(item => `
            <button id="fb-emoji-${item.n}" onclick="Feedback.select(${item.n})"
              class="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-amber-50 transition-colors"
              style="transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),filter 0.15s ease">
              <span style="font-size:28px;line-height:1">${item.e}</span>
              <span class="text-[10px] text-gray-400 font-medium">${item.label}</span>
            </button>
          `).join('')}
        </div>
        <textarea id="fb-comment" rows="2"
          placeholder="Deixe um comentário (opcional)..."
          class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700 placeholder-gray-300"></textarea>
        <div class="flex gap-2 mt-3">
          <button onclick="Feedback.close()"
            class="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
            Agora não
          </button>
          <button id="fb-submit" onclick="Feedback.submit()" disabled
            class="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-35 disabled:cursor-not-allowed">
            Enviar avaliação
          </button>
        </div>
      </div>
    `;
  },

  select(n) {
    this._rating = n;
    this.EMOJIS.forEach(item => {
      const btn = document.getElementById(`fb-emoji-${item.n}`);
      if (!btn) return;
      btn.style.transform = item.n === n ? 'scale(1.3)'  : 'scale(1)';
      btn.style.filter    = item.n === n ? 'none'        : 'grayscale(0.5) opacity(0.5)';
    });
    const btn = document.getElementById('fb-submit');
    if (btn) btn.disabled = false;
  },

  async submit() {
    if (!this._rating) return;
    const item    = this.EMOJIS.find(e => e.n === this._rating);
    const comment = document.getElementById('fb-comment')?.value?.trim() || '';
    const user    = typeof App !== 'undefined' ? App.currentUser : null;
    const btn     = document.getElementById('fb-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

    const timestamp = new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    try {
      await emailjs.send('service_v7uq89j', 'template_jmrzaq7', {
        rating:     String(this._rating),
        emoji:      item.e,
        label:      item.label,
        comment:    comment || '(sem comentário)',
        user_name:  user?.displayName || 'Anônimo',
        user_email: user?.email       || 'Não informado',
        timestamp,
      });
    } catch(e) {
      console.warn('Feedback send failed:', e);
    }

    const el = document.getElementById('feedback-content');
    if (el) el.innerHTML = `
      <div class="px-5 py-8 text-center">
        <div style="font-size:48px;line-height:1;margin-bottom:12px">🐝</div>
        <p class="text-base font-bold text-gray-900 mb-1">Obrigado pelo feedback!</p>
        <p class="text-sm text-gray-400 mb-5">Sua opinião nos ajuda a melhorar o Hive.</p>
        <button onclick="Feedback.close()"
          class="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
          Fechar
        </button>
      </div>
    `;
    setTimeout(() => this.close(), 5000);
  },
};
