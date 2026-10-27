# Flashcards de Medicina

App web simples de flashcards para estudo de medicina. Frontend React hospedado na Vercel; banco, autenticação e imagens no Supabase.

Interface em português do Brasil; código, nomes de arquivos e mensagens de commit em inglês.

## Stack

- Vite + React 18 + TypeScript, `react-router-dom`
- `@supabase/supabase-js` (único acesso a dados; sem backend próprio)
- CSS puro (sem Tailwind, sem UI kit)
- Testes: Vitest + React Testing Library (+ jsdom)
- ESLint + `tsc --noEmit`

## Scripts

| Script | Comando |
|--------|---------|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run` |

## Estrutura

```
src/
  lib/supabase.ts       # client Supabase a partir de VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  lib/api.ts            # TODA chamada ao Supabase passa por aqui
  lib/shuffle.ts        # Fisher-Yates, função pura, não muta a entrada
  lib/importCards.ts    # parse + validação do JSON de importação, função pura
  pages/                # Login, Home, Deck, DeckEdit, Review
  components/           # Flashcard (frente/verso com flip), etc.
supabase/migrations/0001_init.sql
vercel.json             # rewrite de SPA: tudo para /index.html
.env.example
README.md
```

## Rotas

- `/login` — login / cadastro
- `/` — lista de baralhos (protegida)
- `/decks/:id` — tela do baralho (Revisar / Editar)
- `/decks/:id/edit` — editar baralho e cartões
- `/decks/:id/review` — revisão de flashcards

## Passo a passo: rodar localmente e publicar na Vercel

### 1. Criar projeto no Supabase

- Acesse https://app.supabase.com e crie um novo projeto.
- Anote a **URL do projeto** e a **chave anon (anon key)** — elas vão nas variáveis de ambiente.

### 2. Rodar a migration

- No painel do Supabase, vá em **SQL Editor**.
- Cole o conteúdo de `supabase/migrations/0001_init.sql` e execute.
- Isso cria as tabelas `decks` e `cards` com RLS habilitado, e a função `next_card_code`.

### 3. Criar o bucket de imagens

- No painel do Supabase, vá em **Storage**.
- Crie um bucket privado chamado `card-images`.
- O bucket não é criado automaticamente pela migration; deve ser criado manualmente.
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

- Nunca usar a service-role key no frontend. Só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Nunca commitar `.env`/segredos.
- Testes não podem depender de um projeto Supabase real: mockar `src/lib/api.ts`.
- Não implementar nada fora do escopo (repetição espaçada, estatísticas, baralhos compartilhados, etc.).
- Commits pequenos e frequentes.
