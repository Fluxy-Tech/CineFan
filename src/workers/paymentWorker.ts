import { ConsumeMessage } from 'amqplib';

export type PaymentMessage = {
  type: 'TICKET' | 'SNACK';
  id: number;
  value: number;
  idUser: number;
};

// TODO: implementar o processamento de pagamento.
// Se lançar erro, a mensagem recebe nack (sem requeue).
export async function handlePayment(payload: PaymentMessage, _msg: ConsumeMessage) {
  console.log('[payment] mensagem recebida:', payload);
}
