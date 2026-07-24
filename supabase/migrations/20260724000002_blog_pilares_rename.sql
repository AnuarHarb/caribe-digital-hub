-- Renombrar pilares editoriales de Costa Digital News
-- tech-centre → educacion, ciudad-inmersiva → ciudad, caribe-ventures → startups

ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_pilar_check;

UPDATE public.blog_posts SET pilar = 'educacion' WHERE pilar = 'tech-centre';
UPDATE public.blog_posts SET pilar = 'ciudad' WHERE pilar = 'ciudad-inmersiva';
UPDATE public.blog_posts SET pilar = 'startups' WHERE pilar = 'caribe-ventures';

-- Cualquier valor residual fuera del set nuevo queda en comunidad
UPDATE public.blog_posts
SET pilar = 'comunidad'
WHERE pilar NOT IN ('comunidad', 'educacion', 'startups', 'ciudad');

ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_pilar_check
  CHECK (pilar IN ('comunidad', 'educacion', 'startups', 'ciudad'));
