import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';

// Define variáveis de papel de cor (tema rosa-menta) para testes de componente
// que resolvem var(--role-*) via happy-dom.
const ROLE_COLORS: Record<string, string> = {
  '--role-fundo': '#FFF7F9',
  '--role-superficie': '#FFFFFF',
  '--role-superficie-2': '#FDEEF2',
  '--role-texto': '#2D3436',
  '--role-texto-suave': '#666A86',
  '--role-borda': '#3E6B4E',
  '--role-acao-principal': '#F7A8B8',
  '--role-texto-sobre-acao': '#33364D',
  '--role-destaque': '#3E6B4E',
  '--role-progresso': '#F7A8B8',
  '--role-avatar': '#F7A8B8',
  '--role-sucesso': '#1F6B3A',
  '--role-aviso': '#8A5A00',
  '--role-erro': '#B3261E',
};

const styleEl = document.createElement('style');
styleEl.textContent = `:root { ${Object.entries(ROLE_COLORS)
  .map(([k, v]) => `${k}: ${v};`)
  .join('')} }`;
document.head.appendChild(styleEl);
