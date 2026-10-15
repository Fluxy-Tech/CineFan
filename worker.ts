import 'dotenv/config';
import { QUEUES, consume, closeRabbit } from './src/config/rabbitmq';
import { prisma } from './src/config/prisma';
import { handleSeatAvailability } from './src/workers/seatAvailabilityWorker';
import { handlePayment } from './src/workers/paymentWorker';

async function start() {
  if (!process.env.COLMEIA_PAYMENT_ID_DATABASE) {
    console.warn('[worker] COLMEIA_PAYMENT_ID_DATABASE não configurado: callbacks de pagamento vão falhar');
  }
  await consume(QUEUES.seatAvailability, handleSeatAvailability);
  await consume(QUEUES.payment, handlePayment);
  console.log('Workers rodando');

  const shutdown = async () => {
    await closeRabbit();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Falha ao iniciar workers:', err);
  process.exit(1);
});
