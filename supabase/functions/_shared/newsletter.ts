export type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  unsubscribe_token: string;
};

export type ValidationFilter =
  | "all_active"
  | "strict_email"
  | "has_name"
  | "exclude_recent_30d";

export const BATCH_SIZE = 100;
const PAGE_SIZE = 1000;

/** PostgREST returns at most ~1000 rows per request; page until done. */
export async function fetchAllActiveSubscribers(
  // deno-lint-ignore no-explicit-any
  supabase: any
): Promise<Subscriber[]> {
  const all: Subscriber[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, unsubscribe_token")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .range(from, to);
    if (error) throw error;
    const page = (data ?? []) as Subscriber[];
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return all;
}

async function fetchAllRecentSentSubscriberIds(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  sinceIso: string
): Promise<Set<string>> {
  const ids = new Set<string>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("newsletter_sends")
      .select("subscriber_id")
      .eq("status", "sent")
      .gte("sent_at", sinceIso)
      .not("subscriber_id", "is", null)
      .range(from, to);
    if (error) throw error;
    const page = data ?? [];
    for (const row of page) {
      if (row.subscriber_id) ids.add(row.subscriber_id);
    }
    if (page.length < PAGE_SIZE) break;
  }
  return ids;
}

const STRICT_EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "fakeinbox.com",
  "temp-mail.org",
]);

export function isStrictValidEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!STRICT_EMAIL_RE.test(normalized)) return false;
  if (normalized.includes("..")) return false;
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return false;
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  return true;
}

export function buildEmailHtml(
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

export async function applyValidationFilter(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  subscribers: Subscriber[],
  filter: ValidationFilter
): Promise<Subscriber[]> {
  let list = subscribers;

  if (filter === "has_name") {
    list = list.filter((s) => !!s.name?.trim());
  }

  if (filter === "strict_email" || filter === "all_active") {
    // always drop obviously broken addresses; strict adds disposable/format checks
    if (filter === "strict_email") {
      list = list.filter((s) => isStrictValidEmail(s.email));
    }
  }

  if (filter === "exclude_recent_30d") {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    try {
      const recentIds = await fetchAllRecentSentSubscriberIds(
        supabase,
        since.toISOString()
      );
      list = list.filter((s) => !recentIds.has(s.id));
    } catch (error) {
      console.error("[newsletter] exclude_recent_30d", error);
      throw new Error("No se pudo aplicar el filtro de envíos recientes");
    }
  }

  return list;
}

type ResendBase = {
  from: string;
  reply_to?: string;
};

export async function sendResendBatch(options: {
  resendKey: string;
  resendBase: ResendBase;
  // deno-lint-ignore no-explicit-any
  supabase: any;
  campaignId: string;
  subject: string;
  htmlBody: string;
  siteUrl: string;
  batch: Subscriber[];
}): Promise<{ sent: number; failed: number }> {
  const {
    resendKey,
    resendBase,
    supabase,
    campaignId,
    subject,
    htmlBody,
    siteUrl,
    batch,
  } = options;

  let sent = 0;
  let failed = 0;

  const payload = batch.map((sub) => {
    const unsubscribeUrl = `${siteUrl}/newsletter/baja?token=${sub.unsubscribe_token}`;
    return {
      ...resendBase,
      to: [sub.email],
      subject,
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
    failed = batch.length;
    const sendRows = batch.map((sub) => ({
      campaign_id: campaignId,
      subscriber_id: sub.id,
      email: sub.email,
      status: "failed" as const,
      error_message: body?.message ?? "Error de Resend batch",
    }));
    await supabase.from("newsletter_sends").insert(sendRows);
    return { sent, failed };
  }

  const results: Array<{ id?: string } | string> = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];

  const sendRows = batch.map((sub, idx) => {
    const result = results[idx];
    const resendId =
      typeof result === "string"
        ? result
        : typeof result?.id === "string"
          ? result.id
          : null;

    if (resendId) {
      sent += 1;
      return {
        campaign_id: campaignId,
        subscriber_id: sub.id,
        email: sub.email,
        resend_id: resendId,
        status: "sent" as const,
        sent_at: new Date().toISOString(),
      };
    }

    failed += 1;
    return {
      campaign_id: campaignId,
      subscriber_id: sub.id,
      email: sub.email,
      status: "failed" as const,
      error_message: "Sin id de Resend en la respuesta",
    };
  });

  await supabase.from("newsletter_sends").insert(sendRows);
  return { sent, failed };
}

/** Update existing pending send rows after a Resend batch. */
export async function processPendingSendRows(options: {
  resendKey: string;
  resendBase: ResendBase;
  // deno-lint-ignore no-explicit-any
  supabase: any;
  campaignId: string;
  subject: string;
  htmlBody: string;
  siteUrl: string;
  pendingRows: Array<{
    id: string;
    email: string;
    subscriber_id: string | null;
    unsubscribe_token?: string | null;
  }>;
  tokenBySubscriberId: Map<string, string>;
}): Promise<{ sent: number; failed: number }> {
  const {
    resendKey,
    resendBase,
    supabase,
    subject,
    htmlBody,
    siteUrl,
    pendingRows,
    tokenBySubscriberId,
  } = options;

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < pendingRows.length; i += BATCH_SIZE) {
    const chunk = pendingRows.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((row) => {
      const token =
        (row.subscriber_id && tokenBySubscriberId.get(row.subscriber_id)) ||
        "00000000-0000-4000-8000-000000000000";
      const unsubscribeUrl = `${siteUrl}/newsletter/baja?token=${token}`;
      return {
        ...resendBase,
        to: [row.email],
        subject,
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
      failed += chunk.length;
      for (const row of chunk) {
        await supabase
          .from("newsletter_sends")
          .update({
            status: "failed",
            error_message: body?.message ?? "Error de Resend batch",
          })
          .eq("id", row.id);
      }
      continue;
    }

    const results: Array<{ id?: string } | string> = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : [];

    for (let idx = 0; idx < chunk.length; idx++) {
      const row = chunk[idx];
      const result = results[idx];
      const resendId =
        typeof result === "string"
          ? result
          : typeof result?.id === "string"
            ? result.id
            : null;

      if (resendId) {
        sent += 1;
        await supabase
          .from("newsletter_sends")
          .update({
            status: "sent",
            resend_id: resendId,
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", row.id);
      } else {
        failed += 1;
        await supabase
          .from("newsletter_sends")
          .update({
            status: "failed",
            error_message: "Sin id de Resend en la respuesta",
          })
          .eq("id", row.id);
      }
    }
  }

  return { sent, failed };
}

export function tomorrowUtcIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(14, 0, 0, 0); // ~9am Costa Rica
  return d.toISOString();
}
