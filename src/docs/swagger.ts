const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const int = { type: 'integer', example: 1 };
const num = { type: 'number', example: 25.9 };
const str = (example: string) => ({ type: 'string', example });
const date = { type: 'string', format: 'date-time', example: '2026-12-01T19:30:00.000Z' };
const strArr = (...example: string[]) => ({ type: 'array', items: { type: 'string' }, example });
const intArr = { type: 'array', items: { type: 'integer' }, example: [1, 2] };
const status = { type: 'string', example: 'PENDING', default: 'PENDING' };

type Resource = {
  path: string;
  tag: string;
  schema: string;
  input: Record<string, any>;
  required: string[];
  filters?: string[];
  // Schema de resposta, quando diferente de { id, ...input }
  output?: Record<string, any>;
  createStatus?: number;
  createDescription?: string;
};

const resources: Resource[] = [
  {
    path: '/categories', tag: 'Categories', schema: 'Category',
    input: { name: str('Ação') }, required: ['name'],
  },
  {
    path: '/movies', tag: 'Movies', schema: 'Movie',
    input: {
      title: str('Duna: Parte 2'),
      description: str('Paul Atreides se une aos Fremen...'),
      dateCreate: date,
      dateRelease: date,
      productionCompany: str('Legendary Pictures'),
      actors: strArr('Timothée Chalamet', 'Zendaya'),
      director: strArr('Denis Villeneuve'),
      media: str('https://cdn.exemplo.com/duna2.jpg'),
      valueTicket: num,
      categoryIds: { ...intArr, description: 'IDs das categorias (no update substitui a lista)' },
    },
    required: ['title', 'description', 'dateRelease', 'productionCompany', 'media', 'valueTicket'],
  },
  {
    path: '/snacks', tag: 'Snacks', schema: 'Snack',
    input: { name: str('Pipoca grande'), description: str('Pipoca salgada 500g'), value: num },
    required: ['name', 'description', 'value'],
  },
  {
    path: '/sessions', tag: 'Sessions', schema: 'Session',
    input: {
      idMovie: int,
      timeSession: date,
      availableSeats: { ...strArr('A1', 'A2', 'A3'), description: 'Poltronas disponíveis. Se omitido na criação, usa o layout padrão A1..J12 (120 lugares). As aprovadas são removidas automaticamente.' },
    },
    required: ['idMovie', 'timeSession'],
    filters: ['idMovie'],
  },
  {
    path: '/session-users', tag: 'SessionUsers', schema: 'SessionUser',
    input: {
      idSession: int,
      idUser: int,
      seats: { ...strArr('A1', 'A2'), description: 'Poltronas desejadas (precisam estar em session.availableSeats)' },
      idDatabase: { ...str('Gxf3x1zt9ARJKmcbG4KbooXC8KcFby'), description: 'Opcional. Padrão: COLMEIA_ID_DATABASE do .env' },
    },
    required: ['idSession', 'idUser', 'seats'],
    output: {
      id: { ...int, readOnly: true },
      idSession: int,
      idUser: int,
      seats: strArr('A1', 'A2'),
      status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'PENDING' },
      statusReason: { type: 'string', nullable: true, example: null },
      idCallback: { ...str('44f0ea1e-2ef2-49b8-8fc2-a2ad0b54a2e1'), readOnly: true, description: 'Gerado pelo backend (UUID) na criação' },
      idDatabase: { type: 'string', nullable: true },
      createdAt: date,
    },
    createStatus: 200,
    createDescription:
      'Retorna 200 com status PENDING e um idCallback gerado pelo backend (UUID). Após SEAT_CHECK_DELAY_MS (30s) o worker reserva os assentos (se disponíveis), muda o status para APPROVED/REJECTED e chama o callback da Colmeia com liberadoParaPagamento, motivo e celular (phone da People do usuário).',
    filters: ['idSession', 'idUser'],
  },
  {
    path: '/tickets', tag: 'Tickets', schema: 'TicketMoviesUser',
    input: {
      idUser: int, idMovie: int, idSession: int,
      codeTicket: { type: 'integer', example: 123456 },
      valueTicket: num,
      idDatabase: { ...str('Db9Njl82SkwfKbPKl46ligB1htNvn3'), description: 'Opcional. Padrão: COLMEIA_PAYMENT_ID_DATABASE do .env' },
    },
    required: ['idUser', 'idMovie', 'idSession', 'codeTicket', 'valueTicket'],
    filters: ['idUser', 'idMovie', 'idSession', 'codeTicket', 'statusPayment'],
    output: {
      id: { ...int, readOnly: true },
      idUser: int,
      idMovie: int,
      idSession: int,
      codeTicket: { type: 'integer', example: 123456 },
      valueTicket: num,
      statusPayment: { type: 'string', enum: ['PENDING', 'PAID', 'REJECTED'], example: 'PENDING' },
      statusReason: { type: 'string', nullable: true, example: null },
      idCallback: { ...str('7b1c2d3e-4f50-6172-8394-a5b6c7d8e9f0'), readOnly: true, description: 'Gerado pelo backend (UUID) na criação' },
      idDatabase: { type: 'string', nullable: true },
      createdAt: date,
    },
    createDescription:
      'Cria o ticket com statusPayment PENDING e um idCallback gerado pelo backend (UUID), devolvido na resposta. Após PAYMENT_DELAY_MS (60s) o worker de pagamento muda o status para PAID/REJECTED e chama o callback da Colmeia com celular, statusPagamento e motivo.',
  },
  {
    path: '/snacks-users', tag: 'SnacksUsers', schema: 'SnacksUser',
    input: { idUser: int, idSnack: int, value: num, statusPayment: status },
    required: ['idUser', 'idSnack', 'value'],
    filters: ['idUser', 'idSnack', 'statusPayment'],
  },
  {
    path: '/people', tag: 'People', schema: 'People',
    input: {
      name: str('Maria Silva'), document: { type: 'string', example: '529.982.247-25', description: 'CPF (com ou sem máscara, salvo só com dígitos)' },
      phone: str('11999999999'), dateBith: date, zipcode: str('01001000'),
    },
    required: ['name', 'document'],
    filters: ['document'],
  },
  {
    path: '/users', tag: 'Users', schema: 'User',
    input: {
      document: { ...{ type: 'string', example: '529.982.247-25', description: 'CPF (com ou sem máscara, salvo só com dígitos)' }, description: 'CPF obrigatório. Se a pessoa já existir, o usuário é vinculado a ela; senão o People é criado.' },
      name: { ...str('Maria Silva'), description: 'Obrigatório quando a pessoa ainda não existe' },
      phone: str('11999999999'), dateBith: date, zipcode: str('01001000'),
      categoryIds: { ...intArr, description: 'IDs das categorias favoritas' },
    },
    required: ['document'],
    filters: ['idPeople'],
    output: {
      id: { ...int, readOnly: true },
      idPeople: { ...int, readOnly: true, description: 'Preenchido automaticamente' },
      people: ref('PeopleInput'),
      categoriesFavorites: { type: 'array', items: ref('Category') },
    },
  },
];

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const json = (schema: any) => ({ content: { 'application/json': { schema } } });
const errors = {
  400: { description: 'Dados inválidos', ...json(ref('Error')) },
  500: { description: 'Erro interno', ...json(ref('Error')) },
};
const notFound = { 404: { description: 'Não encontrado', ...json(ref('Error')) } };

const paths: Record<string, any> = {
  '/health': {
    get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
  },
  '/users/by-document': {
    get: {
      tags: ['Users'],
      summary: 'Busca usuário pelo documento da pessoa',
      parameters: [{ name: 'document', in: 'query', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Usuário encontrado' }, ...notFound, 400: errors[400] },
    },
  },
  '/sessions/{id}/seats.png': {
    get: {
      tags: ['Sessions'],
      summary: 'Imagem (PNG) do mapa de poltronas da sessão: verde = livre, vermelha = ocupada',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Mapa de poltronas', content: { 'image/png': { schema: { type: 'string', format: 'binary' } } } },
        ...notFound,
      },
    },
  },
  '/movies/{id}/sessions': {
    get: {
      tags: ['Movies'],
      summary: 'Sessões de um filme (por padrão só as futuras, em ordem de horário)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        { name: 'date', in: 'query', required: false, description: 'Dia no horário de Brasília (YYYY-MM-DD)', schema: { type: 'string', example: '2026-10-20' } },
        { name: 'includePast', in: 'query', required: false, description: 'true para incluir sessões que já começaram', schema: { type: 'boolean', default: false } },
      ],
      responses: {
        200: {
          description: 'Sessões do filme',
          ...json({
            type: 'object',
            properties: {
              movie: { type: 'object', properties: { id: int, title: str('Duna: Parte Dois') } },
              total: { type: 'integer', example: 3 },
              sessions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: int,
                    idMovie: int,
                    timeSession: date,
                    availableSeats: strArr('A1', 'A2', 'A3'),
                    availableCount: { type: 'integer', example: 120 },
                  },
                },
              },
            },
          }),
        },
        ...notFound,
        400: errors[400],
      },
    },
  },
  '/users/{id}/purchases': {
    get: {
      tags: ['Users'],
      summary: 'Compras do usuário: sessões (com filme, poltronas e tickets), snacks e totais',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Compras do usuário', ...json(ref('UserPurchases')) }, ...notFound },
    },
  },
};

const paymentStatus = { type: 'string', example: 'PENDING' };

const schemas: Record<string, any> = {
  UserPurchases: {
    type: 'object',
    properties: {
      idUser: int,
      sessions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            idSession: int,
            session: {
              type: 'object',
              properties: {
                id: int,
                timeSession: date,
                movie: {
                  type: 'object',
                  properties: { id: int, title: str('Duna: Parte Dois'), media: str(''), valueTicket: num },
                },
              },
            },
            sessionUserIds: intArr,
            seats: { ...strArr('A1', 'A2'), description: 'Poltronas garantidas (somente pedidos APPROVED)' },
            requests: {
              type: 'array',
              description: 'Todos os pedidos de assento da sessão, com status',
              items: {
                type: 'object',
                properties: {
                  id: int,
                  seats: strArr('A1', 'A2'),
                  status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
                  statusReason: { type: 'string', nullable: true, example: 'Assentos armazenados com sucesso' },
                  createdAt: date,
                },
              },
            },
            tickets: {
              type: 'array',
              items: {
                type: 'object',
                properties: { id: int, codeTicket: { type: 'integer', example: 123456 }, valueTicket: num, statusPayment: paymentStatus },
              },
            },
          },
        },
      },
      snacks: {
        type: 'array',
        items: {
          type: 'object',
          properties: { id: int, value: num, statusPayment: paymentStatus, snack: ref('Snack') },
        },
      },
      totals: {
        type: 'object',
        properties: {
          tickets: { type: 'number', example: 64 },
          snacks: { type: 'number', example: 45 },
          total: { type: 'number', example: 109 },
        },
      },
    },
  },
  Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, error: { type: 'string' } } },
};

for (const r of resources) {
  const input = `${r.schema}Input`;
  schemas[input] = { type: 'object', properties: r.input, required: r.required };
  schemas[r.schema] = r.output
    ? { type: 'object', properties: r.output }
    : { allOf: [{ type: 'object', properties: { id: { ...int, readOnly: true, description: 'Autoincremento, gerado pelo banco' } } }, ref(input)] };

  paths[r.path] = {
    get: {
      tags: [r.tag],
      summary: `Lista ${r.tag}`,
      parameters: (r.filters ?? []).map((name) => ({ name, in: 'query', required: false, schema: { type: 'string' } })),
      responses: { 200: { description: 'Lista', ...json({ type: 'array', items: ref(r.schema) }) }, 500: errors[500] },
    },
    post: {
      tags: [r.tag],
      summary: `Cria ${r.schema}`,
      description: r.createDescription,
      requestBody: { required: true, ...json(ref(input)) },
      responses: { [r.createStatus ?? 201]: { description: 'Criado', ...json(ref(r.schema)) }, 409: { description: 'Duplicado' }, ...errors },
    },
  };

  paths[`${r.path}/{id}`] = {
    get: {
      tags: [r.tag],
      summary: `Busca ${r.schema} por id`,
      parameters: [idParam],
      responses: { 200: { description: 'Encontrado', ...json(ref(r.schema)) }, ...notFound },
    },
    patch: {
      tags: [r.tag],
      summary: `Atualiza ${r.schema}`,
      parameters: [idParam],
      requestBody: { required: true, ...json({ type: 'object', properties: r.input }) },
      responses: { 200: { description: 'Atualizado', ...json(ref(r.schema)) }, ...notFound, ...errors },
    },
    delete: {
      tags: [r.tag],
      summary: `Remove ${r.schema}`,
      parameters: [idParam],
      responses: { 204: { description: 'Removido' }, ...notFound, 400: errors[400] },
    },
  };
}

export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'CineFan API', version: '1.0.0', description: 'Backend de cinema - CRUD de todas as tabelas' },
  // O primeiro é o padrão no seletor "Servers" do Swagger
  servers: [
    { url: 'https://cinefan.egnehl.easypanel.host', description: 'Produção (Easypanel)' },
    { url: '/', description: 'Servidor atual (ex.: localhost)' },
  ],
  paths,
  components: { schemas },
};
