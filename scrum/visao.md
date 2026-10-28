# Visão do Produto — OpenCards (Flashcards de Medicina)

## Resumo
App web de flashcards para estudo de medicina, com repetição espaçada (Leitner), revisão por modos, importação/exportação JSON, quadro Kanban para organização de estudos, tema clínico rosa/escuro, hospedado na Vercel com backend Supabase (auth, database, storage, realtime).

## Público-Alvo
- Estudantes de medicina (Brasil) que usam flashcards para memorização ativa
- Preferem interface em português, atalhos de teclado, feedback visual imediato

## Funcionalidades Core (MVP + Fase 2)
1. **Autenticação** — Login/cadastro email+senha, sessão persistente, logout
2. **Home (Lista de Baralhos)** — Busca por nome, filtro por tag, badge "pendentes hoje", streak de dias consecutivos, botão "Revisar agora"
3. **Tela do Baralho** — Stats (total, dominados, pendentes, accuracy), barra ECG, ações: Revisar / Editar / Exportar JSON / Importar JSON / Adicionar cartão
4. **Edição de Baralho** — Renomear/tag, CRUD de cartões (frente/verso + imagens), importação JSON validada, exclusão
5. **Revisão (Leitner 6 caixas)** — Modos: Pendentes hoje / Todos / Só erros; flip 3D (Espaço/Enter), avaliação (← errei / → acertei / Fácil), progresso ECG, anel de acertos, confete ≥80%, "Revisar erros"
6. **Exportar/Importar JSON** — Round-trip perfeito (card_code → id, front_text → question, back_text → answer)
7. **Kanban Autônomo** — TO DO → IN PROGRESS → TESTING → DONE (um passo por vez), drag-and-drop, persistência localStorage + sync Supabase best-effort
8. **Temas** — Light/dark automático + 10 temas de cor, persistência localStorage

## Requisitos Não Funcionais
- **Stack**: Vite + React 18 + TS, react-router-dom, @supabase/supabase-js, CSS puro com tokens (sem Tailwind/UI kit)
- **Qualidade**: TypeScript strict, ESLint, Prettier, Vitest + RTL (cobertura 80%), snapshots de regressão visual
- **Segurança**: Só anon key no frontend, RLS em todas as tabelas, service-role key nunca no cliente
- **Performance**: Código morto removido, lazy loading de rotas (futuro), imagens via signed URLs
- **Acessibilidade**: Labels em inputs, focus visible, touch targets 44px, prefers-reduced-motion

## Fora de Escopo (Explícito)
- Compartilhamento de baralhos entre usuários
- Cloze deletion / LaTeX / rich text
- Notificações push/email
- App mobile nativo (PWA futuro)
- Backend próprio (só Supabase)

## Restrições Técnicas
- Node 20+ (vitest 5 + rolldown)
- Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Migrations SQL versionadas em `supabase/migrations/`
- Commits pequenos, mensagens em inglês (conventional commits)