# Sprint 2 — Testes, Qualidade & Hardening

**Objetivo**: Estabilizar CI/CD, cobrir gaps de testes (coverage 80%), decidir arquitetura Kanban↔Decks, hardening de acessibilidade e code-splitting.

**Período**: 5 dias úteis  
**Início**: 2026-10-29  
**Time**: 3 áreas (Infra/Testing, Frontend Quality, Backend/Hardening)

---

## Histórias Selecionadas (Maior Valor)

| ID | História | Prioridade | Valor |
|----|----------|------------|-------|
| NEW-01 | Ambiente Supabase local (Docker) | Crítica | Desbloqueia testes RLS/Storage/Auth automatizados |
| NEW-02 | Script seed usuários teste (2+ users) | Alta | Complementa NEW-01; cria usuários A/B instantâneos |
| NEW-03 | `npm install` limpo no CI | Alta | CI reprodutível; resolve native bindings (rolldown/undici) |
| QLT-01 | Testes `streak.ts` | Alta | Gap coverage; streak é core feature |
| QLT-02 | Testes `exportCards.ts` | Alta | Gap coverage; round-trip JSON crítico |
| QLT-03 | Snapshots UI atualizados | Alta | Regressão visual; desbloqueado por CI |
| QLT-04 | Testes integração rotas completos | Média | Confiança em navegação |
| HDN-05 | Kanban ↔ Decks integração | Média | Decisão PO necessária |
| HDN-07 | Acessibilidade formulários | Média | Conformidade; REV-10 relacionado |
| REV-10 | Navegação teclado acessível Review | Média | UX teclado completa |
| HDN-04 | Tipagem `cards_count` obrigatória | Baixa | Elimina `?? 0` |
| NEW-04 | Code-splitting rotas (lazy loading) | Média | Build warning chunk > 500kB |

---

## Tarefas Técnicas (Breakdown)

### Área: Infra/Testing (Instância: `scrum-dev-infra`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-201 | Criar `docker-compose.yml` com Supabase local | NEW-01 | `docker compose up -d` sobe Postgres (5432), Auth (9999), Storage (5000), Kong (8000), Studio (54323); healthchecks passam | ✅ DONE |
| T-202 | Configurar `.env.local` para Supabase local | NEW-01 | `VITE_SUPABASE_URL=http://localhost:54321`, `VITE_SUPABASE_ANON_KEY=eyJhbG...VCJ9...` (anon key padrão local) | ✅ DONE |
| T-203 | Criar `scripts/seed-test-users.ts` | NEW-02 | Script idempotente: cria 2 usuários confirmados (userA/userB) via Supabase Admin API; retorna emails/senhas/access tokens; usa `supabase.auth.admin.createUser` | ✅ DONE |
| T-204 | Adicionar script `npm run test:integration` | NEW-02 | `vitest run --config vitest.integration.config.ts` usa `SUPABASE_URL=http://localhost:54321`; roda testes de RLS/Storage/Auth com usuários seedados | ✅ DONE |
| T-205 | Corrigir CI: `npm ci` + cache + Node 20 | NEW-03 | `.github/workflows/ci.yml`: `npm ci` em vez de `npm install`; cache `~/.npm` e `node_modules`; `actions/setup-node@v4` com `node-version: '20'`; `package-lock.json` commitado | ✅ DONE |
| T-206 | Adicionar job `test:integration` no CI | NEW-03 | CI sobe Supabase local via `services:` (Postgres + Kong) ou usa `docker compose` em step; roda `npm run test:integration` após build | ✅ DONE |

### Área: Frontend Quality (Instância: `scrum-dev-frontend`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-207 | Criar `src/shared/lib/streak.test.ts` | QLT-01 | Casos: vazio=0; dias consecutivos; gap quebra streak; hoje conta; timezone; `streak([]) === 0` | ✅ DONE |
| T-208 | Criar `src/shared/lib/exportCards.test.ts` | QLT-02 | Casos: exporta array vazio; exporta N cards; `exportCardsJson` stringifica bonito; round-trip com `parseAndValidateImport` preserva `card_code`/`front_text`/`back_text` | ✅ DONE |
| T-209 | Atualizar snapshots UI (`Button`, `Card`, `Input`, `Modal`, `StatusPill`, `ProgressBar`, `Select`, `Spinner`, `ErrorBoundary`) | QLT-03 | `npx vitest run src/components/ui --update` passa; arquivos `.snap` commitados; inclui novos `Spinner` e `ErrorBoundary` | 🟡 TODO |
| T-210 | Expandir `integration.test.tsx` para todas as rotas | QLT-04 | Cobre: `/login`, `/cadastro`, `/`, `/decks/:id`, `/decks/:id/edit`, `/decks/:id/review?mode=due|all|missed`, `/novo-card`, `/importar`, `/kanban`; mocks Supabase; `MemoryRouter` | ✅ DONE |
| T-211 | Auditoria e correção acessibilidade formulários | HDN-07 | `htmlFor`/`id` em todos `Input`, `textarea`, `select` (`Login`, `Cadastro`, `DeckEdit`, `NewCard`, `Import`); `aria-label` onde design oculta label; `focus-visible` ring rosa em todos inputs/botões | ✅ DONE |
| T-212 | Navegação teclado acessível Review | REV-10 | `tabIndex` nos botões (Difícil/Bom/Fácil/Virar); `focus-visible` ring rosa; `aria-label` nos ícones; ESC volta para `/decks/:id`; ordem lógica Tab | ✅ DONE |
| T-213 | Code-splitting rotas pesadas | NEW-04 | `React.lazy` + `Suspense` para `Deck`, `DeckEdit`, `Review`, `KanbanPage`; `fallback={<Spinner size="lg" />}`; build warning chunk > 500kB eliminado | ✅ DONE |

### Área: Backend/Hardening (Instância: `scrum-dev-backend`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-214 | Decisão e implementação HDN-05: Kanban ↔ Decks | HDN-05 | **Decisão PO registrada em `decisoes.md`**: (a) manter separado OU (b) migration `ALTER TABLE kanban_cards ADD COLUMN deck_id UUID REFERENCES decks(id)` + FK + UI para vincular card→deck; se (b), `handleEditCard` navega para `/decks/{deckId}/edit` correto | ✅ DONE (Opção A: manter separado) |
| T-215 | Migration `cards_count` NOT NULL DEFAULT 0 | HDN-04 | `ALTER TABLE decks ALTER COLUMN cards_count SET NOT NULL; ALTER TABLE decks ALTER COLUMN cards_count SET DEFAULT 0;` (ou view/computed column); type `Deck` remove `?` em `cards_count` | ✅ DONE |
| T-216 | Signed URL expiração 1h + refresh on-demand | HDN-06 | `uploadImage` cria signed URL 1h (`60*60`); `Flashcard`/`Card` components chamam `createSignedUrl` on-demand antes de renderizar imagem; cache curto (5min) em `useImageUrl` hook | ✅ DONE |

---

## Quadro Kanban (scrum/sprint-atual.md)

```
TODO                          DOING                        REVIEW                      DONE
├─ T-209  Snapshots UI        ├─ (vazio)                   ├─ (vazio)                  ├─ T-201  Docker Supabase
├─ T-214  HDN-05 Kanban↔Decks │                            │                           ├─ T-202  .env.local local
│                            │                            │                           ├─ T-203  Seed test users
│                            │                            │                           ├─ T-204  test:integration
│                            │                            │                           ├─ T-205  CI npm ci fix
│                            │                            │                           ├─ T-206  CI integration job
│                            │                            │                           ├─ T-207  streak.test.ts
│                            │                            │                           ├─ T-208  exportCards.test.ts
│                            │                            │                           ├─ T-210  Integração rotas
│                            │                            │                           ├─ T-211  A11y formulários
│                            │                            │                           ├─ T-212  A11y Review
│                            │                            │                           ├─ T-213  Code-splitting
│                            │                            │                           ├─ T-215  cards_count NOT NULL
│                            │                            │                           └─ T-216  Signed URL refresh
```

---

## Atribuição de Agentes

| Área | Agente (scrum-dev) | Tarefas |
|------|---------------------|---------|
| **Infra/Testing** | `scrum-dev-infra` | T-201 a T-206 |
| **Frontend Quality** | `scrum-dev-frontend` | T-207 a T-213 |
| **Backend/Hardening** | `scrum-dev-backend` | T-214 a T-216 |

---

## Definição de Pronto (DoD) da Sprint

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa (unit + integration)
- [ ] `npm run build` passa (sem warning chunk > 500kB)
- [ ] Coverage ≥ 80% (lines, functions, branches, statements)
- [ ] `npm run test:integration` passa (com Supabase local)
- [ ] CI GitHub Actions verde (typecheck → lint → test → build → test:integration)
- [ ] Smoke test manual verde (mesmo checklist Sprint 1 + code-splitting carrega)
- [ ] Decisão HDN-05 documentada em `decisoes.md`
- [ ] Commits pequenos, conventional commits

---

## Impedimentos Conhecidos

| ID | Descrição | Ação |
|----|-----------|------|
| IMP-01 | Decisão HDN-05 (PO) | Alinhar com PO antes de T-214; se (b) precisa migration + UI |
| IMP-02 | Docker no CI | GitHub Actions `services:` suporta Postgres mas Kong/Storage pode precisar `docker compose` em step |
| IMP-03 | Node 20 no runner | Confirmar `actions/setup-node@v4` com `node-version: '20'` funciona |

---

## Daily Log Template (scrum/daily/AAAA-MM-DD.md)

```markdown
# Daily 2026-10-XX

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