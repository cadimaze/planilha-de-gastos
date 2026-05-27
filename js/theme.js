const Theme = {
  init() {
    this._syncIcons();
    this._startLoader();
  },

  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('pg_theme', isDark ? 'dark' : 'light');
    this._syncIcons();
  },

  _syncIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('[data-theme-icon="moon"]').forEach(el => {
      el.classList.toggle('hidden', isDark);
    });
    document.querySelectorAll('[data-theme-icon="sun"]').forEach(el => {
      el.classList.toggle('hidden', !isDark);
    });
  },

  _startLoader() {
    if (typeof anime === 'undefined') return;
    const bars = document.querySelectorAll('.loader-bar');
    if (!bars.length) return;

    anime.timeline({ loop: true })
      .add({
        targets: '.loader-bar',
        scaleY: [1, 0.12],
        duration: 550,
        delay: anime.stagger(110),
        easing: 'easeInOutSine',
      })
      .add({
        targets: '.loader-bar',
        scaleY: 1,
        duration: 550,
        delay: anime.stagger(110, { from: 'last' }),
        easing: 'easeInOutSine',
      });
  },
};

document.addEventListener('DOMContentLoaded', () => Theme.init());
