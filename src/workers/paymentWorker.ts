import { ConsumeMessage } from 'amqplib';
import { prisma } from '../config/prisma';
import { sendPaymentCallback } from '../services/colmeiaService';

export type PaymentMessage = {
  idTicket: number;
};

type Result = { status: 'PAID' | 'REJECTED'; reason: string };

// Roda PAYMENT_DELAY_MS depois do POST /tickets:
// processa o pagamento, atualiza statusPayment e avisa a Colmeia.
export async function handlePayment({ idTicket }: PaymentMessage, _msg: ConsumeMessage) {
  const ticket = await prisma.ticketMoviesUser.findUnique({
    where: { id: idTicket },
    include: { session: true, user: { include: { people: true } } },
  });

  if (!ticket) {
    console.warn(`[payment] ticket ${idTicket} não existe mais, ignorando`);
    return;
  }
  // Idempotência: mensagem reentregue para um ticket já processado
  if (ticket.statusPayment !== 'PENDING') {
    console.warn(`[payment] ticket ${idTicket} já está ${ticket.statusPayment}, ignorando`);
    return;
  }

  const { status, reason } = await processPayment(ticket);
  await prisma.ticketMoviesUser.update({
    where: { id: idTicket },
    data: { statusPayment: status, statusReason: reason },
  });
  console.log(`[payment] ticket ${idTicket}: ${status} - ${reason}`);

  if (!ticket.idCallback) return;

  try {
    await sendPaymentCallback({
      idCallback: ticket.idCallback,
      idDatabase: ticket.idDatabase,
      phone: ticket.user.people.phone ?? '',
      status,
      reason,
    });
  } catch (err: any) {
    // O status já foi gravado; não relançamos para não reprocessar o pagamento
    console.error(`[payment] ticket ${idTicket}: ${err.message}`);
  }
}

// TODO: integrar o gateway de pagamento aqui. Por enquanto aprova quando a sessão ainda
// não começou e o usuário tem assentos reservados (SessionUser APPROVED) nessa sessão.
async function processPayment(ticket: { idUser: number; idSession: number; session: { timeSession: Date } }): Promise<Result> {
  if (ticket.session.timeSession.getTime() <= Date.now()) {
    return { status: 'REJECTED', reason: 'Sessão já iniciada' };
  }

  const reservation = await prisma.sessionUser.findFirst({
    where: { idUser: ticket.idUser, idSession: ticket.idSession, status: 'APPROVED' },
    select: { id: true },
  });
  if (!reservation) {
    return { status: 'REJECTED', reason: 'Nenhum assento reservado para esta sessão' };
  }

  return { status: 'PAID', reason: 'Pagamento aprovado' };
}
