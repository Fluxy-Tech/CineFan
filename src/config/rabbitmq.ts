import 'dotenv/config';
import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

const prefix = process.env.RABBITMQ_QUEUE_PREFIX ? `${process.env.RABBITMQ_QUEUE_PREFIX}.` : '';

export const QUEUES = {
  seatAvailability: `${prefix}cinefan.seat-availability`,
  payment: `${prefix}cinefan.payment`,
} as const;

// Fila de espera: ninguém consome. A mensagem expira (expiration) e o RabbitMQ
// a move via dead-letter para a fila de destino. Assim temos atraso sem plugin.
const delayQueue = (queue: string) => `${queue}.delay`;
const DELAYED_QUEUES = [QUEUES.seatAvailability, QUEUES.payment];

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let connecting: Promise<Channel> | null = null;

// Reaproveita a mesma conexão/canal, inclusive em chamadas concorrentes
export function connectRabbit(): Promise<Channel> {
  if (channel) return Promise.resolve(channel);
  connecting ??= openChannel().finally(() => { connecting = null; });
  return connecting;
}

async function openChannel(): Promise<Channel> {
  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  connection.on('error', (err) => console.error('[rabbitmq] connection error:', err.message));
  connection.on('close', () => {
    connection = null;
    channel = null;
  });

  channel = await connection.createChannel();
  for (const queue of Object.values(QUEUES)) {
    await channel.assertQueue(queue, { durable: true });
  }
  for (const queue of DELAYED_QUEUES) {
    await channel.assertQueue(delayQueue(queue), {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': queue },
    });
  }

  console.log('[rabbitmq] connected');
  return channel;
}

export async function closeRabbit() {
  await channel?.close().catch(() => {});
  await connection?.close().catch(() => {});
  channel = null;
  connection = null;
}

// delayMs: entrega a mensagem na fila só depois desse tempo (a fila precisa estar em DELAYED_QUEUES)
export async function publish(queue: string, payload: unknown, delayMs?: number) {
  const ch = await connectRabbit();
  const content = Buffer.from(JSON.stringify(payload));
  const options = { persistent: true, contentType: 'application/json' };

  if (delayMs && delayMs > 0) {
    return ch.sendToQueue(delayQueue(queue), content, { ...options, expiration: String(delayMs) });
  }
  return ch.sendToQueue(queue, content, options);
}

export type MessageHandler<T = any> = (payload: T, msg: ConsumeMessage) => Promise<void>;

// Consome a fila com ack manual: sucesso -> ack, erro -> nack sem requeue (evita loop infinito).
export async function consume<T = any>(queue: string, handler: MessageHandler<T>, prefetch = 10) {
  const ch = await connectRabbit();
  await ch.prefetch(prefetch);

  await ch.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString()) as T;
      await handler(payload, msg);
      ch.ack(msg);
    } catch (err) {
      console.error(`[rabbitmq] error processing message on ${queue}:`, err);
      ch.nack(msg, false, false);
    }
  });

  console.log(`[rabbitmq] consuming ${queue}`);
}
