/**
 * Theme toggle — dark/light mode
 *
 * Priority:
 * 1. User's explicit choice (localStorage)
 * 2. System preference (prefers-color-scheme)
 * 3. Default to no attribute (= light, or system handles it via CSS)
 */

const STORAGE_KEY = 'theme-preference';

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference() {
  return localStorage.getItem(STORAGE_KEY);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  updateToggleIcon(theme);
}

function updateToggleIcon(theme) {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  toggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

export function initTheme() {
  const stored = getStoredPreference();

  if (stored) {
    setTheme(stored);
  } else {
    // No explicit choice — let CSS @media handle it, but update icon
    updateToggleIcon(getSystemPreference());
  }

  // Listen for toggle clicks
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || getSystemPreference();
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredPreference()) {
      updateToggleIcon(e.matches ? 'dark' : 'light');
    }
  });
}
