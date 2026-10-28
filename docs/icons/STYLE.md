# Diretrizes de estilo — biblioteca de ícones

## Princípios

- Ícones monocromáticos de traço (stroke), preenchimento vazio.
- Geometria consistente: `viewBox` fixo `0 0 24 24` em todos os ícones.
- Um componente por ícone, em `src/icons/<Nome>Icon.tsx`, com export centralizado em `src/icons/index.ts`.
- Nenhum emoji ou glifo unicode usado como ícone.

## Tokens visuais

| Propriedade | Valor |
|-------------|-------|
| viewBox | `0 0 24 24` |
| fill | `none` |
| stroke | `currentColor` (herda a cor do texto ao redor) |
| stroke-width | `1.8` (≈ 2 px no tamanho base) |
| stroke-linecap | `round` |
| stroke-linejoin | `round` |
| Raio de cantos (retângulos) | `rx="2"` |
| Tamanhos | `sm = 16 px`, `md = 24 px` (padrão), `lg = 32 px`; qualquer valor numérico via prop `size` |

## Cores

Ícones herdam `currentColor`. Quando necessário, sobrescreva com os tokens de `src/styles/tokens.css` (ex.: `var(--err)` para exclusão, `var(--ok)` para confirmação, `var(--rose-600)` para destaque).

## Acessibilidade

- Ícone decorativo: `aria-hidden={true}`, sem `title`.
- Ícone com significado: passe `title` (renderiza `<title>` e `role="img"`).
- Nunca use emoji como ícone: leitores de tela anunciam o nome longo do emoji.

## Uso em botões

Os botões já têm alvo de toque de 44 px (`--touch-target`). Acompanhe o ícone de texto e mantenha alinhamento vertical ao meio. Tamanho recomendado dentro de botões: `sm` (16 px) ou `md` (24 px) ao lado de texto.

## Nomenclatura

PascalCase com sufixo `Icon` (ex.: `CheckIcon`, `TrashIcon`). Um arquivo por componente, índice central em `src/icons/index.ts`.
