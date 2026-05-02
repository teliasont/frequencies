/* ─── FREQUENCIES // SHARED THEME SCRIPT ─── */
/* Handles: localStorage persistence, system preference, 3-state cycle */
/* Include on every page. Must be in <body> after the nav #theme-toggle button. */

(function () {
  var STORAGE_KEY = 'freq-theme';
  var STATES = ['dark', 'light', 'system'];

  /* SVG icons — 16×16 */
  var ICONS = {
    dark:   '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12.5 9.5A5 5 0 0 1 6.5 3.5a.5.5 0 0 0-.64-.64A6 6 0 1 0 13.14 10.14a.5.5 0 0 0-.64-.64z" fill="currentColor"/></svg>',
    light:  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/><line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="2.93" y1="2.93" x2="4.34" y2="4.34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="11.66" y1="11.66" x2="13.07" y2="13.07" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="11.66" y1="4.34" x2="13.07" y2="2.93" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="2.93" y1="13.07" x2="4.34" y2="11.66" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    system: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z" stroke="currentColor" stroke-width="1.25" fill="none"/><path d="M8 1a7 7 0 0 1 0 14V1z" fill="currentColor"/></svg>'
  };

  var LABELS = { dark: 'Dark mode', light: 'Light mode', system: 'System mode' };

  function getSystemPref() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function storeTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (e) {}
  }

  function resolveTheme(state) {
    return state === 'system' ? getSystemPref() : state;
  }

  function applyTheme(state) {
    var resolved = resolveTheme(state);
    document.documentElement.setAttribute('data-theme', resolved);
    /* also keep data-mode in sync for pages that reference it */
    document.documentElement.setAttribute('data-mode', resolved);

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = ICONS[state];
      btn.setAttribute('aria-label', LABELS[state]);
      btn.setAttribute('data-state', state);
    }
  }

  function cycleTheme() {
    var btn = document.getElementById('theme-toggle');
    var current = (btn && btn.getAttribute('data-state')) || getStoredTheme() || 'dark';
    var next = STATES[(STATES.indexOf(current) + 1) % STATES.length];
    storeTheme(next);
    applyTheme(next);
    /* keep tweaks panel toggle buttons in sync if present */
    syncTweaksPanel(next);
  }

  function syncTweaksPanel(state) {
    var resolved = resolveTheme(state);
    var dBtn = document.getElementById('modeD');
    var lBtn = document.getElementById('modeL');
    var sBtn = document.getElementById('modeS');
    if (dBtn) dBtn.classList.toggle('active', resolved === 'dark'   && state !== 'system');
    if (lBtn) lBtn.classList.toggle('active', resolved === 'light'  && state !== 'system');
    if (sBtn) sBtn.classList.toggle('active', state === 'system');
  }

  /* ── Init ── */
  var stored = getStoredTheme();
  var initial = STATES.includes(stored) ? stored : 'dark';
  applyTheme(initial);

  /* listen for OS pref changes when in system mode */
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
    var btn = document.getElementById('theme-toggle');
    var current = (btn && btn.getAttribute('data-state')) || 'dark';
    if (current === 'system') applyTheme('system');
  });

  /* Wire up toggle button once DOM is ready */
  function wireToggle() {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', cycleTheme);
      /* render correct icon now that DOM exists */
      applyTheme(initial);
      syncTweaksPanel(initial);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireToggle);
  } else {
    wireToggle();
  }

  /* Expose for tweaks panel use */
  window.freqSetTheme = function (state) {
    if (!STATES.includes(state)) return;
    storeTheme(state);
    applyTheme(state);
    syncTweaksPanel(state);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { colorMode: state } }, '*');
  };
})();

