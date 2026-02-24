-- Add tags column to blog_posts for categorizing articles

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
