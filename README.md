# Flashcards de Medicina

App web de flashcards para estudo de medicina. Frontend React hospedado na Vercel; banco, autenticação e imagens no Supabase. Interface em português do Brasil; código, nomes de arquivos e mensagens de commit em inglês.

## Stack

- Vite + React 18 + TypeScript, `react-router-dom`
- `@supabase/supabase-js` (único acesso a dados; sem backend próprio)
- CSS puro com variáveis (tokens) — sem Tailwind, sem UI kit
- Fontes self-hosted: Fraunces (títulos) e Inter (UI)
- Testes: Vitest + React Testing Library (+ jsdom)
- ESLint + `tsc --noEmit`

## Funcionalidades (Todas aprovadas pelo QA)

### Autenticação
- Login/cadastro email+senha com sessão persistente
- Logout com limpeza de estado
- Proteção de rotas com spinner durante carregamento (não mais tela branca)

### Home (Lista de Baralhos)
- Busca por nome em tempo real
- Filtro por tag (pills)
- Badge "pendentes hoje" por baralho
- Streak de dias consecutivos de estudo
- Botão "Revisar agora" vai para o primeiro baralho com pendentes
- Criação de baralho inline (nome + tag opcional)
- **Clicar no card navega corretamente** + acessibilidade completa (teclado Enter/Space, `role="button"`, `aria-label`)

### Tela do Baralho (`/decks/:id`)
- Stats: total, dominados, pendentes hoje, accuracy
- Barra de progresso ECG (% dominados)
- Ações: Revisar / Editar / Exportar JSON / Importar JSON / Adicionar cartão
- Lista de cartões com código, frente e botão excluir

### Edição de Baralho (`/decks/:id/edit`)
- Renomear/tag do baralho
- CRUD de cartões inline (frente/verso + imagens)
- Importação JSON validada (preview válidos/inválidos)
- Exclusão de baralho e cartões individuais (com confirmação)

### Revisão Leitner (`/decks/:id/review?mode=due|all|missed`)
- 6 caixas (0..5), intervalos: 0/1/3/7/14/30 dias
- Modos: Pendentes hoje (padrão) / Todos / Só erros
- Flip 3D (Espaço/Enter), avaliação: ← errei / → acertei / Fácil
- Progresso ECG + contador "X de Y"
- Finalização: anel de acertos, confete ≥80%, botão "Revisar erros"

### Exportar/Importar JSON
- Round-trip perfeito: `card_code` ↔ `id`, `front_text` ↔ `question`, `back_text` ↔ `answer`
- Validação Zod rigorosa na importação

### Kanban Autônomo (`/kanban`)
- 4 colunas fixas: TO DO → IN PROGRESS → TESTING → DONE (um passo por vez)
- Drag-and-drop com validação de transição
- Persistência localStorage + sync Supabase best-effort
- Botão "Editar" mostra erro amigável (cards do Kanban são independentes — decisão HDN-05: manter separado)

### Temas
- Light/dark automático + 10 temas de cor
- Persistência no localStorage

### Design System (Componentes Base)
- **Button**, **Input**, **Card**, **Modal**, **StatusPill**, **ProgressBar**, **Select**, **Spinner**, **ErrorBoundary**
- Tokens centralizados em `src/design/tokens.ts` + `src/styles/tokens.css`
- Snapshots de regressão visual via Vitest

### Sprint 2 — Qualidade & Hardening (2026-10 — Aprovadas pelo QA)

#### Infra & Testes Automatizados
- **Supabase local via Docker Compose**: `docker compose up -d` sobe Postgres (5432), Auth (9999), Storage (5000), Kong (8000), Studio (54323) com healthchecks
- **`.env.local` para desenvolvimento local**: `VITE_SUPABASE_URL=http://localhost:54321` + anon key padrão
- **Seed de usuários de teste**: `scripts/seed-test-users.ts` cria 2 usuários confirmados (userA/userB) via Admin API (idempotente)
- **Testes de integração**: `npm run test:integration` (Vitest config dedicada + Supabase local)
- **CI/CD corrigido**: `npm ci` + cache npm + Node 20 + job `test_integration` no GitHub Actions

#### Testes & Coverage
- **`streak.test.ts`**: 8 casos (vazio=0, consecutivos, gap quebra, hoje conta, timezone, futuro ignorado, múltiplos mesmo dia=1)
- **`exportCards.test.ts`**: 5 casos (array vazio, N cards, JSON bonito, round-trip preserva `card_code`/`front_text`/`back_text`)
- **Testes integração rotas completos**: Cobre `/login`, `/cadastro`, `/`, `/decks/:id`, `/decks/:id/edit`, `/decks/:id/review?mode=due|all|missed`, `/novo-card`, `/importar`, `/kanban` com `MemoryRouter` + mocks Supabase

#### Acessibilidade (A11y)
- **Formulários**: `htmlFor`/`id` em todos `Input`, `textarea`, `select` (`Login`, `Cadastro`, `DeckEdit`, `NewCard`, `Import`); `aria-label` onde design oculta label; `focus-visible` ring rosa em todos inputs/botões
- **Revisão Leitner**: `tabIndex` nos botões (Difícil/Bom/Fácil/Virar); `focus-visible` ring rosa; `aria-label` nos ícones; ESC volta para `/decks/:id`; ordem lógica Tab

#### Code-Splitting & Performance
- **Lazy loading rotas pesadas**: `React.lazy` + `Suspense` para `Deck`, `DeckEdit`, `Review`, `KanbanPage`; `fallback={<Spinner size="lg" />}`
- **Warning chunk > 500kB eliminado**: chunks separados (Deck 5.5k, Review 9.5k, DeckEdit 11.8k, Kanban 12.5k)

#### Hardening Backend
- **HDN-05: Kanban independente dos Decks** (decisão PO): Kanban permanece ferramenta de gestão de tarefas gerais; "Editar" mostra erro amigável
- **`cards_count` NOT NULL DEFAULT 0**: Migration `0004` + type `Deck` sem `?` em `cards_count` (elimina `?? 0`)
- **Signed URL 1h + refresh on-demand**: `uploadImage` cria URL 1h; hook `useImageUrl` com cache 5min + auto-refresh antes de renderizar; `Flashcard` usa hook

## Estrutura

```text
src/
  app/              # raiz da aplicação: ponto de entrada, roteador e provedores de estado
    App.tsx         # BrowserRouter + AuthProvider + CardsProvider + rotas
    main.tsx        # ponto de entrada Vite
    providers/      # AuthProvider (sessão) e CardsProvider (baralhos/cartões)
    routes.tsx      # definição de rotas, incluindo ProtectedRoute
  entities/         # entidades de negócio: tipos e camada de dados (sem dependência de UI)
    user/
      model/        # User, AuthStateChangeEvent
      api/          # signIn, signUp, signOut, getSession, getCurrentUser, onAuthStateChange
    card/
      model/        # Deck, Card, NewCardInput, DeckStats
      api/          # CRUD de baralhos/cartões, estatísticas, resposta do cartão, upload de imagem
  features/         # funcionalidades voltadas ao usuário (páginas e hooks tipados)
    auth/           # Login, ProtectedRoute, hook useAuth
    decks/          # Home, Deck, DeckEdit, hooks useDecks e useDeck
    review/         # Review, Flashcard, Confetti
    kanban/         # KanbanPage, kanbanStore, componentes (Board, Column, Card, DragHandle, EmptyState, KanbanStatusPill)
  shared/           # código reutilizável entre features
    ui/             # Componentes base + ícones (Button, Input, Card, Modal, Spinner, ErrorBoundary, StatusPill, ProgressBar, Select, ThemeSwitcher, icons/)
    lib/            # cliente Supabase e puros: schedule, shuffle, streak, export/import cards
    test/           # setup e tipos globais do Vitest
  styles/           # tokens.css, color-themes.css, index.css
  design/           # tokens.ts (fonte de verdade dos tokens visuais)
  test/             # setup e tipos globais do Vitest
supabase/
  migrations/       # SQL versionado (0001_init, 0002_phase2, 0003_profiles, 0003_kanban_cards)
vercel.json         # rewrite de SPA: tudo para /index.html
.env.example
README.md
```

O estado global fica em Context providers (`AuthProvider` e `CardsProvider` em `src/app/providers/`), consumido por hooks tipados (`useAuth`, `useDecks`, `useDeck`, `useCards`) nas features. Toda interação com o Supabase camada pelas APIs em `entities/*/api/`. TypeScript `strict` se mantém ativo.

## Rotas

- `/login` — login / cadastro
- `/` — lista de baralhos (protegida): busca, filtro por tag, badge de pendentes hoje, streak
- `/decks/:id` — tela do baralho: estatísticas, barra de progresso ECG, Revisar / Editar / Importar / Exportar JSON / Adicionar cartão
- `/decks/:id/edit` — editar baralho e cartões (criar, editar, excluir)
- `/decks/:id/review?mode=due|all|missed` — revisão de flashcards com Leitner
- `/kanban` — quadro Kanban autônomo

## Scripts

| Script | Comando |
|--------|---------|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run` |
| `test:integration` | `vitest run --config vitest.integration.config.ts` |
| `format` | `prettier --write src/` |
| `format:check` | `prettier --check src/` |

## Passo a passo: rodar localmente e publicar na Vercel

### 1. Criar projeto no Supabase
- Acesse https://app.supabase.com e crie um novo projeto.
- Anote a **URL do projeto** e a **chave anon (anon key)** — elas vão nas variáveis de ambiente.

### 2. Rodar as migrations
- No painel do Supabase, vá em **SQL Editor**.
- Cole o conteúdo de `supabase/migrations/0001_init.sql` e execute. Cria tabelas `decks` e `cards` com RLS, e a função `next_card_code`.
- Cole o conteúdo de `supabase/migrations/0002_phase2.sql` e execute. Adiciona colunas `box`, `due_at`, `review_count`, `last_reviewed_at` em `cards`, cria a tabela `review_log` com RLS e policies de storage para o bucket `card-images`.
- Cole o conteúdo de `supabase/migrations/0003_profiles.sql` e execute. Cria tabela `profiles` com RLS.
- Cole o conteúdo de `supabase/migrations/0003_kanban_cards.sql` e execute. Cria tabela `kanban_cards` com índice.

### 3. Criar o bucket de imagens
- No painel do Supabase, vá em **Storage**.
- Crie um bucket privado chamado `card-images` (a migration 0001 tenta criá-lo, mas pode ser necessário criar manualmente).
- As policies de storage restringem leitura/escrita à pasta do próprio usuário.

### 4. Desativar confirmação de e-mail (opcional)
- No painel do Supabase, vá em **Authentication > Settings**.
- Em "Email settings", desative "Enable email confirmations" se quiser permitir login imediato sem confirmação por e-mail.

### 5. Configurar variáveis de ambiente
- Copie `.env.example` para `.env`:
  ```bash
  cp .env.example .env
  ```
- Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores do seu projeto Supabase.
- Nunca commite o arquivo `.env` (ele está no `.gitignore`).

### 6. Rodar localmente
```bash
npm install
npm run dev
```
Acesse http://localhost:5173.

### 7. Publicar na Vercel
- Faça push do código para um repositório GitHub.
- Conecte o repositório na Vercel (https://vercel.com).
- Nas configurações do projeto na Vercel, adicione as variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Importe o projeto e faça o deploy. O `vercel.json` já está configurado com o rewrite de SPA (tudo para `/index.html`).

### 8. Executar testes
```bash
npm run test
```
> **Nota**: Requer Node 20+ (vitest 5 + rolldown). Se `npm run test` falhar com erro de `styleText`, instale Node 20+.

### 9. Executar testes de integração (Supabase local)
```bash
docker compose up -d
npm run test:integration
```

### 10. Verificar tipos
```bash
npm run typecheck
```

## Decisões Técnicas Relevantes (Linguagem Simples)

| Decisão | O que significa |
|---------|-----------------|
| **SPA + Supabase BaaS** | Sem backend próprio; Supabase provê Auth, Postgres, Realtime, Storage com RLS nativo |
| **CSS puro com tokens** | Sem Tailwind/UI kit; tokens em `tokens.ts` (JS) + `tokens.css` (CSS variables) — determinismo para testes visuais |
| **Context Providers** | Estado global via React Context (`AuthProvider`, `CardsProvider`) — zero boilerplate, React nativo |
| **Entidades separadas** | `entities/*` não dependem de UI — apenas tipos e API Supabase; testáveis isoladamente |
| **Leitner 6 caixas** | Algoritmo simples e previsível; `scheduleNext` pura e testável; `review_log` para streak/histórico |
| **Import/Export JSON** | Round-trip perfeito; validação Zod; migração Anki via script externo |
| **Kanban offline-first** | localStorage como fonte de verdade; sync Supabase best-effort quando online |
| **RPC `next_card_code`** | Geração de código sequencial no Postgres (elimina race condition) |
| **Mounted guard no realtime** | Evita race condition quando payload chega depois do unmount |
| **ErrorBoundary** | Captura erros de render; UI amigável com botão "Tentar novamente" |
| **Supabase local (Docker)** | Ambiente dev/teste completo (Postgres, Auth, Storage, Kong, Studio) via `docker compose up -d` |
| **CI/CD `npm ci` + Node 20** | Instalação limpa, cache npm, reprodutível; job `test_integration` com Supabase local |
| **Code-splitting rotas** | `React.lazy` + `Suspense` elimina chunk > 500kB; carrega sob demanda |
| **Kanban independente** | Gestão de tarefas gerais, não vinculado a baralhos (decisão HDN-05) |
| **Signed URL 1h + refresh** | Imagens expiram em 1h; hook `useImageUrl` renova on-demand com cache 5min |
| **`cards_count` NOT NULL** | Coluna obrigatória com default 0; elimina `?? 0` no código |

## Regras do Projeto

- Nunca usar a service-role key no frontend. Só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Nunca commitar segredos.
- Nunca commitar `.env`/segredos; manter `.env.example` e `.gitignore` corretos.
- Testes não dependem de um projeto Supabase real: mockar `src/lib/api.ts`.
- Testes de integração com roteador real (`MemoryRouter`) e `api` mockado.
- Não enfraquecer, pular nem apagar testes. Não regredir nada da fase 1.
- Fora do escopo: compartilhamento de baralhos, cloze/LaTeX, notificações, app mobile nativo.
- Commits pequenos e frequentes (conventional commits: `feat:`, `fix:`, `chore:`, `test:`).