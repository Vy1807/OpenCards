# Inventário de ícones — interface de design (flashcards)

## Ícones atualmente em uso

| Ícone | Código | Arquivo | Linha | Uso | Formato | Problema |
|-------|--------|---------|-------|-----|---------|----------|
| ✅ | U+2705 | `src/pages/Review.tsx` | 172 | Rótulo "Acertos" (revisão concluída) | Emoji | Glifo colorido dependente do SO/browser; sem controle de tamanho; leitor de tela anuncia "white heavy check mark"; não acompanha os tokens de cor |
| ❌ | U+274C | `src/pages/Review.tsx` | 175 | Rótulo "Erros" (revisão concluída) | Emoji | Mesmo problema do ✅ |
| → + ✓ | U+2192 + U+2713 | `src/pages/Review.tsx` | 253 | Botão "Acertei" | Mistura de glifos | Duas convenções diferentes para a mesma ação |
| ← + ✗ | U+2190 + U+2717 | `src/pages/Review.tsx` | 261 | Botão "Errei" | Mistura de glifos | Mesmo problema acima |
| → / ← | U+2192 / U+2190 | `src/pages/Review.tsx` | 276 | Dica de atalhos do teclado | Glifos em texto corrido | Sem alinhamento com o restante da interface |
| · | U+00B7 | `src/components/Flashcard.tsx` | 23, 35 | Separador "Frente"/"Verso" | Ponto tipográfico | Não é ícone; mantido como tipografia |

## Biblioteca de ícones

Não há biblioteca de ícones instalada (`package.json` não lista lucide-react, react-icons, heroicons etc.) e não existem arquivos SVG de ícone em `src/`. Toda a iconografia é improvisada com emoji e glifos unicode.

## Conclusão do inventário

Foram mapeadas 6 ocorrências de ícones em 2 arquivos, usando 4 formatos diferentes. Não há estilo unificado: espessura de traço, tamanho, raio de canto e acessibilidade variam caso a caso.
