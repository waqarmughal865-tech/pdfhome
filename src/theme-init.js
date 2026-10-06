/* theme-init.js — Instant zero-flash theme application.
 *
 * Loads render-blocking (plain <script>, no async/defer) before any DOM paint,
 * so the saved/preferred theme is applied with no flash of the wrong theme.
 * Runs synchronously and stays tiny; wrapped in try/catch so a blocked
 * localStorage never breaks page load.
 */
(function () {
  try {
    var theme = localStorage.getItem('pdf-home-theme') || localStorage.getItem('pdf-workspace-theme');
    if (!theme) {
      theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.add('no-transitions');
    document.documentElement.style.backgroundColor = (theme === 'dark') ? '#0b0f19' : '#f8fafc';
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
