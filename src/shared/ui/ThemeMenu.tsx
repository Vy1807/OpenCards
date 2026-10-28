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

/* Cada tema tem uma cor de amostra (principal) para exibir na prévia do seletor. */
const THEME_PREVIEW_COLORS: Record<(typeof THEMES)[number]['key'], string> = {
  'rosa-menta': '#F7A8B8',
  'azul-laranja': '#2A6F97',
  'roxo-amarelo': '#6C5CE7',
  'verde-coral': '#2E7D32',
  'dark-neon': '#1E1B2E',
};

export default function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<(typeof THEMES)[number]['key']>(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    // Migração: se o valor salvo for antigo/desconhecido, usar rosa-menta.
    return isThemeKey(stored) ? stored : DEFAULT_THEME;
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

  const toggleMenu = () => setOpen((prev) => !prev);

  const optionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    borderRadius: '6px',
  };

  return (
    <div className="theme-menu" aria-label="Seletor de tema da interface">
      <button
        type="button"
        className="btn"
        onClick={toggleMenu}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="3" />
          <circle cx="6" cy="12" r="1" />
          <circle cx="18" cy="12" r="1" />
          <circle cx="12" cy="6" r="1" />
          <circle cx="12" cy="18" r="1" />
        </svg>
        Tema
      </button>

      {open && (
        <div className="theme-menu__dropdown" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50 }}>
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTheme(t.key);
                setOpen(false);
              }}
              style={optionStyle}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: THEME_PREVIEW_COLORS[t.key],
                  flexShrink: 0,
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                }}
              ></span>
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
