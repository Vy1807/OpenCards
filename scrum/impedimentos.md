# Impedimentos — OpenCards

**Atualizado**: 2026-10-29

| ID | Descrição | Impacto | Severidade | Status | Ação / Responsável | Resolvido Em |
|----|-----------|---------|------------|--------|-------------------|--------------|
| IMP-01 | Node 18 no WSL não roda vitest 5 (rolldown `styleText`) | Bloqueia testes, CI, coverage | 🔴 Crítica | Resolvido | Node 22.12.0 standalone instalado | 2026-10-28 |
| IMP-02 | Sem credenciais Supabase dev (URL + anon key) | Bloqueia `npm run dev`, migrations, validação RLS | 🔴 Crítica | Resolvido | Usuário proveu credenciais; .env criado | 2026-10-28 |
| IMP-03 | Kanban cards sem `deck_id` (HDN-05) | T-08 não pode mapear kanban card → deck relacionado | 🟡 Média | Aberto | Decisão PO: (a) manter separado, (b) FK `deck_id` + UI | — |
| IMP-04 | Signed URLs de imagem expiram em 1 ano | Risco segurança se URL vazar | 🟢 Baixa | Aberto | HDN-06: reduzir para 1h + refresh on-demand (Sprint 2) | — |
| IMP-05 | `card_code` race condition (client-side MAX) | Duplicate key error em create simultâneo | 🟡 Média | Resolvido | T-11: migrar para `rpc('next_card_code')` | 2026-10-28 |
| IMP-06 | ProtectedRoute retorna `null` no loading | UX: tela branca/pisca ao navegar rotas protegidas | 🟡 Média | Resolvido | T-06: spinner/skeleton | 2026-10-28 |
| IMP-07 | Home: clicar baralho não navega / trava loading | Bug reportado — core flow quebrado | 🔴 Crítica | Resolvido | T-07: `stopPropagation` + teclado + A11y | 2026-10-28 |
| IMP-08 | Kanban "Editar" navega para `/decks/{kanbanId}/edit` | Bug conhecido — ID errado | 🔴 Crítica | Resolvido | T-08: erro amigável explicando limitação | 2026-10-28 |
| IMP-09 | CI `npm install` falha por native bindings (rolldown/undici) | CI não roda de forma reprodutível | 🔴 Crítica | Aberto | NEW-03: `npm ci` + cache + package-lock.json commitado | — |
| IMP-10 | Supabase cloud rate limit impede testes RLS automatizados | Não valida T-12/T-13 end-to-end | 🔴 Crítica | Aberto | NEW-01/02: Supabase local (Docker) + seed users | — |
| IMP-11 | Build warning: chunk > 500kB | Bundle único grande; performance | 🟡 Média | Aberto | NEW-04: code-splitting rotas (React.lazy) | — |
| IMP-12 | Coverage gaps: streak, exportCards, snapshots UI | Qualidade; regressão não detectada | 🟡 Média | Aberto | QLT-01/02/03/04 (Sprint 2) | — |
| IMP-13 | Acessibilidade formulários incompleta | `htmlFor`/`id` faltando em alguns inputs | 🟡 Média | Aberto | HDN-07 + REV-10 (Sprint 2) | — |
|| IMP-14 | Decisão HDN-05 (Kanban ↔ Decks) pendente | Arquitetura incoerente; T-214 bloqueado | 🟡 Média | Resolvido | Decisão PO: Opção A (manter separado); registrado em `decisoes.md` #13 | 2026-10-28 |

---

## Legenda
- **Severidade**: 🔴 Crítica (bloqueia entrega), 🟡 Média (degrada UX/qualidade), 🟢 Baixa (dívida técnica)
- **Status**: Aberto | Em andamento | Resolvido | Não vou corrigir (icebox)