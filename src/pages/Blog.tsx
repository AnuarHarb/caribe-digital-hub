import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { BlogCard, type BlogPostCardData } from "@/components/blog/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";

export default function Blog() {
  const { t } = useTranslation();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
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
        .limit(12);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="font-display text-3xl font-bold text-primary md:text-4xl">
            {t("blog.title")}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            {t("landing.news.subtitle")}
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : cardData.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cardData.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Newspaper className="h-10 w-10 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-6 font-medium text-muted-foreground">
              {t("landing.news.empty")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("landing.news.emptyInvite")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
