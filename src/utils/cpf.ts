import { AppError } from './appError';

// Aceita "123.456.789-09" ou "12345678909" e devolve só os dígitos
export function parseCpf(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new AppError('CPF é obrigatório');

  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) throw new AppError('CPF inválido');

  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  if (digit(9) !== Number(cpf[9]) || digit(10) !== Number(cpf[10])) throw new AppError('CPF inválido');

  return cpf;
}
