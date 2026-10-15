import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma';
import { publish, QUEUES } from '../config/rabbitmq';
import { BaseService, rejectFields } from './baseService';
import { AppError } from '../utils/appError';
import { normalizeSeats } from '../utils/seats';

// Sem availableSeats: a lista completa da sala só aparece em /sessions
const include = { session: { select: { id: true, idMovie: true, timeSession: true } } };
const SEAT_CHECK_DELAY_MS = Number(process.env.SEAT_CHECK_DELAY_MS ?? 30_000);

class SessionUserService extends BaseService {
  // Registra o pedido como PENDING e agenda a checagem de disponibilidade (worker, após SEAT_CHECK_DELAY_MS)
  // O idCallback é gerado aqui (UUID) e devolvido na resposta; o cliente não envia
  async create({ idSession, idUser, seats, idDatabase }: any) {
    const list = normalizeSeats(seats);
    if (!list.length) throw new AppError('Informe ao menos um assento em seats');

    const [session, user] = await Promise.all([
      prisma.session.findUnique({ where: { id: Number(idSession) }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: Number(idUser) }, include: { people: true } }),
    ]);
    if (!session) throw new AppError('Sessão não encontrada', 404);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    if (!user.people.phone) throw new AppError('Usuário sem telefone cadastrado (necessário para o callback)');

    const created = await prisma.sessionUser.create({
      data: {
        idSession: session.id,
        idUser: user.id,
        seats: list,
        idCallback: randomUUID(),
        idDatabase: idDatabase || null,
      },
      include,
    });

    try {
      await publish(QUEUES.seatAvailability, { idSessionUser: created.id }, SEAT_CHECK_DELAY_MS);
    } catch (err) {
      // Sem fila o pedido nunca seria processado: desfaz para o cliente tentar de novo
      await prisma.sessionUser.delete({ where: { id: created.id } });
      console.error('[session-users] falha ao publicar na fila:', err);
      throw new AppError('Fila de processamento indisponível, tente novamente', 503);
    }

    return created;
  }
}

export const sessionUserService = new SessionUserService(prisma.sessionUser, {
  include,
  // Status só muda pelo worker de disponibilidade
  mapUpdate: rejectFields(['status', 'statusReason', 'idCallback']),
});
