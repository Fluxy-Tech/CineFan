// Layout padrão da sala: fileiras A-J, poltronas 1-12 (120 lugares)
export const DEFAULT_ROWS = 'ABCDEFGHIJ'.split('');
export const SEATS_PER_ROW = 12;

export const defaultSeatLayout = () =>
  DEFAULT_ROWS.flatMap((row) => Array.from({ length: SEATS_PER_ROW }, (_, i) => `${row}${i + 1}`));

// Normaliza a lista enviada: "a1" -> "A1", remove espaços e duplicados
export const normalizeSeats = (seats: unknown): string[] =>
  Array.isArray(seats) ? [...new Set(seats.map((s) => String(s).trim().toUpperCase()).filter(Boolean))] : [];
