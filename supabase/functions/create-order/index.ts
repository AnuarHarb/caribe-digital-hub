import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CATALOG, type ProductKey } from "../_shared/catalog.ts";
import {
  createCardPaymentSource,
  createRecurringTransaction,
  wompiFetch,
  wompiHost,
} from "../_shared/wompi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MEMBERSHIP_KEYS = new Set([
  "miembro_mensual",
  "miembro_anual",
  "residente_mensual",
  "residente_anual",
]);

function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `CD-${ts}-${rand}`;
}

function checkoutUrlFromTransaction(tx: { id?: string; payment_link_id?: string }) {
  if (tx.payment_link_id) return `https://checkout.wompi.co/l/${tx.payment_link_id}`;
  if (tx.id) return `https://checkout.wompi.co/p/${tx.id}`;
  return null;
}

function threeDsHtml(source: { extra?: { three_ds_auth?: { three_ds_method_data?: string } } }) {
  return source.extra?.three_ds_auth?.three_ds_method_data ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const wompiPrivateKey = Deno.env.get("WOMPI_SECRET_KEY");
    const wompiPublicKey = Deno.env.get("WOMPI_PUBLIC_KEY");
    const wompiIntegritySecret = Deno.env.get("WOMPI_INTEGRITY_SECRET");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://costadigital.org";

    if (!wompiPrivateKey) {
      return new Response(JSON.stringify({ error: "Wompi no configurado" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      productKey,
      email: guestEmail,
      cardToken,
      reference: finalizeReference,
      finalize,
    } = body as {
      productKey?: ProductKey;
      email?: string;
      cardToken?: string;
      reference?: string;
      finalize?: boolean;
    };

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        userEmail = user.email ?? null;
      }
    }

    const orderEmail = userEmail ?? guestEmail?.trim()?.toLowerCase();
    if (!orderEmail) {
      return new Response(JSON.stringify({ error: "Email requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Finalize: payment source ready → create transaction
    if (finalize && finalizeReference) {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .eq("reference", finalizeReference)
        .single();

      if (orderErr || !order) {
        return new Response(JSON.stringify({ error: "Orden no encontrada" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (userId && order.user_id && order.user_id !== userId) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload = order.payload as Record<string, unknown> | null;
      const sourceId = payload?.payment_source_id as string | undefined;
      if (!sourceId) {
        return new Response(JSON.stringify({ error: "Orden sin fuente de pago" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const srcRes = await wompiFetch(wompiPrivateKey, `/v1/payment_sources/${sourceId}`);
      const srcJson = await srcRes.json();
      const source = srcJson.data;
      if (!source || source.status !== "AVAILABLE") {
        return new Response(
          JSON.stringify({
            reference: order.reference,
            paymentSourceId: sourceId,
            paymentSourceStatus: source?.status ?? "UNKNOWN",
            threeDsHtml: source ? threeDsHtml(source) : null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (!wompiIntegritySecret) {
        return new Response(JSON.stringify({ error: "Integridad Wompi no configurada" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tx = await createRecurringTransaction({
        privateKey: wompiPrivateKey,
        reference: order.reference,
        amountInCents: order.amount_cop * 100,
        email: orderEmail,
        paymentSourceId: Number(sourceId),
        redirectUrl: `${siteUrl}/pago/resultado?reference=${encodeURIComponent(order.reference)}`,
        integritySecret: wompiIntegritySecret,
      });

      await supabase
        .from("orders")
        .update({
          payload: {
            ...payload,
            wompi_transaction_id: tx.id,
            flow: "recurring",
          },
        })
        .eq("id", order.id);

      const checkoutUrl =
        checkoutUrlFromTransaction(tx) ??
        `${siteUrl}/pago/resultado?reference=${encodeURIComponent(order.reference)}`;

      return new Response(
        JSON.stringify({
          reference: order.reference,
          checkoutUrl,
          transactionId: tx.id,
          paymentSourceStatus: "AVAILABLE",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!productKey || !CATALOG[productKey]) {
      return new Response(JSON.stringify({ error: "Producto inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product = CATALOG[productKey];
    const reference = generateReference();
    const amountInCents = product.amountCop * 100;

    // Recurring card flow: token on client, payment source on server (private key)
    if (cardToken && MEMBERSHIP_KEYS.has(productKey)) {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Inicia sesión para pagar" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!wompiPublicKey) {
        return new Response(JSON.stringify({ error: "WOMPI_PUBLIC_KEY no configurada en Supabase" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let source;
      try {
        source = await createCardPaymentSource({
          privateKey: wompiPrivateKey,
          publicKey: wompiPublicKey,
          cardToken,
          email: orderEmail,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No se pudo registrar la tarjeta";
        return new Response(JSON.stringify({ error: msg }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: insertErr } = await supabase.from("orders").insert({
        reference,
        user_id: userId,
        email: orderEmail,
        product_key: productKey,
        amount_cop: product.amountCop,
        status: "pending",
        payload: {
          payment_source_id: String(source.id),
          flow: "recurring",
          card_last_four: source.public_data?.last_four ?? null,
        },
      });

      if (insertErr) {
        console.error("[create-order] insert", insertErr);
        return new Response(JSON.stringify({ error: "Error al crear orden" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (source.status === "AVAILABLE" && wompiIntegritySecret) {
        const tx = await createRecurringTransaction({
          privateKey: wompiPrivateKey,
          reference,
          amountInCents,
          email: orderEmail,
          paymentSourceId: source.id,
          redirectUrl: `${siteUrl}/pago/resultado?reference=${encodeURIComponent(reference)}`,
          integritySecret: wompiIntegritySecret,
        });

        await supabase
          .from("orders")
          .update({
            payload: {
              payment_source_id: String(source.id),
              flow: "recurring",
              wompi_transaction_id: tx.id,
              card_last_four: source.public_data?.last_four ?? null,
            },
          })
          .eq("reference", reference);

        const checkoutUrl =
          checkoutUrlFromTransaction(tx) ??
          `${siteUrl}/pago/resultado?reference=${encodeURIComponent(reference)}`;

        return new Response(
          JSON.stringify({
            reference,
            checkoutUrl,
            paymentSourceId: String(source.id),
            paymentSourceStatus: source.status,
            transactionId: tx.id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          reference,
          paymentSourceId: String(source.id),
          paymentSourceStatus: source.status,
          threeDsHtml: threeDsHtml(source),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Payment link flow (cowork, tech centre, legacy membership links, etc.)
    const redirectUrl = `${siteUrl}/pago/resultado?reference=${encodeURIComponent(reference)}`;
    const wompiHostName = wompiHost(wompiPrivateKey);
    const linkRes = await fetch(`https://${wompiHostName}/v1/payment_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${wompiPrivateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Membresía Costa Digital",
        description: product.title,
        single_use: true,
        collect_shipping: false,
        currency: "COP",
        amount_in_cents: amountInCents,
        redirect_url: redirectUrl,
      }),
    });

    const linkJson = await linkRes.json();
    if (!linkRes.ok) {
      console.error("[create-order] payment_link", linkRes.status, linkJson);
      return new Response(
        JSON.stringify({ error: linkJson?.error?.reason ?? "Wompi rechazó el link de pago" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paymentLinkId = linkJson.data?.id as string;
    const checkoutUrl = `https://checkout.wompi.co/l/${paymentLinkId}`;

    const { error: insertErr } = await supabase.from("orders").insert({
      reference,
      user_id: userId,
      email: orderEmail,
      product_key: productKey,
      amount_cop: product.amountCop,
      status: "pending",
      payload: { payment_link_id: paymentLinkId },
    });

    if (insertErr) {
      console.error("[create-order] insert", insertErr);
      return new Response(JSON.stringify({ error: "Error al crear orden" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ reference, checkoutUrl, paymentLinkId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[create-order]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
