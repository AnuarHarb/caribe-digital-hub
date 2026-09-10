/** Shared Wompi helpers for edge functions (Deno). */

export function wompiHost(privateKey: string) {
  return privateKey.startsWith("prv_prod") ? "production.wompi.co" : "sandbox.wompi.co";
}

export async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function integritySignature(
  reference: string,
  amountInCents: number,
  secret: string,
): Promise<string> {
  return sha256(`${reference}${amountInCents}COP${secret}`);
}

export function wompiHostFromKey(key: string) {
  return key.startsWith("pub_prod") || key.startsWith("prv_prod")
    ? "production.wompi.co"
    : "sandbox.wompi.co";
}

export async function fetchAcceptanceTokens(publicKey: string) {
  const host = wompiHostFromKey(publicKey);
  const res = await fetch(`https://${host}/v1/merchants/${publicKey}`, {
    headers: { Authorization: `Bearer ${publicKey}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.reason ?? "No se pudieron obtener tokens de aceptación");
  }
  const acceptance = json.data?.presigned_acceptance?.acceptance_token as string | undefined;
  const personal = json.data?.presigned_personal_data_auth?.acceptance_token as string | undefined;
  if (!acceptance || !personal || acceptance === personal) {
    throw new Error("Tokens de aceptación Wompi inválidos");
  }
  return { acceptance, personal };
}

export async function createCardPaymentSource(opts: {
  privateKey: string;
  publicKey: string;
  cardToken: string;
  email: string;
}) {
  const { acceptance, personal } = await fetchAcceptanceTokens(opts.publicKey);
  const res = await wompiFetch(opts.privateKey, "/v1/payment_sources", {
    method: "POST",
    body: JSON.stringify({
      type: "CARD",
      token: opts.cardToken,
      customer_email: opts.email,
      acceptance_token: acceptance,
      accept_personal_auth: personal,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("[wompi] payment_source", res.status, json?.error?.type, json?.error?.reason);
    throw new Error(json?.error?.reason ?? "No se pudo registrar la tarjeta");
  }
  return json.data as {
    id: number;
    status: string;
    public_data?: { last_four?: string };
    extra?: { three_ds_auth?: { three_ds_method_data?: string } };
  };
}

export async function wompiFetch(
  privateKey: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const host = wompiHost(privateKey);
  return fetch(`https://${host}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${privateKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function voidPaymentSource(privateKey: string, sourceId: string) {
  const res = await wompiFetch(privateKey, `/v1/payment_sources/${sourceId}/void`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.reason ?? "No se pudo anular la fuente de pago");
  }
  return json;
}

export async function createRecurringTransaction(opts: {
  privateKey: string;
  reference: string;
  amountInCents: number;
  email: string;
  paymentSourceId: number;
  redirectUrl: string;
  integritySecret: string;
}) {
  const signature = await integritySignature(
    opts.reference,
    opts.amountInCents,
    opts.integritySecret,
  );
  const res = await wompiFetch(opts.privateKey, "/v1/transactions", {
    method: "POST",
    body: JSON.stringify({
      amount_in_cents: opts.amountInCents,
      currency: "COP",
      customer_email: opts.email,
      reference: opts.reference,
      payment_source_id: opts.paymentSourceId,
      payment_method: { installments: 1 },
      recurrent: true,
      signature,
      redirect_url: opts.redirectUrl,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("[wompi] transaction", res.status, json);
    throw new Error(json?.error?.reason ?? "Wompi rechazó la transacción");
  }
  return json.data as {
    id: string;
    status: string;
    payment_link_id?: string;
    payment_source_id?: number;
  };
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
