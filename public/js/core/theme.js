/**
 * @file theme.js
 * @description Theme management (light/dark) with persistence and zero-flash support.
 */

let currentTheme = localStorage.getItem('roktosetu_theme');

/**
 * Initializes theme based on localStorage or system preferences.
 */
export function initTheme() {
  if (!currentTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? 'dark' : 'light';
  }

  setTheme(currentTheme);

  // Listen for system theme changes if user has no saved preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('roktosetu_theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Sets theme to 'dark' or 'light' and updates DOM attributes.
 * @param {'dark'|'light'} theme
 */
export function setTheme(theme) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  localStorage.setItem('roktosetu_theme', currentTheme);
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Update theme toggle icon
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    themeBtn.innerHTML = currentTheme === 'dark' 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }

  window.dispatchEvent(new CustomEvent('roktosetu:theme_changed', { detail: { theme: currentTheme } }));
}

/**
 * Toggles between light and dark themes.
 */
export function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

/**
 * Returns active theme ('dark' | 'light').
 */
export function getTheme() {
  return currentTheme || 'dark';
}
