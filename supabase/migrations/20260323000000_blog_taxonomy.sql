-- La Marea: taxonomía editorial sobre blog_posts
-- Combina la sección «La Marea» con el blog existente: cada post gana
-- familia / pilar / formato, soporte de video (YouTube) y CTA por nota.
-- Las columnas llevan DEFAULT, por lo que los posts existentes quedan
-- automáticamente etiquetados y aparecen de inmediato en La Marea.

-- =============================================================================
-- COLUMNAS DE TAXONOMÍA
-- =============================================================================

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS familia text NOT NULL DEFAULT 'pulso',
  ADD COLUMN IF NOT EXISTS pilar text NOT NULL DEFAULT 'comunidad',
  ADD COLUMN IF NOT EXISTS formato text NOT NULL DEFAULT 'news-semanal',
  ADD COLUMN IF NOT EXISTS destacado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS cta_texto text,
  ADD COLUMN IF NOT EXISTS cta_url text;

-- =============================================================================
-- RESTRICCIONES DE TAXONOMÍA (mantienen los ids dentro de la taxonomía)
-- =============================================================================

DO $$ BEGIN
  ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_familia_check
    CHECK (familia IN ('pulso', 'profundidad', 'voces', 'pruebas'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_pilar_check
    CHECK (pilar IN ('tech-centre', 'comunidad', 'ciudad-inmersiva', 'caribe-ventures'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_formato_check
    CHECK (formato IN (
      'news-semanal', 'anuncio', 'columna', 'datos',
      'resena', 'podcast', 'entrevista', 'historia', 'cronica'
    ));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- ÍNDICES PARA FILTRADO POR FAMILIA / PILAR
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_familia ON public.blog_posts(familia);
CREATE INDEX IF NOT EXISTS idx_blog_posts_pilar ON public.blog_posts(pilar);
CREATE INDEX IF NOT EXISTS idx_blog_posts_destacado ON public.blog_posts(destacado) WHERE destacado = true;
