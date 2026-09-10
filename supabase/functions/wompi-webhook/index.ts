import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { activateMembership } from "../_shared/membership.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wompi-signature",
};

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function processApprovedTransaction(
  supabase: ReturnType<typeof createClient>,
  tx: {
    reference?: string;
    id?: string;
    payment_link_id?: string;
    payment_source_id?: number | string;
    status?: string;
  },
) {
  if (tx.status && tx.status !== "APPROVED") return { ok: false, reason: "not_approved" };

  let orderQuery = supabase.from("orders").select("*");

  if (tx.reference) {
    orderQuery = orderQuery.eq("reference", tx.reference);
  } else if (tx.payment_link_id) {
    orderQuery = orderQuery.contains("payload", { payment_link_id: tx.payment_link_id });
  } else if (tx.payment_source_id) {
    orderQuery = orderQuery.contains("payload", {
      payment_source_id: String(tx.payment_source_id),
    });
  } else if (tx.id) {
    orderQuery = orderQuery.contains("payload", { wompi_transaction_id: tx.id });
  } else {
    return { ok: false, reason: "no_lookup" };
  }

  const { data: order, error } = await orderQuery.maybeSingle();
  if (error || !order) return { ok: false, reason: "order_not_found" };
  if (order.status === "approved") return { ok: true, reason: "already_processed" };

  await supabase
    .from("orders")
    .update({
      status: "approved",
      payload: {
        ...(order.payload as Record<string, unknown> | null),
        wompi_transaction_id: tx.id,
        payment_source_id: tx.payment_source_id
          ? String(tx.payment_source_id)
          : (order.payload as Record<string, unknown> | null)?.payment_source_id,
      },
    })
    .eq("id", order.id);

  await activateMembership(
    supabase,
    {
      id: order.id,
      user_id: order.user_id,
      email: order.email,
      product_key: order.product_key,
      payload: order.payload as Record<string, unknown> | null,
    },
    tx,
  );

  return { ok: true, reason: "processed" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const eventsSecret = Deno.env.get("WOMPI_EVENTS_SECRET");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // Manual sync from PagoResultado (transactionId poll)
    if (body.transactionId && !body.event) {
      const wompiPrivateKey = Deno.env.get("WOMPI_SECRET_KEY");
      if (!wompiPrivateKey) {
        return new Response(JSON.stringify({ error: "Wompi no configurado" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const host = wompiPrivateKey.startsWith("prv_prod")
        ? "production.wompi.co"
        : "sandbox.wompi.co";
      const txRes = await fetch(`https://${host}/v1/transactions/${body.transactionId}`, {
        headers: { Authorization: `Bearer ${wompiPrivateKey}` },
      });
      const txJson = await txRes.json();
      const tx = txJson.data;
      if (!tx) {
        return new Response(JSON.stringify({ error: "Transacción no encontrada" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await processApprovedTransaction(supabase, tx);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Wompi webhook event
    const signature = req.headers.get("x-wompi-signature") ?? req.headers.get("X-Event-Checksum");
    const event = body.event ?? body;
    const tx = event?.data?.transaction ?? event?.transaction ?? body.data?.transaction;

    if (eventsSecret && signature && tx) {
      const checksum = await sha256Hex(
        `${tx.id}${tx.status}${tx.amount_in_cents}${eventsSecret}`,
      );
      if (checksum !== signature) {
        console.warn("[wompi-webhook] invalid signature");
        return new Response(JSON.stringify({ error: "Firma inválida" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (tx?.status === "APPROVED") {
      await processApprovedTransaction(supabase, tx);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[wompi-webhook]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
