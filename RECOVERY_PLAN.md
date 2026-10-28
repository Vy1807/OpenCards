# OpenCards — Plano de Recuperação (Scrum Orchestrator)

**Status atual**: Typecheck ✅ | Lint ✅ | Testes ❌ (Node 18 incompatível) | Build ❓ | Deploy ❓
**Branch**: `main` (clean working tree)

---

## 🎯 Objetivo
Tirar o projeto do limbo de bugs e correções, estabilizar o ambiente, validar funcionalidades core e habilitar CI/CD confiável.

---

## 📋 Backlog Priorizado (Sprint 0 — Estabilização)

### P0 — Bloqueadores de Ambiente (fazer primeiro, em paralelo)
| ID | Item | Critério de Pronto |
|----|------|---------------------|
| P0-1 | **Resolver Node 18 → 20+** para vitest/rolldown funcionar | `npm run test` passa localmente |
| P0-2 | **Criar `.env` local** com credenciais Supabase de dev | `npm run dev` conecta e carrega dados |
| P0-3 | **Rodar migrations no Supabase dev** (0001, 0002, 0003_profiles, 0003_kanban_cards) | Tabelas `decks`, `cards`, `review_log`, `profiles`, `kanban_cards` existem com RLS |

> **Como resolver P0-1 sem sudo**: baixar binário Node 20 standalone → `~/node20/bin/node` → alias no `.bashrc` ou usar `npx` com `--node-options` (testar). Alternativa: downgrade vitest para v1.x compatível com Node 18.

### P1 — Bugs Reportados pelo Usuário (validar e corrigir)
| ID | Sintoma | Hipótese | Validação |
|----|---------|----------|-----------|
| P1-1 | "Clicar no baralho não navega / carrega infinito" | `ProtectedRoute` retorna `null` durante `loading` → pisca ou trava navegação | Reproduzir no dev: logar, ir em Home, clicar baralho → deve ir para `/decks/:id` com stats |
| P1-2 | "Rotas não funcionam conforme esperado" | Ordem das rotas / `ProtectedRoute` wrapper / `Navigate` fallback | Testar todas as rotas: `/`, `/login`, `/cadastro`, `/decks/:id`, `/decks/:id/edit`, `/decks/:id/review`, `/novo-card`, `/importar`, `/kanban` |
| P1-3 | Kanban "Editar" navega para `/decks/{kanbanCardId}/edit` mas kanban cards não têm `deck_id` | `KanbanPage.tsx:53` usa `cardId` do kanban como se fosse deck ID | Clicar "Editar" em card do Kanban → deve abrir edição do **baralho** correspondente ou dar erro claro |

### P2 — Cobertura de Testes (gaps do `vitest.config.ts`)
| ID | Arquivo faltante | Ação |
|----|------------------|------|
| P2-1 | `src/shared/lib/streak.test.ts` | Criar testes para `streak()` (dias consecutivos, gap quebra streak, vazio=0) |
| P2-2 | `src/shared/lib/exportCards.test.ts` | Criar testes para `exportCards()` / `exportCardsJson()` (round-trip com import) |
| P2-3 | `src/features/kanban/kanbanStore.test.ts` | Já existe (256 linhas) — verificar se passa no Node 20 |
| P2-4 | `src/features/kanban/kanban.test.ts` | Já existe (60 linhas) — verificar |
| P2-5 | Snapshots UI (`Button`, `Card`, `Input`, `Modal`, `StatusPill`, `ProgressBar`, `Select`) | Rodar `npx vitest run src/components/ui --update` após Node 20 |

### P3 — Dívida Técnica & Hardening
| ID | Item | Detalhes |
|----|------|----------|
| P3-1 | **ProtectedRoute loading UX** | Substituir `return null` por spinner/skeleton para evitar flash e dar feedback |
| P3-2 | **CardsProvider realtime race condition** | Subscription assíncrona pode sobrescrever estado carregado sob demanda; adicionar `mounted` guard igual ao `AuthProvider` |
| P3-3 | **Error boundaries** | Adicionar `<ErrorBoundary>` em `App.tsx` envolvendo rotas para capturar erros de render e mostrar UI amigável |
| P3-4 | **Tipagem `deck.cards_count`** | `Deck` type tem `cards_count?: number` mas `getDecks`/`getDeck` sempre retornam; tornar obrigatório após migração |
| P3-5 | **Kanban ↔ Decks integração** | Kanban cards são entidade separada; se a ideia é gerenciar tarefas de estudo, decidir: (a) manter separado, (b) vincular `kanban_cards.deck_id` via FK |
| P3-6 | **Validação `card_code` duplicado** | `createCard` gera código sequencial mas race condition possível; usar `next_card_code()` function do PG (já existe na migration 0001) |
| P3-7 | **Image upload signed URL expiração** | `uploadImage` cria signed URL de 1 ano; avaliar se deve ser mais curto + refresh on demand |
| P3-8 | **Acessibilidade formulários** | `Input` já tem `htmlFor`; revisar `Label` em todos os forms (DeckEdit, NewCard, Import) |

### P4 — CI/CD & Qualidade Contínua
| ID | Item |
|----|------|
| P4-1 | GitHub Actions workflow: `typecheck` → `lint` → `test` → `build` |
| P4-2 | Vercel preview deploy automático em PR |
| P4-3 | Coverage threshold 80% enforcado no CI (já configurado no `vitest.config.ts`) |
| P4-4 | `dependabot.yml` para updates semanais |

---

## 🗓️ Cronograma Sugerido (2 semanas)

### Semana 1 — Fundação
| Dia | Foco | Entregável |
|-----|------|------------|
| 1-2 | P0-1, P0-2, P0-3 | Ambiente dev funcional, testes rodando |
| 3   | P1-1, P1-2, P1-3 | Bugs de navegação/rotas reproduzidos e corrigidos |
| 4   | P2-1, P2-2 | Testes `streak` e `exportCards` criados |
| 5   | P2-3, P2-4, P2-5 | Todos testes UI passam, snapshots atualizados |

### Semana 2 — Hardening & Deploy
| Dia | Foco | Entregável |
|-----|------|------------|
| 1-2 | P3-1 a P3-8 (priorizar 1, 2, 3, 6) | Código mais robusto, menos flaky |
| 3   | P4-1, P4-2 | CI/CD no GitHub Actions + Vercel preview |
| 4   | Regressão completa | `npm run typecheck && npm run lint && npm run test && npm run build` tudo verde |
| 5   | Deploy production + smoke test | Vercel production URL funcional |

---

## 🔍 Checklist de Validação Manual (Smoke Test)

Após cada correção, rodar este checklist no dev local:

- [ ] **Auth**: Login → Cadastro → Logout → Login novamente
- [ ] **Home**: Lista baralhos, busca, filtro tag, streak, botão "Revisar agora"
- [ ] **Deck**: Abre deck, mostra stats, cartões, botões Revisar/Editar/Exportar/Adicionar
- [ ] **DeckEdit**: Edita nome/tag, adiciona cartão (com/sem imagem), importa JSON, exclui cartão/baralho
- [ ] **Review**: Modo `due` (padrão), flip (Espaço/Enter), acerto (→), erro (←), progresso ECG, finalização com confete ≥80%, "Revisar erros"
- [ ] **Import/Export**: Exporta JSON → importa no mesmo/outro baralho → round-trip preserva `card_code`, `front_text`, `back_text`
- [ ] **Kanban**: Cria card, arrasta colunas (TO DO → IN PROGRESS → TESTING → DONE), bloqueia salto de etapa, persiste no localStorage, sync Supabase (se online)
- [ ] **Tema**: Toggle dark/light persiste no localStorage
- [ ] **Responsivo**: Mobile (375px), tablet (768px), desktop (1200px)

---

## 📦 Definição de Pronto (DoD) por Story

- [ ] Typecheck passa (`tsc --noEmit`)
- [ ] Lint passa (`eslint .`)
- [ ] Testes passam (`vitest run`) — **requer Node 20+**
- [ ] Build passa (`vite build`)
- [ ] Smoke test manual verde
- [ ] Commits pequenos, mensagens em inglês, conventional commits (`feat:`, `fix:`, `test:`, `chore:`)

---

## 🚨 Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Node 20 não instala no WSL | Média | Alto (bloqueia testes) | Usar binário standalone Node 20 em `~/bin` + PATH; ou downgrade vitest para 1.x |
| Supabase dev sem créditos/limite | Baixa | Médio | Usar projeto Supabase local (Docker) ou conta free tier separada |
| Realtime flaky em CI | Média | Baixo | Mock `supabase.channel` nos testes (já feito em `integration.test.tsx`) |
| Kanban cards órfãos (sem deck) | Alta | Médio | Decidir arquitetura P3-5 antes de expandir Kanban |

---

## 📌 Próximos Passos Imediatos (para você)

1. **Resolver Node 20** — tente `curl -fsSL https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz | tar -xJ -C ~/ && echo 'export PATH=~/node-v20.18.0-linux-x64/bin:$PATH' >> ~/.bashrc && source ~/.bashrc`
2. **Criar `.env`** — `cp .env.example .env` e preencher com seu projeto Supabase dev
3. **Rodar migrations** — SQL Editor no painel Supabase, colar 4 arquivos em ordem
4. **Confirmar** — `npm run dev` abre em `localhost:5173`, login funciona, vê Home com baralhos

> Depois disso, podemos atacar P1/P2 em paralelo via sub-agentes (Codex/Claude Code) se quiser acelerar.