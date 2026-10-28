/** Mascara de CPF: 000.000.000-00 */
export const cpfMask = '000.000.000-00';

/** Mascara de telefone: (00) 00000-0000 (aceita fixo de 10 dígitos na validação). */
export const telefoneMask = '(00) 00000-0000';

export type MaskKind = 'cpf' | 'telefone';

export function maskDefinition(kind: MaskKind) {
  if (kind === 'cpf') return { mask: cpfMask, lazy: false };
  return { mask: telefoneMask, lazy: false };
}
