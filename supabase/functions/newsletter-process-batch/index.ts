import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import {
  processPendingSendRows,
  tomorrowUtcIso,
} from "../_shared/newsletter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

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

    // Auth: admin JWT or cron secret
    const cronSecret = Deno.env.get("NEWSLETTER_CRON_SECRET");
    const providedCron = req.headers.get("x-cron-secret");
    const isCron = !!cronSecret && providedCron === cronSecret;

    if (!isCron) {
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
    }

    const body = await req.json().catch(() => ({}));
    const campaignId =
      typeof body?.campaignId === "string" && body.campaignId.trim()
        ? body.campaignId.trim()
        : null;
    const force = body?.force === true;

    let query = supabase
      .from("newsletter_campaigns")
      .select(
        "id, subject, html_body, daily_limit, sent_count, failed_count, recipient_count, next_batch_at"
      )
      .eq("status", "sending")
      .eq("send_mode", "staggered");

    if (campaignId) {
      query = query.eq("id", campaignId);
    }

    const { data: rawCampaigns, error: campErr } = await query.order("created_at", {
      ascending: true,
    });

    if (campErr) {
      console.error("[newsletter-process-batch] campaigns", campErr);
      return new Response(JSON.stringify({ error: "No se pudieron cargar campañas" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const now = Date.now();
    const campaigns = (rawCampaigns ?? []).filter((c) => {
      if (campaignId || force) return true;
      if (!c.next_batch_at) return true;
      return new Date(c.next_batch_at).getTime() <= now;
    });

    if (!campaigns.length) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "No hay lotes pendientes" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const results: Array<{
      campaignId: string;
      sentCount: number;
      failedCount: number;
      pendingCount: number;
      done: boolean;
    }> = [];

    for (const campaign of campaigns) {
      const dailyLimit = campaign.daily_limit && campaign.daily_limit > 0
        ? campaign.daily_limit
        : 100;

      const { data: pendingRows, error: pendingErr } = await supabase
        .from("newsletter_sends")
        .select("id, email, subscriber_id")
        .eq("campaign_id", campaign.id)
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(dailyLimit);

      if (pendingErr) {
        console.error("[newsletter-process-batch] pending", pendingErr);
        continue;
      }

      if (!pendingRows?.length) {
        await supabase
          .from("newsletter_campaigns")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            next_batch_at: null,
          })
          .eq("id", campaign.id);
        results.push({
          campaignId: campaign.id,
          sentCount: 0,
          failedCount: 0,
          pendingCount: 0,
          done: true,
        });
        continue;
      }

      const subscriberIds = pendingRows
        .map((r) => r.subscriber_id)
        .filter((id): id is string => !!id);

      const tokenBySubscriberId = new Map<string, string>();
      if (subscriberIds.length > 0) {
        const { data: subs } = await supabase
          .from("newsletter_subscribers")
          .select("id, unsubscribe_token")
          .in("id", subscriberIds);
        for (const sub of subs ?? []) {
          tokenBySubscriberId.set(sub.id, sub.unsubscribe_token);
        }
      }

      const batchResult = await processPendingSendRows({
        resendKey,
        resendBase,
        supabase,
        campaignId: campaign.id,
        subject: campaign.subject,
        htmlBody: campaign.html_body,
        siteUrl,
        pendingRows,
        tokenBySubscriberId,
      });

      const sentCount = (campaign.sent_count ?? 0) + batchResult.sent;
      const failedCount = (campaign.failed_count ?? 0) + batchResult.failed;

      const { count: remaining } = await supabase
        .from("newsletter_sends")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaign.id)
        .eq("status", "pending");

      const pendingCount = remaining ?? 0;
      const done = pendingCount === 0;

      await supabase
        .from("newsletter_campaigns")
        .update({
          status: done ? "sent" : "sending",
          sent_count: sentCount,
          failed_count: failedCount,
          sent_at: done ? new Date().toISOString() : null,
          next_batch_at: done ? null : tomorrowUtcIso(),
          error_message: failedCount > 0 ? `${failedCount} envío(s) fallaron` : null,
        })
        .eq("id", campaign.id);

      results.push({
        campaignId: campaign.id,
        sentCount: batchResult.sent,
        failedCount: batchResult.failed,
        pendingCount,
        done,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("[newsletter-process-batch]", err);
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
