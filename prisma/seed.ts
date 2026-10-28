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
  {
    title: 'Interestelar',
    description:
      'Com a Terra à beira do colapso, um grupo de exploradores atravessa um buraco de minhoca em busca de um novo lar para a humanidade.',
    dateRelease: new Date('2014-11-06'),
    productionCompany: 'Syncopy',
    actors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: ['Christopher Nolan'],
    media: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    valueTicket: 26.0,
    categories: ['Ficção Científica', 'Aventura', 'Drama'],
  },
  {
    title: 'O Poderoso Chefão',
    description:
      'O patriarca de uma dinastia do crime organizado transfere o controle de seu império clandestino para o filho relutante.',
    dateRelease: new Date('1972-07-07'),
    productionCompany: 'Paramount Pictures',
    actors: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Diane Keaton'],
    director: ['Francis Ford Coppola'],
    media: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    valueTicket: 22.0,
    categories: ['Policial', 'Drama'],
  },
  {
    title: 'Homem-Aranha: Através do Aranhaverso',
    description:
      'Miles Morales é lançado através do Multiverso e encontra uma equipe de Pessoas-Aranha encarregada de proteger sua própria existência.',
    dateRelease: new Date('2023-06-01'),
    productionCompany: 'Sony Pictures Animation',
    actors: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
    director: ['Joaquim Dos Santos', 'Kemp Powers', 'Justin K. Thompson'],
    media: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    valueTicket: 28.0,
    categories: ['Animação', 'Super-herói', 'Ação', 'Aventura'],
  },
  {
    title: 'Divertida Mente',
    description:
      'Depois que a jovem Riley se muda para São Francisco, suas emoções — Alegria, Tristeza, Raiva, Medo e Nojinho — disputam o comando de sua mente.',
    dateRelease: new Date('2015-06-18'),
    productionCompany: 'Pixar Animation Studios',
    actors: ['Amy Poehler', 'Phyllis Smith', 'Bill Hader', 'Lewis Black', 'Mindy Kaling'],
    director: ['Pete Docter'],
    media: 'https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg',
    valueTicket: 24.0,
    categories: ['Animação', 'Família', 'Infantil', 'Comédia'],
  },
  {
    title: 'Coringa',
    description:
      'Arthur Fleck, um comediante fracassado ignorado pela sociedade, inicia uma lenta transformação que o leva a se tornar o Coringa.',
    dateRelease: new Date('2019-10-03'),
    productionCompany: 'DC Films',
    actors: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz', 'Frances Conroy'],
    director: ['Todd Phillips'],
    media: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    valueTicket: 26.0,
    categories: ['Drama', 'Suspense', 'Policial'],
  },
  {
    title: 'Parasita',
    description:
      'Toda a família de Ki-taek está desempregada, até que o filho consegue um emprego na casa dos ricos Park — e o resto da família arma um plano para entrar também.',
    dateRelease: new Date('2019-11-07'),
    productionCompany: 'Barunson E&A',
    actors: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
    director: ['Bong Joon-ho'],
    media: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    valueTicket: 24.0,
    categories: ['Suspense', 'Drama', 'Comédia'],
  },
  {
    title: 'Invocação do Mal',
    description:
      'Os investigadores paranormais Ed e Lorraine Warren ajudam uma família aterrorizada por uma presença sombria em sua fazenda isolada.',
    dateRelease: new Date('2013-09-13'),
    productionCompany: 'New Line Cinema',
    actors: ['Vera Farmiga', 'Patrick Wilson', 'Lili Taylor', 'Ron Livingston'],
    director: ['James Wan'],
    media: 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
    valueTicket: 25.0,
    categories: ['Terror', 'Suspense', 'Mistério'],
  },
  {
    title: 'Top Gun: Maverick',
    description:
      'Depois de mais de 30 anos como um dos maiores aviadores da Marinha, Pete "Maverick" Mitchell treina uma nova geração de pilotos para uma missão perigosa.',
    dateRelease: new Date('2022-05-26'),
    productionCompany: 'Paramount Pictures',
    actors: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Glen Powell'],
    director: ['Joseph Kosinski'],
    media: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    valueTicket: 28.0,
    categories: ['Ação', 'Drama', 'Aventura'],
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
  Interestelar: ['14:30', '18:00', '21:15'],
  'O Poderoso Chefão': ['16:00', '20:00'],
  'Homem-Aranha: Através do Aranhaverso': ['13:00', '15:30', '18:00', '20:30'],
  'Divertida Mente': ['11:00', '13:30', '16:00'],
  Coringa: ['17:15', '20:15', '22:30'],
  Parasita: ['15:45', '19:00', '21:45'],
  'Invocação do Mal': ['19:30', '22:00', '23:30'],
  'Top Gun: Maverick': ['14:15', '17:45', '20:45'],
};
const sessionsFrom = '2026-10-15';
const sessionsTo = '2026-11-30';

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
  // Pipocas especiais
  { name: 'Pipoca de Queijo', description: 'Pipoca com cobertura de queijo cheddar, balde médio', value: 27.0 },
  { name: 'Pipoca de Chocolate', description: 'Pipoca com cobertura de chocolate ao leite, balde médio', value: 28.0 },
  { name: 'Pipoca Mista', description: 'Metade salgada, metade doce caramelizada, balde grande', value: 31.0 },
  // Bebidas
  { name: 'Refrigerante Refil', description: 'Copo 1 L com refil à vontade durante a sessão', value: 22.0 },
  { name: 'Chá Gelado 450 ml', description: 'Limão ou pêssego', value: 11.0 },
  { name: 'Energético 473 ml', description: 'Lata de energético tradicional ou sem açúcar', value: 16.0 },
  { name: 'Milkshake 400 ml', description: 'Chocolate, morango ou baunilha', value: 21.0 },
  { name: 'Café Expresso', description: 'Expresso curto ou longo', value: 8.0 },
  { name: 'Cappuccino', description: 'Cappuccino cremoso 200 ml', value: 12.0 },
  // Doces
  { name: 'KitKat', description: 'Chocolate com wafer 41,5 g', value: 8.0 },
  { name: 'Ovomaltine Crocante', description: 'Chocolate ao leite com flocos de Ovomaltine 45 g', value: 10.0 },
  { name: 'Fini Tubes', description: 'Balas de gelatina em tubo 80 g', value: 10.0 },
  { name: 'Mentos', description: 'Bala mastigável, rolo 37,5 g', value: 5.0 },
  { name: 'Brigadeiro Gourmet', description: 'Caixa com 4 brigadeiros', value: 14.0 },
  // Sorvetes
  { name: 'Sorvete Casquinha', description: 'Casquinha de baunilha, chocolate ou mista', value: 9.0 },
  { name: 'Sundae', description: 'Sorvete de baunilha com calda de chocolate ou morango', value: 16.0 },
  { name: 'Picolé', description: 'Picolé de chocolate, morango ou limão', value: 8.0 },
  // Salgados
  { name: 'Batata Frita', description: 'Porção média de batata frita crocante', value: 18.0 },
  { name: 'Pão de Queijo', description: 'Porção com 6 pães de queijo', value: 15.0 },
  { name: 'Mini Pizza', description: 'Mini pizza de mussarela ou calabresa', value: 17.0 },
  { name: 'Pretzel', description: 'Pretzel com sal grosso e molho de mostarda', value: 16.0 },
  { name: 'Batata Chips', description: 'Pacote de batata chips 80 g', value: 10.0 },
  // Saudáveis
  { name: 'Mix de Castanhas', description: 'Castanhas, amêndoas e nozes 50 g', value: 13.0 },
  { name: 'Salada de Frutas', description: 'Copo 300 ml com frutas da estação', value: 12.0 },
  // Combos extras
  { name: 'Combo Kids', description: 'Pipoca pequena + suco 300 ml + bala de goma + brinde', value: 34.0 },
  { name: 'Combo Nachos', description: 'Nachos com cheddar + refrigerante 700 ml', value: 33.0 },
  { name: 'Combo Doce', description: 'Pipoca doce + milkshake 400 ml', value: 42.0 },
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
