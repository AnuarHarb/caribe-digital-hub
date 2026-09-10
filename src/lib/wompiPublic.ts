const pubKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined;

export function wompiPublicHost() {
  if (!pubKey) return "sandbox.wompi.co";
  return pubKey.startsWith("pub_prod") ? "production.wompi.co" : "sandbox.wompi.co";
}

export function wompiPublicKey() {
  if (!pubKey) throw new Error("VITE_WOMPI_PUBLIC_KEY no configurada");
  return pubKey;
}

export async function wompiPublicFetch(path: string, init?: RequestInit) {
  const host = wompiPublicHost();
  return fetch(`https://${host}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${wompiPublicKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export interface MerchantAcceptance {
  acceptanceToken: string;
  personalAuthToken: string;
  acceptancePermalink: string;
  personalAuthPermalink: string;
}

export async function fetchMerchantAcceptance(): Promise<MerchantAcceptance> {
  const key = wompiPublicKey();
  const res = await wompiPublicFetch(`/v1/merchants/${key}`);
  const json = await res.json();
  if (!res.ok) throw new Error("No se pudieron cargar los términos de Wompi");
  const data = json.data;
  return {
    acceptanceToken: data.presigned_acceptance.acceptance_token,
    personalAuthToken: data.presigned_personal_data_auth.acceptance_token,
    acceptancePermalink: data.presigned_acceptance.permalink,
    personalAuthPermalink: data.presigned_personal_data_auth.permalink,
  };
}

function normalizeExpYear(year: string) {
  const digits = year.replace(/\D/g, "");
  if (digits.length === 4) return digits.slice(-2);
  return digits.padStart(2, "0").slice(-2);
}

export async function tokenizeCard(card: {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holder: string;
}) {
  const res = await wompiPublicFetch("/v1/tokens/cards", {
    method: "POST",
    body: JSON.stringify({
      number: card.number.replace(/\s/g, ""),
      exp_month: card.expMonth.padStart(2, "0").slice(-2),
      exp_year: normalizeExpYear(card.expYear),
      cvc: card.cvc,
      card_holder: card.holder.trim(),
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.reason ?? "No se pudo tokenizar la tarjeta");
  }
  return json.data.id as string;
}

