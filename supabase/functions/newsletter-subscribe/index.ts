import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const { email, name, source } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Correo inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status, unsubscribe_token")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing?.status === "active") {
      return new Response(JSON.stringify({ ok: true, alreadySubscribed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const payload = {
      email: normalizedEmail,
      name: typeof name === "string" && name.trim() ? name.trim() : null,
      source: typeof source === "string" && source.trim() ? source.trim() : "web",
      status: "active" as const,
      unsubscribed_at: null,
    };

    const { data: saved, error } = existing
      ? await supabase
          .from("newsletter_subscribers")
          .update(payload)
          .eq("id", existing.id)
          .select("unsubscribe_token")
          .single()
      : await supabase
          .from("newsletter_subscribers")
          .insert(payload)
          .select("unsubscribe_token")
          .single();

    if (error) {
      console.error("[newsletter-subscribe]", error);
      return new Response(JSON.stringify({ error: "No se pudo suscribir" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Optional welcome email via Resend (non-blocking for subscription success)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const replyTo = Deno.env.get("RESEND_REPLY_TO");
    const siteUrl = (Deno.env.get("NEWSLETTER_SITE_URL") ?? "https://costadigital.org").replace(
      /\/$/,
      ""
    );
    const unsubscribeUrl = saved?.unsubscribe_token
      ? `${siteUrl}/newsletter/baja?token=${saved.unsubscribe_token}`
      : null;

    if (resendKey && fromEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            ...(replyTo ? { reply_to: replyTo } : {}),
            to: [normalizedEmail],
            subject: "Bienvenido a Costa Digital News",
            html: `<p>¡Listo! Ya formas parte de <strong>Costa Digital News</strong>.</p>
<p>Te llegará El Pulso con lo que mueve la vaina tech en el Caribe.</p>
<p>— Anuar de TechCaribe</p>
${
  unsubscribeUrl
    ? `<p style="margin-top:24px;font-size:12px;color:#666;">Si no quieres recibir estos correos, <a href="${unsubscribeUrl}">date de baja aquí</a>.</p>`
    : ""
}`,
          }),
        });
      } catch (welcomeError) {
        console.error("[newsletter-subscribe] welcome email failed", welcomeError);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("[newsletter-subscribe]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
