import { supabase } from "@/integrations/supabase/client";

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
    resendId?: string;
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
