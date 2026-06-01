const UIPrivacy = {
  _VERSION: 'v3',

  checkAndShow(onAccepted) {
    const uid = App.currentUser?.uid;
    if (!uid) { onAccepted(); return; }
    if (localStorage.getItem(`hive_privacy_${this._VERSION}_${uid}`)) { onAccepted(); return; }
    this._showBanner(uid, onAccepted);
  },

  _showBanner(uid, onAccepted) {
    const isDark = document.documentElement.classList.contains('dark');

    const overlay = document.createElement('div');
    overlay.id = 'privacy-overlay';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9999',
      'background:rgba(15,23,42,0.75)',
      'display:flex', 'align-items:flex-end', 'justify-content:center',
      'backdrop-filter:blur(2px)',
    ].join(';');

    const bg      = isDark ? '#1e293b' : '#ffffff';
    const titleC  = isDark ? '#f1f5f9' : '#111827';
    const bodyC   = isDark ? '#94a3b8' : '#6b7280';
    const linkC   = isDark ? '#a5b4fc' : '#6366f1';
    const footC   = isDark ? '#475569' : '#9ca3af';

    overlay.innerHTML = `
      <div style="background:${bg};border-radius:24px 24px 0 0;width:100%;max-width:460px;padding:28px 24px 32px;animation:slideUp 0.3s cubic-bezier(0.32,0.72,0,1)">

        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:44px;margin-bottom:10px;line-height:1">🐝</div>
          <h2 style="font-size:19px;font-weight:800;color:${titleC};margin:0 0 10px;letter-spacing:-0.3px">
            Grande atualização! 🚀
          </h2>
          <p style="font-size:13.5px;color:${bodyC};line-height:1.6;margin:0">
            O Hive ganhou uma <strong style="color:${titleC}">cara nova</strong>! Navegação por menu lateral, filtros por cartão e categoria nas transações, página de assinaturas e Política de Privacidade — tudo isso em uma única atualização.<br><br>
            Obrigado por fazer parte dessa jornada. Aceite os termos e aproveite! 🐝
          </p>
        </div>

        <a href="privacy.html" target="_blank" rel="noopener"
          style="display:block;text-align:center;font-size:12.5px;color:${linkC};margin-bottom:14px;text-decoration:underline;font-weight:500">
          Ler a política completa →
        </a>

        <button id="privacy-accept-btn"
          style="width:100%;padding:15px;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:-0.2px;box-shadow:0 4px 14px rgba(245,158,11,0.4);margin-bottom:10px">
          Entendido, aceitar! 🐝
        </button>

        <button id="privacy-reject-btn"
          style="width:100%;padding:11px;background:transparent;color:${bodyC};border:1.5px solid ${isDark ? '#334155' : '#e5e7eb'};border-radius:14px;font-size:13px;font-weight:500;cursor:pointer">
          Recusar e sair
        </button>

        <p style="text-align:center;font-size:11px;color:${footC};margin-top:10px">
          Ao aceitar, você concorda com a Política de Privacidade do Hive
        </p>

      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('privacy-accept-btn').addEventListener('click', () => {
      localStorage.setItem(`hive_privacy_${this._VERSION}_${uid}`, '1');
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      setTimeout(() => { overlay.remove(); onAccepted(); }, 200);
    });

    document.getElementById('privacy-reject-btn').addEventListener('click', () => {
      this._showRejectConfirm(overlay, isDark, uid);
    });
  },

  _showRejectConfirm(overlay, isDark, uid) {
    const bg     = isDark ? '#1e293b' : '#ffffff';
    const titleC = isDark ? '#f1f5f9' : '#111827';
    const bodyC  = isDark ? '#94a3b8' : '#6b7280';
    const warnBg = isDark ? '#450a0a' : '#fff1f2';
    const warnC  = isDark ? '#fca5a5' : '#be123c';

    const confirm = document.createElement('div');
    confirm.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:rgba(15,23,42,0.6)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'padding:24px',
    ].join(';');

    confirm.innerHTML = `
      <div style="background:${bg};border-radius:20px;width:100%;max-width:360px;padding:28px 24px;animation:pageIn 0.18s ease-out both">

        <div style="text-align:center;margin-bottom:18px">
          <div style="width:52px;height:52px;background:${warnBg};border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px">⚠️</div>
          <h3 style="font-size:17px;font-weight:800;color:${titleC};margin:0 0 10px">Tem certeza?</h3>
          <p style="font-size:13px;color:${bodyC};line-height:1.6;margin:0">
            Ao recusar a Política de Privacidade você <strong style="color:${titleC}">não poderá usar o Hive</strong> — o app precisa armazenar seus dados para funcionar.
          </p>
        </div>

        <div style="background:${warnBg};border-radius:12px;padding:12px 14px;margin-bottom:20px">
          <p style="font-size:12px;color:${warnC};margin:0;line-height:1.6">
            Sua conta será desconectada e <strong>nenhum dado será excluído</strong> — você pode voltar e aceitar quando quiser. Para solicitar a exclusão dos seus dados, entre em contato: <strong>cadima.corporativo@gmail.com</strong>
          </p>
        </div>

        <button id="reject-confirm-btn"
          style="width:100%;padding:13px;background:#dc2626;color:white;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px">
          Sim, recusar e sair
        </button>
        <button id="reject-cancel-btn"
          style="width:100%;padding:11px;background:transparent;color:${bodyC};border:1.5px solid ${isDark ? '#334155' : '#e5e7eb'};border-radius:12px;font-size:13px;font-weight:500;cursor:pointer">
          Voltar
        </button>

      </div>
    `;

    document.body.appendChild(confirm);

    document.getElementById('reject-confirm-btn').addEventListener('click', () => {
      confirm.remove();
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      setTimeout(() => { overlay.remove(); auth.signOut(); }, 200);
    });

    document.getElementById('reject-cancel-btn').addEventListener('click', () => {
      confirm.remove();
    });
  },
};
