# Sprint 5 — Paridade com o Design (PARTE 1 de scrum/sprint-5.md)

**Objetivo**: Deixar a interface com paridade visual e de comportamento com o design descrito em `scrum/sprint-5.md` (PARTE 1). Não é inspiração: é paridade.
**Período**: 5 dias úteis
**Início**: 2026-10-30
**Time**: 1 área (Frontend) — instância `scrum-dev-frontend`
**Regra de precedência**: PARTE 1 é a única fonte da verdade do design. Imagens em docs/design/ são apoio visual; em conflito, vale a spec escrita.

---

## Histórias Selecionadas

| ID | História | Est. | Prioridade | Depende de |
|----|----------|------|------------|------------|
| S5-01 | Tokens de cor por papel (5 temas) | G | Crítica | — (bloqueia o resto) |
| S5-02 | Fonte Figtree e tipografia | M | Alta | S5-01 |
| S5-03 | Componentes base (botões, campo, chips, progresso, ícones) | G | Alta | S5-01 |
| S5-04 | Layout compartilhado com cabeçalho único | G | Alta | S5-01 |
| S5-05 | Barra de baixo mobile/tablet | M | Alta | S5-01, S5-04 |
| S5-06 | Menus de tema e conta | M | Alta | S5-01, S5-04 |
| S5-07 | Entrar (desktop) | M | Alta | S5-01, S5-02, S5-03, S5-04 |

**Nota de escopo**: 7 histórias selecionadas (acima de 5 por ser redesenho completo). Todas cabem pois são de interface pura e compartilham a mesma base (tokens → componentes → layout → telas). Se o ORQUESTRADOR considerar que não cabe, corte por esta prioridade: S5-01 (sempre primeiro) → S5-03 → S5-05 → S5-02.

---

## Tarefas Técnicas (Breakdown)

### Área: Frontend (Instância: `scrum-dev-frontend`)

| T-ID | Título | História | Critérios de Aceite | Status | Dependências |
|------|--------|----------|---------------------|--------|--------------|
| T-S5-01-01 | Definir papéis de cor em tokens.css e tokens.ts | S5-01 | `tokens.css` e `tokens.ts` definem papéis: fundo, superfície, superfície 2, texto, texto suave, borda, ação principal, texto sobre ação, destaque, progresso, avatar, sucesso, aviso, erro (seção 2, 6 PARTE 1). Cores do usuário: principal #F7A8B8, secundária #98D8AA, terciária #4A4E69. | ✅ done | — |
| T-S5-01-02 | Criar color-themes.css com 5 temas definindo todos os papéis | S5-01 | Cada tema (rosa-menta, azul-laranja, roxo-amarelo, verde-coral, dark-neon) define todos os papéis de cor. Nenhum hex solto em componente (seção 13). Contraste mínimo 4,5:1 texto normal e 3:1 texto grande/ícones em todos os 5 temas (seção 2, 6). | ✅ done | T-S5-01-01 |
| T-S5-01-03 | Teste automático de contraste por tema em Vitest | S5-01 | Teste Vitest itera os 5 temas, aplica `data-theme` no `<html>`, mede razões de contraste texto/fundo e texto/ação principal. Falha se abaixo de 4,5:1 (normal) ou 3:1 (grande/ícones). Verificado em 375, 768 e 1280 px (seção 13). | ✅ done | T-S5-01-02 |
| T-S5-01-04 | Remover hex soltos de componentes existentes | S5-01 | Componentes existentes consomem apenas variáveis CSS de papel (--role-*). Nenhum hex hardcoded em src/components ou src/features. | ✅ done | T-S5-01-03 |
| T-S5-02-01 | Empacotar Figtree via @font-face local | S5-02 | Fonte Figtree empacotada no projeto (src/fonts/figtree/*.woff2). Declaração @font-face em src/styles/index.css ou tokens.css. Fallback para fonte do sistema (Georgia/Inter). (seção 3) | ✅ done | — |
| T-S5-02-02 | Definir estilos tipográficos em CSS | S5-02 | Estilos: Display 40/48 800, Título 32/40 700, Seção 24/32 700, Subtítulo 18/26 700, Corpo 16/24 500, Pequeno 14/20 500, Legenda 12/16 600 caixa alta, Cartão 28/36 600. (seção 3) | ✅ done | T-S5-02-01 |
| T-S5-02-03 | Aplicar tipografia via tokens, nenhum tamanho fixo em componente | S5-02 | Componentes usam variáveis CSS de tipografia. Nenhum tamanho de fonte fixo (px/rem hardcoded) em componente. (seção 13) | ✅ done | T-S5-02-02 |
| T-S5-03-01 | Botões primário/secundário/fantasma/excluir | S5-03 | Botão Primário rosa #F7A8B8 com texto #33364D. Secundário: contorno. Fantasma: texto em rosa. Excluir: fundo perigo suave com texto perigo; versão sólida na confirmação. (seção 7) | ✅ done | T-S5-01-02, T-S5-02-03 |
| T-S5-03-02 | Campo com rótulo/placeholder/ajuda/erro/foco | S5-03 | Campo: rótulo acima, placeholder, texto de ajuda abaixo. Estado de erro com borda perigo + ícone + mensagem. Foco com contorno de 2 px (grafite). (seção 7) | ✅ done | T-S5-01-02, T-S5-02-03 |
| T-S5-03-03 | Chips (tag, N para hoje, Dominado, Aprendendo, Novo, Em dia) | S5-03 | Chips: tag (Anatomia, Clínica, Básico, Geral), "N para hoje" (rosa), Dominado (verde), Aprendendo/Em aprendizado (amarelo), Novo (amarelo ou rosa), Em dia (verde). (seção 7) | ⬜ TODO | T-S5-01-02 |
| T-S5-03-04 | Barra de progresso | S5-03 | Barra de progresso: verde sobre rosa claro, com rótulo "N% dominado". (seção 7) | ⬜ TODO | T-S5-01-02 |
| T-S5-03-05 | Ícones Lucide 20px traço 1.75 | S5-03 | Conjunto único de ícones de linha (Lucide), 20 px, traço 1,75, cor herdada. Necessários: camadas, relógio, chama, busca, olho, upload, download, lápis, lixeira, chevron, voltar, X, mais, paleta, sair, quadro de tarefas, atualizar, check, alerta, calendário. (seção 7) | ⬜ TODO | T-S5-01-02 |
| T-S5-03-06 | Alvos de toque ≥ 44×44 px | S5-03 | Todos os botões, inputs e itens clicáveis têm alvo de toque mínimo 44×44 px. (seção 4) | ⬜ TODO | T-S5-01-02 |
| T-S5-04-01 | Cabeçalho único em App.tsx, páginas não renderizam próprio cabeçalho | S5-04 | Cabeçalho único em layout compartilhado. Páginas não renderizam próprio cabeçalho. `getAllByRole('banner')` retorna exatamente 1 elemento por rota. (seção 8) | ⬜ TODO | T-S5-01-02, T-S5-03-01 |
| T-S5-04-02 | Logo + "OpenCards" peso 700 | S5-04 | Logo: dois quadrados arredondados sobrepostos, frente rosa e trás menta, deslocados. Ao lado, "OpenCards" em peso 700. (seção 7) | ⬜ TODO | T-S5-04-01 |
| T-S5-04-03 | Navegação desktop Baralhos/Revisar/Tarefas + botão tema + avatar | S5-04 | Desktop: cabeçalho branco (Superfície), 64 px, borda inferior fina, conteúdo limitado a 1200 px. Logo + abas Baralhos/Revisar/Tarefas (aba ativa com fundo Superfície 2, texto rosa para texto, raio 12) + botão de tema (quadrado 40x40, borda fina, ícone paleta) + avatar circular 40 px com inicial e menu. (seção 8, breakpoint 1024px+) | ⬜ TODO | T-S5-04-01 |
| T-S5-04-04 | Verificar único cabeçalho por rota | S5-04 | Teste automatizado: `getAllByRole('banner')` retorna exatamente 1 elemento por rota pública e protegida. (seção 8) | ⬜ TODO | T-S5-04-01 |
| T-S5-05-01 | Barra de baixo com Baralhos/Revisar/Tarefas + "+" rosa central | S5-05 | Celular/tablet: barra de cima (voltar + título + avatar) e barra de baixo (Baralhos, Revisar, Tarefas) com botão "+" rosa no centro. Ação de criar do contexto (novo baralho em Baralhos; novo cartão dentro de um baralho). (seção 8, breakpoint até 1023px; seção 11 C1) | ⬜ TODO | T-S5-04-01 |
| T-S5-05-02 | Barra de baixo some na revisão e no desktop | S5-05 | Barra de baixo não aparece na tela de revisão e não aparece em desktop (1024px+). (seção 8) | ⬜ TODO | T-S5-05-01 |
| T-S5-06-01 | Seletor de tema com rótulo TEMA, 5 opções com 3 bolinhas, check ativa | S5-06 | Menu do tema: rótulo TEMA, 5 opções com 3 bolinhas de cor cada e check na opção ativa. (seção 8) | ⬜ TODO | T-S5-01-02, T-S5-04-03 |
| T-S5-06-02 | Menu da conta (avatar, nome, e-mail, linha divisória, Sair) | S5-06 | Menu da conta: avatar, [nome da pessoa], e-mail, linha divisória, "Sair" em cor de alerta. "Sair" existe só aqui. (seção 8) | ⬜ TODO | T-S5-04-03 |
| T-S5-06-03 | Esc fecha menus, foco volta ao botão que abriu | S5-06 | Teclado: Esc fecha os menus (tema e conta) e o foco volta ao botão que os abriu. Tudo funciona por teclado. (seção 8) | ⬜ TODO | T-S5-06-01, T-S5-06-02 |
| T-S5-06-04 | Migração localStorage de tema salvo | S5-06 | Preferência de tema salva pelo usuário migra sem perda. Valor antigo/desconhecido → rosa-menta (padrão D5). Chave localStorage: selected-theme. Migração ocorre ao montar o App. (seção 6, decisão D5) | ⬜ TODO | T-S5-01-02 |
| T-S5-07-01 | Painel dividido 50/50 desktop (login) | S5-07 | Desktop: painel dividido 50/50. Esquerda fundo Principal com logo, frase e dois cartões decorativos (pergunta/resposta, resposta em menta). Direita fundo Fundo com formulário max-width 432 px centralizado na vertical. (seção 9.1, breakpoint 1280px) | ⬜ TODO | T-S5-01-02, T-S5-02-03, T-S5-03-01 |
| T-S5-07-02 | Controle segmentado Entrar | Criar conta | S5-07 | Controle segmentado Entrar | Criar conta (fundo Superfície 2, aba ativa branca). (seção 9.1) | ⬜ TODO | T-S5-07-01 |
| T-S5-07-03 | Campos E-mail e Senha com ícone olho, link "Esqueci minha senha" | S5-07 | Título "Bem-vinda de volta". Campo E-mail (placeholder nome@email.com). Campo Senha (placeholder "Sua senha", ícone de olho, link "Esqueci minha senha" à direita do rótulo). (seção 9.1) | ⬜ TODO | T-S5-07-02 |
| T-S5-07-04 | Botão Entrar, estados erro e carregando | S5-07 | Botão Entrar. Estado erro: faixa perigo suave com ícone ("E-mail ou senha incorretos. Confira e tente de novo."). Estado carregando: spinner + "Entrando…" + botão desabilitado. (seção 9.1) | ⬜ TODO | T-S5-07-03 |
| T-S5-07-05 | Já logado → /login redireciona para / | S5-07 | Usuário já logado que abre /login é redirecionado para Home (/). (seção 9.1 / visão) | ⬜ TODO | T-S5-07-04 |

---

## Quadro Kanban

```
TODO                          DOING                        REVIEW                      DONE
│                            │                            │                           ├─ T-S5-01-01  Papéis de cor tokens
│                            │                            │                           ├─ T-S5-01-02  color-themes 5 temas
│                            │                            │                           ├─ T-S5-01-03  Teste contraste Vitest
│                            │                            │                           ├─ T-S5-01-04  Remover hex soltos
│                            │                            │                           ├─ T-S5-02-01  Figtree @font-face
│                            │                            │                           ├─ T-S5-02-02  Estilos tipográficos CSS
│                            │                            │                           ├─ T-S5-02-03  Tipografia via tokens
│                            │                            │                           ├─ T-S5-03-01  Botões prim/sec/fant/excluir
│                            │                            │                           ├─ T-S5-03-02  Campo rótulo/ajuda/erro/foco
│                            │                            │                           ├─ T-S5-03-03  Chips
│                            │                            │                           ├─ T-S5-03-04  Barra de progresso
│                            │                            │                           ├─ T-S5-03-05  Ícones Lucide 20px
│                            │                            │                           ├─ T-S5-03-06  Alvos toque 44px
│                            │                            │                           ├─ T-S5-04-01  Cabeçalho único App.tsx
│                            │                            │                           ├─ T-S5-04-02  Logo + OpenCards
│                            │                            │                           ├─ T-S5-04-03  Navegação desktop
│                            │                            │                           ├─ T-S5-04-04  Único banner por rota
│                            │                            │                           ├─ T-S5-05-01  Barra de baixo mobile
│                            │                            │                           ├─ T-S5-05-02  Barra some revisão/desktop
│                            │                            │                           ├─ T-S5-06-01  Seletor tema TEMA
│                            │                            │                           ├─ T-S5-06-02  Menu conta avatar
│                            │                            │                           ├─ T-S5-06-03  Esc fecha menus
│                            │                            │                           ├─ T-S5-06-04  Migração tema localStorage
│                            │                            │                           ├─ T-S5-07-01  Painel 50/50 login
│                            │                            │                           ├─ T-S5-07-02  Controle segmentado
│                            │                            │                           ├─ T-S5-07-03  Campos E-mail/Senha
│                            │                            │                           ├─ T-S5-07-04  Botão Entrar estados
│                            │                            │                           └─ T-S5-07-05  Redirect se logado
```

---

## Atribuição de Agentes

| Área | Agente (scrum-dev) | Tarefas |
|------|---------------------|---------|
| **Frontend** | `scrum-dev-frontend` | T-S5-01-01 a T-S5-07-05 (todas as 24 tarefas) |

> Todas as histórias S5-01 a S5-07 são de interface pura (frontend). Não há backend/dados nem automação/infra nesta sprint — não se alteram regras de negócio, apenas a interface e os dados que ela precisa exibir.

---

## Definição de Pronto (DoD) da Sprint

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run build` passa
- [ ] `npx vitest run` passa (incluindo teste de contraste por tema)
- [ ] Textos, rótulos, pesos, tamanhos, espaçamentos, raios e estados batem com a spec (seção 13 PARTE 1)
- [ ] Só tokens e papéis de cor; nenhum hex solto em componente (seção 13)
- [ ] Verificado em 375, 768 e 1280 px, nos 5 temas (seção 13)
- [ ] Contraste ≥ 4,5:1 em todo texto (teste automático por tema) (seção 13)
- [ ] Teclado completo: Tab, Esc devolve o foco, Espaço e 1 a 5 na revisão (seção 13)
- [ ] Alvos de toque ≥ 44 px; um único cabeçalho por tela (seção 13)
- [ ] Nenhuma função existente quebrada (criar, editar, excluir, revisar, importar, tarefas, tema salvo)
- [ ] Commits pequenos, conventional commits, mensagens em inglês

---

## Impedimentos Conhecidos

| ID | Descrição | Ação |
|----|-----------|------|
| IMP-01 | Node 20+ para snapshots/testes locais | Node 22.12.0 em /tmp; exportar PATH antes de cada comando npm/npx |
| IMP-02 | Redesenho completo em uma sprint | 7 histórias com 3 Grandes; se não couber, cortar por prioridade: S5-01 → S5-03 → S5-05 → S5-02 |
| IMP-03 | Figtree fonte não disponível | Fallback para fonte do sistema (Georgia/Inter) |

---

## Daily Log Template (scrum/daily/AAAA-MM-DD.md)

```markdown
# Daily 2026-10-XX

## scrum-dev-frontend
- Feito: ...
- Fazendo: ...
- Bloqueadores: ...

## Impedimentos Novos
- ...

## Decisões do Dia
- ...
```
