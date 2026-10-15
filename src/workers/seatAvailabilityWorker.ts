import { ConsumeMessage } from 'amqplib';
import { prisma } from '../config/prisma';
import { sendSeatCallback } from '../services/colmeiaService';

export type SeatAvailabilityMessage = {
  idSessionUser: number;
};

type Result = { approved: boolean; reason: string };

// Roda SEAT_CHECK_DELAY_MS depois do POST /session-users:
// reserva os assentos (se ainda disponíveis), atualiza o status e avisa a Colmeia.
export async function handleSeatAvailability({ idSessionUser }: SeatAvailabilityMessage, _msg: ConsumeMessage) {
  const sessionUser = await prisma.sessionUser.findUnique({
    where: { id: idSessionUser },
    include: { session: true, user: { include: { people: true } } },
  });

  if (!sessionUser) {
    console.warn(`[seat-availability] sessionUser ${idSessionUser} não existe mais, ignorando`);
    return;
  }
  // Idempotência: mensagem reentregue para um pedido já processado
  if (sessionUser.status !== 'PENDING') {
    console.warn(`[seat-availability] sessionUser ${idSessionUser} já está ${sessionUser.status}, ignorando`);
    return;
  }

  const { approved, reason } = await reserveSeats(idSessionUser, sessionUser.session, sessionUser.seats);
  console.log(`[seat-availability] sessionUser ${idSessionUser}: ${approved ? 'APPROVED' : 'REJECTED'} - ${reason}`);

  if (!sessionUser.idCallback) return;

  try {
    await sendSeatCallback({
      idCallback: sessionUser.idCallback,
      idDatabase: sessionUser.idDatabase,
      phone: sessionUser.user.people.phone ?? '',
      approved,
      reason,
    });
  } catch (err: any) {
    // A reserva já foi gravada; não relançamos para não reprocessar o pedido
    console.error(`[seat-availability] sessionUser ${idSessionUser}: ${err.message}`);
  }
}

async function reserveSeats(
  idSessionUser: number,
  session: { id: number; timeSession: Date },
  seats: string[],
): Promise<Result> {
  return prisma.$transaction(async (tx) => {
    const reject = async (reason: string): Promise<Result> => {
      await tx.sessionUser.update({ where: { id: idSessionUser }, data: { status: 'REJECTED', statusReason: reason } });
      return { approved: false, reason };
    };

    if (session.timeSession.getTime() <= Date.now()) return reject('Sessão já iniciada');

    // Atômico: só remove os assentos se TODOS ainda estiverem disponíveis.
    // Dois pedidos concorrentes pela mesma poltrona: o UPDATE trava a linha e só um passa.
    const reserved = await tx.$queryRaw<{ id: number }[]>`
      UPDATE "Session"
      SET "availableSeats" = ARRAY(
        SELECT s FROM unnest("availableSeats") AS s WHERE s <> ALL(${seats}::text[])
      )
      WHERE id = ${session.id} AND "availableSeats" @> ${seats}::text[]
      RETURNING id`;

    if (!reserved.length) {
      const current = await tx.session.findUnique({ where: { id: session.id }, select: { availableSeats: true } });
      const unavailable = seats.filter((s) => !current?.availableSeats.includes(s));
      return reject(`Assentos indisponíveis: ${unavailable.join(', ')}`);
    }

    const reason = 'Assentos armazenados com sucesso';
    await tx.sessionUser.update({ where: { id: idSessionUser }, data: { status: 'APPROVED', statusReason: reason } });
    return { approved: true, reason };
  });
}
