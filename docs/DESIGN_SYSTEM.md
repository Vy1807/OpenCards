# OpenCards — Sistema de Design

Documentação de uso dos tokens de design e dos componentes base (`src/components/ui`):
**Button**, **Input**, **Card**, **Modal**, **Spinner** e **ErrorBoundary**. Público-alvo: desenvolvedores front-end que
estão implementando ou atualizando telas do app.

> Versão da documentação: alinhada com `src/design/tokens.ts` e `src/styles/tokens.css`.
> Prefácio: UI em português, código e commits em inglês.

---

## 1. Tokens de design (`src/design/tokens.ts`)

Arquivo único exportado como objeto `tokens`. É a fonte de verdade dos valores
visuais; componentes base consomem esse módulo via estilos inline para deixar o
HTML renderizado determinístico (útil para testes de regressão visual por snapshot).

### Cores (modo claro — espelha `:root` de `src/styles/tokens.css`)

| Token | Valor | Uso |
| --- | --- | --- |
| `colors.primary` | `#E0527F` | Botão sólido, ícones ativos, progresso ativo |
| `colors.primaryHover` | `#C73E6B` | Hover / ativo |
| `colors.primaryLight` | `#FCE4EC` | Fundo de card de pré-visualização, input, progresso inativo |
| `colors.background` | `#FFF7F9` | Fundo global da aplicação |
| `colors.surface` | `#FFFFFF` | Fundo de componentes elevados (card, input, modal) |
| `colors.ink` | `#2B2024` | Texto principal |
| `colors.muted` | `#8A7580` | Texto secundário / desabilitado |
| `colors.line` | `#F3D9E1` | Borda padrão |
| `colors.ok` / `colors.err` | `#4FA38A` / `#E4694F` | Sucesso / erro |
| `colors.disabledOpacity` | `0.55` | Opacidade de estados desabilitados |

Existe também `colorSchemes.dark` com a paleta escura; o modo escuro dos
componentes legíveis ainda segue o CSS de `src/styles/tokens.css` até que os
componentes base leiam o esquema ativo do DOM.

### Tipografia

| Token | Valor |
| --- | --- |
| `typography.fontHeading` | `'Fraunces', Georgia, serif` — títulos de tela e nomes de baralhos |
| `typography.fontBody` | `'Inter', system-ui, ...` — corpo da interface |
| `typography.fontSize` | `xs` 12px, `sm` 14px, `base` 16px, `lg` 18px, `xl` 20px, `xxl` 24px |
| `typography.fontWeight` | `regular` 400, `medium` 500, `semibold` 600, `bold` 700 |
| `typography.lineHeight` | `tight` 1.2, `snug` 1.375, `normal` 1.5, `loose` 1.75 |

### Espaçamento, raios, sombras, durações

| Escala | Valores |
| --- | --- |
| `spacing` | `0` 0px … `16` 64px (passos de 4px: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 10=40px, 12=48px) |
| `radius` | `sm` 12px, `md` 16px, `lg` 24px, `full` 9999px |
| `shadows` | `sm` suave (cards), `md` (modais), `lg`, `inset` |
| `transitions` | `fast` 0.2s ease, `spring` 0.4s, `modal` 0.3s |
| `touchTarget` | `44px` — altura mínima de alvos táteis (botões, inputs) |
| `zIndex` | `dropdown` 50, `modalBackdrop` 100, `modal` 110, `toast` 200 |
| `breakpoints` | `sm` 640px |

> **Sincronia obrigatória:** `tokens.ts` espelha `src/styles/tokens.css`. Mudar um valor
> exige espelhar no outro arquivo (variáveis CSS equivalentes).

---

## 2. Componentes base

Todos exportados pelo barrel `src/components/ui/index.ts` e importados com caminhos
relativos (não há alias `@/` configurado):

```tsx
import { Button, Input, Card, Modal, Spinner, ErrorBoundary } from '../components/ui'
```

### Button

Props: `variant` ('solid' \| 'outline' \| 'ghost', padrão 'solid'), `size`
('sm' \| 'md', padrão 'md'), `fullWidth`, `disabled`, `children` e todos os
atributos nativos de `<button>`.

```tsx
<Button variant="solid" onClick={() => save()}>
  <PlusIcon size={16} /> Salvar card
</Button>
<Button variant="outline" size="sm">Cancelar</Button>
<Button variant="ghost" disabled>Em breve</Button>
```

Regras visuais: altura mínima `44px` (touch target), raio `12px`, foco de teclado
visível (anel rosa `2px`), estado desabilitado com opacidade `0.55`.

### Input

Props: `label`, `error`, `helper`, `fullWidth`, `disabled` + atributos nativos
de `<input>`. O label é associado automaticamente ao input (`htmlFor`).

```tsx
<Input
  label="Nome do baralho"
  placeholder="Ex: Cardiologia"
  error={deckError}
  helper="Máximo 40 caracteres"
/>
```

Regras visuais: borda `#F3D9E1`, fundo `#FFFFFF`, foco com anel rosa, altura
mínima `44px`. Em erro, borda e mensagem ficam `#E4694F`.

### Card

Container branco com borda, raio `16px` e sombra suave.

```tsx
<Card padded="md" shadowed>
  <h3>Meus Baralhos</h3>
  <p>Texto dentro do card.</p>
</Card>
```

Props: `padded` ('none' \| 'sm' \| 'md' \| 'lg', padrão 'md'), `bordered`,
`shadowed`, `fullWidth`, `className`, `style`.

### Modal

Painel centralizado sobre backdrop escurecido, com `role="dialog"` e
`aria-modal="true"`. Fecha com ESC, clique no backdrop ou botão "Fechar".

```tsx
const [open, setOpen] = useState(false)

<Modal isOpen={open} onClose={() => setOpen(false)} title="Novo card">
  <Input label="Pergunta" />
  <Input label="Resposta" />
</Modal>
```

### Spinner

Indicador de carregamento animado (spinner circular). Usado em estados de
loading assíncrono (ex.: `ProtectedRoute` durante verificação de sessão).

Props:
- `size`: `'sm'` (20px) | `'md'` (32px) | `'lg'` (48px) — padrão `'md'`
- `color`: cor do traço (padrão `tokens.colors.primary`)
- `ariaLabel`: label para screen readers (padrão `"Carregando…"`)

```tsx
import { Spinner } from '../components/ui'

// Centralizado em container flex
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
  <Spinner size="lg" ariaLabel="Verificando sessão…" />
</div>
```

Regras visuais:
- Animação CSS `ui-spinner-rotate` (1s linear infinite)
- Respeita `prefers-reduced-motion` (para a animação via `ui.css`)
- Tamanhos baseados no design system (`tokens.touchTarget` referência)
- Cor do traço usa token `colors.primary` por padrão
- Track (fundo) com opacidade 25%

### ErrorBoundary

Componente de classe React que captura erros de renderização na sub-árvore
e exibe uma UI de fallback amigável. **Não captura** erros em:
- Event handlers (use `try/catch` neles)
- Código assíncrono (`setTimeout`, `Promise`)
- Server-side rendering
- O próprio `ErrorBoundary`

Props:
- `fallback`: ReactNode opcional — UI customizada de erro (se omitido, usa fallback padrão)

```tsx
import { ErrorBoundary } from '../components/ui'

// Envolve rotas ou seções críticas
<ErrorBoundary>
  <AppRoutes />
</ErrorBoundary>

// Ou com fallback customizado
<ErrorBoundary fallback={<MeuErroCustomizado />}>
  <ComponenteArriscado />
</ErrorBoundary>
```

Fallback padrão inclui:
- Ícone `AlertIcon` (rosa/erro)
- Título "Algo deu errado"
- Mensagem explicativa
- Botão "Tentar novamente" → `window.location.reload()`
- Estilos usando `tokens` (cores, tipografia, espaçamento, raios)
- Log automático no console (`console.error`) para debugging

---

## 3. Regras de uso (UI/UX)

- Títulos de tela e nomes de baralho usam `fontHeading` (serif); todo o resto usa
  `fontBody` (sans).
- Botões principais (ação única na tela) usam `variant="solid"`; ações secundárias
  usam `outline` ou `ghost`.
- Todo input deve ter label visível (ou `aria-label` quando o design não permite).
- Alvos táteis (botões, inputs, ícones clicáveis) nunca abaixo de `44px` de
  altura mínima (`tokens.touchTarget`).
- Não use valores de cor "hardcoded" fora de `tokens.ts`; se um componente novo
  precisar de um valor não coberto, adicione-o a `tokens.ts` (e ao CSS) antes de
  usá-lo.
- Respeite `prefers-reduced-motion`: animações dos componentes base são
  desabilitadas automaticamente via CSS.

---

## 4. Regressão visual (baseline)

Os testes de `src/components/ui/*.test.tsx` usam **Vitest snapshots**
(`toMatchSnapshot()`) como baseline de regressão visual: eles congelam o markup
renderizado + estilos inline de cada componente base.

### Gerar / atualizar a baseline

```bash
# executa os testes e cria src/components/ui/__snapshots__/*.snap na primeira vez
npx vitest run src/components/ui

# atualiza intencionalmente a baseline após mudança aprovada nos componentes
npx vitest run src/components/ui --update
```

Qualquer alteração nos componentes que altere o snapshot produzirá falha no
teste: revisar o diff, confirmar que é intencional e rodar `--update`.

### Limitação do ambiente atual

Este repositório não roda `vitest`/`vite build` aqui (rolldown do Vite 8 importa
`node:util` `styleText`, disponível apenas no Node 20+, e o Node 26 instalado
falaha com SIGBUS). Isso é tratado na tarefa irmã de estabilização de ambiente
(tarefa raiz, Passo 0). Os arquivos de teste e o mecanismo de snapshot estão
prontos: basta rodar os comandos acima num ambiente com Node 20+.

---

## 5. Sincronia de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `src/design/tokens.ts` | Tokens consumidos por código JS/TS (componentes base) |
| `src/styles/tokens.css` | Mesmos valores como variáveis CSS (modo claro + escuro) |
| `src/styles/color-themes.css` | 10 temas de cor (`theme-slate` … `theme-abyss`) |
| `src/components/ui/ui.css` | Estados que não podem ser inline (`:hover`, `:focus-visible`, `[disabled]`, modal, **spinner**) |
| `src/index.css` | Importa `tokens.css` + `color-themes.css` e classes utilitárias legadas |
| `docs/DESIGN_SYSTEM.md` | Este documento |

Quando um token mudar: edite `tokens.ts` → espelhe em `tokens.css` (e
`color-themes.css` se for cor de tema) → verifique `ui.css` → atualize snapshots.
