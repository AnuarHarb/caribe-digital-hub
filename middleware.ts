/**
 * Vercel Edge Middleware: serves a self-contained HTML page with dynamic meta
 * tags when social-media crawlers request /blog/:slug.
 *
 * Instead of fetching the SPA HTML and replacing tags via regex, this builds
 * a minimal HTML document from scratch — eliminating self-fetch failures and
 * regex fragility.
 */

const SITE_URL = "https://costadigital.org";

export const config = {
  matcher: "/blog/:slug*",
};

const CRAWLER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "TelegramBot",
  "Slurp",
  "bingbot",
  "Googlebot",
  "Pinterest",
  "Discordbot",
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return CRAWLER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCrawlerHtml(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedTime?: string;
}): string {
  const t = escapeAttr(meta.title);
  const d = escapeAttr(meta.description);
  const img = escapeAttr(meta.image);
  const u = escapeAttr(meta.url);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${t}</title>
  <meta name="title" content="${t}" />
  <meta name="description" content="${d}" />
  <link rel="canonical" href="${u}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${u}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${t}" />
  <meta property="og:locale" content="es_CO" />
  <meta property="og:site_name" content="Costa Digital" />
  ${meta.publishedTime ? `<meta property="article:published_time" content="${escapeAttr(meta.publishedTime)}" />` : ""}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${u}" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />
  <meta name="twitter:image:alt" content="${t}" />
  <meta name="twitter:site" content="@costa_digital" />
  <meta name="twitter:creator" content="@costa_digital" />

  <meta http-equiv="refresh" content="0;url=${u}" />
</head>
<body>
  <p><a href="${u}">${t}</a></p>
</body>
</html>`;
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/^\/blog\/([^/]+)$/);
  const userAgent = request.headers.get("user-agent") ?? "";

  const passThrough = () => fetch(new Request(`${url.origin}/`, { headers: request.headers }));

  if (!pathMatch || !isCrawler(userAgent)) {
    return passThrough();
  }

  const slug = pathMatch[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return passThrough();
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,excerpt,cover_image_url,published_at`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return passThrough();
    }

    const posts = await res.json();
    const post = Array.isArray(posts) ? posts[0] : null;

    if (!post) {
      return passThrough();
    }

    const articleUrl = `${SITE_URL}/blog/${slug}`;
    const title = `${post.title} | Costa Digital`;
    const description = post.excerpt || post.title;
    const image =
      post.cover_image_url?.startsWith("http")
        ? post.cover_image_url
        : post.cover_image_url
          ? `${SITE_URL}${post.cover_image_url.startsWith("/") ? "" : "/"}${post.cover_image_url}`
          : `${SITE_URL}/og-image.png`;

    const html = buildCrawlerHtml({
      title,
      description,
      image,
      url: articleUrl,
      publishedTime: post.published_at ?? undefined,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return passThrough();
  }
}
