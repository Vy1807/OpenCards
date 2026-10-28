# Lacunas — ícones ainda não adotados na interface

## Ícones criados na biblioteca (aguardando adoção)

| Ícone | Uso pretendido |
|-------|----------------|
| `PlusIcon` | Adicionar baralho / cartão |
| `PencilIcon` | Editar baralho / cartão |
| `TrashIcon` | Excluir baralho / cartão |
| `DownloadIcon` | Exportar JSON |
| `UploadIcon` | Importar JSON / imagem de cartão |
| `SearchIcon` | Buscar por nome |
| `FilterIcon` | Filtrar por tag |
| `RefreshIcon` | Recarregar / tentar de novo |
| `ExternalLinkIcon` | Link externo |
| `UserIcon` | Usuário / conta |
| `LogoutIcon` | Sair |
| `ImageIcon` | Imagem da frente/verso do cartão |
| `InfoIcon` | Informação / ajuda |
| `AlertIcon` | Atenção / erro |
| `CloseIcon` | Fechar / dismiss de dialog |
| `DeckIcon` / `CardIcon` | Baralho / cartão em listagens |
| `ChevronDownIcon` | Selects / dropdowns |
| `ArrowRightIcon` / `ArrowLeftIcon` | Navegação / ações |

## Por tela (pendente de adoção — tarefa de rollout)

- **Home:** `SearchIcon`, `FilterIcon`, `DeckIcon` nos itens de baralho, `PlusIcon` (novo baralho)
- **Deck:** `DownloadIcon` (exportar), `TrashIcon` (excluir baralho), `PencilIcon` (editar), `PlusIcon` (adicionar cartão)
- **DeckEdit:** `TrashIcon` (cartão), `CloseIcon` (fechar importação), `UploadIcon` (imagem), `InfoIcon` (ajuda)
- **Login:** `UserIcon`
- **Revisão:** já migrado — `CheckIcon`, `CloseIcon`, `ArrowRightIcon`, `ArrowLeftIcon` substituem os emoji `✅ ❌` e glifos `→ ✓ ← ✗`
- **Global:** menu, usuário/sair, estados vazios (`InfoIcon`/`AlertIcon`), recarregar (`RefreshIcon`)

## Status

Inventário concluído, estilo definido e biblioteca criada em `src/icons/`. `Review.tsx` foi migrado para a nova biblioteca. Demais telas aguardam a tarefa de rollout (t_423fdffa).
