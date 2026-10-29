PARTE 1: Especificação de design (fonte da verdade)

Direção visual: calma clínica. Telas leves, muito espaço entre os elementos e uma única ação principal por tela. Os dados citados (Cardiologia, 48 cartões, João etc.) são exemplos, nunca texto fixo.

Regra de precedência: esta spec é a única fonte da verdade do design. Se existir PDF ou imagens em docs/design/, servem só de apoio visual; em conflito, vale esta spec.

1. Princípios
Uma ação principal por tela. O botão rosa é sempre o próximo passo (Revisar, Salvar, Entrar).
Espaço de sobra. Grade de 8 px; no mínimo 24 px entre blocos e 12 px entre itens.
Legível em qualquer tema. Todo texto com contraste mínimo 4,5:1 nos cinco temas.
Celular e tablet primeiro, desktop próprio. No desktop o layout muda (colunas e navegação no topo), não só estica.
2. Tokens do tema padrão (Rosa Suave & Menta, slug rosa-menta)
Papel	Hex	Observação
Principal	#F7A8B8	cor indicada pelo usuário
Secundária	#98D8AA	cor indicada pelo usuário
Terciária (texto)	#4A4E69	cor indicada pelo usuário
Fundo	#FFF7F9	
Superfície	#FFFFFF	
Superfície 2	#FDEEF2	
Texto suave	#666A86	5,0:1 no fundo
Rosa para texto	#B03A66	5,5:1 no fundo
Sobre o rosa	#33364D	texto de botões rosa, 6,3:1
Perigo	#B3261E	6,5:1 no branco
Sucesso (texto)	#1F6B3A	5,8:1 no verde claro
Aviso (texto)	#8A5A00	5,4:1 no amarelo claro

Regras de acessibilidade: 
#4A4E69 sobre #F7A8B8 dá 4,35:1 (reprova), então botões rosa usam #33364D. O rosa claro nunca é cor de texto sobre fundo claro.

3. Tipografia: Figtree (empacotar a fonte no projeto)
Estilo	Tamanho/linha	Peso	Exemplo
Display	40/48	800	Bem-vinda de volta
Título	32/40	700	Cardiologia
Seção	24/32	700	Revisão do dia
Subtítulo	18/26	700	Novo baralho
Corpo	16/24	500	Pergunta ou resposta do cartão
Pequeno	14/20	500	12 cartões · revisado hoje
Legenda	12/16	600, caixa alta	PARA HOJE
Cartão	28/36	600	texto do flashcard na revisão
4. Espaçamento e forma
Escala: 4, 8, 12, 16, 24, 32, 48, 64.
Raios: campos 8, botões 12, cartões 20, chips 999.
Alvos de toque de no mínimo 44 x 44 px.
Sombras só em menus e janelas; cartões usam borda fina.
Foco: contorno grafite de 2 px com 2 px de distância.
5. Breakpoints
Celular, até 767 px: 1 coluna, barra de navegação embaixo, botões principais com largura total.
Tablet, 768 a 1023 px: 2 colunas de baralhos, barra embaixo mantida, formulários mais largos e centralizados.
Desktop, 1024 px em diante: navegação no cabeçalho, grade de 3 colunas, duas colunas no baralho e no novo cartão, largura máxima de 1200 px.
6. Temas

Mesmo layout, só mudam as cores. A tela usa apenas papéis de cor: fundo, superfície, superfície 2, texto, texto suave, borda, ação principal, texto sobre ação, destaque (chips "N para hoje"), progresso, avatar, sucesso, aviso, erro. Cada tema define esses papéis; componentes só consomem papéis, então trocar de tema não mexe em componente. As cores indicadas pelo usuário entram como principal, secundária e terciária; o restante é derivado e checado.

Temas e slugs: Rosa Suave & Menta (rosa-menta, padrão), Azul Foco & Laranja Estudo (azul-laranja), Roxo Criativo & Amarelo Sol (roxo-amarelo), Verde Concentração & Coral (verde-coral), Dark Mode Neon (dark-neon).

Valores iniciais dos temas não padrão (ajustar por teste até atingir os contrastes declarados; nenhum valor é fixo se reprovar):

azul-laranja: ação principal laranja #FF9F1C com texto escuro #1B2A3A; progresso e avatar azul #2A6F97; destaque laranja; fundo #EAF0F6; superfície #F6F8FB; texto #1B2A3A; texto suave #4F6272.
roxo-amarelo: ação principal roxo #6C5CE7 com texto branco; progresso roxo; destaque e avatar amarelo #FDCB6E com texto #2D3436; fundo #F6F4FF; superfície #FFFFFF; texto #2D3436; texto suave #5E6470.
verde-coral: ação principal verde #2E7D32 com texto branco; progresso e destaque verde; botão/estado "Errei" em coral #FF6B6B com texto escurecido até 6,3:1; fundo #F4F4EF; superfície 2 #ECEAE2; texto #23302A; verde de texto #256B29.
dark-neon: fundo #1F1B2E; superfície #2A2640; ação principal, progresso, destaque e avatar neon #00F5D4 com texto #1F1B2E; texto #F2F0FF; texto suave #B4B0CC; "Errei" em vinho escuro com texto rosa claro.

Contrastes declarados que os testes devem garantir (mínimo absoluto 4,5:1 em qualquer texto):

Tema	Texto no fundo	Texto sobre ação principal	Outros
rosa-menta	7,7	escuro no rosa 6,3	escuro no menta 7,2; texto suave 5,0
azul-laranja	12,9	escuro no laranja 7,2	branco no azul 5,5; texto suave 4,8
roxo-amarelo	11,7	branco no roxo 4,9	escuro no amarelo 8,4; texto suave 5,5
verde-coral	12,3	branco no verde 5,1	escuro no coral 6,3; verde de texto #256B29 5,5
dark-neon	14,3	escuro no neon 12,0	neon no fundo 12,0; texto suave 7,1

Texto branco só aparece sobre azul, roxo e verde. Preferência de tema já salva pelo usuário deve migrar sem perda. Tema inicial para quem nunca escolheu: rosa-menta.

7. Componentes base
Botões: Primário (rosa, texto #33364D), Secundário (contorno), Fantasma (texto em rosa para texto), Excluir (fundo perigo suave com texto perigo; versão sólida na confirmação).
Campo: rótulo acima, placeholder, texto de ajuda abaixo, estado de erro com borda perigo + ícone + mensagem, foco com contorno de 2 px.
Chips: tag (Anatomia, Clínica, Básico, Geral), "N para hoje" (rosa), Dominado (verde), Aprendendo/Em aprendizado (amarelo), Novo (amarelo ou rosa), Em dia (verde).
Barra de progresso: verde sobre rosa claro, com rótulo "N% dominado".
Estados: foco, desabilitado, carregando (spinner + texto, ex.: "Entrando…", botão desabilitado), erro.
Ícones: um único conjunto de ícones de linha (ex.: Lucide), 20 px, traço 1,75, cor herdada. Necessários: camadas, relógio, chama, busca, olho, upload, download, lápis, lixeira, chevron, voltar, X, mais, paleta, sair, quadro de tarefas, atualizar, check, alerta, calendário.
Logo: dois quadrados arredondados sobrepostos, o da frente rosa e o de trás menta, deslocados; no painel rosa do login o da frente é branco. Ao lado, "OpenCards" em peso 700.
8. Cabeçalho e navegação
Um único cabeçalho por tela, feito no layout compartilhado; as páginas não desenham o seu.
Desktop: cabeçalho branco (Superfície), 64 px, borda inferior fina, conteúdo limitado a 1200 px. Logo + abas Baralhos, Revisar, Tarefas (aba ativa com fundo Superfície 2, texto rosa para texto, raio 12) + botão de tema (quadrado 40x40, borda fina, ícone paleta) + avatar circular 40 px com a inicial e menu.
Seletor de tema (menu): rótulo TEMA, 5 opções com 3 bolinhas de cor cada e check na ativa.
Menu da conta: avatar, [nome da pessoa], e-mail, linha divisória, "Sair" em cor de alerta. "Sair" existe só aqui.
Teclado: Esc fecha os menus e o foco volta ao botão que os abriu. Tudo funciona por teclado.
Voltar (‹): só nas telas internas (baralho, edição, revisão, novo cartão, importação).
Título da tela: no desktop fica no corpo da página; no celular vai para a barra de cima.
Celular e tablet: barra de cima (voltar + título + avatar) e barra de baixo (Baralhos, Revisar, Tarefas) com botão "+" rosa no centro, ação de criar do contexto. A barra de baixo some na revisão e no desktop. O menu da conta no celular é um painel inferior com nome, e-mail, TEMA (cartões de 2 linhas, rolagem horizontal) e "Sair".
Tema e conta ficam atrás do avatar: a tela não tem barra extra só para tema nem botão solto de sair.
9. Telas
9.1 Entrar (desktop)

Painel dividido 50/50. Esquerda, fundo Principal: logo; frase "Seus baralhos e sua rotina de revisão, num só lugar."; subtítulo "Crie cartões de pergunta e resposta e revise na hora certa."; dois cartões decorativos inclinados, Pergunta ("Qual é o marca-passo natural do coração?") e Resposta ("O nó sinoatrial."), este em menta. Direita, fundo Fundo, formulário com largura máxima 432 px centralizado na vertical: controle segmentado Entrar | Criar conta (fundo Superfície 2, aba ativa branca); título "Bem-vinda de volta"; "Entre com seu e-mail e sua senha para continuar estudando."; E-mail (placeholder nome@email.com); Senha (placeholder "Sua senha", ícone de olho, link "Esqueci minha senha" à direita do rótulo); botão Entrar. Estados: erro em faixa perigo suave com ícone ("E-mail ou senha incorretos. Confira e tente de novo."); carregando com spinner ("Entrando…") e botão desabilitado. O rótulo "ESTADOS DO FORMULÁRIO" é só anotação do design e não vai para a UI.

9.2 Criar conta (desktop)

Esquerda: "Comece em três passos." com 3 itens numerados em cartões brancos (1 Crie sua conta; 2 Monte um baralho e adicione cartões; 3 Revise um pouco todo dia). Direita: abas, título "Criar conta", "Leva menos de um minuto.", campos Nome (placeholder "Como quer ser chamada"), E-mail, Senha (olho; ajuda "Pelo menos 8 caracteres."), Confirmar senha (erro: borda perigo + ícone + "As senhas não são iguais."), botão Criar conta, "Já tem conta? Entrar". Sem CPF e telefone na UI.

9.3 Baralhos (home, desktop)

Faixa superior em 2 colunas. Esquerda: data por extenso (ex.: "Quarta-feira, 28 de outubro"), saudação em Display ("Bem-vinda de volta", com o nome quando existir), chips "N dias seguidos" (ícone chama, rosa) e "Última revisão: ontem". Direita: cartão rosa de ~370 px, raio 20: "PARA HOJE", "N cartões" grande, "em N baralhos", botão escuro "Revisar agora →". Abaixo: busca "Buscar por nome ou tag" ocupando a largura restante, filtros (Todos ativo em grafite, Básico, Clínica) e botão secundário "+ Novo baralho". Título "Seus baralhos" com contador "N baralhos". Grade de 3 colunas, espaço de 24 px. Cartão de baralho (padding 24): ícone de camadas em quadrado 40 px raio 12 fundo Superfície 2; nome; chip de tag + "N cartões"; barra de progresso + "N% dominado"; chip "N para hoje" (rosa) ou "Em dia" (verde) ou "Novo" (amarelo, com "Ainda sem revisões" no lugar do progresso); link "Abrir" à direita. Último item da grade: cartão tracejado com "+" e "Novo baralho".

9.4 Baralho (detalhe, desktop)

"‹ Baralhos"; título + chip de tag. Coluna esquerda ~320 px: painel com 4 números (cartões; dominados em verde; para hoje em rosa; taxa de acerto em %) e barra "N de N dominados"; botões empilhados: "Revisar N cartões →" (primário), "+ Adicionar cartão" (secundário), "Importar JSON" (secundário), "Editar baralho" (fantasma com lápis). Coluna direita: "Cartões (N)", busca "Buscar nos cartões", filtros Todos / Para hoje / Novos / Dominados; lista em um cartão: cada linha tem "#n", pergunta em negrito, resposta em 1 linha truncada com reticências, chip de estado (Dominado, Aprendendo, Novo) com a próxima revisão embaixo ("em 12 dias", "amanhã", "hoje") e menu "…". Rodapé: "Mostrando N de N" e botão "Carregar mais".

9.5 Editar baralho (desktop)

"‹ nome do baralho"; título "Editar baralho". Esquerda ~320 px: card "Dados do baralho" (Nome; Tag opcional com chips sugeridos Básico e Clínica; botão "Salvar alterações" primário; "Cancelar") e card "Excluir baralho" ("Apaga o baralho e seus N cartões. Não dá para desfazer." + botão Excluir baralho em perigo suave). Direita: "Cartões (N)" + botão "Adicionar cartão"; lista com "#n", pergunta, resposta truncada, ícones lápis e lixeira. Edição inline expande a linha: "Editando cartão #N", campos Pergunta e Resposta (textarea, foco com borda grafite 2 px), botões "Salvar cartão" e "Cancelar". Exclusão de cartão: faixa perigo suave dentro da lista, "Excluir o cartão #N?", texto da pergunta entre aspas, "Não dá para desfazer.", botões Cancelar e Excluir (sólido). Rodapé "Mostrando N de N" + "Carregar mais".

9.6 Revisar (desktop e celular)

Desktop: aba Revisar ativa; "‹ baralho" à esquerda e "N de N" à direita; barra de progresso; coluna central de ~720 px; cartão raio 20-28 com padding 48: legenda PERGUNTA + pergunta em Corpo, divisor, chip RESPOSTA (verde), resposta em Cartão 28/36, dica "Clique no cartão ou aperte Espaço para voltar à pergunta". Abaixo "Como foi lembrar?" e 5 botões em 5 colunas iguais, altura ~64 px, número grande e rótulo pequeno: 1 Errei (perigo suave), 2 Difícil (laranja suave), 3 Razoável (amarelo suave), 4 Bom (verde suave), 5 Fácil (verde sólido, Secundária). Atalhos como teclas com borda fina: "Espaço virar", "1 a 5 avaliar", "Esc sair". Antes de virar, só a pergunta, com dica equivalente para ver a resposta. Celular: topo "X" + nome do baralho + "N/N"; progresso; cartão grande com PERGUNTA e a pergunta centralizada na vertical; dica "Toque no cartão para ver a resposta"; botão primário "Mostrar resposta" no rodapé. Depois de virar: pergunta pequena no topo do cartão, divisor, chip RESPOSTA, resposta grande; "Como foi lembrar?" e os 5 botões. Sem barra de baixo.

9.7 Novo cartão

Desktop: "‹ baralho"; título "Novo cartão"; abas "Criar manualmente" | "Importar JSON"; 2 colunas (formulário ~560 px, prévia ~400 px). Formulário: "Baralho de destino" (select); "Pergunta (frente)" com contador "N / 500" e textarea; botão tracejado "Anexar imagem" e, quando há anexo, chip com ícone, nome, tamanho e ✕; "Resposta (verso)" com contador "N / 500" e "Anexar imagem"; botões "Salvar cartão" (primário), "Salvar e criar outro" (secundário), "Cancelar" (fantasma). Prévia: título "Prévia" com toggle Frente | Verso; cartão com legenda PERGUNTA e texto, "Clique no cartão para virar"; nota "A prévia usa o tema escolhido e mostra o cartão como ele aparece na revisão." Celular: topo "‹ Novo cartão" + avatar; abas; Baralho; "Frente (pergunta)" N/500; "Verso (resposta)" N/500 com placeholder "Digite a resposta"; "Anexar imagem (opcional)"; "Pré-visualização" com cartão FRENTE e cartão VERSO tracejado ("A resposta aparece aqui."); rodapé fixo "Cancelar" + "Salvar cartão" (desabilitado enquanto o formulário é inválido).

9.8 Importar cartões

"‹ baralho"; título "Importar cartões"; "Envie um arquivo JSON com vários cartões de uma vez. Você confere o resultado antes de importar." Coluna única de ~720 px, passos com bolinha numerada rosa: 1 "Escolha o baralho" (select); 2 "Envie o JSON": dropzone tracejada com ícone de upload em círculo rosa suave, "Arraste o arquivo .json aqui" e botão "Escolher arquivo", ao lado textarea "Ou cole o JSON aqui" com placeholder [ { "id": 1, "pergunta": "...", "resposta": "..." } ]; arquivo escolhido como chip (nome · tamanho · ✕); link "Baixar modelo de JSON"; 3 "Confira antes de importar": chips "N cartões lidos", "N válidos" (verde), "N com problema" (perigo); alerta por item com problema (ex.: Item 7: falta o campo "resposta". Esse cartão não será importado.); tabela "PRIMEIROS CARTÕES" (cabeçalho rosa suave em caixa alta, linhas #n, pergunta, resposta); botões "Importar N cartões" (primário) e "Cancelar". Só os válidos entram. O formato JSON atual (id, pergunta, resposta) não pode quebrar.

9.9 Tarefas (antigo Kanban)

Título "Tarefas", subtítulo "Organize o que estudar, separado dos seus baralhos.", botão primário "+ Nova tarefa" à direita. 3 colunas iguais (fundo Superfície 2, raio 20, padding 24) com contador: "A fazer", "Em andamento" (cartões com barra lateral rosa de 3-4 px), "Concluído" (check verde circular e título riscado). Cartão de tarefa branco com borda fina: título, chip de tag (Anatomia, Clínica, Básico, Geral) e data com ícone de relógio ("Qui, 29 out"; "Hoje" em destaque rosa). "+ Adicionar tarefa" no fim de A fazer e Em andamento. Rodapé: Arraste os cartões entre as colunas. No celular, toque em uma tarefa e escolha "Mover para" (alternativa ao arrastar, que também funciona por teclado). Arrastar, mover por teclado e "Mover para" são obrigatórios.

9.10 Celular: Baralhos e Baralho

Baralhos: topo com logo + avatar; saudação "Olá, [nome]" e "Você estudou N dias seguidos. Continue assim!"; cartão rosa "Para hoje / N cartões" com botão escuro "Revisar"; busca "Buscar baralho"; filtros Todos, Básico, Clínica, Geral; lista de baralhos (cartões raio 20 com quadrado de ícone 48 px em cor suave própria, nome, "N cartões · N para hoje" ou "· em dia", chevron); barra de baixo com botão "+" central. Baralho: topo "‹ nome" + lápis (editar) + avatar; 3 cartões de estatística lado a lado (cartões, para hoje em destaque, % dominados); "Cartões" + botão "+ Novo cartão"; lista de cartões com pergunta e chip de estado (Em aprendizado, Dominado, Novo); rodapé fixo: "Importar" (secundário) + "Revisar N cartões" (primário, ocupa o resto); sem barra de baixo nesta tela.

10. Decisões padrão (registrar em scrum/decisoes.md)
D1 Avaliação na revisão: manter os 5 níveis (1 a 5) com rótulos e atalhos de teclado; algoritmo de repetição espaçada inalterado.
D2 Cadastro sem CPF e telefone na UI. Se o backend exigir, tornar opcional, sem apagar dados existentes.
D3 "Kanban" vira "Tarefas" na navegação.
D4 Saudação com o nome da pessoa quando existir no cadastro; sem nome, só "Bem-vinda de volta".
D5 Tema inicial rosa-menta para quem nunca escolheu.
11. Conflitos do design (registrar em scrum/conflitos-design.md; adotar o padrão sem bloquear a sprint)
C1 Barra de baixo no celular: a regra escrita pede "+" rosa central; alguns mockups mostram botão flutuante "Novo baralho" e só 3 itens. Padrão: botão "+" central na barra de baixo, contextual (novo baralho em Baralhos; novo cartão dentro de um baralho).
C2 Tema no celular: a regra põe o tema atrás do avatar; alguns mockups mostram o ícone de paleta solto. Padrão: tema dentro do painel do avatar.
C3 Saudação: desktop "Bem-vinda de volta", celular "Olá, João". Padrão: D4.
C4 Exclusão de baralho sem confirmação no design. Padrão: janela de confirmação (janelas podem ter sombra).
C5 Cabeçalho branco nas telas completas, colorido nas miniaturas da página de temas. Padrão: branco, como nas telas completas.
12. O que o design não define (decidir, registrar em decisoes.md, sem bloquear)
Entrar e Criar conta no celular: empilhar, com o painel rosa reduzido a um topo com logo e frase curta.
Tablet: seguir os breakpoints da seção 5.
Estados vazio, carregando e erro das demais telas: usar chips, faixas de erro e spinner dos componentes base, sem inventar novos padrões visuais.
Texto no feminino ("Bem-vinda", "Como quer ser chamada") é do design; manter.
13. Definição de pronto de qualquer tarefa visual
Textos, rótulos, pesos, tamanhos, espaçamentos, raios e estados batem com esta spec.
Só tokens e papéis de cor; nenhum hex solto em componente.
Verificado em 375, 768 e 1280 px, nos 5 temas.
Contraste ≥ 4,5:1 em todo texto (teste automático por tema).
Teclado completo: Tab, Esc devolve o foco, Espaço e 1 a 5 na revisão.
Alvos de toque ≥ 44 px; um único cabeçalho por tela.
Nenhuma função existente quebrada (criar, editar, excluir, revisar, importar, tarefas, tema salvo).