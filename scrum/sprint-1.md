# Sprint 1 — Fundação & Bugs Críticos

**Objetivo**: Resolver bloqueadores de ambiente (Node 20, .env, migrations) e corrigir 3 bugs reportados pelo usuário (navegação baralho, ProtectedRoute loading, Kanban edit).

**Período**: 5 dias úteis  
**Início**: 2026-10-28  
**Time**: 3 áreas (Frontend Core, Backend/Dados, Automação/Infra)

---

## Histórias Selecionadas (Maior Valor)

| ID | História | Prioridade | Valor |
|----|----------|------------|-------|
| FUN-01 | Node 20+ no ambiente dev | Crítica | Desbloqueia testes/CI |
| FUN-02 | `.env` local configurado | Crítica | Desbloqueia `npm run dev` |
| FUN-03 | Migrations aplicadas no Supabase dev | Crítica | Desbloqueia dados reais |
| AUTH-04 | ProtectedRoute UX loading | Crítica | Bug: tela branca/pisca |
| HOM-07 | Navegar para baralho ao clicar | Crítica | Bug: não navega/trava |
| KAN-04 | Editar card Kanban → deckId errado | Alta | Bug: navega para ID errado |

---

## Tarefas Técnicas (Breakdown)

### Área: Automação/Infra (Instância: `scrum-dev-infra`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-01 | Instalar Node 20 standalone no WSL | FUN-01 | `node --version` ≥ 20.0.0; `npm run test` executa sem erro `styleText` | ✅ DONE |
| T-02 | Criar `.env` com credenciais Supabase dev | FUN-02 | Arquivo `.env` existe com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` válidos; `npm run dev` conecta | ✅ DONE |
| T-03 | Aplicar 4 migrations no Supabase dev (SQL Editor) | FUN-03 | Tabelas `decks`, `cards`, `review_log`, `profiles`, `kanban_cards` existem; RLS ativo; bucket `card-images` criado | ✅ DONE |
| T-04 | Criar GitHub Actions CI workflow (typecheck→lint→test→build) | FUN-04 | `.github/workflows/ci.yml` roda em push/PR; falha se qualquer step falha; usa Node 20; cache `node_modules` | ✅ DONE |
| T-05 | Configurar Vercel Preview Deploy automático | FUN-05 | Preview URL gerada por PR; env vars no painel Vercel; `vercel.json` rewrite funciona | ✅ DONE |

### Área: Frontend Core (Instância: `scrum-dev-frontend`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-06 | ProtectedRoute: substituir `return null` por Spinner/Skeleton durante `loading` | AUTH-04 | `ProtectedRoute.tsx` mostra spinner centralizado enquanto `loading=true`; não renderiza `null`; transição suave para rota protegida ou `/login` | ✅ DONE |
| T-07 | Home: corrigir navegação ao clicar no card do baralho (`onClick` no `li`) | HOM-07 | Clicar no card na Home navega para `/decks/:id`; não trava em loading infinito; `Deck` carrega stats e cartões | ✅ DONE |
| T-08 | KanbanPage: corrigir "Editar" para mapear kanban card → deck relacionado | KAN-04 | Clicar "Editar" em card do Kanban navega para `/decks/{deckId}/edit` correto (não `kanbanCardId`); se sem mapeamento, mostra erro amigável | ✅ DONE |
| T-09 | ErrorBoundary no App.tsx (HDN-01) | HDN-01 | `<ErrorBoundary fallback={<ErrorFallback />}>` envolve `{routes()}`; captura erros de render; mostra UI amigável com botão "Tentar novamente" | ✅ DONE |
| T-10 | CardsProvider: adicionar `mounted` guard no realtime subscription (HDN-02) | HDN-02 | `useEffect` do realtime tem `let mounted = true`; ignora payloads se `!mounted`; cleanup seta `mounted=false` + `removeChannel` | ✅ DONE |

### Área: Backend/Dados (Instância: `scrum-dev-backend`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-11 | Migrar `createCard` para usar `rpc('next_card_code')` PG function (HDN-03) | HDN-03 | `entities/card/api/cards.ts` remove `SELECT MAX(card_code)` client-side; chama `supabase.rpc('next_card_code', {deck_id_param: input.deck_id})`; trata erro se function não existir | ✅ DONE |
| T-12 | Validar RLS policies com 2 usuários mockados | FUN-03 | Teste manual: user A cria baralho → user B não vê; user A edita → user B não edita; `review_log` isolado por user | ✅ DONE |
| T-13 | Verificar bucket `card-images` policies (storage) | FUN-03 | Upload/Download/Delete restrito à pasta `user_id/`; signed URL funciona; expiração 1 ano (atual) | ✅ DONE |

---

## Quadro Kanban (scrum/sprint-atual.md)

```
TODO                          DOING                        REVIEW                      DONE
├─ (vazio)                   ├─ (vazio)                   ├─ (vazio)                  ├─ T-01  Node 20 standalone
│                            │                            │                           ├─ T-02  .env local
│                            │                            │                           ├─ T-03  Migrations Supabase
│                            │                            │                           ├─ T-04  CI workflow GH Actions
│                            │                            │                           ├─ T-05  Vercel Preview
│                            │                            │                           ├─ T-06  ProtectedRoute spinner
│                            │                            │                           ├─ T-07  Home click navega
│                            │                            │                           ├─ T-08  Kanban edit → deckId
│                            │                            │                           ├─ T-09  ErrorBoundary App
│                            │                            │                           ├─ T-10  CardsProvider mounted
│                            │                            │                           ├─ T-11  createCard RPC next
│                            │                            │                           ├─ T-12  Validar RLS 2 users
│                            │                            │                           └─ T-13  Bucket card-images
```

---

## Atribuição de Agentes

| Área | Agente (scrum-dev) | Tarefas |
|------|---------------------|---------|
| **Automação/Infra** | `scrum-dev-infra` | T-01, T-02, T-03, T-04, T-05 |
| **Frontend Core** | `scrum-dev-frontend` | T-06, T-07, T-08, T-09, T-10 |
| **Backend/Dados** | `scrum-dev-backend` | T-11, T-12, T-13 |

---

## Definição de Pronto (DoD) da Sprint

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa (requer T-01 concluído)
- [ ] `npm run build` passa
- [ ] `npm run dev` abre em localhost:5173, login funciona, Home carrega baralhos
- [ ] **Smoke test manual** verde:
  - [ ] Login → Cadastro → Logout → Login
  - [ ] Home: lista, busca, filtro tag, streak, "Revisar agora"
  - [ ] Clicar baralho → navega para `/decks/:id` (sem travar)
  - [ ] Deck: stats, botões Revisar/Editar/Exportar/Importar/Add
  - [ ] DeckEdit: CRUD cartões, import JSON, imagens
  - [ ] Review: modos due/all/missed, flip, setas, finalização confete
  - [ ] Kanban: drag-drop 1 passo, add card, edit → deck correto
  - [ ] Tema light/dark persiste
- [ ] Commits pequenos, conventional commits (`fix:`, `feat:`, `chore:`)

---

## Impedimentos Conhecidos (scrum/impedimentos.md)

| ID | Descrição | Impacto | Ação |
|----|-----------|---------|------|
| IMP-01 | Node 18 no WSL não roda vitest 5 | Bloqueia T-01, T-04, todos os testes | Instalar Node 20 standalone (T-01) — prioridade máxima |
| IMP-02 | Sem credenciais Supabase dev | Bloqueia T-02, T-03, T-12, T-13 | Usuário deve prover URL + anon key de projeto dev |
| IMP-03 | Kanban cards sem `deck_id` (HDN-05) | T-08 não pode ser 100% resolvido sem decisão | Decisão do PO: (a) manter separado, (b) adicionar FK `deck_id` |

---

## Daily Log Template (scrum/daily/AAAA-MM-DD.md)

```markdown
# Daily 2026-10-28

## scrum-dev-infra
- Feito: ...
- Fazendo: ...
- Bloqueadores: ...

## scrum-dev-frontend
- Feito: ...
- Fazendo: ...
- Bloqueadores: ...

## scrum-dev-backend
- Feito: ...
- Fazendo: ...
- Bloqueadores: ...

## Impedimentos Novos
- ...

## Decisões do Dia
- ...
```

---

## Próximos Passos (Orquestrador)

1. **Criar 3 instâncias `scrum-dev`** (uma por área) com as tarefas atribuídas
2. **Iniciar T-01 (Node 20)** — desbloqueia tudo o mais
3. **Paralelizar**: T-02/.env + T-03/migrations (usuário precisa prover credenciais)
4. **Frontend pode começar T-06/T-07/T-08** assim que T-02/T-03 permitirem testar localmente
5. **Backend T-11** pode ser feito independentemente (mudança local no código)

> **Nota**: T-04 (CI) e T-05 (Vercel) dependem de T-01 (Node 20 no CI runner). GitHub Actions usa `actions/setup-node@v4` com `node-version: '20'`.