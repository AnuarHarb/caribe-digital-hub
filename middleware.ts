/**
 * Vercel Edge Middleware: serves a self-contained HTML page with dynamic meta
 * tags when social-media crawlers request /blog/:slug.
 *
 * Builds a minimal HTML document from scratch so crawlers see the correct
 * title, description, and cover image without needing to execute JavaScript.
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
  "lnms",
  "WhatsApp",
  "TelegramBot",
  "Slurp",
  "bingbot",
  "Googlebot",
  "Pinterest",
  "Discordbot",
  "Slackbot",
  "redditbot",
  "Applebot",
  "Embedly",
  "outbrain",
  "Quora Link Preview",
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
  const imgType = detectImageType(meta.image);

  return `<!doctype html>
<html lang="es" prefix="og: https://ogp.me/ns# article: https://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8" />
  <title>${t}</title>
  <meta name="title" content="${t}" />
  <meta name="description" content="${d}" />
  <link rel="canonical" href="${u}" />
  <meta name="robots" content="index, follow" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${u}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:secure_url" content="${img}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  ${imgType ? `<meta property="og:image:type" content="${imgType}" />` : ""}
  <meta property="og:image:alt" content="${t}" />
  <meta property="og:locale" content="es_CO" />
  <meta property="og:site_name" content="Costa Digital" />
  ${meta.publishedTime ? `<meta property="article:published_time" content="${escapeAttr(meta.publishedTime)}" />` : ""}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${u}" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />
  <meta name="twitter:image:alt" content="${t}" />
  <meta name="twitter:site" content="@costa_digital" />
  <meta name="twitter:creator" content="@costa_digital" />
</head>
<body>
  <h1>${t}</h1>
  <p>${d}</p>
  <p><a href="${u}">${t}</a></p>
  ${meta.image ? `<img src="${img}" alt="${t}" />` : ""}
</body>
</html>`;
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/^\/blog\/([^/]+?)\/?$/);
  const userAgent = request.headers.get("user-agent") ?? "";

  const passThrough = () =>
    fetch(new Request(`${url.origin}/`, { headers: request.headers }));

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

    let image = post.cover_image_url ?? "";
    if (image && !image.startsWith("http")) {
      image = `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
    }
    image = image.replace(/^http:\/\//, "https://");
    if (!image) {
      image = `${SITE_URL}/og-image.png`;
    }

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
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch {
    return passThrough();
  }
}
