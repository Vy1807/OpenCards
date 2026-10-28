export type ExportCard = {
  id: string;
  question: string;
  answer: string;
};

/**
 * exportCards — converte uma lista de cartões no formato de exportação JSON,
 * idêntico ao formato de importação ([{"id","question","answer"}]).
 *
 * O round-trip exportar → importar não altera nada:
 * - id = card_code
 * - question = front_text
 * - answer = back_text
 */
export function exportCards(
  cards: {
    card_code: string;
    front_text: string;
    back_text: string;
  }[]
): ExportCard[] {
  return cards.map((c) => ({
    id: c.card_code,
    question: c.front_text,
    answer: c.back_text,
  }));
}

export function exportCardsJson(
  cards: {
    card_code: string;
    front_text: string;
    back_text: string;
  }[]
): string {
  return JSON.stringify(exportCards(cards), null, 2);
}
