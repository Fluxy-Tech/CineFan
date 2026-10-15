import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import { DEFAULT_ROWS, SEATS_PER_ROW } from '../utils/seats';

// Fonte embutida: a imagem Docker (node:22-slim) não tem fontes de sistema
const require = createRequire(import.meta.url);
const FONT_FILES = [
  require.resolve('dejavu-fonts-ttf/ttf/DejaVuSans.ttf'),
  require.resolve('dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf'),
];

const COLORS = {
  background: '#1c1c1c',
  text: '#ffffff',
  muted: '#bdbdbd',
  screen: '#ffffff',
  free: { back: '#4cd137', seat: '#2f9e22' },
  taken: { back: '#e8382f', seat: '#a8201a' },
};

// Geometria (px)
const WIDTH = 1000;
const CELL_W = 56; // largura de cada coluna de poltrona
const CELL_H = 50; // altura de cada fileira
const AISLE = 44; // corredor central
const SEAT_W = 40;

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

// Poltrona: encosto arredondado + assento com braços (mesmo formato da referência)
function seatSvg(x: number, y: number, free: boolean) {
  const c = free ? COLORS.free : COLORS.taken;
  return `<g>
    <rect x="${x + 4}" y="${y}" width="${SEAT_W - 8}" height="22" rx="8" fill="${c.back}"/>
    <rect x="${x}" y="${y + 14}" width="${SEAT_W}" height="16" rx="5" fill="${c.seat}"/>
    <rect x="${x + 6}" y="${y + 12}" width="${SEAT_W - 12}" height="10" rx="4" fill="${c.back}"/>
  </g>`;
}

export function renderSeatMapSvg(opts: { title: string; subtitle: string; availableSeats: string[] }) {
  const available = new Set(opts.availableSeats);
  const half = SEATS_PER_ROW / 2;
  const gridW = SEATS_PER_ROW * CELL_W + AISLE;
  const left = (WIDTH - gridW) / 2;

  const titleY = 50;
  const screenY = 110;
  const gridTop = 230;
  // Igual à referência: a primeira fileira (A) fica embaixo
  const rows = [...DEFAULT_ROWS].reverse();
  const numbersY = gridTop + rows.length * CELL_H + 30;
  const legendY = numbersY + 60;
  const height = legendY + 50;

  const colX = (n: number) => left + (n - 1) * CELL_W + (n > half ? AISLE : 0) + (CELL_W - SEAT_W) / 2;

  let free = 0;
  let taken = 0;
  const parts: string[] = [];

  rows.forEach((row, i) => {
    const y = gridTop + i * CELL_H;
    parts.push(`<text x="${left - 34}" y="${y + 24}" class="label">${row}</text>`);
    parts.push(`<text x="${left + gridW + 34}" y="${y + 24}" class="label">${row}</text>`);
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      const isFree = available.has(`${row}${n}`);
      isFree ? free++ : taken++;
      parts.push(seatSvg(colX(n), y, isFree));
    }
  });

  for (let n = 1; n <= SEATS_PER_ROW; n++) {
    parts.push(`<text x="${colX(n) + SEAT_W / 2}" y="${numbersY}" class="label">${n}</text>`);
  }

  // Legenda
  const legend = [
    { free: true, text: `Livre (${free})`, x: WIDTH / 2 - 190 },
    { free: false, text: `Ocupada (${taken})`, x: WIDTH / 2 + 40 },
  ]
    .map(
      (l) => `${seatSvg(l.x, legendY - 22, l.free)}
      <text x="${l.x + SEAT_W + 12}" y="${legendY}" class="legend">${escapeXml(l.text)}</text>`,
    )
    .join('');

  const screenL = left - 10;
  const screenR = left + gridW + 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">
  <style>
    text { font-family: 'DejaVu Sans'; fill: ${COLORS.text}; }
    .title { font-size: 28px; font-weight: bold; text-anchor: middle; }
    .subtitle { font-size: 18px; fill: ${COLORS.muted}; text-anchor: middle; }
    .screen { font-size: 24px; font-weight: bold; fill: #111; text-anchor: middle; }
    .label { font-size: 18px; font-weight: bold; text-anchor: middle; }
    .legend { font-size: 18px; }
  </style>
  <rect width="100%" height="100%" fill="${COLORS.background}"/>
  <text x="${WIDTH / 2}" y="${titleY}" class="title">${escapeXml(opts.title)}</text>
  <text x="${WIDTH / 2}" y="${titleY + 30}" class="subtitle">${escapeXml(opts.subtitle)}</text>
  <path d="M ${screenL} ${screenY} H ${screenR} V ${screenY + 50} Q ${WIDTH / 2} ${screenY + 30} ${screenL} ${screenY + 50} Z" fill="${COLORS.screen}"/>
  <text x="${WIDTH / 2}" y="${screenY + 30}" class="screen">TELA</text>
  ${parts.join('\n  ')}
  ${legend}
</svg>`;
}

// PNG do mapa de poltronas de uma sessão (verde = livre, vermelha = ocupada)
export async function renderSessionSeatMap(idSession: number) {
  const session = await prisma.session.findUnique({
    where: { id: idSession },
    include: { movie: { select: { title: true } } },
  });
  if (!session) throw new AppError('Sessão não encontrada', 404);

  const when = session.timeSession.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const svg = renderSeatMapSvg({
    title: session.movie.title,
    subtitle: `Sessão ${session.id} · ${when}`,
    availableSeats: session.availableSeats,
  });

  return new Resvg(svg, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans' },
  })
    .render()
    .asPng();
}
