import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ArrowLeft, Newspaper } from "lucide-react";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("es") ? es : enUS;

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          cover_image_url,
          published_at,
          profiles(full_name, avatar_url)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const author = post.profiles as { full_name?: string; avatar_url?: string } | null;
  const dateStr = post.published_at
    ? format(new Date(post.published_at), "d 'de' MMMM yyyy", { locale })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("blog.backToBlog")}
        </Link>

        <article>
          <header className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author?.avatar_url} alt="" />
                <AvatarFallback>{getInitials(author?.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                {author?.full_name && (
                  <p className="font-medium text-foreground">{author.full_name}</p>
                )}
                {dateStr && (
                  <p className="text-sm">
                    {t("blog.publishedOn")} {dateStr}
                  </p>
                )}
              </div>
            </div>
            {post.cover_image_url && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </header>

          <div
            className="prose prose-lg dark:prose-invert max-w-none mt-8 prose-headings:font-display prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-12 pt-8 border-t">
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              {t("blog.backToBlog")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
