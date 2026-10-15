import { prisma } from '../config/prisma';
import { BaseService, connectIds, setIds, withDates } from './baseService';
import { parseCpf } from '../utils/cpf';
import { AppError } from '../utils/appError';

const include = { people: true, categoriesFavorites: true };

const peopleFields = ({ name, phone, dateBith, zipcode }: any) =>
  withDates({ name, phone, dateBith, zipcode }, ['dateBith']);

const movieSelect = { id: true, title: true, media: true, valueTicket: true };

class UserService extends BaseService {
  // Compras do usuário agrupadas por sessão: poltronas (SessionUser) + tickets (TicketMoviesUser) + snacks
  async findPurchases(idUser: number) {
    const user = await prisma.user.findUnique({ where: { id: idUser }, select: { id: true } });
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const [sessionUsers, tickets, snacks] = await Promise.all([
      prisma.sessionUser.findMany({
        where: { idUser },
        include: { session: { include: { movie: { select: movieSelect } } } },
        orderBy: { id: 'asc' },
      }),
      prisma.ticketMoviesUser.findMany({
        where: { idUser },
        include: { session: { include: { movie: { select: movieSelect } } } },
      }),
      prisma.snacksUser.findMany({ where: { idUser }, include: { snack: true }, orderBy: { id: 'desc' } }),
    ]);

    type Purchase = {
      idSession: number;
      session: { id: number; timeSession: Date; movie: Record<string, any> };
      sessionUserIds: number[];
      seats: string[];
      requests: { id: number; seats: string[]; status: string; statusReason: string | null; createdAt: Date }[];
      tickets: { id: number; codeTicket: number; valueTicket: number; statusPayment: string }[];
    };
    const bySession = new Map<number, Purchase>();
    const entry = (s: (typeof sessionUsers)[number]['session']) => {
      if (!bySession.has(s.id)) {
        bySession.set(s.id, {
          idSession: s.id,
          session: { id: s.id, timeSession: s.timeSession, movie: s.movie },
          sessionUserIds: [],
          seats: [],
          requests: [],
          tickets: [],
        });
      }
      return bySession.get(s.id)!;
    };

    for (const su of sessionUsers) {
      const e = entry(su.session);
      e.sessionUserIds.push(su.id);
      // Só pedidos aprovados contam como poltronas garantidas; o histórico completo fica em requests
      if (su.status === 'APPROVED') e.seats.push(...su.seats);
      e.requests.push({ id: su.id, seats: su.seats, status: su.status, statusReason: su.statusReason, createdAt: su.createdAt });
    }
    for (const t of tickets) {
      entry(t.session).tickets.push({
        id: t.id,
        codeTicket: t.codeTicket,
        valueTicket: t.valueTicket,
        statusPayment: t.statusPayment,
      });
    }

    const sessions = [...bySession.values()].sort(
      (a, b) => b.session.timeSession.getTime() - a.session.timeSession.getTime(),
    );
    const ticketsTotal = tickets.reduce((sum, t) => sum + t.valueTicket, 0);
    const snacksTotal = snacks.reduce((sum, s) => sum + s.value, 0);

    return {
      idUser,
      sessions,
      snacks: snacks.map(({ id, value, statusPayment, snack }) => ({ id, value, statusPayment, snack })),
      totals: { tickets: ticketsTotal, snacks: snacksTotal, total: ticketsTotal + snacksTotal },
    };
  }

  findByDocument(document: string) {
    return prisma.user.findFirst({ where: { people: { document: parseCpf(document) } }, include });
  }

  // Cria o usuário a partir do CPF: se a pessoa já existe, vincula; senão cria o People junto.
  // id e idPeople são sempre preenchidos pelo sistema, nunca pelo cliente.
  async create({ document, categoryIds, ...data }: any) {
    const cpf = parseCpf(document);
    const existing = await prisma.people.findUnique({ where: { document: cpf }, include: { user: true } });

    if (existing?.user) throw new AppError('Já existe um usuário para este CPF', 409);
    if (!existing && !data.name) throw new AppError('Nome é obrigatório para cadastrar um novo CPF');

    return prisma.user.create({
      data: {
        people: existing
          ? { connect: { id: existing.id } }
          : { create: { ...peopleFields(data), document: cpf } },
        categoriesFavorites: connectIds(categoryIds),
      },
      include,
    });
  }
}

export const userService = new UserService(prisma.user, {
  include,
  mapUpdate: ({ document, categoryIds, idPeople: _idPeople, ...data }) => {
    const people = peopleFields(data);
    if (document !== undefined) people.document = parseCpf(document);
    const hasPeople = Object.values(people).some((v) => v !== undefined);
    return {
      people: hasPeople ? { update: people } : undefined,
      categoriesFavorites: setIds(categoryIds),
    };
  },
});
