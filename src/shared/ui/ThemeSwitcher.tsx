import { useState, useCallback, useEffect } from 'react';

/* The 8 color themes delivered by the design-token task (T-310/T-311).
 * Keys map 1:1 to the [data-theme="<key>"] selectors in src/styles/color-themes.css.
 */
export type Theme = { key: string; name: string };

export const THEMES: Theme[] = [
  { key: 'slate', name: 'Slate' },
  { key: 'cobalt', name: 'Cobalt' },
  { key: 'amber', name: 'Amber' },
  { key: 'rose', name: 'Rose' },
  { key: 'indigo', name: 'Indigo' },
  { key: 'teal', name: 'Teal' },
  { key: 'violet', name: 'Violet' },
  { key: 'zinc', name: 'Zinc' },
];

const THEME_STORAGE_KEY = 'selected-theme';
const DEFAULT_THEME = 'slate';

function isThemeKey(value: string | null): value is (typeof THEMES)[number]['key'] {
  return value !== null && THEMES.some((t) => t.key === value);
}

/* Aplica o atributo data-theme no <html> com o tema ativo. */
function applyTheme(theme: (typeof THEMES)[number]['key']): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]['key']>(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME;
    return isThemeKey(localStorage.getItem(THEME_STORAGE_KEY))
      ? localStorage.getItem(THEME_STORAGE_KEY)!
      : DEFAULT_THEME;
  });

  /* Apply the theme to the DOM and persist it whenever it changes. */
  const persist = useCallback((next: (typeof THEMES)[number]['key']) => {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable or quota exceeded — prefer not crashing the UI.
    }
  }, []);

  useEffect(() => {
    persist(theme);
  }, [theme, persist]);

  return (
    <div className="theme-switcher" aria-label="Seletor de tema da interface">
      <label htmlFor="theme-select" className="label">
        Tema
      </label>
      <select
        id="theme-select"
        className="input"
        value={theme}
        onChange={(e) => setTheme(e.target.value as (typeof THEMES)[number]['key'])}
      >
        {THEMES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
