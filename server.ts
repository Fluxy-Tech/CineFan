import 'dotenv/config';
import app from './app';
import { redis } from './src/config/redis';
import { prisma } from './src/config/prisma';
import { connectRabbit, closeRabbit } from './src/config/rabbitmq';

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  await redis.connect().catch((err) => console.warn('[redis] não conectou:', err.message));
  await connectRabbit().catch((err) => console.warn('[rabbitmq] não conectou:', err.message));

  const server = app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT} (docs: /docs)`);
  });

  const shutdown = async () => {
    server.close();
    await closeRabbit();
    redis.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
