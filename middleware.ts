/**
 * Social crawlers hitting /noticias/:slug get OG HTML from /api/og-noticias.
 * Browsers still receive the SPA shell.
 */

export const config = {
  matcher: ["/noticias/:slug*", "/blog/:slug*"],
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

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/^\/(?:noticias|blog)\/([^/]+?)\/?$/);
  const userAgent = request.headers.get("user-agent") ?? "";

  const passThrough = () =>
    fetch(new Request(`${url.origin}/`, { headers: request.headers }));

  if (!pathMatch || !isCrawler(userAgent)) {
    return passThrough();
  }

  return fetch(
    new Request(`${url.origin}/api/og-noticias?slug=${encodeURIComponent(pathMatch[1])}`, {
      headers: request.headers,
    })
  );
}
