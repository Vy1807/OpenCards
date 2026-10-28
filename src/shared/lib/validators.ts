/* Validadores puros de dados cadastrais (sem dependencia de DOM). */

/** Valida CPF brasileiro: 11 digitos, dvs e rejeita sequencias repetidas. */
export function validarCPF(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, '');
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(digitos[i]) * (10 - i);
  let resto = soma % 11;
  const d1 = resto < 2 ? 0 : 11 - resto;
  if (Number(digitos[9]) !== d1) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(digitos[i]) * (11 - i);
  resto = soma % 11;
  const d2 = resto < 2 ? 0 : 11 - resto;
  return Number(digitos[10]) === d2;
}

/** Valida telefone fixo ou celular brasileiro: 10 ou 11 digitos com DDD valido. */
export function validarTelefone(telefone: string): boolean {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length !== 10 && digitos.length !== 11) return false;
  const ddd = Number(digitos.slice(0, 2));
  return ddd >= 11 && ddd <= 99;
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}
