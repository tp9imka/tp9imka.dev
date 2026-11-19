export type Theme = 'dark' | 'light';
export const THEME_KEY = 'tp9imka-theme';

export function readTheme(storage: Pick<Storage, 'getItem'> | null): Theme {
  if (!storage) return 'dark';
  try {
    return storage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function nextTheme(t: Theme): Theme {
  return t === 'dark' ? 'light' : 'dark';
}

export function initThemeToggle(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const sync = () => {
    const t = (document.documentElement.dataset.theme as Theme) || 'dark';
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    btn.textContent = t === 'dark' ? 'light' : 'dark';
  };
  btn.addEventListener('click', () => {
    const t = nextTheme((document.documentElement.dataset.theme as Theme) || 'dark');
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch { /* storage blocked: theme lasts this visit */ }
    sync();
  });
  sync();
}
