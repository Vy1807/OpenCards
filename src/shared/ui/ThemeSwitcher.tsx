import { useState, useCallback, useEffect } from 'react';

/* The 5 color themes delivered by the design system task (T-311).
 * Keys map 1:1 to the [data-theme="<key>"] selectors in src/styles/color-themes.css.
 */
export type Theme = { key: string; name: string };

export const THEMES: Theme[] = [
  { key: 'rosa-menta', name: 'Rosa Suave & Menta' },
  { key: 'azul-laranja', name: 'Azul Foco & Laranja Estudo' },
  { key: 'roxo-amarelo', name: 'Roxo Criativo & Amarelo Sol' },
  { key: 'verde-coral', name: 'Verde Concentração & Coral' },
  { key: 'dark-neon', name: 'Dark Mode Neon' },
];

const THEME_STORAGE_KEY = 'selected-theme';
const DEFAULT_THEME = 'rosa-menta';

function isThemeKey(value: string | null): value is (typeof THEMES)[number]['key'] {
  return value !== null && THEMES.some((t) => t.key === value);
}

/* Aplica o atributo data-theme no <html> com o tema ativo. */
function applyTheme(theme: (typeof THEMES)[number]['key']): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
}

/* Cores de destaque (bolinha) para cada tema, usadas no seletor. */
const THEME_DOT_COLORS: Record<(typeof THEMES)[number]['key'], string> = {
  'rosa-menta': '#F7A8B8',
  'azul-laranja': '#FF9F1C',
  'roxo-amarelo': '#6C5CE7',
  'verde-coral': '#2E7D32',
  'dark-neon': '#00F5D4',
};

export default function ThemeSwitcher({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
} = {}) {
  const [theme, setTheme] = useState<(typeof THEMES)[number]['key']>(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME;
    return isThemeKey(localStorage.getItem(THEME_STORAGE_KEY))
      ? localStorage.getItem(THEME_STORAGE_KEY)!
      : DEFAULT_THEME;
  });

  /* Aplica o tema ao DOM e persiste sempre que muda. */
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

  const isActive = (t: (typeof THEMES)[number]['key']) => t === theme;

  return (
    <div className="theme-switcher" aria-label="Seletor de tema da interface">
      {/* Rótulo TEMA */}
      <label className="label">Tema</label>

      {/* Botão que abre/fecha o dropdown do tema */}
      <button
        type="button"
        className="theme-button theme-button--open"
        aria-label="Tema"
        title="Tema"
        onClick={() => {
          if (isOpen) {
            onClose?.();
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="theme-dots">
          {THEME_DOT_COLORS[theme] && (
            <div className="theme-dot theme-dot--active" />
          )}
        </div>
      </button>

      {/* Dropdown com as 5 opções de tema */}
      {isOpen && (
        <div className="theme-dropdown">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`theme-option ${isActive(t.key) ? 'active' : ''}`}
              onClick={() => {
                setTheme(t.key);
                onClose?.();
              }}
            >
              <div className="theme-dots">
                {THEMES.map((themeKey) => (
                  <div
                    key={themeKey.key}
                    className={`theme-dot ${t.key === themeKey.key ? 'active' : ''}`}
                    style={{
                      backgroundColor: THEME_DOT_COLORS[themeKey.key],
                    }}
                  />
                ))}
              </div>
              <span className="theme-option-name">{t.name}</span>
              {isActive(t.key) && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
