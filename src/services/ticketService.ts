import { prisma } from '../config/prisma';
import { publish, QUEUES } from '../config/rabbitmq';
import { BaseService } from './baseService';
import { AppError } from '../utils/appError';

const include = { movie: true, session: { select: { id: true, idMovie: true, timeSession: true } } };
const PAYMENT_DELAY_MS = Number(process.env.PAYMENT_DELAY_MS ?? 60_000);

class TicketService extends BaseService {
  // Cria o ticket como PENDING e agenda o processamento do pagamento (worker, após PAYMENT_DELAY_MS)
  async create({ idUser, idMovie, idSession, codeTicket, valueTicket, idCallback, idDatabase }: any) {
    if (typeof idCallback !== 'string' || !idCallback.trim()) throw new AppError('idCallback é obrigatório');

    const user = await prisma.user.findUnique({ where: { id: Number(idUser) }, include: { people: true } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    if (!user.people.phone) throw new AppError('Usuário sem telefone cadastrado (necessário para o callback)');

    const created = await prisma.ticketMoviesUser.create({
      data: {
        idUser: user.id,
        idMovie,
        idSession,
        codeTicket,
        valueTicket,
        idCallback,
        idDatabase: idDatabase || null,
      },
      include,
    });

    try {
      await publish(QUEUES.payment, { idTicket: created.id }, PAYMENT_DELAY_MS);
    } catch (err) {
      // Sem fila o pagamento nunca seria processado: desfaz para o cliente tentar de novo
      await prisma.ticketMoviesUser.delete({ where: { id: created.id } });
      console.error('[tickets] falha ao publicar na fila:', err);
      throw new AppError('Fila de processamento indisponível, tente novamente', 503);
    }

    return created;
  }
}

export const ticketService = new TicketService(prisma.ticketMoviesUser, { include });
