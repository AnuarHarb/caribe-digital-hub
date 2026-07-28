import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import {
  applyValidationFilter,
  BATCH_SIZE,
  buildEmailHtml,
  processPendingSendRows,
  sendResendBatch,
  tomorrowUtcIso,
  type Subscriber,
  type ValidationFilter,
} from "../_shared/newsletter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const VALID_FILTERS = new Set<ValidationFilter>([
  "all_active",
  "strict_email",
  "has_name",
  "exclude_recent_30d",
]);

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

    const body = await req.json();
    const {
      subject,
      htmlBody,
      testEmail,
      sendMode = "immediate",
      dailyLimit,
      validationFilter = "all_active",
    } = body;

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

      const testBody = await res.json();
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: testBody?.message ?? "Error al enviar prueba con Resend" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 502,
          }
        );
      }

      return new Response(JSON.stringify({ ok: true, test: true, resendId: testBody.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const mode = sendMode === "staggered" ? "staggered" : "immediate";
    const filter = (
      VALID_FILTERS.has(validationFilter) ? validationFilter : "all_active"
    ) as ValidationFilter;

    let limit: number | null = null;
    if (mode === "staggered") {
      const parsed = Number(dailyLimit);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5000) {
        return new Response(
          JSON.stringify({
            error: "Para envío escalonado indica cuántos correos enviar por día (1–5000).",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      limit = Math.floor(parsed);
    }

    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, unsubscribe_token")
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (subError) {
      console.error("[newsletter-send] subscribers", subError);
      return new Response(JSON.stringify({ error: "No se pudieron cargar suscriptores" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    let list = await applyValidationFilter(
      supabase,
      (subscribers ?? []) as Subscriber[],
      filter
    );

    if (list.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No hay suscriptores que cumplan el filtro de validación seleccionado",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        subject: subject.trim(),
        html_body: htmlBody,
        status: "sending",
        created_by: user.id,
        recipient_count: list.length,
        send_mode: mode,
        daily_limit: limit,
        validation_filter: filter,
        next_batch_at: mode === "staggered" ? new Date().toISOString() : null,
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
    let pendingCount = 0;

    if (mode === "immediate") {
      for (let i = 0; i < list.length; i += BATCH_SIZE) {
        const batch = list.slice(i, i + BATCH_SIZE);
        const result = await sendResendBatch({
          resendKey,
          resendBase,
          supabase,
          campaignId: campaign.id,
          subject: subject.trim(),
          htmlBody,
          siteUrl,
          batch,
        });
        sentCount += result.sent;
        failedCount += result.failed;
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
          next_batch_at: null,
          error_message: failedCount > 0 ? `${failedCount} envío(s) fallaron` : null,
        })
        .eq("id", campaign.id);

      return new Response(
        JSON.stringify({
          ok: true,
          campaignId: campaign.id,
          recipientCount: list.length,
          sentCount,
          failedCount,
          pendingCount: 0,
          sendMode: mode,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Staggered: queue all as pending, then send today's batch
    const pendingRows = list.map((sub) => ({
      campaign_id: campaign.id,
      subscriber_id: sub.id,
      email: sub.email,
      status: "pending" as const,
    }));

    for (let i = 0; i < pendingRows.length; i += 500) {
      const chunk = pendingRows.slice(i, i + 500);
      const { error: insertErr } = await supabase.from("newsletter_sends").insert(chunk);
      if (insertErr) {
        console.error("[newsletter-send] queue pending", insertErr);
        await supabase
          .from("newsletter_campaigns")
          .update({
            status: "failed",
            error_message: "No se pudo encolar los destinatarios",
          })
          .eq("id", campaign.id);
        return new Response(JSON.stringify({ error: "No se pudo encolar los destinatarios" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    const { data: todayPending, error: pendingErr } = await supabase
      .from("newsletter_sends")
      .select("id, email, subscriber_id")
      .eq("campaign_id", campaign.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(limit!);

    if (pendingErr) {
      console.error("[newsletter-send] load pending", pendingErr);
      return new Response(JSON.stringify({ error: "No se pudieron cargar envíos pendientes" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const tokenBySubscriberId = new Map(list.map((s) => [s.id, s.unsubscribe_token]));
    const batchResult = await processPendingSendRows({
      resendKey,
      resendBase,
      supabase,
      campaignId: campaign.id,
      subject: subject.trim(),
      htmlBody,
      siteUrl,
      pendingRows: todayPending ?? [],
      tokenBySubscriberId,
    });

    sentCount = batchResult.sent;
    failedCount = batchResult.failed;

    const { count: remaining } = await supabase
      .from("newsletter_sends")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("status", "pending");

    pendingCount = remaining ?? 0;
    const done = pendingCount === 0;

    await supabase
      .from("newsletter_campaigns")
      .update({
        status: done ? (sentCount > 0 || failedCount < list.length ? "sent" : "failed") : "sending",
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: done ? new Date().toISOString() : null,
        next_batch_at: done ? null : tomorrowUtcIso(),
        error_message: failedCount > 0 ? `${failedCount} envío(s) fallaron` : null,
      })
      .eq("id", campaign.id);

    return new Response(
      JSON.stringify({
        ok: true,
        campaignId: campaign.id,
        recipientCount: list.length,
        sentCount,
        failedCount,
        pendingCount,
        sendMode: mode,
        dailyLimit: limit,
        nextBatchAt: done ? null : tomorrowUtcIso(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[newsletter-send]", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Error interno",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
