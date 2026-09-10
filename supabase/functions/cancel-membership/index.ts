import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { voidPaymentSource } from "../_shared/wompi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const wompiPrivateKey = Deno.env.get("WOMPI_SECRET_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { membershipId } = (await req.json()) as { membershipId?: string };
    if (!membershipId) {
      return new Response(JSON.stringify({ error: "membershipId requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: membership, error } = await supabase
      .from("memberships")
      .select("id, user_id, wompi_payment_source_id, canceled_at")
      .eq("id", membershipId)
      .single();

    if (error || !membership) {
      return new Response(JSON.stringify({ error: "Membresía no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (membership.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (membership.canceled_at) {
      return new Response(JSON.stringify({ ok: true, alreadyCanceled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wompiPrivateKey && membership.wompi_payment_source_id) {
      try {
        await voidPaymentSource(wompiPrivateKey, membership.wompi_payment_source_id);
      } catch (e) {
        console.warn("[cancel-membership] void source", e);
        // Continue — DB cancel still applies
      }
    }

    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: updateErr } = await service
      .from("memberships")
      .update({ renew: false, canceled_at: new Date().toISOString() })
      .eq("id", membershipId);

    if (updateErr) {
      return new Response(JSON.stringify({ error: "No se pudo cancelar" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[cancel-membership]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
