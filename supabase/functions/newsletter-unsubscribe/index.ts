import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    let token = "";

    if (req.method === "GET") {
      const url = new URL(req.url);
      token = (url.searchParams.get("token") ?? "").trim();
    } else {
      const body = await req.json().catch(() => ({}));
      token = typeof body.token === "string" ? body.token.trim() : "";
    }

    if (!token || !UUID_RE.test(token)) {
      return new Response(JSON.stringify({ error: "Enlace de baja inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, status")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findError) {
      console.error("[newsletter-unsubscribe] find", findError);
      return new Response(JSON.stringify({ error: "No se pudo procesar la baja" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!subscriber) {
      return new Response(JSON.stringify({ error: "Enlace de baja no encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (subscriber.status === "unsubscribed") {
      return new Response(
        JSON.stringify({ ok: true, alreadyUnsubscribed: true, email: subscriber.email }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("[newsletter-unsubscribe] update", updateError);
      return new Response(JSON.stringify({ error: "No se pudo procesar la baja" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true, email: subscriber.email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("[newsletter-unsubscribe]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
