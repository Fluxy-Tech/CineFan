import { prisma } from '../src/config/prisma';
import { defaultSeatLayout } from '../src/utils/seats';

const categories = [
  'Ação',
  'Animação',
  'Anime',
  'Aventura',
  'Biografia',
  'Comédia',
  'Comédia Romântica',
  'Documentário',
  'Drama',
  'Esporte',
  'Família',
  'Fantasia',
  'Faroeste',
  'Ficção Científica',
  'Guerra',
  'Histórico',
  'Infantil',
  'Mistério',
  'Musical',
  'Policial',
  'Romance',
  'Super-herói',
  'Suspense',
  'Terror',
];

const movies = [
  {
    title: 'Duna: Parte Dois',
    description:
      'Paul Atreides se une a Chani e aos Fremen em uma jornada de vingança contra os conspiradores que destruíram sua família, enquanto tenta evitar um futuro terrível que só ele consegue prever.',
    dateRelease: new Date('2024-02-29'),
    productionCompany: 'Legendary Pictures',
    actors: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler', 'Florence Pugh'],
    director: ['Denis Villeneuve'],
    media: 'https://image.tmdb.org/t/p/w500/VMy4UGsI2u3f4fALGeCqCdsQBb.jpg',
    valueTicket: 32.0,
    categories: ['Ficção Científica', 'Aventura', 'Ação', 'Drama'],
  },
  {
    title: 'Oppenheimer',
    description:
      'A história do físico J. Robert Oppenheimer e de seu papel no Projeto Manhattan, que levou ao desenvolvimento da bomba atômica durante a Segunda Guerra Mundial.',
    dateRelease: new Date('2023-07-20'),
    productionCompany: 'Syncopy',
    actors: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    director: ['Christopher Nolan'],
    media: 'https://image.tmdb.org/t/p/w500/dUPQszWoRSE9FucJTbVp2bwEi9G.jpg',
    valueTicket: 30.0,
    categories: ['Biografia', 'Drama', 'Histórico'],
  },
  {
    title: 'Ainda Estou Aqui',
    description:
      'Rio de Janeiro, 1971. Durante a ditadura militar, Eunice Paiva vê sua vida mudar quando o marido, o ex-deputado Rubens Paiva, é levado por agentes do regime e desaparece.',
    dateRelease: new Date('2024-11-07'),
    productionCompany: 'VideoFilmes',
    actors: ['Fernanda Torres', 'Selton Mello', 'Fernanda Montenegro'],
    director: ['Walter Salles'],
    media: 'https://image.tmdb.org/t/p/w500/zNAw7jK8bwCK56rIW676pdgkwhd.jpg',
    valueTicket: 28.0,
    categories: ['Drama', 'Biografia', 'Histórico'],
  },
];

async function seedMovies() {
  let created = 0;
  for (const { categories: names, ...movie } of movies) {
    const exists = await prisma.movie.findFirst({ where: { title: movie.title } });
    if (exists) continue;

    const found = await prisma.category.findMany({ where: { name: { in: names } }, select: { id: true } });
    await prisma.movie.create({ data: { ...movie, categories: { connect: found } } });
    created++;
  }
  console.log(`Filmes criados: ${created} (já existiam: ${movies.length - created})`);
}

// Horários (Brasília, UTC-3) de cada filme por dia
const sessionSchedule: Record<string, string[]> = {
  'Duna: Parte Dois': ['14:00', '17:30', '21:00'],
  Oppenheimer: ['13:30', '17:00', '20:30'],
  'Ainda Estou Aqui': ['15:00', '18:30', '21:30'],
};
const sessionsFrom = '2026-10-15';
const sessionsTo = '2026-11-10';

async function seedSessions() {
  const days: string[] = [];
  for (let d = new Date(`${sessionsFrom}T00:00:00Z`); d <= new Date(`${sessionsTo}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }

  let created = 0;
  for (const [title, times] of Object.entries(sessionSchedule)) {
    const movie = await prisma.movie.findFirst({ where: { title } });
    if (!movie) continue;

    const existing = new Set(
      (await prisma.session.findMany({ where: { idMovie: movie.id }, select: { timeSession: true } })).map((s) =>
        s.timeSession.getTime(),
      ),
    );
    const data = days
      .flatMap((day) => times.map((time) => new Date(`${day}T${time}:00-03:00`)))
      .filter((timeSession) => !existing.has(timeSession.getTime()))
      .map((timeSession) => ({ idMovie: movie.id, timeSession, availableSeats: defaultSeatLayout() }));

    if (data.length) await prisma.session.createMany({ data });
    created += data.length;
  }
  console.log(`Sessões criadas: ${created}`);
}

const snacks = [
  { name: 'Pipoca Pequena', description: 'Pipoca salgada com manteiga, balde pequeno (≈60 g)', value: 18.0 },
  { name: 'Pipoca Média', description: 'Pipoca salgada com manteiga, balde médio (≈90 g)', value: 24.0 },
  { name: 'Pipoca Grande', description: 'Pipoca salgada com manteiga, balde grande (≈130 g)', value: 29.0 },
  { name: 'Pipoca Doce', description: 'Pipoca caramelizada, balde médio', value: 26.0 },
  { name: 'Refrigerante 500 ml', description: 'Coca-Cola, Coca-Cola Zero, Guaraná ou Sprite', value: 12.0 },
  { name: 'Refrigerante 700 ml', description: 'Coca-Cola, Coca-Cola Zero, Guaraná ou Sprite', value: 15.0 },
  { name: 'Água Mineral 500 ml', description: 'Com ou sem gás', value: 7.0 },
  { name: 'Suco 300 ml', description: 'Laranja, uva ou maracujá', value: 10.0 },
  { name: 'Chocolate', description: 'Barra de chocolate ao leite 90 g', value: 11.0 },
  { name: "M&M's", description: 'Confeitos de chocolate 80 g', value: 12.0 },
  { name: 'Bala de Goma', description: 'Pacote de balas de goma sortidas 100 g', value: 9.0 },
  { name: 'Nachos', description: 'Nachos com molho de queijo cheddar', value: 22.0 },
  { name: 'Cachorro-Quente', description: 'Pão, salsicha, molho de tomate e batata palha', value: 19.0 },
  { name: 'Combo Individual', description: 'Pipoca média + refrigerante 500 ml', value: 32.0 },
  { name: 'Combo Casal', description: 'Pipoca grande + 2 refrigerantes 500 ml', value: 45.0 },
  { name: 'Combo Família', description: '2 pipocas grandes + 4 refrigerantes 500 ml + 2 chocolates', value: 89.0 },
];

async function seedSnacks() {
  const existing = new Set((await prisma.snack.findMany({ select: { name: true } })).map((s) => s.name));
  const missing = snacks.filter((s) => !existing.has(s.name));

  if (missing.length) await prisma.snack.createMany({ data: missing });
  console.log(`Snacks criados: ${missing.length} (já existiam: ${snacks.length - missing.length})`);
}

async function main() {
  // Idempotente: só cria as categorias que ainda não existem
  const existing = new Set((await prisma.category.findMany({ select: { name: true } })).map((c) => c.name));
  const missing = categories.filter((name) => !existing.has(name));

  if (missing.length) await prisma.category.createMany({ data: missing.map((name) => ({ name })) });
  console.log(`Categorias criadas: ${missing.length} (já existiam: ${categories.length - missing.length})`);
}

async function run() {
  await main();
  await seedMovies();
  await seedSessions();
  await seedSnacks();
}

run().finally(() => prisma.$disconnect());
