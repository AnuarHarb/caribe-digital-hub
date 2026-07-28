import { supabase } from "@/integrations/supabase/client";

export type NewsletterSendMode = "immediate" | "staggered";
export type NewsletterValidationFilter =
  | "all_active"
  | "strict_email"
  | "has_name"
  | "exclude_recent_30d";

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

/** Client-side estimate of recipients for a validation filter (exclude_recent needs server). */
export function estimateFilteredRecipients(
  subscribers: Array<{ email: string; name: string | null; status: string }>,
  filter: NewsletterValidationFilter
): number {
  const active = subscribers.filter((s) => s.status === "active");
  switch (filter) {
    case "has_name":
      return active.filter((s) => !!s.name?.trim()).length;
    case "strict_email":
      return active.filter((s) => isStrictValidEmail(s.email)).length;
    case "exclude_recent_30d":
      // Exact count is applied server-side; show active as upper bound.
      return active.length;
    default:
      return active.length;
  }
}

export async function subscribeToNewsletter(
  email: string,
  options?: { name?: string; source?: string }
) {
  const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
    body: {
      email,
      name: options?.name,
      source: options?.source ?? "web",
    },
  });

  if (error) {
    throw new Error(error.message || "No se pudo suscribir");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as { ok: boolean; alreadySubscribed?: boolean };
}

export async function sendNewsletter(payload: {
  subject: string;
  htmlBody: string;
  testEmail?: string;
  sendMode?: NewsletterSendMode;
  dailyLimit?: number;
  validationFilter?: NewsletterValidationFilter;
}) {
  const { data, error } = await supabase.functions.invoke("newsletter-send", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "No se pudo enviar el newsletter");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as {
    ok: boolean;
    test?: boolean;
    campaignId?: string;
    recipientCount?: number;
    sentCount?: number;
    failedCount?: number;
    pendingCount?: number;
    sendMode?: NewsletterSendMode;
    dailyLimit?: number;
    nextBatchAt?: string | null;
    resendId?: string;
  };
}

export type NewsletterUserLink = {
  subscriber_id: string;
  email: string;
  subscriber_status: string;
  subscriber_name: string | null;
  user_id: string;
  full_name: string | null;
};

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: string;
  created_at: string;
  unsubscribed_at: string | null;
};

/** PostgREST caps each response at ~1000 rows; page until exhausted. */
const PAGE_SIZE = 1000;

export async function fetchAllNewsletterSubscribers() {
  const all: NewsletterSubscriberRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, status, source, created_at, unsubscribed_at")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    const page = (data ?? []) as NewsletterSubscriberRow[];
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return all;
}

export async function fetchNewsletterUserLinks() {
  const all: NewsletterUserLink[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .rpc("admin_list_newsletter_user_links")
      .range(from, to);
    if (error) throw error;
    const page = (data ?? []) as NewsletterUserLink[];
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return all;
}

export type CampaignSendStatus = "pending" | "sent" | "failed" | "cancelled";

export type CampaignSendRow = {
  id: string;
  email: string;
  status: CampaignSendStatus;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

export type CampaignSendCounts = {
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
  total: number;
};

async function countSends(campaignId: string, status?: CampaignSendStatus) {
  let query = supabase
    .from("newsletter_sends")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);
  if (status) query = query.eq("status", status);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function fetchCampaignSendCounts(
  campaignId: string
): Promise<CampaignSendCounts> {
  const [pending, sent, failed, cancelled, total] = await Promise.all([
    countSends(campaignId, "pending"),
    countSends(campaignId, "sent"),
    countSends(campaignId, "failed"),
    countSends(campaignId, "cancelled"),
    countSends(campaignId),
  ]);
  return { pending, sent, failed, cancelled, total };
}

export async function fetchCampaignSendsPage(
  campaignId: string,
  options?: {
    status?: CampaignSendStatus | "all";
    page?: number;
    pageSize?: number;
  }
) {
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 50;
  const status = options?.status ?? "all";
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("newsletter_sends")
    .select("id, email, status, resend_id, error_message, sent_at, created_at", {
      count: "exact",
    })
    .eq("campaign_id", campaignId);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  // Prefer recently sent first, then pending queue, then the rest.
  const { data, error, count } = await query
    .order("sent_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    rows: (data ?? []) as CampaignSendRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function updateCampaignSchedule(
  campaignId: string,
  nextBatchAt: string
) {
  const { error } = await supabase
    .from("newsletter_campaigns")
    .update({ next_batch_at: nextBatchAt })
    .eq("id", campaignId)
    .eq("status", "sending");
  if (error) throw error;
}

export async function cancelStaggeredCampaign(campaignId: string) {
  const { error: sendsError } = await supabase
    .from("newsletter_sends")
    .update({
      status: "cancelled",
      error_message: "Cancelado por administrador",
    })
    .eq("campaign_id", campaignId)
    .eq("status", "pending");
  if (sendsError) throw sendsError;

  const { error: campaignError } = await supabase
    .from("newsletter_campaigns")
    .update({
      status: "cancelled",
      next_batch_at: null,
      error_message: "Campaña cancelada: envíos pendientes detenidos",
    })
    .eq("id", campaignId)
    .eq("status", "sending");
  if (campaignError) throw campaignError;
}

export async function processNewsletterBatch(options?: {
  campaignId?: string;
  force?: boolean;
}) {
  const { data, error } = await supabase.functions.invoke("newsletter-process-batch", {
    body: options ?? {},
  });

  if (error) {
    throw new Error(error.message || "No se pudo procesar el lote");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as {
    ok: boolean;
    processed: number;
    message?: string;
    results?: Array<{
      campaignId: string;
      sentCount: number;
      failedCount: number;
      pendingCount: number;
      done: boolean;
    }>;
  };
}

export type ParsedSubscriberCsv = {
  rows: Array<{ email: string; name?: string }>;
  /** Valid email rows in the file (including in-file duplicates). */
  totalValid: number;
  /** Rows skipped because the email already appeared earlier in the file. */
  duplicatesInFile: number;
  /** Rows without a usable email. */
  invalid: number;
};

/** Parse a CSV with at least an email column (header optional). */
export function parseSubscriberCsv(text: string): Array<{ email: string; name?: string }> {
  return parseSubscriberCsvDetailed(text).rows;
}

export function parseSubscriberCsvDetailed(text: string): ParsedSubscriberCsv {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], totalValid: 0, duplicatesInFile: 0, invalid: 0 };
  }

  const split = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const first = split(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = first.some((c) => c === "email" || c === "correo" || c === "e-mail");
  const emailIdx = hasHeader
    ? first.findIndex((c) => c === "email" || c === "correo" || c === "e-mail")
    : 0;
  const nameIdx = hasHeader
    ? first.findIndex((c) => c === "name" || c === "nombre" || c === "full_name")
    : first.length > 1
      ? 1
      : -1;

  const sourceLines = hasHeader ? lines.slice(1) : lines;
  const out: Array<{ email: string; name?: string }> = [];
  const seen = new Set<string>();
  let duplicatesInFile = 0;
  let invalid = 0;
  let totalValid = 0;

  for (const line of sourceLines) {
    const cells = split(line);
    const email = (cells[emailIdx] ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      invalid += 1;
      continue;
    }
    totalValid += 1;
    if (seen.has(email)) {
      duplicatesInFile += 1;
      continue;
    }
    seen.add(email);
    const name = nameIdx >= 0 ? (cells[nameIdx] ?? "").trim() : "";
    out.push(name ? { email, name } : { email });
  }

  return { rows: out, totalValid, duplicatesInFile, invalid };
}

export async function fetchExistingSubscriberEmails() {
  const emails = new Set<string>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .range(from, to);
    if (error) throw error;
    const page = data ?? [];
    for (const row of page) {
      emails.add(row.email.toLowerCase());
    }
    if (page.length < PAGE_SIZE) break;
  }
  return emails;
}

export type ImportSubscribersResult = {
  added: number;
  duplicates: number;
  duplicatesInFile: number;
  invalid: number;
};

/** Insert only new emails; never update existing subscribers. */
export async function importNewsletterSubscribers(
  rows: Array<{ email: string; name?: string }>,
  options?: { duplicatesInFile?: number; invalid?: number }
): Promise<ImportSubscribersResult> {
  const duplicatesInFile = options?.duplicatesInFile ?? 0;
  const invalid = options?.invalid ?? 0;

  if (rows.length === 0) {
    return { added: 0, duplicates: 0, duplicatesInFile, invalid };
  }

  const existing = await fetchExistingSubscriberEmails();
  const toInsert: Array<{
    email: string;
    name: string | null;
    source: string;
    status: "active";
    unsubscribed_at: null;
  }> = [];
  let duplicates = 0;

  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (existing.has(email)) {
      duplicates += 1;
      continue;
    }
    existing.add(email);
    toInsert.push({
      email,
      name: row.name?.trim() || null,
      source: "import",
      status: "active",
      unsubscribed_at: null,
    });
  }

  const chunkSize = 200;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from("newsletter_subscribers").insert(chunk);
    if (error) throw error;
  }

  return {
    added: toInsert.length,
    duplicates,
    duplicatesInFile,
    invalid,
  };
}
