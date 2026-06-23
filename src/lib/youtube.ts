/**
 * Normaliza una URL de YouTube a su forma embebible (`/embed/ID`).
 * Soporta watch?v=, youtu.be/, shorts/ y URLs ya embebidas.
 * Devuelve null si no es una URL de YouTube reconocible.
 */
export function toYouTubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");

    let id: string | null = null;

    if (host === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] ?? null;
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] ?? null;
      }
    }

    if (!id) return null;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return toYouTubeEmbed(url) !== null;
}
