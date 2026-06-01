const UIPrivacy = {
  _VERSION: 'v1',

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
    const hlBg    = isDark ? '#451a03' : '#fef3c7';
    const hlText  = isDark ? '#fcd34d' : '#92400e';
    const hlLi    = isDark ? '#fde68a' : '#78350f';
    const linkC   = isDark ? '#a5b4fc' : '#6366f1';
    const footC   = isDark ? '#475569' : '#9ca3af';

    overlay.innerHTML = `
      <div style="background:${bg};border-radius:24px 24px 0 0;width:100%;max-width:460px;padding:28px 24px 32px;animation:slideUp 0.3s cubic-bezier(0.32,0.72,0,1)">

        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:44px;margin-bottom:10px;line-height:1">🐝</div>
          <h2 style="font-size:19px;font-weight:800;color:${titleC};margin:0 0 10px;letter-spacing:-0.3px">
            O Hive está crescendo!
          </h2>
          <p style="font-size:13.5px;color:${bodyC};line-height:1.6;margin:0">
            Mais um marco nessa jornada: chegamos à nossa
            <strong style="color:${titleC}">Política de Privacidade</strong>. 🚀<br>
            É direta, honesta e leva menos de 2 minutos pra ler.<br>
            Obrigado por fazer parte do Hive!
          </p>
        </div>

        <div style="background:${hlBg};border-radius:12px;padding:14px 16px;margin-bottom:18px">
          <p style="font-size:11px;font-weight:700;color:${hlText};margin:0 0 7px;text-transform:uppercase;letter-spacing:0.5px">Resumo rápido</p>
          <ul style="margin:0;padding:0 0 0 15px;list-style:disc">
            <li style="font-size:12px;color:${hlLi};margin-bottom:4px">Seus dados ficam só no Firebase — não repassamos nada a ninguém</li>
            <li style="font-size:12px;color:${hlLi};margin-bottom:4px">Coletamos apenas o e-mail do Google + o que você mesmo insere</li>
            <li style="font-size:12px;color:${hlLi}">Você pode pedir a exclusão dos seus dados a qualquer hora</li>
          </ul>
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
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      setTimeout(() => { overlay.remove(); auth.signOut(); }, 200);
    });
  },
};
