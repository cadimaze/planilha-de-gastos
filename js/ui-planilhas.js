const UIPlanilhas = {
  // ── Criar planilha ────────────────────────────────────────────────────────
  showCreate(firstTime = false) {
    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">
            ${firstTime ? 'Bem-vindo! Crie sua planilha' : 'Nova planilha'}
          </h3>
          ${firstTime ? '<p class="text-xs text-gray-400 mt-0.5">Você pode criar mais e compartilhar depois.</p>' : ''}
        </div>
        ${!firstTime ? `<button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>` : ''}
      </div>
      <div class="px-4 pb-6 pt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nome da planilha *</label>
          <input id="np-name" type="text" autocomplete="off"
            placeholder='Ex: "Finanças do Casal", "Pessoal 2025"'
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <button onclick="UIPlanilhas.create()" id="np-btn"
          class="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
          Criar planilha
        </button>
        ${firstTime ? '' : `
        <div class="relative flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-100"></div>
          <span class="text-xs text-gray-400">ou</span>
          <div class="flex-1 h-px bg-gray-100"></div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Entrar com código</label>
          <div class="flex gap-2">
            <input id="np-join-code" type="text" maxlength="6" autocomplete="off"
              placeholder="ABC123"
              class="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <button onclick="UIPlanilhas.join('np-join-code')"
              class="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
              Entrar
            </button>
          </div>
        </div>
        `}
      </div>
    `;
    Modal.open();
    setTimeout(() => document.getElementById('np-name')?.focus(), 100);
  },

  async create() {
    const input = document.getElementById('np-name');
    const name  = input?.value?.trim();
    if (!name) { input?.focus(); return; }
    const btn = document.getElementById('np-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Criando...'; }
    try {
      const ref = await Storage.createPlanilha(name);
      // reload planilhas list
      App.planilhas = await Storage.getUserPlanilhas();
      Modal.close();
      App.switchPlanilha(ref.id);
    } catch (e) {
      console.error(e);
      alert('Erro ao criar: ' + e.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Criar planilha'; }
    }
  },

  // ── Gerenciar planilha ────────────────────────────────────────────────────
  showManage() {
    const p       = App.currentPlanilha;
    if (!p) return;
    const isOwner = p.ownerId === App.currentUser?.uid;
    const members = Object.entries(p.members || {});

    document.getElementById('modal-box').innerHTML = `
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h3 class="text-base font-bold text-gray-900">Gerenciar planilha</h3>
        <button onclick="Modal.close()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="px-4 pb-6 pt-4 space-y-5 overflow-y-auto max-h-[80vh]">

        <!-- Renomear -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nome</label>
          <div class="flex gap-2">
            <input id="pm-name" value="${_esc(p.name)}"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <button onclick="UIPlanilhas.rename()"
              class="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700">
              Salvar
            </button>
          </div>
        </div>

        <!-- Código de compartilhamento -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Código para convidar</label>
          <div class="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
            <span class="text-2xl font-mono font-bold text-indigo-600 tracking-[0.3em] flex-1">${p.shareCode}</span>
            <button onclick="UIPlanilhas.copyCode('${p.shareCode}')"
              class="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              Copiar
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">Envie este código para quem quiser convidar. Eles entram em "Entrar com código".</p>
        </div>

        <!-- Membros -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-2">Membros (${members.length})</label>
          <div class="space-y-2">
            ${members.map(([uid, m]) => `
              <div class="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-indigo-600">${_esc((m.displayName || m.email)[0].toUpperCase())}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">${_esc(m.displayName || m.email)}</p>
                  <p class="text-xs text-gray-400">${m.role === 'owner' ? 'Dono' : 'Editor'}</p>
                </div>
                ${isOwner && uid !== App.currentUser?.uid ? `
                  <button onclick="UIPlanilhas.removeMember('${uid}')"
                    class="text-xs text-red-400 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">
                    Remover
                  </button>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Suas planilhas -->
        ${App.planilhas.length > 1 ? `
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-2">Suas planilhas</label>
          <div class="space-y-1">
            ${App.planilhas.map(p2 => `
              <button onclick="UIPlanilhas.switchTo('${p2.id}')"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors
                  ${p2.id === App.currentPlanilhaId ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}">
                <div class="w-2 h-2 rounded-full flex-shrink-0 ${p2.id === App.currentPlanilhaId ? 'bg-indigo-500' : 'bg-gray-300'}"></div>
                <span class="text-sm font-medium flex-1 truncate">${_esc(p2.name)}</span>
                ${p2.id === App.currentPlanilhaId ? '<span class="text-xs text-indigo-500 font-semibold">ativa</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Entrar com código -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">Entrar em outra planilha</label>
          <div class="flex gap-2">
            <input id="pm-join-code" type="text" maxlength="6" autocomplete="off" placeholder="Código..."
              class="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <button onclick="UIPlanilhas.join('pm-join-code')"
              class="px-3 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-700">
              Entrar
            </button>
          </div>
        </div>

        <!-- Zona de perigo -->
        <div class="pt-2 border-t border-gray-100">
          ${isOwner ? `
            <button onclick="UIPlanilhas.deleteConfirm()"
              class="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
              Excluir esta planilha
            </button>
          ` : `
            <button onclick="UIPlanilhas.leaveConfirm()"
              class="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
              Sair desta planilha
            </button>
          `}
        </div>
      </div>
    `;
    Modal.open();
  },

  async rename() {
    const name = document.getElementById('pm-name')?.value?.trim();
    if (!name) return;
    try {
      await Storage.renamePlanilha(App.currentPlanilhaId, name);
      if (App.currentPlanilha) App.currentPlanilha.name = name;
      const p = App.planilhas.find(x => x.id === App.currentPlanilhaId);
      if (p) p.name = name;
      App._updatePlanilhaDisplay();
    } catch (e) { alert('Erro: ' + e.message); }
  },

  copyCode(code) {
    navigator.clipboard?.writeText(code)
      .then(() => alert(`Código copiado: ${code}`))
      .catch(() => alert(`Código: ${code}`));
  },

  async join(inputId) {
    const code = document.getElementById(inputId)?.value?.trim().toUpperCase();
    if (!code || code.length < 6) { alert('Digite o código de 6 caracteres.'); return; }
    const btn = document.querySelector(`#${inputId} + button`);
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    try {
      await Storage.joinPlanilha(code);
      App.planilhas = await Storage.getUserPlanilhas();
      const joined = App.planilhas.find(p => !App.planilhas.find(ep => ep.id === p.id && ep.id !== p.id));
      const newest = App.planilhas[App.planilhas.length - 1];
      Modal.close();
      App.switchPlanilha(newest.id);
    } catch (e) {
      alert(e.message || 'Código inválido.');
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  },

  switchTo(planilhaId) {
    Modal.close();
    App.switchPlanilha(planilhaId);
  },

  async removeMember(uid) {
    if (!confirm('Remover este membro da planilha?')) return;
    try {
      await Storage.removeMember(App.currentPlanilhaId, uid);
      if (App.currentPlanilha?.members) delete App.currentPlanilha.members[uid];
      if (App.currentPlanilha?.memberIds)
        App.currentPlanilha.memberIds = App.currentPlanilha.memberIds.filter(x => x !== uid);
      this.showManage();
    } catch (e) { alert('Erro: ' + e.message); }
  },

  leaveConfirm() {
    Confirm.show('Você vai sair desta planilha e perder acesso aos dados.', async () => {
      try {
        await Storage.leavePlanilha(App.currentPlanilhaId);
        App.planilhas = App.planilhas.filter(p => p.id !== App.currentPlanilhaId);
        Modal.close();
        if (App.planilhas.length > 0) App.switchPlanilha(App.planilhas[0].id);
        else this.showCreate(true);
      } catch (e) { alert('Erro: ' + e.message); }
    });
  },

  deleteConfirm() {
    Confirm.show('Excluir esta planilha permanentemente? Todos os dados serão perdidos.', async () => {
      try {
        await Storage.deletePlanilha(App.currentPlanilhaId);
        App.planilhas = App.planilhas.filter(p => p.id !== App.currentPlanilhaId);
        Modal.close();
        if (App.planilhas.length > 0) App.switchPlanilha(App.planilhas[0].id);
        else this.showCreate(true);
      } catch (e) { alert('Erro: ' + e.message); }
    });
  },
};
