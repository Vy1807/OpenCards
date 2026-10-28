# Sprint 3 — Coverage 80%, Features & Polish

**Objetivo**: Atingir coverage ≥ 80%, completar feature DEK-06 (adicionar cartão rápido), snapshots UI, e polish geral
**Período**: 5 dias úteis
**Início**: 2026-10-30
**Time**: 2 áreas (Frontend Quality, Backend/Hardening)

---

## Histórias Selecionadas (Maior Valor)

| ID | História | Prioridade | Valor |
|----|----------|------------|-------|
| QLT-03 | Snapshots UI atualizados | Alta | Regressão visual; desbloqueado por Node 20+ no CI |
| DEK-06 | Adicionar cartão rápido na tela do baralho | Média | UX: evita ir para `/decks/:id/edit` para criar 1 cartão |
| QLT-05 | Coverage ≥ 80% (linhas, funções, branches, statements) | Alta | Qualidade; previne regressões em libs puras |
| NEW-05 | Testes integração RLS/Storage com Supabase local | Média | Valida security policies end-to-end |
| REV-11 | Melhoria "Revisar agora": ir para baralho com **mais pendentes** | Baixa | UX: prioriza baralho que mais precisa de estudo |

---

## Tarefas Técnicas (Breakdown)

### Área: Frontend Quality (Instância: `scrum-dev-frontend`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-301 | Atualizar snapshots UI com Node 20+ | QLT-03 | `npx vitest run src/components/ui --update` passa; arquivos `.snap` commitados; inclui `Spinner`, `ErrorBoundary`, `Select` | ✅ DONE |
| T-302 | Implementar DEK-06: Botão "Adicionar cartão" em `/decks/:id` | DEK-06 | Botão "Adicionar cartão" navega para `/novo-card?deckId=:id`; pré-preenche `deck_id`; após salvar, volta para `/decks/:id` | ✅ DONE |
| T-303 | Testes `schedule.ts` (Leitner algorithm) | QLT-05 | `src/shared/lib/schedule.test.ts`: `scheduleNext` (todas caixas 0→5), `isDue` (due today, future, past), edge cases | ✅ DONE |
| T-304 | Testes `shuffle.ts` | QLT-05 | `src/shared/lib/shuffle.test.ts`: array vazio, 1 item, N items (distribuição uniforme), imutabilidade | 🟡 TODO |
| T-305 | Testes `importCards.ts` | QLT-05 | `src/shared/lib/importCards.test.ts`: parse válido, inválido, campos obrigatórios, round-trip com export | 🟡 TODO |
| T-306 | Testes `streak.ts` adicionais (edge cases) | QLT-05 | Timezone boundary, ano bissexto, datas futuras ignoradas, múltiplas reviews mesmo dia | 🟡 TODO |
| T-307 | Melhorar "Revisar agora" → baralho com mais pendentes | REV-11 | `Home.tsx`: `filteredDecks.sort((a,b) => b.dueToday - a.dueToday)` antes de pegar `[0]` | 🟡 TODO |

### Área: Backend/Hardening (Instância: `scrum-dev-backend`)

| T-ID | Título | História | Critérios de Aceite | Status |
|------|--------|----------|---------------------|--------|
| T-308 | Testes integração RLS (Supabase local) | NEW-05 | `npm run test:integration` roda: userA não vê decks userB; userA não edita cards userB; storage policies funcionam | 🟡 TODO |
| T-309 | Testes integração Auth (login/logout/refresh) | NEW-05 | `npm run test:integration` roda: signup → login → session persist → logout → session clear | 🟡 TODO |
| T-310 | Verificar/ajustar coverage threshold 80% | QLT-05 | `vitest.config.ts`: `coverage.thresholds` ≥ 80 para lines/functions/branches/statements | 🟡 TODO |

---

## Quadro Kanban (scrum/sprint-atual.md)

```
TODO                          DOING                        REVIEW                      DONE
├─ T-304  shuffle.test.ts     ├─ (vazio)                   ├─ (vazio)                  ├─ T-301  Snapshots UI
├─ T-305  importCards.test.ts │                            │                           ├─ T-302  DEK-06 Add card
├─ T-306  streak extra tests  │                            │                           ├─ T-303  schedule.test.ts
├─ T-307  Revisar agora fix   │                            │
├─ T-308  RLS integration     │                            │
├─ T-309  Auth integration    │                            │
└─ T-310  Coverage threshold  │                            │
```

---

## Atribuição de Agentes

| Área | Agente (scrum-dev) | Tarefas |
|------|---------------------|---------|
| **Frontend Quality** | `scrum-dev-frontend` | T-301 a T-307 |
| **Backend/Hardening** | `scrum-dev-backend` | T-308 a T-310 |

---

## Definição de Pronto (DoD) da Sprint

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run test` passa (unit + integration) **com coverage ≥ 80%**
- [ ] `npm run build` passa (sem warning chunk > 500kB)
- [ ] `npm run test:integration` passa (com Supabase local — RLS + Auth)
- [ ] CI GitHub Actions verde (typecheck → lint → test → build → test:integration)
- [ ] Snapshots UI atualizados e commitados
- [ ] DEK-06 funcional (adicionar cartão rápido)
- [ ] "Revisar agora" vai para baralho com mais pendentes
- [ ] Commits pequenos, conventional commits

---

## Impedimentos Conhecidos

| ID | Descrição | Ação |
|----|-----------|------|
| IMP-01 | Node 20+ para snapshots locais | CI usa Node 20; snapshots podem ser atualizados no CI |
| IMP-02 | Supabase local no CI (Docker) | `services:` no workflow ou `docker compose` em step |
| IMP-03 | Coverage 80% pode exigir muitos testes novos | Priorizar libs puras (schedule, shuffle, import, export, streak) |

---

## Daily Log Template (scrum/daily/AAAA-MM-DD.md)

```markdown
# Daily 2026-10-XX

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