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

function detectImageType(url: string): string | null {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return ext ? types[ext] ?? null : null;
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
    res.redirect(302, `${SITE_URL}/noticias/${slug}`);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, slug, cover_image_url, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) {
    res.redirect(302, `${SITE_URL}/noticias/${slug}`);
    return;
  }

  const title = escapeHtml(`${post.title} | Costa Digital`);
  const description = escapeHtml(post.excerpt || post.title);
  let image = post.cover_image_url || `${SITE_URL}/og-image.png`;
  if (image && !image.startsWith("http")) {
    image = `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  }
  image = image.replace(/^http:\/\//, "https://");
  const img = escapeHtml(image);
  const url = escapeHtml(`${SITE_URL}/noticias/${post.slug}`);
  const imgType = detectImageType(image);
  const published = post.published_at
    ? `<meta property="article:published_time" content="${escapeHtml(post.published_at)}" />`
    : "";

  const html = `<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns# article: https://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:secure_url" content="${img}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  ${imgType ? `<meta property="og:image:type" content="${imgType}" />` : ""}
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Costa Digital" />
  <meta property="og:locale" content="es_CO" />
  ${published}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${img}" />
  <meta name="twitter:image:alt" content="${title}" />
  <meta name="twitter:site" content="@costa_digital" />

  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
  <p>Redirigiendo a <a href="${url}">${title}</a>...</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=86400");
  res.status(200).send(html);
}
