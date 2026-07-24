/**
 * Taxonomías de la sección editorial «Costa Digital News».
 *
 * Convenciones del proyecto a las que se adhiere este módulo:
 * - Alias `@/` → `src/`.
 * - Tailwind 3 con tokens HSL (navy `--primary`, teal `--accent`) y modo claro/oscuro vía clases.
 * - Sentence case en toda la UI, en español.
 *
 * Principio rector: la navegación es por FAMILIA y por PILAR, nunca por formato.
 * El formato es solo un filtro y un tratamiento visual secundario.
 *
 * Los `color.*` se escriben como nombres de clase Tailwind COMPLETOS (sin
 * interpolar) para que el compilador no los purgue.
 */

export type FamiliaId = "pulso" | "profundidad" | "voces" | "pruebas";
export type PilarId = "comunidad" | "educacion" | "startups" | "ciudad";
export type FormatoId =
  | "news-semanal"
  | "anuncio"
  | "columna"
  | "datos"
  | "resena"
  | "podcast"
  | "entrevista"
  | "historia"
  | "cronica";

export interface FamiliaDef {
  id: FamiliaId;
  /** Texto de display (configurable). */
  label: string;
  /** Descriptor corto para encabezados/listados. */
  descriptor: string;
  /** Registro de voz que usa esta familia. */
  voz: "institucional" | "comunidad";
  color: {
    /** Chip/badge en reposo. */
    badge: string;
    /** Chip/badge activo (filtro seleccionado). */
    badgeActive: string;
    /** Punto/acento sólido. */
    dot: string;
    /** Acento de texto. */
    text: string;
  };
}

export interface PilarDef {
  id: PilarId;
  label: string;
  color: {
    badge: string;
    badgeActive: string;
    dot: string;
  };
}

export interface FormatoDef {
  id: FormatoId;
  label: string;
}

/** Familias → mapa de color de marca: coral, púrpura/navy, teal, ámbar. */
export const FAMILIAS: Record<FamiliaId, FamiliaDef> = {
  pulso: {
    id: "pulso",
    label: "El Pulso",
    descriptor: "newsletter semanal",
    voz: "comunidad",
    color: {
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      badgeActive: "bg-rose-500 text-white border-rose-500",
      dot: "bg-rose-500",
      text: "text-rose-600 dark:text-rose-400",
    },
  },
  profundidad: {
    id: "profundidad",
    label: "A Fondo",
    descriptor: "autoridad regional",
    voz: "institucional",
    color: {
      badge:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
      badgeActive: "bg-indigo-700 text-white border-indigo-700",
      dot: "bg-indigo-700",
      text: "text-indigo-700 dark:text-indigo-300",
    },
  },
  voces: {
    id: "voces",
    label: "Voces",
    descriptor: "el estudio, en uso",
    voz: "comunidad",
    color: {
      badge: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
      badgeActive: "bg-teal-600 text-white border-teal-600",
      dot: "bg-teal-500",
      text: "text-teal-700 dark:text-teal-300",
    },
  },
  pruebas: {
    id: "pruebas",
    label: "Historias de la Costa",
    descriptor: "el flywheel, visible",
    voz: "institucional",
    color: {
      badge:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
      badgeActive: "bg-amber-500 text-white border-amber-500",
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
    },
  },
};

export const PILARES: Record<PilarId, PilarDef> = {
  comunidad: {
    id: "comunidad",
    label: "Comunidad",
    color: {
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      badgeActive: "bg-emerald-600 text-white border-emerald-600",
      dot: "bg-emerald-500",
    },
  },
  educacion: {
    id: "educacion",
    label: "Educación",
    color: {
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      badgeActive: "bg-blue-600 text-white border-blue-600",
      dot: "bg-blue-500",
    },
  },
  startups: {
    id: "startups",
    label: "Startups",
    color: {
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
      badgeActive: "bg-orange-600 text-white border-orange-600",
      dot: "bg-orange-500",
    },
  },
  ciudad: {
    id: "ciudad",
    label: "Ciudad",
    color: {
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
      badgeActive: "bg-purple-600 text-white border-purple-600",
      dot: "bg-purple-500",
    },
  },
};

export const FORMATOS: Record<FormatoId, FormatoDef> = {
  "news-semanal": { id: "news-semanal", label: "News semanal" },
  anuncio: { id: "anuncio", label: "Anuncio" },
  columna: { id: "columna", label: "Columna de opinión" },
  datos: { id: "datos", label: "El Caribe en datos" },
  resena: { id: "resena", label: "Reseña" },
  podcast: { id: "podcast", label: "Podcast" },
  entrevista: { id: "entrevista", label: "Entrevista" },
  historia: { id: "historia", label: "Historia" },
  cronica: { id: "cronica", label: "Crónica" },
};

export const FAMILIA_LIST: FamiliaDef[] = Object.values(FAMILIAS);
export const PILAR_LIST: PilarDef[] = Object.values(PILARES);
export const FORMATO_LIST: FormatoDef[] = Object.values(FORMATOS);

export function isFamiliaId(value: string | null | undefined): value is FamiliaId {
  return !!value && value in FAMILIAS;
}

export function isPilarId(value: string | null | undefined): value is PilarId {
  return !!value && value in PILARES;
}

export function isFormatoId(value: string | null | undefined): value is FormatoId {
  return !!value && value in FORMATOS;
}

/** Marca editorial de la sección (cabezote «Costa Digital News»). */
export const MAREA = {
  nombre: "Costa Digital News",
  descriptor: "Lo que mueve la vaina tech en el Caribe.",
  grito: "Mantente al día.",
} as const;
