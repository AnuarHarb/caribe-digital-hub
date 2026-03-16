-- Add display_order to professional_experience for drag-and-drop reordering
ALTER TABLE public.professional_experience
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- Backfill: order by start_date descending (most recent first)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY professional_id
    ORDER BY start_date DESC, created_at DESC
  ) - 1 AS rn
  FROM public.professional_experience
)
UPDATE public.professional_experience e
SET display_order = ordered.rn
FROM ordered
WHERE e.id = ordered.id;
