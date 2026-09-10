import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { getProduct, isValidProductKey } from "../_shared/catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://costadigital.org";

function wompiHost(privateKey: string) {
  return privateKey.startsWith("prv_prod") ? "production.wompi.co" : "sandbox.wompi.co";
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
    const { productKey, email, wallConsent } = await req.json();

    if (!isValidProductKey(productKey)) {
      return new Response(JSON.stringify({ error: "Producto inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product = getProduct(productKey);
    const amountCop = product.amountCop;
    const amountInCents = amountCop * 100;

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let userId: string | null = null;
    let orderEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (authHeader) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        userId = user.id;
        orderEmail = user.email ?? orderEmail;
      }
    }

    if (!orderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail)) {
      return new Response(JSON.stringify({ error: "Correo requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const privateKey = Deno.env.get("WOMPI_SECRET_KEY") ?? "";
    if (!privateKey.startsWith("prv_")) {
      return new Response(JSON.stringify({ error: "Wompi no configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = `CD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const linkRes = await fetch(`https://${wompiHost(privateKey)}/v1/payment_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Membresía Costa Digital",
        description: product.title,
        single_use: true,
        collect_shipping: false,
        amount_in_cents: amountInCents,
        currency: "COP",
        sku: reference,
        redirect_url: `${SITE_URL}/pago/resultado?reference=${reference}`,
      }),
    });
    const linkJson = await linkRes.json();
    const linkId = linkJson?.data?.id as string | undefined;
    if (!linkRes.ok || !linkId) {
      console.error("[create-order] wompi", linkRes.status, linkJson);
      return new Response(JSON.stringify({ error: "Wompi rechazó el link de pago" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await supabase.from("orders").insert({
      reference,
      user_id: userId,
      email: orderEmail,
      product_key: productKey,
      amount_cop: amountCop,
      status: "pending",
      wall_consent: !!wallConsent,
      payload: { payment_link_id: linkId },
    });

    if (insertError) {
      console.error("[create-order]", insertError);
      return new Response(JSON.stringify({ error: "No se pudo crear la orden" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ reference, checkoutUrl: `https://checkout.wompi.co/l/${linkId}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-order]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
