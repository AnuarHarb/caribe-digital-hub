import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CATALOG, type ProductKey } from "../_shared/catalog.ts";
import { activateMembership } from "../_shared/membership.ts";
import { createRecurringTransaction } from "../_shared/wompi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function generateReference() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `CD-R-${ts}-${rand}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("MEMBERSHIP_CRON_SECRET");
    const headerSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || headerSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const wompiPrivateKey = Deno.env.get("WOMPI_SECRET_KEY");
    const wompiIntegritySecret = Deno.env.get("WOMPI_INTEGRITY_SECRET");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://costadigital.org";

    if (!wompiPrivateKey || !wompiIntegritySecret) {
      return new Response(JSON.stringify({ error: "Wompi no configurado" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { membershipId: forceId } = body as { membershipId?: string };

    const now = new Date();
    const horizon = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let query = supabase
      .from("memberships")
      .select("*")
      .eq("renew", true)
      .is("canceled_at", null)
      .not("wompi_payment_source_id", "is", null)
      .not("product_key", "is", null);

    if (forceId) {
      query = query.eq("id", forceId);
    } else {
      query = query.lte("ends_at", horizon.toISOString());
    }

    const { data: memberships, error } = await query;
    if (error) {
      console.error("[renew-memberships] query", error);
      return new Response(JSON.stringify({ error: "Error al consultar membresías" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { membershipId: string; status: string; reference?: string }[] = [];

    for (const m of memberships ?? []) {
      const productKey = m.product_key as ProductKey;
      const product = CATALOG[productKey];
      if (!product) {
        results.push({ membershipId: m.id, status: "invalid_product" });
        continue;
      }

      // Skip if a pending renewal order exists in the last 24h
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, status")
        .contains("payload", { membership_id: m.id, renewal: true })
        .gte("created_at", dayAgo.toISOString())
        .in("status", ["pending", "approved"]);

      if (recentOrders && recentOrders.length > 0) {
        results.push({ membershipId: m.id, status: "skipped_recent_order" });
        continue;
      }

      const reference = generateReference();
      const email = m.email ?? (m.user_id ? undefined : null);

      let orderEmail = email;
      if (!orderEmail && m.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(m.user_id);
        orderEmail = userData?.user?.email ?? null;
      }
      if (!orderEmail) {
        results.push({ membershipId: m.id, status: "no_email" });
        continue;
      }

      const { error: insertErr } = await supabase.from("orders").insert({
        reference,
        user_id: m.user_id,
        email: orderEmail,
        product_key: productKey,
        amount_cop: product.amountCop,
        status: "pending",
        payload: {
          membership_id: m.id,
          renewal: true,
          payment_source_id: m.wompi_payment_source_id,
          flow: "recurring",
        },
      });

      if (insertErr) {
        results.push({ membershipId: m.id, status: "order_error" });
        continue;
      }

      try {
        const tx = await createRecurringTransaction({
          privateKey: wompiPrivateKey,
          reference,
          amountInCents: product.amountCop * 100,
          email: orderEmail,
          paymentSourceId: Number(m.wompi_payment_source_id),
          redirectUrl: `${siteUrl}/pago/resultado?reference=${encodeURIComponent(reference)}`,
          integritySecret: wompiIntegritySecret,
        });

        await supabase
          .from("orders")
          .update({
            payload: {
              membership_id: m.id,
              renewal: true,
              payment_source_id: m.wompi_payment_source_id,
              flow: "recurring",
              wompi_transaction_id: tx.id,
            },
          })
          .eq("reference", reference);

        if (tx.status === "APPROVED") {
          await supabase.from("orders").update({ status: "approved" }).eq("reference", reference);
          const { data: order } = await supabase
            .from("orders")
            .select("*")
            .eq("reference", reference)
            .single();
          if (order) {
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
          }
        }

        results.push({
          membershipId: m.id,
          status: tx.status ?? "created",
          reference,
        });
      } catch (e) {
        console.error("[renew-memberships] charge", m.id, e);
        results.push({ membershipId: m.id, status: "charge_failed" });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[renew-memberships]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
