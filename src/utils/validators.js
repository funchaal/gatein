/**
 * Valida se um CPF é válido.
 * Aceita formatos: "000.000.000-00" ou "00000000000"
 * @param {string} cpf
 * @returns {boolean}
 */

export const isValidCPF = (cpf) => {
  if (typeof cpf !== 'string') return false;

  // 1. Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, '');

  // 2. Verifica se tem 11 dígitos ou se todos são iguais (ex: 111.111.111-11)
  // CPFs com todos os dígitos iguais passam no cálculo matemático, mas são inválidos.
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
    return false;
  }

  // 3. Validação do 1º Dígito Verificador
  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // 4. Validação do 2º Dígito Verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;

  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};