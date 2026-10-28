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

---

**Assinatura**: Arquiteto (scrum-arquiteto)  
**Próxima revisão**: Quando FUN-01/02/03 resolvidos e CI verde.