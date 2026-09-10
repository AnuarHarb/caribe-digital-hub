import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { getProduct, isValidProductKey, type ProductKey } from "../_shared/catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const event = body?.data?.transaction ? body : body?.event ? body : null;

    if (!event?.data?.transaction) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tx = event.data.transaction;
    const reference = tx.reference as string;
    const transactionId = String(tx.id);
    const status = tx.status as string;

    const eventsSecret = Deno.env.get("WOMPI_EVENTS_SECRET") ?? "";
    const checksum = event.signature?.checksum ?? body.signature?.checksum;
    const props = event.signature?.properties ?? [];
    if (eventsSecret && checksum && props.length) {
      const chain = props.map((p: string) => {
        const parts = p.split(".");
        let val: unknown = event.data;
        for (const part of parts) val = (val as Record<string, unknown>)?.[part];
        return String(val ?? "");
      }).join("") + eventsSecret + (event.timestamp ?? "");
      const expected = await sha256(chain);
      if (expected !== checksum) {
        return new Response(JSON.stringify({ error: "Checksum inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await supabase
      .from("orders")
      .select("id, status, product_key, user_id, email, wall_consent")
      .eq("reference", reference)
      .maybeSingle();

    if (!existing) {
      return new Response(JSON.stringify({ error: "Orden no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing.status === "approved") {
      return new Response(JSON.stringify({ ok: true, idempotent: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderStatus = status === "APPROVED" ? "approved" : status === "DECLINED" ? "declined" : "pending";

    await supabase
      .from("orders")
      .update({
        status: orderStatus,
        wompi_transaction_id: transactionId,
        payload: event,
      })
      .eq("id", existing.id);

    if (orderStatus !== "approved" || !isValidProductKey(existing.product_key)) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product = getProduct(existing.product_key as ProductKey);
    if (!product.membershipPlan || !product.months) {
      return new Response(JSON.stringify({ ok: true, noMembership: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const ends = new Date(now);
    ends.setMonth(ends.getMonth() + product.months);

    let userId = existing.user_id;

    const { data: creyenteNum } = await supabase.rpc("next_creyente_number");

    let wallName: string | null = null;
    if (existing.wall_consent && userId) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      wallName = prof?.full_name ?? null;
    }

    await supabase.from("memberships").insert({
      user_id: userId,
      plan: product.membershipPlan,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
      creyente_number: creyenteNum ?? null,
      wall_name: wallName,
      order_id: existing.id,
    });

    // ponytail: renewal reminder email when Wompi tokenization is approved

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
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
