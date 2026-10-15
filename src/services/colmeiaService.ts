import 'dotenv/config';

type SeatCallback = {
  idCallback: string;
  idDatabase?: string | null;
  phone: string;
  approved: boolean;
  reason: string;
};

const MAX_ATTEMPTS = 3;

// Retoma o fluxo do bot na Colmeia informando se os assentos foram liberados para pagamento
export async function sendSeatCallback({ idCallback, idDatabase, phone, approved, reason }: SeatCallback) {
  const body = {
    idCallback,
    idDatabase: idDatabase || process.env.COLMEIA_ID_DATABASE,
    answer: {
      celular: phone.replace(/\D/g, ''),
      liberadoParaPagamento: String(approved),
      motivo: reason,
    },
  };

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(process.env.COLMEIA_CALLBACK_URL!, {
        method: 'POST',
        headers: {
          Authorization: process.env.COLMEIA_TOKEN!,
          idSocialNetwork: process.env.COLMEIA_ID_SOCIAL_NETWORK!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return;
    } catch (err: any) {
      if (attempt >= MAX_ATTEMPTS) throw new Error(`Callback Colmeia falhou após ${attempt} tentativas: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}
