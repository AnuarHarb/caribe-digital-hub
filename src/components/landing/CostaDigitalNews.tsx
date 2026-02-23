import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard, type BlogPostCardData } from "@/components/blog/BlogCard";
import { Newspaper } from "lucide-react";

export function CostaDigitalNews() {
  const { t } = useTranslation();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["featured-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          slug,
          title,
          excerpt,
          cover_image_url,
          published_at,
          profiles(full_name, avatar_url)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const cardData: BlogPostCardData[] =
    posts?.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cover_image_url: p.cover_image_url,
      published_at: p.published_at,
      author: p.profiles as { full_name?: string; avatar_url?: string } | null,
    })) ?? [];

  return (
    <section
      aria-labelledby="costa-digital-news-heading"
      className="py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <h2
          id="costa-digital-news-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.news.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.news.subtitle")}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full mt-4" />
                </div>
              </div>
            ))
          ) : cardData.length > 0 ? (
            cardData.map((post) => (
              <BlogCard key={post.id} post={post} variant="compact" />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Newspaper className="h-8 w-8 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-muted-foreground">
                {t("landing.news.empty")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("landing.news.emptyInvite")}
              </p>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link to="/blog">
            <Button variant="outline" className="transition-colors">
              {t("landing.news.viewAll")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
