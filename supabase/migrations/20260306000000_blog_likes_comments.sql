-- Blog likes and comments
-- Social engagement for Costa Digital News articles

-- =============================================================================
-- TABLE blog_likes
-- =============================================================================

CREATE TABLE public.blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_blog_likes_post_id ON public.blog_likes(post_id);
CREATE INDEX idx_blog_likes_user_id ON public.blog_likes(user_id);

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view blog likes" ON public.blog_likes;
CREATE POLICY "Anyone can view blog likes"
  ON public.blog_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.blog_likes;
CREATE POLICY "Authenticated users can like posts"
  ON public.blog_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own likes" ON public.blog_likes;
CREATE POLICY "Users can remove own likes"
  ON public.blog_likes FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- =============================================================================
-- TABLE blog_comments
-- =============================================================================

CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON public.blog_comments(user_id);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view blog comments" ON public.blog_comments;
CREATE POLICY "Anyone can view blog comments"
  ON public.blog_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.blog_comments;
CREATE POLICY "Authenticated users can comment"
  ON public.blog_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.blog_comments;
CREATE POLICY "Users can update own comments"
  ON public.blog_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments or admin" ON public.blog_comments;
CREATE POLICY "Users can delete own comments or admin"
  ON public.blog_comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
