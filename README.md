# Flashcards de Medicina

App web de flashcards para estudo de medicina. Frontend React hospedado na Vercel; banco, autenticação e imagens no Supabase. Interface em português do Brasil; código, nomes de arquivos e mensagens de commit em inglês.

## Stack

- Vite + React 18 + TypeScript, `react-router-dom`
- `@supabase/supabase-js` (único acesso a dados; sem backend próprio)
- CSS puro com variáveis (tokens) — sem Tailwind, sem UI kit
- Fontes self-hosted: Fraunces (títulos) e Inter (UI)
- Testes: Vitest + React Testing Library (+ jsdom)
- ESLint + `tsc --noEmit`

## Novidades da Fase 2

- Repetição espaçada (método Leitner): 6 caixas, intervalos de 0/1/3/7/14/30 dias
- Tabela `review_log` para histórico de revisões e cálculo de streak
- Modos de revisão: Pendentes hoje, Todos, Só os que errei
- Atalhos de teclado: Espaço/Enter (vira), seta direita (acertei), seta esquerda (errei)
- Redesign visual: tema rosa/clínico, modo escuro automático, animações (flip 3D, slide ao responder, barra de progresso ECG, anel de acertos, confete)
- Exportar JSON (round-trip com importação)
- Busca por nome e filtro por tag na Home

## Estrutura

```
src/
  lib/supabase.ts       # client Supabase a partir de VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  lib/api.ts            # TODA chamada ao Supabase passa por aqui (mockável)
  lib/shuffle.ts        # Fisher-Yates puro
  lib/importCards.ts    # parse/validação do JSON de importação
  lib/exportCards.ts    # exporta cartões no mesmo formato do import
  lib/schedule.ts       # scheduleNext(box, correct, now) — função pura (Leitner)
  lib/streak.ts         # cálculo de sequência de dias a partir do review_log
  pages/                # Login, Home, Deck, DeckEdit, Review
  components/           # Flashcard, ImageField, EcgProgress, Confetti, EmptyState...
  styles/tokens.css     # paleta, tipografia, raios, sombras, durações
supabase/migrations/0001_init.sql
supabase/migrations/0002_phase2.sql
vercel.json             # rewrite de SPA: tudo para /index.html
.env.example
README.md
```

## Rotas

- `/login` — login / cadastro
- `/` — lista de baralhos (protegida): busca, filtro por tag, badge de pendentes hoje, streak
- `/decks/:id` — tela do baralho: estatísticas, barra de progresso ECG, Revisar / Editar / Importar / Exportar JSON / Adicionar cartão
- `/decks/:id/edit` — editar baralho e cartões (criar, editar, excluir)
- `/decks/:id/review?mode=due|all|missed` — revisão de flashcards com Leitner

## Scripts

| Script | Comando |
|--------|---------|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run` |

## Passo a passo: rodar localmente e publicar na Vercel

### 1. Criar projeto no Supabase

- Acesse https://app.supabase.com e crie um novo projeto.
- Anote a **URL do projeto** e a **chave anon (anon key)** — elas vão nas variáveis de ambiente.

### 2. Rodar as migrations

- No painel do Supabase, vá em **SQL Editor**.
- Cole o conteúdo de `supabase/migrations/0001_init.sql` e execute. Cria tabelas `decks` e `cards` com RLS, e a função `next_card_code`.
- Cole o conteúdo de `supabase/migrations/0002_phase2.sql` e execute. Adiciona colunas `box`, `due_at`, `review_count`, `last_reviewed_at` em `cards`, cria a tabela `review_log` com RLS e policies de storage para o bucket `card-images`.

### 3. Criar o bucket de imagens

- No painel do Supabase, vá em **Storage**.
- Crie um bucket privado chamado `card-images` (a migration 0002 tenta criá-lo, mas pode ser necessário criar manualmente).
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

### 9. Verificar tipos

```bash
npm run typecheck
```

## Regras do projeto

- Nunca usar a service-role key no frontend. Só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Nunca commitar segredos.
- Nunca commitar `.env`/segredos; manter `.env.example` e `.gitignore` corretos.
- Testes não dependem de um projeto Supabase real: mockar `src/lib/api.ts`.
- Testes de integração com roteador real (`MemoryRouter`) e `api` mockado.
- Não enfraquecer, pular nem apagar testes. Não regredir nada da fase 1.
- Fora do escopo: compartilhamento de baralhos, cloze/LaTeX, notificações, app mobile nativo.
- Commits pequenos e frequentes.
