import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 100;

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  unsubscribe_token: string;
};

function buildEmailHtml(
  htmlBody: string,
  unsubscribeUrl: string,
  siteUrl: string
): string {
  const withPlaceholder = htmlBody.includes("{{unsubscribe_url}}")
    ? htmlBody.split("{{unsubscribe_url}}").join(unsubscribeUrl)
    : htmlBody;

  const footer = `
<hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px;" />
<p style="font-size:12px;line-height:1.5;color:#666;">
  Recibes este correo porque te suscribiste a Costa Digital News.
  <a href="${unsubscribeUrl}">Darme de baja</a>
  · <a href="${siteUrl}/noticias">Ver noticias</a>
</p>`;

  return `${withPlaceholder}${footer}`;
}

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
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const replyTo = Deno.env.get("RESEND_REPLY_TO");

    if (!resendKey || !fromEmail) {
      return new Response(
        JSON.stringify({
          error:
            "Resend no está configurado. Define RESEND_API_KEY y RESEND_FROM_EMAIL en los secrets de la edge function.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        }
      );
    }

    const resendBase = {
      from: fromEmail,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    const siteUrl = (Deno.env.get("NEWSLETTER_SITE_URL") ?? "https://costadigital.org").replace(
      /\/$/,
      ""
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Sin permisos de administrador" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { subject, htmlBody, testEmail } = await req.json();

    if (!subject?.trim() || !htmlBody?.trim()) {
      return new Response(JSON.stringify({ error: "Asunto y contenido son requeridos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Test send to a single address (does not create a campaign)
    if (typeof testEmail === "string" && testEmail.trim()) {
      const testUnsubUrl = `${siteUrl}/newsletter/baja?token=00000000-0000-4000-8000-000000000000`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...resendBase,
          to: [testEmail.trim().toLowerCase()],
          subject: `[TEST] ${subject.trim()}`,
          html: buildEmailHtml(htmlBody, testUnsubUrl, siteUrl),
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: body?.message ?? "Error al enviar prueba con Resend" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 502,
          }
        );
      }

      return new Response(JSON.stringify({ ok: true, test: true, resendId: body.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, unsubscribe_token")
      .eq("status", "active");

    if (subError) {
      console.error("[newsletter-send] subscribers", subError);
      return new Response(JSON.stringify({ error: "No se pudieron cargar suscriptores" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const list = (subscribers ?? []) as Subscriber[];
    if (list.length === 0) {
      return new Response(JSON.stringify({ error: "No hay suscriptores activos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        subject: subject.trim(),
        html_body: htmlBody,
        status: "sending",
        created_by: user.id,
        recipient_count: list.length,
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      console.error("[newsletter-send] campaign", campaignError);
      return new Response(JSON.stringify({ error: "No se pudo crear la campaña" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE);
      const payload = batch.map((sub) => {
        const unsubscribeUrl = `${siteUrl}/newsletter/baja?token=${sub.unsubscribe_token}`;
        return {
          ...resendBase,
          to: [sub.email],
          subject: subject.trim(),
          html: buildEmailHtml(htmlBody, unsubscribeUrl, siteUrl),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
          },
        };
      });

      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        failedCount += batch.length;
        const sendRows = batch.map((sub) => ({
          campaign_id: campaign.id,
          subscriber_id: sub.id,
          email: sub.email,
          status: "failed" as const,
          error_message: body?.message ?? "Error de Resend batch",
        }));
        await supabase.from("newsletter_sends").insert(sendRows);
        continue;
      }

      // Resend batch returns { data: [{ id }, ...] } or array of ids depending on API version
      const results: Array<{ id?: string } | string> = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];

      const sendRows = batch.map((sub, idx) => {
        const result = results[idx];
        const resendId =
          typeof result === "string" ? result : typeof result?.id === "string" ? result.id : null;

        if (resendId) {
          sentCount += 1;
          return {
            campaign_id: campaign.id,
            subscriber_id: sub.id,
            email: sub.email,
            resend_id: resendId,
            status: "sent" as const,
            sent_at: new Date().toISOString(),
          };
        }

        failedCount += 1;
        return {
          campaign_id: campaign.id,
          subscriber_id: sub.id,
          email: sub.email,
          status: "failed" as const,
          error_message: "Sin id de Resend en la respuesta",
        };
      });

      await supabase.from("newsletter_sends").insert(sendRows);
    }

    const finalStatus =
      failedCount === list.length ? "failed" : sentCount > 0 ? "sent" : "failed";

    await supabase
      .from("newsletter_campaigns")
      .update({
        status: finalStatus,
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString(),
        error_message:
          failedCount > 0 ? `${failedCount} envío(s) fallaron` : null,
      })
      .eq("id", campaign.id);

    return new Response(
      JSON.stringify({
        ok: true,
        campaignId: campaign.id,
        recipientCount: list.length,
        sentCount,
        failedCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[newsletter-send]", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
