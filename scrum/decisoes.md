# Decisões de Arquitetura — OpenCards

**Data**: 2026-10-28  
**Origem**: `scrum/visao.md` + `scrum/backlog.md`  
**Formato**: Decisão | Alternativas consideradas | Por quê (justificativa)

---

## 1. Stack Principal

| Decisão | Alternativas | Por quê |
|---------|--------------|---------|
| **Vite + React 18 + TypeScript (strict)** | Next.js, Remix, CRA | Projeto SPA client-only; Vite é leve, build rápido, HMR nativo; React 18 traz concurrent features; TS strict já configurado e passando |
| **react-router-dom v7** (data routers) | wouter, tanstack-router, Next.js App Router | Roteamento declarativo com `ProtectedRoute` + `Outlet`; v7 suporta data loading futuras; migração de v6 trivial |
| **@supabase/supabase-js v2** (único acesso a dados) | Prisma + API própria, TanStack Query + REST, Firebase | Supabase provê Auth + Postgres + Realtime + Storage + RLS nativo; elimina backend próprio; anon key no frontend é seguro com RLS |
| **CSS puro com tokens (CSS variables + `tokens.ts`)** | Tailwind, styled-components, Emotion, CSS Modules | Requisito explícito da visão: "sem Tailwind, sem UI kit"; tokens em `tokens.ts` + `tokens.css` dão determinismo para snapshots; bundle menor |
| **Vitest + React Testing Library + jsdom** | Jest, Playwright (e2e), Cypress | Vitest integra nativo com Vite; RTL para testes de integração com router real (`MemoryRouter`); jsdom suficiente para lógica UI; coverage 80% configurado |
| **ESLint (flat config) + Prettier + typescript-eslint** | Biome, oxlint | ESLint 9 flat config já no projeto; Prettier para formatação consistente; TS ESLint para regras de tipo |

---

## 2. Estrutura de Pastas (Atual → Alvo)

```
src/
├── app/                    # Raiz da aplicação
│   ├── App.tsx             # BrowserRouter + Providers + Rotas
│   ├── main.tsx            # Entry point Vite
│   ├── providers/          # Context providers (Auth, Cards)
│   │   ├── AuthProvider.tsx
│   │   └── CardsProvider.tsx
│   └── routes.tsx          # Definição de rotas + ProtectedRoute
├── entities/               # Camada de domínio (tipos + API) — SEM dependência de UI
│   ├── user/
│   │   ├── model/user.ts
│   │   └── api/auth.ts
│   └── card/
│       ├── model/card.ts
│       └── api/cards.ts
├── features/               # Funcionalidades voltadas ao usuário (páginas + hooks tipados)
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Cadastro.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── useAuth.ts
│   ├── decks/
│   │   ├── Home.tsx
│   │   ├── Deck.tsx
│   │   ├── DeckEdit.tsx
│   │   ├── NewCard.tsx
│   │   ├── Import.tsx
│   │   ├── useDecks.ts
│   │   └── useDeck.ts
│   ├── review/
│   │   ├── Review.tsx
│   │   ├── Flashcard.tsx
│   │   └── Confetti.tsx
│   └── kanban/
│       ├── KanbanPage.tsx
│       ├── kanbanStore.ts
│       ├── kanban.ts
│       └── components/     # Board, Column, Card, DragHandle, EmptyState, KanbanStatusPill
├── shared/                 # Código reutilizável entre features
│   ├── ui/                 # Componentes base + ícones
│   │   ├── Button.tsx, Input.tsx, Card.tsx, Modal.tsx, ...
│   │   ├── StatusPill.tsx, ProgressBar.tsx, Select.tsx
│   │   ├── ThemeSwitcher.tsx
│   │   ├── icons/          # 20+ ícones SVG como componentes
│   │   └── index.ts        # Barrel export
│   ├── lib/                # Funções puras + cliente Supabase
│   │   ├── supabase/client.ts
│   │   ├── schedule.ts     # Leitner scheduleNext, isDue
│   │   ├── shuffle.ts
│   │   ├── streak.ts
│   │   ├── importCards.ts
│   │   ├── exportCards.ts
│   │   └── masks.ts
│   └── test/               # Setup Vitest + tipos globais
├── styles/                 # CSS global + tokens
│   ├── tokens.css          # :root + dark mode variables
│   ├── color-themes.css    # 10 temas (.theme-slate ... .theme-abyss)
│   └── index.css           # Imports + utilitários legados
├── design/
│   └── tokens.ts           # Fonte de verdade tokens (espelha tokens.css)
└── test/
    ├── setup.ts
    └── types.ts

supabase/
└── migrations/             # SQL versionado (0001_init, 0002_phase2, 0003_profiles, 0003_kanban_cards)
```

**Princípios**:
- `entities/*` **não importam** de `features/*` nem `shared/ui/*` — apenas tipos e API Supabase
- `features/*` consomem `entities/*/api` via hooks (`useDecks`, `useDeck`, `useAuth`, `useCards`)
- `shared/ui/*` são **componentes base puros** (Button, Input, Card, Modal) — sem lógica de negócio
- `shared/lib/*` são **funções puras testáveis** (schedule, shuffle, streak, import/export) — sem React

---

## 3. Componentes Principais & Responsabilidades

| Componente | Responsabilidade | Dependências |
|------------|------------------|--------------|
| **AuthProvider** | Sessão Supabase: `getSession` init + `onAuthStateChange` listener; expõe `user`, `loading`, `signIn/Up/Out` | `@supabase/supabase-js`, `entities/user/api/auth` |
| **CardsProvider** | Estado global decks/cartões: `decks[]`, `deck`, `cards[]`, `loading`, `error`; actions tipadas (`fetchDecks`, `createCard`, `answerCard`, `uploadImage`...); **Realtime subscription** com `mounted` guard | `AuthProvider` (user), `entities/card/api/cards`, `supabase.Realtime` |
| **ProtectedRoute** | Guard: `loading` → spinner; `!user` → redirect `/login` com `state.from`; `user` → `<Outlet />` | `react-router-dom`, `useAuth` |
| **Home** | Lista baralhos + busca + filtro tag + streak + criar baralho inline + "Revisar agora" | `useDecks`, `streak`, `useNavigate` |
| **Deck** | Stats (total/mastered/due/accuracy + ECG), ações (Revisar/Editar/Exportar/Importar/Add), lista cartões | `useDeck`, `getDeckStats`, `exportCards`, `useNavigate` |
| **DeckEdit** | CRUD baralho (nome/tag), CRUD cartões inline (frente/verso/imagens), import JSON, add card form | `useDeck`, `useCards`, `useAuth`, `parseAndValidateImport`, `upsertCard` |
| **Review** | Sessão Leitner: filtro modo (`due|all|missed`), flip 3D, teclado (Space/Enter/←/→), progresso ECG, finalização (anel, confete, revisar erros) | `useDeck`, `scheduleNext`, `isDue`, `shuffle`, `answerCard` |
| **KanbanPage + kanbanStore** | Quadro 4 colunas (TO DO→IN_PROGRESS→TESTING→DONE), drag-drop 1 passo, localStorage + Supabase sync best-effort | `createKanbanStore`, `supabase` (kanban_cards), `localStorage` |
| **ThemeSwitcher** | Toggle light/dark + 10 temas cor; persiste `localStorage`; aplica `data-theme` no `<html>` | `localStorage`, CSS variables |
| **Componentes Base (shared/ui)** | Button, Input, Card, Modal, StatusPill, ProgressBar, Select, Icons — **apenas UI, zero lógica de negócio** | `design/tokens.ts` (inline styles para snapshots) |

---

## 4. Dependências & Integrações

### Produção (`dependencies`)
| Pacote | Versão | Uso |
|--------|--------|-----|
| `react` / `react-dom` | ^19.3.1 | UI runtime |
| `react-router-dom` | ^7.18.5 | Roteamento SPA |
| `@supabase/supabase-js` | ^2.118.0 | Auth, Database, Realtime, Storage |
| `react-hook-form` | ^7.91.0 | Formulários (Login, DeckEdit, NewCard, Import) |
| `@hookform/resolvers` | ^6.0.1 | Zod resolver para validação |
| `zod` | ^4.6.7 | Schemas de validação (import, forms) |
| `imask` | ^7.6.1 | Input masks (futuro: CPF, telefone no perfil) |

### Desenvolvimento (`devDependencies`)
| Pacote | Versão | Uso |
|--------|--------|-----|
| `typescript` | ^5.8.0 | Type checking |
| `vite` | ^8.3.5 | Dev server + build |
| `@vitejs/plugin-react` | ^6.1.2 | React plugin |
| `vitest` | ^5.0.5 | Test runner |
| `@testing-library/react` | ^16.3.3 | RTL |
| `@testing-library/jest-dom` | ^7.0.1 | Matchers DOM |
| `jsdom` | ^30.1.3 | Ambiente DOM para testes |
| `eslint` | ^9.39.5 | Linting |
| `typescript-eslint` | ^8.72.1 | Regras TS |
| `prettier` | ^3.9.10 | Formatação |

### Integrações Externas
| Serviço | Uso | Configuração |
|---------|-----|--------------|
| **Supabase** | Auth (email/password), Postgres (RLS), Realtime, Storage (card-images) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **Vercel** | Hosting SPA + preview deploys | `vercel.json` rewrite `/index.html`; env vars no painel |
| **GitHub Actions** | CI/CD (typecheck → lint → test → build) | Workflow em `.github/workflows/ci.yml` |

---

## 5. Riscos Técnicos & Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| **Node 18 incompatível com vitest 5 (rolldown `styleText`)** | Alta | Bloqueia testes/CI | **Ação imediata**: instalar Node 20 standalone ou downgrade vitest para 1.x; CI usa `node-version: '20'` |
| **Realtime race condition** (CardsProvider sobrescreve fetch manual) | Média | UI pisca, estado inconsistente | Adicionar `mounted` flag no `useEffect` do realtime (padrão `AuthProvider`); ignorar payloads se desmontado |
| **`card_code` race condition** (dois creates simultâneos → duplicate key) | Média | Erro 23505 unique_violation | Migrar `createCard` para `supabase.rpc('next_card_code', {deck_id_param})` — function PG já existe (migration 0001) |
| **Kanban cards órfãos** (sem vínculo com Decks) | Alta | Arquitetura fragmentada; UX confusa | Decisão pendente (HDN-05): (a) manter separado, (b) FK `deck_id` em `kanban_cards` + UI para vincular |
| **Signed URLs de 1 ano** (imagens) | Baixa | Segurança: URL vazada = acesso permanente | Reduzir para 1h + refresh on-demand via `createSignedUrl` no componente `Flashcard`/`Card` |
| **RLS policies muito permissivas/incorretas** | Baixa | Vazamento de dados entre usuários | Testes de integração com usuários mockados diferentes; `supabase.auth.getUser()` em cada request valida ownership |
| **Bundle size** (ícones inline, tokens duplicados TS+CSS) | Baixa | Performance mobile | Tree-shaking automático Vite; ícones como componentes SVG (já são); tokens TS só importados onde necessário |
| **Acessibilidade incompleta** (labels, focus, ARIA) | Média | Exclusão usuários; não-conformidade | Auditoria P3-7: `htmlFor`/`id` em todos inputs; `focus-visible` ring; `aria-label` onde design oculta label |

---

## 6. Decisões Registradas (Formato: Decisão | Alternativas | Por quê)

| # | Decisão | Alternativas | Por quê |
|---|---------|--------------|---------|
| 01 | **SPA client-only (Vite) + Supabase BaaS** | Next.js fullstack, Remix, API própria + Postgres | Elimina backend; RLS + Realtime + Storage nativos; custo zero infra; deploy Vercel trivial |
| 02 | **CSS puro com tokens (TS + CSS variables)** | Tailwind, styled-components, CSS Modules | Requisito de visão; determinismo para snapshots visuais; bundle menor; zero runtime CSS-in-JS |
| 03 | **Context Providers (Auth + Cards) + hooks tipados** | Redux Toolkit, Zustand, Jotai, TanStack Query | Estado simples, React nativo, zero boilerplate; `useAuth`/`useCards`/`useDecks`/`useDeck` encapsulam consumo |
| 04 | **Entidades separadas (`entities/*`) sem dependência de UI** | Feature-first (colocar API dentro de features) | Separação clara domínio/UI; testável isoladamente; reutilizável se houver native/CLI futuro |
| 05 | **Realtime best-effort + localStorage fallback (Kanban)** | Só realtime, só localStorage, CRDT (Yjs/Automerge) | Offline-first real; sync quando online; sem complexidade CRDT para quadro simples |
| 06 | **Leitner 6 caixas (0..5) com intervalos fixos [0,1,3,7,14,30]** | SM-2, FSRS, Anki algoritmo custom | Simplicidade; previsível para usuário; `scheduleNext` pura e testável; `review_log` para streak/histórico |
| 07 | **Import/Export JSON round-trip (card_code↔id, front↔question, back↔answer)** | CSV, Anki .apkg, formato proprietário | JSON universal; versionável no git; migração Anki via script externo; validação Zod rigorosa |
| 08 | **ProtectedRoute retorna `null` durante loading** (atual) → **spinner/skeleton** (planejado) | Redirect imediato para login, renderizar children com loading interno | `null` causa flash/piscada; spinner mantém layout estável; UX profissional |
| 09 | **Testes de integração com `MemoryRouter` + mocks Supabase** | Testes e2e Playwright/Cypress, testes unitários só hooks | Rápidos, determinísticos, exercitam rotas reais; mocks na camada `entities/*/api` isolam Supabase |
| 10 | **Snapshots de regressão visual (Vitest `toMatchSnapshot`)** | Chromatic, Percy, Loki, screenshot testing | Zero custo extra; roda no CI; detecta mudanças acidentais em componentes base; baseline commitado |
| 11 | **Migrações SQL versionadas em `supabase/migrations/`** | Prisma migrate, Supabase CLI `db diff`, manual no painel | Controle de versão no git; revisável em PR; idempotentes (`IF NOT EXISTS`); aplica em qualquer env |
|| 12 | **Conventional Commits + commits pequenos + mensagens em inglês** | Git flow, trunk-based sem padrão, mensagens em PT | Histórico legível; changelog automático futuro; código/reviews em inglês (padrão time) |
|---|---------|--------------|---------|
| 13 | **HDN-05: Kanban permanece independente dos Decks** | (a) Manter separado (escolhido) | (b) FK `deck_id` em `kanban_cards` + UI para vincular | Kanban é ferramenta de gestão de tarefas gerais, não de estudos por baralho. Opção (a) mantém arquitetura simples; "Editar" no Kanban já mostra erro amigável explicando limitação. Se no futuro houver demanda real, pode-se adicionar FK `deck_id` via migration. |
|| 14 | **HDN-04: Contagem de cards via relacionamento (sem coluna física)** | Coluna `cards_count` em `decks` + migration NOT NULL | `select('..., cards(count)')` nas queries; tipo `Deck` com `cards_count?: number` vindo do relacionamento; realtime não mantém contador manual | A coluna não existia no banco; cálculo on-demand via FK `cards.deck_id → decks.id` é mais simples, nunca desatualiza, e evita migração desnecessária. Para uso pessoal, performance é suficiente. Se escalar, considerar trigger + coluna materializada. |
| 15 | **B-302: Estabilizar referência de `user` no AuthProvider** | `setUser(session?.user ? { id: session.user.id } : null)` direto | `setUser((prev) => { const next = ...; if (prev?.id === next?.id) return prev; return next; })` | `AuthProvider` criava novo objeto `{ id }` a cada evento `onAuthStateChange`, mesmo com id igual. Isso fazia `CardsProvider` re-renderizar (user mudou de referência), re-executar o `useEffect` do realtime ([user]) e causar re-renders em cadeia no `Deck`, fazendo o botão "Editar" piscar. Agora `user` mantém a mesma referência quando o id não mudou. |

---\n\n## 9. Design — Fonte da Verdade (Sprint 5)\n\n**PARTE 1 de `scrum/sprint-5.md` é a única fonte da verdade do design da Sprint 5.** Se existirem PDFs ou imagens em `docs/design/`, servem apenas como apoio visual; em conflito, vale a spec escrita.\n\n### Decisões D1 a D5 (seção 10 da PARTE 1)\n\n| # | Decisão | Fonte |\n|---|---------|-------|\n| D1 | Avaliação na revisão: manter os 5 níveis (1 a 5) com rótulos e atalhos de teclado; algoritmo de repetição espaçada inalterado. | PARTE 1, seção 10 |\n| D2 | Cadastro sem CPF e telefone na UI. Se o backend exigir, tornar opcional, sem apagar dados existentes. | PARTE 1, seção 10 |\n| D3 | "Kanban" vira "Tarefas" na navegação. | PARTE 1, seção 10 |\n| D4 | Saudação com o nome da pessoa quando existir no cadastro; sem nome, só "Bem-vinda de volta". | PARTE 1, seção 10 |\n| D5 | Tema inicial rosa-menta para quem nunca escolheu. | PARTE 1, seção 10 |\n\n### Pendências da seção 12 (O que o design não define)\n\n- Entrar e Criar conta no celular: empilhar, com o painel rosa reduzido a um topo com logo e frase curta.\n- Tablet: seguir os breakpoints da seção 5 da PARTE 1.\n- Estados vazio, carregando e erro das demais telas: usar chips, faixas de erro e spinner dos componentes base, sem inventar novos padrões visuais.\n- Texto no feminino ("Bem-vinda", "Como quer ser chamada") é do design; manter.

---

## 7. Áreas de Dev Necessárias (para `scrum-dev` instances)

| Área | Foco | Stories Relacionadas | Skills Esperados |
|------|------|---------------------|------------------|
| **Frontend Core** | App shell, routing, providers, theme, design system | FUN-04, FUN-05, AUTH-04, QLT-03, HDN-01, HDN-07 | React 18, TS, CSS variables, Vitest/RTL, Accessibility |
| **Auth & Session** | Login, cadastro, logout, ProtectedRoute UX, RLS | AUTH-01 a 05 | Supabase Auth, React Context, Router guards |
| **Decks & Cards (CRUD)** | Home, Deck, DeckEdit, NewCard, Import/Export | HOM-01 a 07, DEK-01 a 07, EDI-01 a 06 | React Hook Forms + Zod, Supabase CRUD, Realtime, File upload |
| **Review Engine (Leitner)** | Schedule, flip 3D, teclado, progresso, finalização | REV-01 a 10 | Algoritmos puros (schedule.ts), Animações CSS 3D, Keyboard events |
| **Kanban** | Drag-drop, store, localStorage, Supabase sync | KAN-01 a 07, HDN-05 | @dnd-kit ou nativo, State management, Offline-first patterns |
| **Quality & Tooling** | Testes unitários/integração, snapshots, CI/CD, coverage | QLT-01 a 04, FUN-04, FUN-05 | Vitest, GitHub Actions, Vercel CLI, Coverage thresholds |
| **Data & Migrations** | Schema, RLS, functions, indexes, seed | FUN-03, HDN-03, HDN-04 | Postgres, Supabase SQL Editor, PL/pgSQL |

> **Nota**: O projeto **não tem backend próprio** — toda lógica de dados fica em `entities/*/api` (client-side Supabase calls) e PostgreSQL functions (ex: `next_card_code`, `scheduleNext` server-side via `answerCard`). Não há área "Backend/API".

---

## 8. Próximos Passos Imediatos (Arquiteto → Orquestrador)

1. **Resolver Node 20** (FUN-01) — pré-requisito para qualquer validação técnica
2. **Criar `.github/workflows/ci.yml`** (FUN-04) — template: `typecheck → lint → test → build`
3. **Implementar `ErrorBoundary`** (HDN-01) — envolve `{routes()}` em `App.tsx`
4. **Adicionar `mounted` guard no realtime** (HDN-02) — `CardsProvider.tsx` linhas 301-396
5. **Migrar `createCard` para `rpc('next_card_code')`** (HDN-03) — `entities/card/api/cards.ts` linhas 141-164
6. **Decidir Kanban ↔ Decks** (HDN-05) — alinhar com PO antes de expandir Kanban
7. **Criar testes faltantes** (QLT-01, QLT-02) — `streak.test.ts`, `exportCards.test.ts`

---\n
## B-400: Triagem dos itens da Sprint 3 (concluída)

| ID | Título | Status | Observação |
|----|--------|--------|------------|
| B-301 | Revisão: mostrar a pergunta primeiro | ✅ ok | Implementado em Review.tsx + Flashcard.test.tsx (6 testes) |
| B-302 | Botão "Editar" piscando | ✅ ok | AuthProvider estabiliza referência de user; decisão #15 |
| B-303 | Texto espelhado no verso | ✅ ok | Removeu `scaleX(-1)`; flip 3D CSS correto |
| B-304 | Contraste insuficiente | ✅ ok | Tokens de contraste adicionados; verificado em 5 temas |
| B-305 | Cabeçalho da revisão sobreposto | ✅ ok | Seta duplicada removida; título flex/ellipsis |
| B-306 | "0 diasdesde" sem espaço | ✅ ok | `formatStreak()` adicionada; 3 testes |
| T-310 | Sistema de tokens de design | ✅ ok | 5 novos tokens CSS/TS; 8 temas mantidos |
| T-311 | Cinco novos temas | ✅ ok | rosa-menta, azul-laranja, roxo-amarelo, verde-coral, dark-neon |
| T-312 | Seletor de tema + migração | ✅ ok | ThemeMenu com data-theme; migração localStorage |
| T-313 | Contraste WCAG AA | ✅ ok | contrast.test.ts com 21 testes; cores ajustadas |
| U-320 | Escala de espaçamento | ✅ ok | --space-1 a --space-8; container 720px |
| U-321 | Cabeçalho consistente | ✅ ok | Header único em 6 páginas; wrappers seguros |
| U-322 | Home formulário colapsado | ✅ ok | Formulário "Novo baralho" colapsado; card redesenhado |
| U-323 | Hierarquia de ações | ✅ ok | Revisar primário; Adicionar secundário; Editar/Exportar terciários |
| U-324 | Layout da revisão | ✅ ok | Cabeçalho sem sobreposição; scroll interno; próximo intervalo |
| U-325 | Formulário de novo card | ✅ ok | Textarea com altura que cresce; prévia Frente/Verso |
| U-326 | Mobile first | ✅ ok | Media queries @media (max-width: 360px); review-actions coluna |
| M-330 | Atalhos de teclado na revisão | ⬜ Aberto | Só setas (←/→) implementadas; falta 1/2/3 e dica atualizada |
| M-331 | Resumo ao fim da sessão | ⬜ Aberto | Tela final existe; falta distribuição Difícil/Bom/Fácil |
| M-332 | Desfazer última avaliação | ⬜ Aberto | Não implementado |
| M-333 | Confirmação ao excluir, estados vazios | ⬜ Parcial | `confirm()` existe; falta toast/desfazer/estados vazios |
| M-334 | Acessibilidade | ⬜ Parcial | Foco e rótulos básicos; não completa (M-334) |
| M-335 | Testes E2E com Playwright | ⬜ Aberto | Não configurado |

**Conclusão da triagem B-400:** Todos os itens P0/P1 da Sprint 3 (B-301 a B-306, T-310 a T-313, U-320 a U-326) estão ✅ ok. Os itens M-330 a M-335 (P2) continuam abertos e entram no backlog da Sprint 4 conforme prioridade.

---

## 10. Arquitetura Técnica — Sprint 5: Paridade com o Design (PARTE 1)

**Origem**: `scrum/sprint-5.md` (PARTE 1), `scrum/backlog.md` (Épico F), código atual do repo.

### 10.1 Decisões de arquitetura

| # | Decisão | Alternativas | Por quê |
|---|---------|--------------|---------|
| 16 | **Tokens por papel de cor, não por cor fixa** | Manter tokens atuais (--rose-500, --ink, etc.) | A PARTE 1 (seções 6, 7, 13) exige que componentes consumam apenas papéis (fundo, superfície, superfície 2, texto, texto suave, borda, ação principal, texto sobre ação, destaque, progresso, avatar, sucesso, aviso, erro). Cada tema define esses papéis; trocar de tema não altera componente. Nenhum hex solto em componente (seção 13). |
| 17 | **Empacotar Figtree via @font-face local** | Google Fonts CDN, fontes do sistema | A PARTE 1 (seção 3) especifica Figtree. Empacotar localmente (src/fonts/figtree/*.woff2) garante disponibilidade offline, controle de versão e não depende de rede externa. Declaração @font-face em src/styles/index.css ou tokens.css. |
| 18 | **Layout compartilhado com cabeçalho único + barra de baixo mobile/tablet** | Cabeçalho por página, barra flutuante (FAB) | A PARTE 1 (seção 8) exige um único cabeçalho por tela feito no layout compartilhado; páginas não desenham o próprio. Barra de baixo existe apenas em mobile/tablet (Baralhos, Revisar, Tarefas + "+" rosa central). Menus de tema e conta ficam atrás do avatar (sem barra extra). |
| 19 | **Migração de tema salvo no localStorage** | Não migrar, forçar rosa-menta | A PARTE 1 (seção 6) diz que preferência de tema salva deve migrar sem perda. Valor antigo/desconhecido → rosa-menta (padrão D5). Chave localStorage: selected-theme. Migração ocorre ao montar o App. |
| 20 | **Componentes base consomem apenas papéis de cor (variáveis CSS)** | Componentes usam hex fixos ou tokens TypeScript | Nenhum hex solto em componente (seção 13 da PARTE 1). Componentes base (Button, Input, Card, Modal, ProgressBar, Chip, Select, Spinner) consomem variáveis CSS de papel (--role-*) definidas por tema em color-themes.css. Tokens TypeScript (tokens.ts) espelham para snapshots determinísticos. |
| 21 | **Teste automático de contraste por tema em Vitest** | Teste manual, Chromatic, Percy | A PARTE 1 (seção 13) exige contraste ≥ 4,5:1 em todo texto, verificado por teste automático por tema. Teste Vitest que itera os 5 temas, aplica data-theme no <html>, mede razões de contraste texto/fundo e texto/ação principal, falha se abaixo de 4,5:1 (texto normal) ou 3:1 (texto grande/ícones). |
| 22 | **Captura de screenshots em 375, 768 e 1280 px** | Testes visuais comerciais (Chromatic/Percy) | Definição de pronto (seção 13): verificado em 375, 768 e 1280 px nos 5 temas. Screenshots automáticos no CI por viewport e tema para comparação visual de regressão. |

### 10.2 Mapeamento de dados: o que a interface exige vs o que já existe

| Dado exigido pela interface | Existe? | Onde | Observação |
|----------------------------|---------|------|------------|
| Sequência de dias (streak) | Sim | src/shared/lib/streak.ts | `streak()` a partir de `review_log`; `formatStreak()` para exibição |
| Última revisão por baralho | Parcial | `review_log` (last_reviewed_at) | Precisa de query que agregue a última revisão por deck |
| Taxa de acerto | Sim | `DeckStats.accuracy` | Já existe em `entities/card/model/card.ts` |
| Próxima revisão por cartão | Sim | `Card.due_at`, `Card.box` | Leitner schedule já existe (`scheduleNext`) |
| Paginação "Carregar mais" | Não | — | Novo: Home e Deck precisam de paginação de cartões (seção 9.3, 9.4) |
| Validação por item na importação | Sim | src/shared/lib/importCards.ts | `parseAndValidateImport` já retorna válidos/inválidos por item (seção 9.8) |
| Tarefas com tag, data e coluna | Sim | `kanbanStore`, `kanban_cards` | Kanban já tem colunas, tags e datas; renomear para "Tarefas" (D3) |

### 10.3 Arquivos que serão tocados

**Tokens e tema:**
- `src/styles/tokens.css` — adicionar variáveis de papel de cor por tema; fontes Figtree via @font-face
- `src/design/tokens.ts` — adicionar tipos de papel de cor; espelhar tokens.css
- `src/styles/color-themes.css` — reescrever com papéis de cor para os 5 temas (rosa-menta, azul-laranja, roxo-amarelo, verde-coral, dark-neon)
- `src/shared/ui/ThemeSwitcher.tsx` — ajustar para 5 temas + migração localStorage de tema salvo

**Layout compartilhado:**
- `src/app/App.tsx` — layout compartilhado com cabeçalho único + barra de baixo mobile/tablet
- `src/components/ui/Header.tsx` — cabeçalho único (logo, navegação desktop Baralhos/Revisar/Tarefas, botão tema, avatar com menu)
- `src/components/ui/` — componentes base (Button, Input, Card, Modal, ProgressBar, Chip, Select, Spinner) consumindo apenas papéis de cor

**Telas (paridade com PARTE 1, seções 9.1 a 9.10):**
- `src/features/auth/Login.tsx` — painel dividido 50/50 desktop (seção 9.1)
- `src/features/auth/Cadastro.tsx` — sem CPF/telefone (seção 9.2, decisão D2)
- `src/features/decks/Home.tsx` — grade 3 colunas, busca, filtros, cartão "Para hoje", paginação "Carregar mais" (seção 9.3); versão mobile (seção 9.10)
- `src/features/decks/Deck.tsx` — duas colunas desktop (stats à esquerda, lista à direita), paginação "Carregar mais" (seção 9.4); versão mobile (seção 9.10)
- `src/features/decks/NewCard.tsx` — duas colunas desktop (formulário + prévia) (seção 9.7); versão mobile com rodapé fixo (seção 9.7)
- `src/features/decks/DeckEdit.tsx` — edição inline, exclusão com confirmação (seção 9.5)
- `src/features/decks/Import.tsx` — dropzone, colar JSON, prévia, validação por item (seção 9.8)
- `src/features/review/Review.tsx` — 5 botões de avaliação, atalhos teclado, cartão centralizado desktop (seção 9.6); versão mobile (seção 9.6)
- `src/features/kanban/KanbanPage.tsx` — renomear para "Tarefas", 3 colunas, mover por teclado (seção 9.9, decisão D3)

**Testes:**
- Novo arquivo de teste de contraste automático por tema (Vitest)
- Atualizar testes existentes para consumir apenas papéis de cor

### 10.4 Riscos

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| **Regressão de funções existentes** (criar, editar, excluir, revisar, importar, tarefas, tema salvo) | Média | Alta | Definição de pronto (seção 13): nenhuma função existente quebrada. Testes de integração cobrem rotas críticas. |
| **Cadastro sem CPF/telefone (D2)** | Média | Média | Se o backend exigir CPF/telefone, tornar opcional no cadastro; não apagar dados existentes do `profiles`. |
| **JSON de importação não quebrar** | Baixa | Alta | Formato atual (id, pergunta, resposta) preservado; `parseAndValidateImport` já valida por item. |
| **Migração de tema salvo** | Baixa | Média | Valor antigo/desconhecido → rosa-menta sem erro (D5). |
| **Figtree não carregar** | Baixa | Baixa | Fallback para fonte do sistema (Georgia/Inter) no CSS. |

### 10.5 Áreas de dev necessárias (para `scrum-dev` instances)

| Área | Foco | Histórias relacionadas (Épico F) | Skills esperados |
|------|------|----------------------------------|------------------|
| **Frontend Core** | Tokens por papel, Figtree, layout compartilhado (cabeçalho único, barra de baixo, menus), componentes base | S5-01 a S5-06 | React 18, TS, CSS variables, Vitest/RTL, Acessibilidade, Figtree |
| **Auth & Session** | Login/cadastro redesenhado (desktop 50/50, sem CPF/telefone) | S5-07, S5-08 | React Hook Forms + Zod, Supabase Auth, Router guards |
| **Decks & Cards** | Home, Deck, DeckEdit, NewCard, Import com paridade visual | S5-09 a S5-16 | CSS grid, paginação, validação por item, File upload |
| **Review Engine** | Revisão desktop e celular, 5 botões de avaliação, atalhos teclado | S5-17, S5-18 | Animações CSS 3D, Keyboard events, Leitner |
| **Kanban/Tarefas** | Renomear para Tarefas, 3 colunas, mover por teclado e "Mover para" | S5-19, S5-20 | Drag-drop, Keyboard navigation, localStorage |
| **Quality & Tooling** | Teste automático de contraste por tema, screenshots 375/768/1280px | S5-21, S5-22 | Vitest, Playwright, Acessibilidade (foco 44px, Esc) |

> **Nota**: O projeto **não tem backend próprio** — toda lógica de dados fica em `entities/*/api` (client-side Supabase calls). Não há área "Backend/API". Não mudar regras de negócio, só interface e os dados que ela precisa exibir.

### 10.6 Próximos passos imediatos (Arquiteto → Orquestrador)

1. **Criar instâncias `scrum-dev`** por área de dev (Frontend Core, Auth & Session, Decks & Cards, Review Engine, Kanban/Tarefas, Quality & Tooling).
2. **Orquestrador cria cards no kanban** a partir do Épico F (S5-01 a S5-22), respeitando ordem de dependência.
3. **Definição de pronto** (seção 13 da PARTE 1) é o critério de aceite para cada história visual.


---\n