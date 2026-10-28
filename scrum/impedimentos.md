# Impedimentos — OpenCards

**Atualizado**: 2026-10-30

| ID | Descrição | Impacto | Severidade | Status | Ação / Responsável | Resolvido Em |
|----|-----------|---------|------------|--------|-------------------|--------------|
| IMP-01 | Node 18 no WSL não roda vitest 5 (rolldown `styleText`) | Bloqueia testes, CI, coverage | 🔴 Crítica | Resolvido | Node 22.12.0 standalone instalado | 2026-10-28 |
| IMP-02 | Sem credenciais Supabase dev (URL + anon key) | Bloqueia `npm run dev`, migrations, validação RLS | 🔴 Crítica | Resolvido | Usuário proveu credenciais; .env criado | 2026-10-28 |
| IMP-03 | Kanban cards sem `deck_id` (HDN-05) | T-08 não pode mapear kanban card → deck relacionado | 🟡 Média | Resolvido | Decisão PO: Opção A (manter separado) | 2026-10-28 |
| IMP-04 | Signed URLs de imagem expiram em 1 ano | Risco segurança se URL vazar | 🟢 Baixa | Resolvido | HDN-06: T-216 (1h + refresh on-demand) | 2026-10-28 |
| IMP-05 | `card_code` race condition (client-side MAX) | Duplicate key error em create simultâneo | 🟡 Média | Resolvido | T-11: migrar para `rpc('next_card_code')` | 2026-10-28 |
| IMP-06 | ProtectedRoute retorna `null` no loading | UX: tela branca/pisca ao navegar rotas protegidas | 🟡 Média | Resolvido | T-06: spinner/skeleton | 2026-10-28 |
| IMP-07 | Home: clicar baralho não navega / trava loading | Bug reportado — core flow quebrado | 🔴 Crítica | Resolvido | T-07: `stopPropagation` + teclado + A11y | 2026-10-28 |
| IMP-08 | Kanban "Editar" navega para `/decks/{kanbanId}/edit` | Bug conhecido — ID errado | 🔴 Crítica | Resolvido | T-08: erro amigável explicando limitação | 2026-10-28 |
| IMP-09 | CI `npm install` falha por native bindings (rolldown/undici) | CI não roda de forma reprodutível | 🔴 Crítica | Resolvido | T-205: `npm ci` + cache + package-lock.json | 2026-10-28 |
| IMP-10 | Supabase cloud rate limit impede testes RLS automatizados | Não valida T-12/T-13 end-to-end | 🔴 Crítica | Resolvido | T-201/202/203: Supabase local Docker + seed | 2026-10-28 |
| IMP-11 | Build warning: chunk > 500kB | Bundle único grande; performance | 🟡 Média | Resolvido | T-213: code-splitting rotas (React.lazy) | 2026-10-28 |
| IMP-12 | Coverage gaps: streak, exportCards, snapshots UI | Qualidade; regressão não detectada | 🟡 Média | Em andamento | Sprint 3: T-301, T-303-306 (coverage 80%) | — |
| IMP-13 | Acessibilidade formulários incompleta | `htmlFor`/`id` faltando em alguns inputs | 🟡 Média | Resolvido | T-211/212: A11y formulários + Review | 2026-10-28 |
| IMP-14 | Decisão HDN-05 (Kanban ↔ Decks) pendente | Arquitetura incoerente; T-214 bloqueado | 🟡 Média | Resolvido | Decisão PO: Opção A (manter separado) | 2026-10-28 |
| IMP-15 | Snapshots UI não atualizados (Node 18 local) | Regressão visual não detectada | 🟡 Média | Aberto | T-301: CI Node 20 roda `--update` | — |
|| IMP-16 | DEK-06: Adicionar cartão rápido não implementado | UX: precisa ir em Editar para criar 1 cartão | 🟡 Média | Resolvido | T-302: Botão "Adicionar cartão" em `/decks/:id` | 2026-10-30 |
|| IMP-17 | Review piscando / não funciona | Review tela reinicia a cada resposta (useEffect re-dispara por deckCards) | 🔴 Crítica | Resolvido | useRef deckCards + load deps [id, refresh] | 2026-10-30 |

---

## Legenda
- **Severidade**: 🔴 Crítica (bloqueia entrega), 🟡 Média (degrada UX/qualidade), 🟢 Baixa (dívida técnica)
- **Status**: Aberto | Em andamento | Resolvido | Não vou corrigir (icebox)