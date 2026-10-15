import 'dotenv/config';

type Callback = {
  idCallback: string;
  idDatabase: string;
  answer: Record<string, string>;
};

const MAX_ATTEMPTS = 3;

// Retoma um fluxo do bot na Colmeia (POST callback-resume-bot-flow), com até 3 tentativas
export async function sendCallback({ idCallback, idDatabase, answer }: Callback) {
  if (!idDatabase) throw new Error('idDatabase não configurado para o callback');
  const body = { idCallback, idDatabase, answer };

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

const onlyDigits = (phone: string) => phone.replace(/\D/g, '');

// Resultado da checagem de assentos
export function sendSeatCallback(p: { idCallback: string; idDatabase?: string | null; phone: string; approved: boolean; reason: string }) {
  return sendCallback({
    idCallback: p.idCallback,
    idDatabase: p.idDatabase || process.env.COLMEIA_ID_DATABASE!,
    answer: { celular: onlyDigits(p.phone), liberadoParaPagamento: String(p.approved), motivo: p.reason },
  });
}

// Resultado do pagamento do ticket
export function sendPaymentCallback(p: { idCallback: string; idDatabase?: string | null; phone: string; status: string; reason: string }) {
  return sendCallback({
    idCallback: p.idCallback,
    idDatabase: p.idDatabase || process.env.COLMEIA_PAYMENT_ID_DATABASE!,
    answer: { celular: onlyDigits(p.phone), statusPagamento: p.status, motivo: p.reason },
  });
}
