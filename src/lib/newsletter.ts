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

/** Parse a CSV with at least an email column (header optional). */
export function parseSubscriberCsv(text: string): Array<{ email: string; name?: string }> {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

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

  const rows = hasHeader ? lines.slice(1) : lines;
  const out: Array<{ email: string; name?: string }> = [];
  const seen = new Set<string>();

  for (const line of rows) {
    const cells = split(line);
    const email = (cells[emailIdx] ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    const name = nameIdx >= 0 ? (cells[nameIdx] ?? "").trim() : "";
    out.push(name ? { email, name } : { email });
  }

  return out;
}
