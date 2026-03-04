/**
 * Vercel Edge Middleware: injects dynamic meta tags for blog posts when crawlers request /blog/:slug.
 * This ensures Facebook, Twitter, LinkedIn, WhatsApp, etc. see the correct title, description, and cover image.
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
  "Slurp", // Yahoo
  "bingbot",
  "Googlebot",
  "Pinterest",
  "Discordbot",
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return CRAWLER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/^\/blog\/([^/]+)$/);
  const userAgent = request.headers.get("user-agent") ?? "";

  // Pass-through: fetch / (SPA root) - does not match matcher, so no loop
  const passThrough = () => fetch(new Request(`${url.origin}/`));

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
      `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,excerpt,cover_image_url`,
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

    const escapedTitle = escapeHtml(title);
    const escapedDescription = escapeHtml(description);
    const escapedImage = escapeHtml(image);
    const escapedUrl = escapeHtml(articleUrl);

    const htmlRes = await fetch(`${url.origin}/`);
    if (!htmlRes.ok) {
      return passThrough();
    }

    let html = await htmlRes.text();

    html = html.replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapedTitle}</title>`
    );
    const metaPattern = (name: string) =>
      new RegExp(`<meta ${name} content="[^"]*"\\s*\\/?>`, "g");
    html = html.replace(
      metaPattern("name=\"title\""),
      `<meta name="title" content="${escapedTitle}" />`
    );
    html = html.replace(
      metaPattern("name=\"description\""),
      `<meta name="description" content="${escapedDescription}" />`
    );
    html = html.replace(
      metaPattern("property=\"og:type\""),
      `<meta property="og:type" content="article" />`
    );
    html = html.replace(
      metaPattern("property=\"og:url\""),
      `<meta property="og:url" content="${escapedUrl}" />`
    );
    html = html.replace(
      metaPattern("property=\"og:title\""),
      `<meta property="og:title" content="${escapedTitle}" />`
    );
    html = html.replace(
      metaPattern("property=\"og:description\""),
      `<meta property="og:description" content="${escapedDescription}" />`
    );
    html = html.replace(
      metaPattern("property=\"og:image\""),
      `<meta property="og:image" content="${escapedImage}" />`
    );
    html = html.replace(
      metaPattern("property=\"og:image:alt\""),
      `<meta property="og:image:alt" content="${escapedTitle}" />`
    );
    html = html.replace(
      metaPattern("name=\"twitter:url\""),
      `<meta name="twitter:url" content="${escapedUrl}" />`
    );
    html = html.replace(
      metaPattern("name=\"twitter:title\""),
      `<meta name="twitter:title" content="${escapedTitle}" />`
    );
    html = html.replace(
      metaPattern("name=\"twitter:description\""),
      `<meta name="twitter:description" content="${escapedDescription}" />`
    );
    html = html.replace(
      metaPattern("name=\"twitter:image\""),
      `<meta name="twitter:image" content="${escapedImage}" />`
    );
    html = html.replace(
      metaPattern("name=\"twitter:image:alt\""),
      `<meta name="twitter:image:alt" content="${escapedTitle}" />`
    );
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapedUrl}" />`
    );

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
