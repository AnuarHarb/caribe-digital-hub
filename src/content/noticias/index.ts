/**
 * Modelo de contenido de «Costa Digital News».
 *
 * La sección está unificada con el blog: la fuente de verdad es la tabla
 * `blog_posts` de Supabase (ver `src/hooks/useNoticias.ts`). Este módulo define
 * el tipo `Note` normalizado que consumen los componentes y helpers puros
 * (orden, hero, relacionadas) que operan sobre arreglos ya cargados.
 *
 * El cuerpo (`content`) es HTML producido por el editor TipTap.
 */

import {
  type FamiliaId,
  type FormatoId,
  type PilarId,
  isFamiliaId,
  isFormatoId,
  isPilarId,
} from "@/content/taxonomies";
import type { Database } from "@/integrations/supabase/types";

export interface NoteCta {
  texto: string;
  url: string;
}

export interface Note {
  /** ID del post en Supabase (para likes/comentarios). */
  id: string;
  title: string;
  slug: string;
  familia: FamiliaId;
  formato: FormatoId;
  pilar: PilarId;
  /** ISO timestamp (published_at o created_at). */
  fecha: string;
  autor: string;
  resumen: string;
  portada: string;
  destacado: boolean;
  cta?: NoteCta;
  /** URL de video (YouTube) para formatos de video/entrevista. */
  videoUrl?: string;
  tags: string[];
  /** Cuerpo en HTML (TipTap). */
  content: string;
}

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

/** Fila de blog_posts (con join opcional de autor) → Note normalizada. */
export function mapRowToNote(
  row: BlogPostRow & { profiles?: { full_name?: string | null } | null },
): Note {
  const cta =
    row.cta_texto && row.cta_url
      ? { texto: row.cta_texto, url: row.cta_url }
      : undefined;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    familia: isFamiliaId(row.familia) ? row.familia : "pulso",
    formato: isFormatoId(row.formato) ? row.formato : "news-semanal",
    pilar: isPilarId(row.pilar) ? row.pilar : "comunidad",
    fecha: row.published_at ?? row.created_at ?? "",
    autor: row.profiles?.full_name ?? "",
    resumen: row.excerpt ?? "",
    portada: row.cover_image_url ?? "",
    destacado: row.destacado === true,
    cta,
    videoUrl: row.video_url ?? undefined,
    tags: row.tags ?? [],
    content: row.content,
  };
}

/** Orden por fecha descendente (las notas suelen venir ya ordenadas). */
export function sortByFechaDesc(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Nota ancla para el hero de Costa Digital News.
 * Prioriza la marcada como «destacado» en el admin; si no hay, la más reciente.
 */
export function pickHeroNote(notes: Note[]): Note | undefined {
  return notes.find((n) => n.destacado) ?? notes[0];
}

/** El último News semanal (para el PulsoBanner). */
export function pickUltimoPulso(notes: Note[]): Note | undefined {
  return notes.find((n) => n.formato === "news-semanal");
}

/** 2–3 notas relacionadas (mismo pilar o familia), excluyendo la actual. */
export function pickRelatedNotes(
  notes: Note[],
  current: Note,
  limit = 3,
): Note[] {
  const samePilar = notes.filter(
    (n) => n.slug !== current.slug && n.pilar === current.pilar,
  );
  const sameFamilia = notes.filter(
    (n) =>
      n.slug !== current.slug &&
      n.familia === current.familia &&
      !samePilar.includes(n),
  );
  return [...samePilar, ...sameFamilia].slice(0, limit);
}

export function filterNotes(
  notes: Note[],
  opts: { familia?: FamiliaId | null; pilar?: PilarId | null; excludeSlug?: string },
): Note[] {
  return notes.filter((n) => {
    if (opts.excludeSlug && n.slug === opts.excludeSlug) return false;
    if (opts.familia && n.familia !== opts.familia) return false;
    if (opts.pilar && n.pilar !== opts.pilar) return false;
    return true;
  });
}
