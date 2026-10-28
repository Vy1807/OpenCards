# Backlog do Produto — OpenCards

**Origem**: `scrum/visao.md`
**Formato**: ID | Título | História de Usuário | Critérios de Aceite | Estimativa | Prioridade | Status

---

## Épico 1 — Fundação & Ambiente (P0)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| FUN-01 | Node 20+ no ambiente dev | Como **dev**, quero **Node 20+ funcional** para que **vitest/rolldown rode sem erro de `styleText`** | `npm run test` executa e passa; `node --version` ≥ 20.0.0 | P | Crítica | ✅ Feito |
| FUN-02 | `.env` local configurado | Como **dev**, quero **arquivo `.env` com credenciais Supabase dev** para que **`npm run dev` conecte ao banco** | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` preenchidos; `npm run dev` carrega Home autenticado | P | Crítica | ✅ Feito |
| FUN-03 | Migrations aplicadas no Supabase dev | Como **dev**, quero **tabelas criadas via SQL Editor** para que **RLS e schema estejam prontos** | Tabelas: `decks`, `cards`, `review_log`, `profiles`, `kanban_cards`; policies RLS ativas; bucket `card-images` existe | P | Crítica | ✅ Feito |
| FUN-04 | CI/CD GitHub Actions | Como **equipe**, quero **pipeline `typecheck → lint → test → build`** para que **PRs só mergem se verdes** | Workflow roda em push/PR; falha se qualquer step falha; artifact de build opcional | M | Alta | ✅ Feito |
| FUN-05 | Vercel Preview Deploy | Como **dev**, quero **deploy automático de PR na Vercel** para que **stakeholders validem visualmente** | Preview URL gerada por PR; variáveis de ambiente configuradas no projeto Vercel | M | Alta | ✅ Feito |
|| NEW-01 | Ambiente Supabase local para testes (Docker) | Como **dev**, quero **Supabase local via Docker** para que **testes de RLS/Auth/Storage rodem sem rate limit externo** | `docker compose up -d supabase` sobe Postgres+Auth+Storage; `scripts/seed-test-users.ts` cria 2 usuários confirmados; `npm run test:integration` usa URL local | G | Crítica | ✅ Feito (T-201, T-202) |
|| NEW-02 | Script seed usuários teste (2+ users) | Como **dev**, quero **script automatizado de seed** para que **testes de integração criem usuários A/B instantaneamente** | Script cria 2 usuários confirmados no Supabase local; retorna emails/senhas/tokens; idempotente | M | Alta | ✅ Feito (T-203) |
|| NEW-03 | `npm install` limpo no CI (resolver native bindings) | Como **dev**, quero **CI com install reprodutível** para que **rolldown/undici não falhem por bindings antigos** | `.github/workflows/ci.yml` usa `npm ci` + cache `~/.npm`; `package-lock.json` commitado; Node 20 no runner | M | Alta | ✅ Feito (T-205, T-206) |

---

## Épico 2 — Autenticação & Sessão

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| AUTH-01 | Login email/senha | Como **estudante**, quero **entrar com email e senha** para que **acesse meus baralhos privados** | Formulário valida email; erro amigável se credenciais inválidas; redireciona para `/` após sucesso; sessão persiste no refresh | P | Alta | ✅ Feito |
| AUTH-02 | Cadastro email/senha | Como **novo usuário**, quero **criar conta** para que **comece a estudar** | Toggle Login/Cadastro; valida email único; cria usuário no Supabase Auth; login automático após cadastro | P | Alta | ✅ Feito |
| AUTH-03 | Logout + limpeza de estado | Como **usuário logado**, quero **sair da conta** para que **ninguém acesse meus dados** | Botão "Sair" no header; `signOut()` limpa sessão Supabase; `AuthProvider` reage a `SIGNED_OUT`; redireciona para `/login` | P | Alta | ✅ Feito |
| AUTH-04 | ProtectedRoute UX loading | Como **usuário**, quero **feedback visual enquanto a sessão carrega** para que **não veja tela branca ou pisque conteúdo protegido** | `ProtectedRoute` mostra spinner/skeleton durante `loading`; não renderiza `null`; transição suave para rota protegida ou login | P | Média | ✅ Feito |
| AUTH-05 | Persistência de tema | Como **usuário**, quero **meu tema (light/dark + cor) salvo** para que **não precise reconfigurar a cada login** | `ThemeSwitcher` salva no `localStorage`; aplica ao montar `App`; funciona cross-session | P | Baixa | ✅ Feito |

---

## Épico 3 — Home & Lista de Baralhos

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| HOM-01 | Listar baralhos do usuário | Como **estudante**, quero **ver meus baralhos** para que **escolha qual estudar** | Cards mostram: nome, tag (se houver), contagem de cartões, badge "pendentes hoje"; ordenados por `created_at` desc | M | Alta | ✅ Feito |
| HOM-02 | Busca por nome | Como **estudante**, quero **filtrar baralhos digitando** para que **encontre rápido** | Input "Pesquise por tema…" filtra em tempo real (case-insensitive); limpa com ESC ou botão | P | Alta | ✅ Feito |
| HOM-03 | Filtro por tag (pills) | Como **estudante**, quero **clicar em tags** para que **veja só baralhos daquele assunto** | Pills "Todos" + tags únicas dos baralhos; clique alterna filtro; estado visual ativo/inativo | P | Alta | ✅ Feito |
| HOM-04 | Streak de dias estudados | Como **estudante**, quero **ver quantos dias seguidos estudei** para que **mantenha o hábito** | `streak()` calculado a partir de `review_log`; mostra "X dias desde sua última revisão"; 0 se nunca revisou | P | Alta | ✅ Feito |
| HOM-05 | Botão "Revisar agora" | Como **estudante**, quero **ir direto para revisão do primeiro baralho com pendentes** para que **ganhe tempo** | Botão aparece se `totalCards > 0`; clique navega para `/decks/{firstDeckId}/review`; desabilitado se sem baralhos | P | Alta | ✅ Feito |
| HOM-06 | Criar baralho inline | Como **estudante**, quero **criar baralho na Home** para que **não perca contexto** | Formulário: Nome (obrigatório), Tag (opcional); submit cria via `createDeck`; navega para `/decks/{id}`; limpa formulário | M | Alta | ✅ Feito |
| HOM-07 | Navegar para baralho ao clicar | Como **estudante**, quero **clicar no card do baralho e ir para `/decks/:id`** para que **veja detalhes e ações** | Card inteiro clicável (`onClick` no `li`); navegação funciona; **não trava em loading infinito** | P | Crítica | ✅ Feito |

---

## Épico 4 — Tela do Baralho (`/decks/:id`)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| DEK-01 | Stats do baralho | Como **estudante**, quero **ver total, dominados, pendentes hoje, accuracy** para que **saiba meu progresso** | 4 cards numéricos coloridos; barra ECG preenchida `% dominados`; recalcula ao abrir/atualizar | M | Alta | ✅ Feito |
| DEK-02 | Botão "Revisar" | Como **estudante**, quero **iniciar revisão Leitner** para que **estude os cartões pendentes** | Botão principal (solid, 56px); desabilitado se `cards.length === 0`; navega para `/decks/:id/review` | P | Alta | ✅ Feito |
| DEK-03 | Botão "Editar" | Como **estudante**, quero **ir para edição do baralho** para que **gerencie cartões** | Navega para `/decks/:id/edit`; acessível via teclado | P | Alta | ✅ Feito |
| DEK-04 | Exportar JSON | Como **estudante**, quero **baixar JSON dos cartões** para que **faça backup ou migre** | Botão "Exportar JSON"; gera `exportCards()` → blob → download; nome do arquivo = `{deckName}.json`; desabilitado se sem cartões | M | Alta | ✅ Feito |
| DEK-05 | Importar JSON | Como **estudante**, quero **importar cartões de JSON** para que **adiciono vários de uma vez** | Botão "Importar" abre modal/secao; valida via `parseAndValidateImport`; mostra prévia válidos/inválidos; confirma importa via `upsertCard`; recarrega lista | M | Alta | ✅ Feito |
| DEK-06 | Adicionar cartão rápido | Como **estudante**, quero **adicionar cartão direto da tela do baralho** para que **não precise ir em Editar** | Botão "Adicionar cartão" → navega para `/novo-card?deckId=:id` (ou modal); pré-preenche `deck_id` | P | Média | ⬜ Pendente |
| DEK-07 | Listar cartões com ações | Como **estudante**, quero **ver meus cartões com código, frente, botão excluir** para que **gerencie conteúdo** | Lista: `#{card_code} {front_text}` + botão "Excluir" (confirma); exclusão chama `deleteCard` e remove da UI | M | Alta | ✅ Feito |

---

## Épico 5 — Edição de Baralho (`/decks/:id/edit`)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| EDI-01 | Editar nome/tag do baralho | Como **estudante**, quero **renomear ou retaggear** para que **organize melhor** | Formulário pré-preenchido; submit chama `updateDeck`; feedback sucesso/erro | P | Alta | ✅ Feito |
| EDI-02 | Excluir baralho (com confirmação) | Como **estudante**, quero **apagar baralho e todos os cartões** para que **limpe o que não uso** | Botão "Excluir baralho" (danger); `confirm()` antes; chama `deleteDeck`; navega para `/` | P | Alta | ✅ Feito |
| EDI-03 | CRUD cartões inline | Como **estudante**, quero **editar frente/verso de cada cartão na lista** para que **corrija rápido** | Cada cartão mostra inputs editáveis; `onChange` chama `updateCard`; debounce ou blur para salvar | M | Alta | ✅ Feito |
| EDI-04 | Excluir cartão individual | Como **estudante**, quero **apagar um cartão** para que **remova errados/duplicados** | Botão "Excluir" por cartão; `confirm()`; chama `deleteCard`; remove da UI local | P | Alta | ✅ Feito |
| EDI-05 | Adicionar cartão com imagens | Como **estudante**, quero **criar cartão com foto na frente/verso** para que **use recursos visuais** | Formulário: ID opcional, frente (textarea), verso (textarea), upload imagem frente, upload imagem verso; `uploadImage` → signed URL; `createCard` com paths; limpa formulário após sucesso | G | Alta | ✅ Feito |
| EDI-06 | Importar cartões (JSON) | Como **estudante**, quero **colar JSON e importar válidos** para que **migre de Anki/outros** | Mesma lógica de DEK-05 mas dentro da tela de edição; botão "Importar cartões (JSON)" abre formulário | M | Alta | ✅ Feito |

---

## Épico 6 — Revisão Leitner (`/decks/:id/review`)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| REV-01 | Modo "Pendentes hoje" (padrão) | Como **estudante**, quero **revisar só o que vence hoje** para que **otimize tempo** | Query param `?mode=due` (default); `isDue(card.due_at, now)` filtra; embaralha via `shuffle()` | M | Alta | ✅ Feito |
| REV-02 | Modo "Todos" | Como **estudante**, quero **revisar todo o baralho** para que **faça revisão geral** | `?mode=all` ignora `due_at`; mostra todos os cartões embaralhados | P | Média | ✅ Feito |
| REV-03 | Modo "Só erros" | Como **estudante**, quero **revisar só o que errei (caixa 0)** para que **foque nas dificuldades** | `?mode=missed` filtra `box === 0`; embaralha | P | Média | ✅ Feito |
| REV-04 | Flip 3D (Espaço/Enter) | Como **estudante**, quero **virar o card com teclado** para que **não precise clicar** | `keydown` Space/Enter → `setFlipped(!flipped)`; animação CSS 3D flip; previne default | M | Alta | ✅ Feito |
| REV-05 | Avaliação: Errei (←) / Acertei (→) / Fácil (→→) | Como **estudante**, quero **responder com setas** para que **flua rápido** | ← → `handleAnswer(false)`; → → `handleAnswer(true)`; botão "Fácil" também `true` mas com estilo diferente; `answerCard` chama `scheduleNext` no servidor | M | Alta | ✅ Feito |
| REV-06 | Progresso ECG + contador | Como **estudante**, quero **ver barra de progresso e "X de Y"** para que **saiba onde estou** | `ProgressBar` avança a cada resposta; label "X de Y respondido"; texto "Cartão X de Y" | P | Alta | ✅ Feito |
| REV-07 | Finalização com anel + confete | Como **estudante**, quero **ver meu aproveitamento no final** para que **sinta conquista** | Tela final: anel giratório `correct/total`; `CheckIcon` acertos, `CloseIcon` erros; % aproveitamento; confete se ≥80% | M | Alta | ✅ Feito |
| REV-08 | "Revisar erros" no final | Como **estudante**, quero **refazer só o que errei** para que **fixe o conteúdo** | Botão "Revisar erros (N)" filtra `box === 0` do baralho original; reinicia sessão só com esses; desabilitado se `wrong === 0` | M | Alta | ✅ Feito |
| REV-09 | "Revisar de novo" reinicia tudo | Como **estudante**, quero **recomeçar a mesma sessão** para que **pratique mais** | Botão "Revisar de novo" chama `load()` → recarrega `deckCards`, filtra, embaralha, zera contadores | P | Média | ✅ Feito |
|| REV-10 | Navegação teclado acessível | Como **usuário**, quero **focus visível e ordem lógica** para que **use só teclado** | `tabIndex` nos botões; `focus-visible` ring rosa; `aria-label` nos ícones; ESC volta para baralho | P | Média | ✅ Feito (T-212) |

---

## Épico 7 — Kanban Autônomo (`/kanban`)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| KAN-01 | Quadro 4 colunas fixas | Como **estudante**, quero **ver TO DO → IN PROGRESS → TESTING → DONE** para que **organize meus estudos** | 4 colunas renderizadas; headers com ícones; contagem de cards por coluna | M | Média | ✅ Feito |
| KAN-02 | Drag-and-drop entre colunas | Como **estudante**, quero **arrastar cards** para que **mova de etapa** | `@dnd-kit` ou nativo; `onCardMove` chama `store.moveCard`; valida transição 1 passo (TODO→IN_PROGRESS→TESTING→DONE); rejeita saltos | G | Média | ✅ Feito |
| KAN-03 | Adicionar card em qualquer coluna | Como **estudante**, quero **criar card direto na coluna** para que **capture ideias rápido** | Botão "+" no header da coluna → `prompt()` título → `store.addCard({title, columnId})` | P | Média | ✅ Feito |
| KAN-04 | Editar card → abre `/decks/:id/edit` | Como **estudante**, quero **clicar "Editar" no card do Kanban e ir para o baralho** para que **detalhe o conteúdo** | **BUG**: `KanbanPage.tsx:53` usa `cardId` do kanban como `deckId`; deve mapear kanban card → deck relacionado ou dar erro claro | M | Alta | ✅ Feito (erro amigável) |
| KAN-05 | Persistência localStorage | Como **estudante**, quero **meu quadro salvo no navegador** para que **funcione offline** | `localStorage['opencards:kanban:cards']` atualizado a cada mudança; hidrata ao carregar página | M | Média | ✅ Feito |
| KAN-06 | Sync Supabase (best-effort) | Como **sistema**, quero **espelhar cards no Supabase quando online** para que **outros dispositivos sincronizem** | `pushRemoteCards` em `persist()`; `fetchRemoteCards` na init; falhas silenciosas; não bloqueia UI | M | Baixa | ✅ Feito |
| KAN-07 | Excluir card | Como **estudante**, quero **apagar card do Kanban** para que **limpe concluídos/errados** | Botão/ação exclui; `store.deleteCard`; remove do localStorage + Supabase | P | Média | ✅ Feito |

---

## Épico 8 — Qualidade & Testes (P2 — Gaps de Cobertura)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
|| QLT-01 | Testes `streak.ts` | Como **dev**, quero **cobertura da função `streak()`** para que **regressão de streak seja pega** | Arquivo `src/shared/lib/streak.test.ts`; casos: vazio=0, dias consecutivos, gap quebra streak, hoje conta, timezone | P | Alta | ✅ Feito (T-207) |
|| QLT-02 | Testes `exportCards.ts` | Como **dev**, quero **cobertura de export/import round-trip** para que **formato JSON não quebre** | Arquivo `src/shared/lib/exportCards.test.ts`; casos: exporta array vazio, exporta N cards, `exportCardsJson` stringifica bonito, round-trip com `parseAndValidateImport` preserva dados | P | Alta | ✅ Feito (T-208) |
|| QLT-03 | Snapshots UI atualizados | Como **dev**, quero **snapshots de `Button`, `Card`, `Input`, `Modal`, `StatusPill`, `ProgressBar`, `Select`, `Spinner`, `ErrorBoundary`** para que **regressão visual seja detectada** | `npx vitest run src/components/ui --update` passa; arquivos `.snap` commitados | M | Alta | 🟡 Pendente (Node 20+) |
|| QLT-04 | Testes integração rotas | Como **dev**, quero **teste que navega Home → Deck → Review → Edit** para que **rotas não quebrem silenciosamente** | `integration.test.tsx` expandido: cobre todas as rotas de `routes.tsx`; mocks Supabase; `MemoryRouter` | M | Média | ✅ Feito (T-210) |

---

## Épico 9 — Hardening & Dívida Técnica (P3)

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| HDN-01 | Error Boundary no App | Como **dev**, quero **capturar erros de render** para que **usuário veja tela amigável, não tela branca** | `<ErrorBoundary fallback={<ErrorFallback />}>` envolve `{routes()}`; loga erro no console; botão "Tentar novamente" recarrega | M | Alta | ✅ Feito |
| HDN-02 | CardsProvider realtime guard | Como **dev**, quero **evitar race condition do realtime** para que **estado não pisque ou sobrescreva fetch manual** | `mounted` flag no `useEffect` do realtime (igual `AuthProvider`); ignora payloads se `!mounted` | P | Alta | ✅ Feito |
| HDN-03 | `card_code` via PG function | Como **dev**, quero **gerar código sequencial no banco** para que **evite race condition em createCard** | `createCard` chama `supabase.rpc('next_card_code', {deck_id_param})` em vez de `SELECT MAX`; remove lógica client-side | P | Média | ✅ Feito |
|| HDN-04 | Contagem de cards via relacionamento | Como **dev**, quero **obter contagem via `select('..., cards(count)')`** para que **não precise coluna física e nunca fique desatualizada** | Query `getDecks`/`getDeck` usa `select('id, user_id, name, tag, created_at, cards(count)')`; tipo `Deck` tem `cards_count?: number` opcional; realtime não mantém contador manual | P | Baixa | ✅ Feito (T-215, abordagem corrigida) |
|| HDN-05 | Kanban ↔ Decks integração | Como **PO**, quero **decidir se Kanban cards vinculam a Decks** para que **arquitetura seja coerente** | Decisão documentada: (a) manter separado, (b) FK `deck_id` em `kanban_cards`; se (b), migration + tipos + UI | M | Média | ✅ Feito (Opção A: manter separado, T-214) |
|| HDN-06 | Signed URL expiração curta + refresh | Como **dev**, quero **URLs de imagem expirarem em horas, não 1 ano** para que **segurança melhore** | `uploadImage` cria signed URL 1h; componentes que exibem imagem chamam `createSignedUrl` on-demand (ou cache curto) | M | Baixa | ✅ Feito (T-216) |
|| HDN-07 | Acessibilidade formulários | Como **usuário**, quero **todos inputs com label associado** para que **leitores de tela funcionem** | Auditoria: `htmlFor`/`id` em todos `Input`, `textarea`, `select`; `aria-label` onde design não permite label visível | P | Média | ✅ Feito (T-211) |

---

## Épico 10 — Melhorias Futuras (Icebox)

| ID | Título | História | Est. | Prioridade | Status |
|----|--------|----------|------|------------|--------|
|| ICE-01 | Lazy loading rotas | Code-split `Deck`, `DeckEdit`, `Review`, `KanbanPage` com `React.lazy` + `Suspense` | M | Baixa | ✅ Feito (T-213) |
|| ICE-02 | PWA + Service Worker | Instalável, offline-first real (workbox) | G | Baixa | |
|| ICE-03 | Compartilhamento baralho | Link público read-only de um baralho | M | Baixa | |
|| ICE-04 | Cloze deletion | Tipo de card "lacuna" com marcação `{{c1::texto}}` | G | Baixa | |
|| ICE-05 | Estatísticas avançadas | Gráfico de retenção, heatmap de atividade, previsão de carga | M | Baixa | |
|| ICE-06 | Notificações locais | "Hora de revisar" via Notification API + `review_log` | M | Baixa | |

---

## Épico A — Bugs (Revisão, UX, Contraste) — Sprint 3

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| B-301 | Revisão: mostrar a pergunta primeiro, resposta só depois de virar | Como **estudante**, quero **ver só a pergunta ao abrir o card na revisão** para que **avalie depois de ver a resposta** | Todo card começa na frente (pergunta) com rótulo "Pergunta"; clique/Enter/Espaço viram para o verso; Difícil/Bom/Fácil desabilitados até virar; botão "Mostrar resposta" vira "Voltar à pergunta" após virar; próximo card começa na frente; teste automatizado cobre estado inicial, virar por clique, virar por teclado, avaliação bloqueada antes de virar | M | P0 | ✅ Feito |
| B-302 | Botão "Editar" piscando | Como **usuário**, quero **o botão Editar parar de piscar** para que **possa editar sem interrupção** | React Profiler sem renders contínuos com tela parada; causa raiz registrada em `scrum/decisoes.md`; teste que falha se renderizar mais de N vezes em 2s sem interação | M | P0 | ✅ Feito |
| B-303 | Texto espelhado no verso do card | Como **estudante**, quero **ler o verso do card sem espelhamento** para que **possa avaliar a resposta** | Frente e verso legíveis sem espelhamento em Chrome/Firefox/Safari; animação 3D funcional; `prefers-reduced-motion` respeitado (troca simples sem rotação); prévia do novo card sem faces sobrepostas/invertidas | M | P0 | ✅ Feito |
| B-304 | Títulos e textos com contraste insuficiente | Como **usuário**, quero **ler todos os textos com clareza** para que **possa usar o app em qualquer tema** | Nenhum texto abaixo de 4,5:1 (normal) ou 3:1 (grande/ícones); cores vêm dos tokens do tema (sem hex fixo); verificado nos cinco temas | M | P1 | ✅ Feito |
| B-305 | Cabeçalho da revisão sobreposto e seta duplicada | Como **estudante**, quero **ver o cabeçalho da revisão sem sobreposição** para que **possa navegar com clareza** | Botão de voltar com uma seta; título e botão sem sobreposição de 320px a desktop; um único indicador de progresso (barra + "1 de N") | M | P1 | ✅ Feito |
| B-306 | "0 diasdesde" sem espaço e sem plural | Como **usuário**, quero **ler a frase do streak corretamente** para que **entenda meu progresso** | Texto: "Hoje você já revisou" (0 dias), "1 dia desde sua última revisão", "N dias desde sua última revisão"; teste unitário da função de formatação | P | P1 | ✅ Feito |

---

## Épico B — Temas e Design System — Sprint 3

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| T-310 | Sistema de tokens de design | Como **dev**, quero **todas as cores vindas de variáveis CSS** para que **não haja cores fixas em componentes** | Cores em `:root[data-theme="..."]`; tokens: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--primary`, `--on-primary`, `--secondary`, `--on-secondary`, `--success`, `--warning`, `--danger`, `--focus-ring`; espaçamento, raio, sombra, fonte como tokens; temas antigos removidos | G | P0 | ✅ Feito |
| T-311 | Cinco novos temas | Como **usuário**, quero **escolher entre cinco temas de cor** para que **personalize o app** | Temas: rosa-menta (#F7A8B8/#98D8AA/#4A4E69), azul-laranja (#2A6F97/#FF9F1C/#F8F9FA), roxo-amarelo (#6C5CE7/#FDCB6E/#2D3436), verde-coral (#2E7D32/#FF6B6B/#EFECE6), dark-neon (#1E1B2E/#00F5D4/#2A2640); rosa-menta padrão; funciona em todas as telas; mapeamento de botões de avaliação documentado; troca sem recarregar/piscar | G | P0 | ✅ Feito |
| T-312 | Seletor de tema e migração do valor salvo | Como **usuário**, quero **escolher o tema em um menu** para que **não ocupe espaço fixo na barra** | Seletor sai da barra fixa para menu com ícone de paleta + prévia; chave `selected-theme` no localStorage guarda um dos 5 IDs; migração: valor antigo/desconhecido → `rosa-menta` sem erro; teste cobre válido, ausente e antigo | M | P1 | ✅ Feito |
| T-313 | Garantia de contraste (AA) em todos os temas | Como **usuário**, quero **ler texto com contraste suficiente em todo tema** para que **não tenha dificuldade de leitura** | Cores de texto ajustadas por tema para contraste WCAG AA (≥4.5:1 texto normal, ≥3:1 texto grande/ícones); teste automatizado em src/shared/lib/contrast.test.ts (21 testes); relatório de contraste por tema no console | M | P1 | ✅ Feito |

---

## Épico C — Refatoração de UI/UX — Sprint 3

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| U-320 | Escala de espaçamento e container centralizado | Como **dev**, quero **uma escala de espaçamento em tokens** para que **o app tenha espaçamento consistente** | Tokens --space-1 a --space-8 (4/8px) em tokens.css e tokens.ts; container .page max-width 720px, padding var(--space-8) var(--space-4), mobile margem 16px; .section --space-6 (24px entre blocos); .card/.btn/.input/.label usam tokens; alvos de toque 44px; 6 testes (spacing.test.ts) | M | P0 | ✅ Feito |
| U-321 | Cabeçalho e navegação consistentes | Como **usuário**, quero **um cabeçalho único em todas as telas** para que **navegue de forma previsível** | Header único: marca OpenCards à esquerda, botão Voltar + título, seletor de tema e menu do usuário (avatar com iniciais, nome curto, Sair) à direita; wrappers seguros para testes; aplicado em Deck, DeckEdit, Review, NewCard, Import, Kanban; 6 testes (Header.test.tsx) | M | P1 | ✅ Feito |
| U-322 | Home: formulário colapsado e card de baralho redesenhado | Como **estudante**, quero **o formulário "Novo baralho" fechado por padrão** para que **veja a lista sem rolagem desnecessária** | Botão '+ Novo baralho' abre formulário colapsado com Nome e Tag; saudação + resumo + 'Revisar agora' em bloco de destaque (card section); card de baralho com cores do tema (tag com background primário/texto onPrimary, sem branco fixo): nome, tag, total (badge), barra de progresso com rótulo; busca e filtro alinhados com tokens --space-N; estado vazio com botão de criação; Header como cabeçalho único; 2 testes (Home.test.tsx) | G | P1 | ✅ Feito |
| U-323 | Tela do baralho: hierarquia de ações | Como **estudante**, quero **ver a ação principal destacada** para que **saiba o que fazer primeiro** | Hierarquia: Revisar (primário, largura total, minHeight 56px), Adicionar cartão (secundário), Editar + Exportar JSON (terciários lado a lado); espaço claro entre título, stats e ações usando tokens --space-N; lista de cartões com pergunta + prévia resposta (texto secundário itálico), editar/excluir por item; Header com Voltar para Baralhos; cores do tema sem valores fixos | M | P1 | ✅ Feito |
| U-324 | Layout da tela de revisão | Como **estudante**, quero **a tela de revisão clara e sem sobreposição** para que **possa estudar com foco** | Cabeçalho com "Voltar", título e contador "1 de N" lado a lado sem sobreposição; card grande centralizado (min-height 320px) com scroll interno para cartões longos; botões de avaliação mostram próximo intervalo (<1 dia, 3 dias, 7 dias) abaixo; dica de teclado coerente (Espaço/Enter virar, setas acertam/erram, Esc sair); cores do tema sem valores fixos | M | P1 | ✅ Feito |
| U-325 | Formulário de novo card | Como **estudante**, quero **criar um card com formulário centralizado** para que **possa digitar respostas longas** | Formulário centralizado (max-width 720px); Pergunta e Resposta em textarea com altura que cresce + contador de caracteres; prévia do card com alternância Frente/Verso (não ambas ao mesmo tempo); botões Salvar card (primário), Salvar e criar outro (secundário), Cancelar (texto); primário desabilitado só se faltar Pergunta ou Resposta; 7 testes (NewCard.test.tsx) | G | P1 | ✅ Feito |
| U-326 | Mobile first | Como **usuário**, quero **usar o app no celular** para que **possa estudar em qualquer lugar** | Media queries @media (max-width: 360px) — .page/.header padding reduzido, btn/input min-height 48px, flashcard-face max-height 280px, html/body overflow-x hidden (sem rolagem horizontal), inputs max-width 100%, btn-primary largura total; Review com classe review-actions (botões de avaliação em coluna, alcance do polegar); 2 arquivos CSS/TSX alterados | M | P1 | ✅ Feito |

---

## Épico D — Melhorias adicionais — Sprint 3

| ID | Título | História | Critérios de Aceite | Est. | Prioridade | Status |
|----|--------|----------|---------------------|------|------------|--------|
| M-330 | Atalhos de teclado na revisão | Como **estudante**, quero **usar atalhos de teclado na revisão** para que **estude mais rápido** | Espaço/Enter: virar; 1=Difícil, 2=Bom, 3=Fácil (só depois de virar); Esc: voltar ao baralho; dica atualizada e escondida em telas sensíveis ao toque | M | P2 | ⬜ Pendente |
| M-331 | Resumo ao fim da sessão de revisão | Como **estudante**, quero **ver um resumo ao concluir** para que **saiba meu aproveitamento** | Mostrar cards revisados, distribuição Difícil/Bom/Fácil, próxima revisão; botões "Voltar aos baralhos" e "Revisar de novo os difíceis" | M | P2 | ⬜ Pendente |
| M-332 | Desfazer última avaliação | Como **estudante**, quero **desfazer a última avaliação** para que **corrija um engano** | Aviso temporário "Avaliado como X. Desfazer" por alguns segundos; restaura card e agendamento anteriores | M | P2 | ⬜ Pendente |
| M-333 | Confirmação ao excluir, estados vazios, carregamento e avisos | Como **usuário**, quero **confirmação antes de excluir** para que **não apague por engano** | Excluir cartão/baralho pede confirmação em diálogo com nome do item + desfazer por alguns segundos; estados vazios e carregamento (esqueletos) em Home, baralho, revisão; erros mostram mensagem clara + "Tentar de novo"; toasts para criado/salvo/importado/erro de rede | M | P2 | ⬜ Pendente |
| M-334 | Acessibilidade (foco, rótulos, movimento reduzido) | Como **usuário**, quero **navegar com teclado e leitor de tela** para que **possa usar o app sem mouse** | Foco visível em todos os controles; ordem de tabulação lógica; `aria-live` anuncia resposta ao virar; rótulos em todos campos e botões de ícone; `prefers-reduced-motion` respeitado em animações | M | P2 | ⬜ Pendente |
| M-335 | Testes E2E com Playwright | Como **equipe**, quero **testes E2E cobrindo fluxos críticos** para que **tenha confiança no deploy** | Cobrir: login, criar baralho, abrir baralho, criar card, revisão (frente → virar → avaliar), importar JSON, troca de tema (persistido), viewport mobile; usuário de teste via `TEST_EMAIL` e `TEST_PASSWORD` | G | P2 | ⬜ Pendente |

---

## Legenda
- **Estimativa**: P = Pequeno (≤ 2h), M = Médio (2h–1 dia), G = Grande (> 1 dia)
- **Prioridade**: Crítica (bloqueia tudo), Alta (core value), Média (qualidade), Baixa (nice-to-have), Icebox (futuro)
- **Status**: 🔴 Bloqueado/Bug, ⬜ Pendente, 🟡 Em andamento, ✅ Feito

---

## Dúvidas Abertas para o Orquestrador
1. **Kanban ↔ Decks**: O Kanban deve ser independente (gestão de tarefas gerais) ou cards do Kanban representam baralhos/cartões de estudo? (HDN-05)
2. **Modo "Revisar agora" na Home**: Deve ir para o baralho com **mais pendentes** ou **primeiro da lista filtrada**? Atual pega `filteredDecks[0]`.
3. **Imagens**: Manter signed URL de 1 ano ou migrar para expiração curta + refresh on-demand? (HDN-06)
4. **Node 20 no CI**: GitHub Actions usa `actions/setup-node@v4` com `node-version: '20'` — confirmar se runners têm Node 20 pré-instalado.
