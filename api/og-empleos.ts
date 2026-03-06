import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const SITE_URL = "https://costadigital.org";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = req.query.slug;
  if (!slug || typeof slug !== "string") {
    res.redirect(301, SITE_URL);
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    res.redirect(301, `${SITE_URL}/empleos/${slug}`);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: job } = await supabase
    .from("job_postings")
    .select("title, description, slug, company_profiles(company_name, logo_url)")
    .eq("slug", slug)
    .single();

  if (!job) {
    res.redirect(301, `${SITE_URL}/empleos/${slug}`);
    return;
  }

  const company = job.company_profiles as {
    company_name?: string;
    logo_url?: string | null;
  } | null;

  const title = escapeHtml(
    `${job.title} en ${company?.company_name ?? "empresa"} | Costa Digital`
  );
  const description = escapeHtml(
    job.description?.slice(0, 160) ?? `Oferta de empleo tech: ${job.title}`
  );
  const image = escapeHtml(company?.logo_url || `${SITE_URL}/og-image.png`);
  const url = escapeHtml(`${SITE_URL}/empleos/${job.slug}`);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Costa Digital" />
  <meta property="og:locale" content="es_CO" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:site" content="@costa_digital" />

  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
  <p>Redirigiendo a <a href="${url}">${title}</a>...</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(html);
}
