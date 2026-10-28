## Entrega da Sprint 1 — Fundação & Bugs Críticos

**Período**: 2026-10-28 a 2026-10-31 (em andamento)  
**Objetivo**: Resolver bloqueadores de ambiente (Node 20, .env, migrations) e corrigir 3 bugs reportados pelo usuário (navegação baralho, ProtectedRoute loading, Kanban edit).

---

## ✅ Entregas Concluídas (Done)

### Backend/Dados
| ID | Tarefa | Descrição | Arquivos |
|----|--------|-----------|----------|
| **T-11** | `createCard` via RPC `next_card_code` | Elimina race condition de `card_code` duplicado; usa função PostgreSQL existente (migration 0001) com fallback client-side se função não existir | `src/entities/card/api/cards.ts` |

### Frontend Core
| ID | Tarefa | Descrição | Arquivos |
|----|--------|-----------|----------|
| **T-06** | ProtectedRoute: Spinner no loading | Substitui `return null` por Spinner centralizado com `ariaLabel`; evita tela branca/pisca ao navegar rotas protegidas | `src/features/auth/ProtectedRoute.tsx`, `src/components/ui/Spinner.tsx` (novo) |
| **T-07** | Home: clique no baralho navega + A11y | `e.stopPropagation()` para não disparar pai; suporte teclado (Enter/Space); `tabIndex=0`, `role="button"`, `aria-label` dinâmico | `src/features/decks/Home.tsx` |
| **T-08** | Kanban "Editar" → erro amigável | Sem `deck_id` nos cards do Kanban (HDN-05 pendente), mostra erro claro orientando para página do baralho | `src/features/kanban/KanbanPage.tsx` |
| **T-09** | ErrorBoundary no App.tsx | Captura erros de render na árvore; UI amigável com ícone, mensagem e botão "Tentar novamente" (recarrega página) | `src/components/ui/ErrorBoundary.tsx` (novo), `src/app/App.tsx` |
| **T-10** | CardsProvider: mounted guard no realtime | Flag `mounted` no `useEffect` do realtime; ignora payloads se desmontado; cleanup remove channel | `src/app/providers/CardsProvider.tsx` |

### Design System (Novos Componentes)
| Componente | Descrição |
|------------|-----------|
| **Spinner** | Carregamento animado (sm/md/lg), `prefers-reduced-motion`, CSS animations em `ui.css`, `ariaLabel` |
| **ErrorBoundary** | Class component React; `getDerivedStateFromError` + `componentDidCatch`; fallback customizável; botão "Tentar novamente" recarrega página |

### Infraestrutura
| ID | Tarefa | Descrição |
|----|--------|-----------|
| **T-01** | Node 20 standalone instalado | v20.18.0 em `~/.local/bin`; `npm run typecheck` e `npm run lint` passam |

---

## 🔄 Em Andamento / Pendente

| ID | Tarefa | Área | Status | Bloqueador |
|----|--------|------|--------|------------|
| T-02 | `.env` com credenciais Supabase dev | Infra | 🔴 Bloqueado | **Usuário deve prover** |
| T-03 | Migrations no Supabase dev | Infra | 🔴 Bloqueado | **Usuário deve rodar no SQL Editor** |
| T-04 | CI workflow GitHub Actions | Infra | 🟡 Doing | Problemas npm/rolldown native bindings |
| T-05 | Vercel Preview Deploy | Infra | 🟡 Todo | — |

---

## 📝 Decisões Técnicas Relevantes (Sprint 1)

| Decisão | Resumo |
|---------|--------|
| **RPC `next_card_code`** | `createCard` delega geração de código sequencial ao Postgres (função já existe na migration 0001). Fallback client-side mantém compatibilidade se migration não aplicada. |
| **ProtectedRoute loading UX** | `null` → Spinner centralizado. Mantém layout estável, acessível (`aria-label`), respeita design system (tokens, CSS). |
| **Home navegação acessível** | Card do baralho vira botão semântico: `role="button"`, `tabIndex=0`, teclado (Enter/Space), `aria-label`, `stopPropagation`. |
| **Kanban edit sem deck_id** | Sem mapeamento (HDN-05), mostra erro amigável em vez de navegar para ID errado. Decisão PO pendente. |
| **ErrorBoundary** | Class component (necessário para `getDerivedStateFromError`); fallback padrão com `AlertIcon`, mensagem, botão reload; logs no console. |
| **CardsProvider mounted guard** | Flag `mounted` no realtime `useEffect`; `if (!mounted) return` em cada handler; cleanup seta `mounted=false` + `removeChannel`. |
| **Node 20 standalone** | Instalação sem sudo em `~/.local/bin`; contorna limitação WSL/Node 18 para vitest 5 + rolldown. |

---

## 🐛 Bugs Corrigidos

| Bug | Sintoma | Correção |
|-----|---------|----------|
| **IMP-06** | ProtectedRoute: tela branca/pisca durante loading | T-06: Spinner em vez de `null` |
| **IMP-07** | Home: clicar baralho não navega / trava | T-07: `stopPropagation` + teclado + A11y |
| **IMP-05** | `card_code` race condition (duplicate key) | T-11: RPC `next_card_code` no Postgres |
| **IMP-08** | Kanban "Editar" navega para `/decks/{kanbanId}/edit` | T-08: erro amigável explicando limitação |

---

## 📦 Mudanças de Código (Resumo)

```
src/components/ui/Spinner.tsx          # NOVO: componente spinner
src/components/ui/ErrorBoundary.tsx    # NOVO: error boundary class component
src/components/ui/ui.css               # + Spinner CSS animations
src/components/ui/index.ts             # + export Spinner, ErrorBoundary
src/features/auth/ProtectedRoute.tsx   # FIX: loading → Spinner
src/features/decks/Home.tsx            # FIX: navegação baralho + A11y
src/features/kanban/KanbanPage.tsx     # FIX: edit → erro amigável (sem deck_id)
src/app/App.tsx                        # FIX: ErrorBoundary envolve rotas
src/app/providers/CardsProvider.tsx    # FIX: mounted guard no realtime
src/entities/card/api/cards.ts         # FIX: createCard → rpc('next_card_code')
package.json / package-lock.json       # Node 20 install
.github/workflows/ci.yml               # CI: Node 20 via .nvmrc
.nvmrc                                 # Node 20 version
README.md                              # + Sprint 1 fixes section
docs/DESIGN_SYSTEM.md                  # + Spinner, ErrorBoundary docs
```

---

## ✅ Critérios de Qualidade

| Check | Status |
|-------|--------|
| `npm run typecheck` | ✅ Passa |
| `npm run lint` | ✅ Passa |
| `npm run build` | ⏳ Pendente (precisa Node 20 no PATH do shell) |
| `npm run test` | ⏳ Pendente (precisa `npm install` limpo + Node 20) |
| Smoke test manual | ⏳ Pendente (precisa `.env` + Supabase dev) |

---

## 📋 Próximos Passos (Sprint 1 → Sprint 2)

1. **Usuário**: Preencher `.env` + rodar 4 migrations no Supabase SQL Editor
2. **Decisão PO**: HDN-05 — Kanban cards têm `deck_id`? (desbloqueia T-08 completo)
3. **Infra**: Resolver CI (npm install limpo) + Vercel Preview
4. **Sprint 2 planejada**: Testes faltantes (QLT-01, QLT-02), Hardening (HDN-01 a 07), CI/CD completo

---

**Assinatura**: Scrum Documentador  
**Base**: `scrum/sprint-atual.md`, `scrum/decisoes.md`, `scrum/impedimentos.md`, git diff