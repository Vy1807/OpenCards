export type ImportCard = {
  id: string;
  question: string;
  answer: string;
};

export type ImportValidationError = {
  index: number;
  item: ImportCard | null;
  reason: string;
};

export type ImportResult = {
  valid: ImportCard[];
  invalid: ImportValidationError[];
};

export function parseAndValidateImport(input: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    return { valid: [], invalid: [{ index: 0, item: null, reason: 'JSON inválido' }] };
  }

  if (!Array.isArray(raw)) {
    return {
      valid: [],
      invalid: [{ index: 0, item: null, reason: 'O conteúdo deve ser um array' }],
    };
  }

  const valid: ImportCard[] = [];
  const invalid: ImportValidationError[] = [];
  const seenIds = new Set<string>();

  raw.forEach((item, index) => {
    if (item === null || typeof item !== 'object') {
      invalid.push({ index, item: null, reason: 'Item deve ser um objeto' });
      return;
    }

    const obj = item as Record<string, unknown>;
    const id = obj.id;
    const question = obj.question;
    const answer = obj.answer;

    if (typeof id !== 'string' || id.trim() === '') {
      invalid.push({
        index,
        item: obj as ImportCard,
        reason: 'id é obrigatório e deve ser uma string não vazia',
      });
      return;
    }
    if (typeof question !== 'string' || question.trim() === '') {
      invalid.push({
        index,
        item: obj as ImportCard,
        reason: 'question é obrigatória e deve ser uma string não vazia',
      });
      return;
    }
    if (typeof answer !== 'string' || answer.trim() === '') {
      invalid.push({
        index,
        item: obj as ImportCard,
        reason: 'answer é obrigatória e deve ser uma string não vazia',
      });
      return;
    }
    if (seenIds.has(id.trim())) {
      invalid.push({
        index,
        item: obj as ImportCard,
        reason: `id duplicado dentro do arquivo: "${id.trim()}"`,
      });
      return;
    }

    seenIds.add(id.trim());
    valid.push({ id: id.trim(), question: question.trim(), answer: answer.trim() });
  });

  return { valid, invalid };
}
