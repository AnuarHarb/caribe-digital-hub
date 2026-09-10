import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { getProduct, isValidProductKey } from "../_shared/catalog.ts";

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

    const reference = `CD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const integritySecret = Deno.env.get("WOMPI_INTEGRITY_SECRET") ?? "";
    const signature = await sha256(`${reference}${amountInCents}COP${integritySecret}`);
    const publicKey = Deno.env.get("WOMPI_PUBLIC_KEY") ?? "";

    const { error: insertError } = await supabase.from("orders").insert({
      reference,
      user_id: userId,
      email: orderEmail,
      product_key: productKey,
      amount_cop: amountCop,
      status: "pending",
      wall_consent: !!wallConsent,
    });

    if (insertError) {
      console.error("[create-order]", insertError);
      return new Response(JSON.stringify({ error: "No se pudo crear la orden" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ reference, signature, amountInCents, publicKey }),
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
