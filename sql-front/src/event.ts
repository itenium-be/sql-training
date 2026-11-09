export const themes = {
  devfest: { label: 'DevFest Gold', mode: 'dark', color: '#16100a' },
  terminal: { label: 'Terminal', mode: 'dark', color: '#030803' },
  synthwave: { label: 'Synthwave', mode: 'dark', color: '#14072b' },
  blueprint: { label: 'Blueprint', mode: 'dark', color: '#0b2a4a' },
  brutalist: { label: 'Brutalist', mode: 'light', color: '#f3eee3' },
} as const;

export type ThemeName = keyof typeof themes;

const THEME_STORAGE = 'theme';

function isTheme(value: string | null | undefined): value is ThemeName {
  return !!value && value in themes;
}

export const event = {
  name: import.meta.env.VITE_EVENT_NAME ?? 'DevFest Paris',
  year: import.meta.env.VITE_EVENT_YEAR ?? '2026',
  date: import.meta.env.VITE_EVENT_DATE ?? '27 November 2026',
  venue: import.meta.env.VITE_EVENT_VENUE ?? 'La Fabrique de la Connaissance',
};

export function resolveTheme(): ThemeName {
  const fromUrl = new URLSearchParams(window.location.search).get('theme');
  if (fromUrl === 'default') {
    localStorage.removeItem(THEME_STORAGE);
  } else if (isTheme(fromUrl)) {
    localStorage.setItem(THEME_STORAGE, fromUrl);
    return fromUrl;
  }
  const stored = localStorage.getItem(THEME_STORAGE);
  if (isTheme(stored)) {
    return stored;
  }
  const configured = import.meta.env.VITE_THEME;
  return isTheme(configured) ? configured : 'devfest';
}

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.bsTheme = themes[theme].mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[theme].color);
  document.title = `SQL Showdown · ${event.name}`;
}
