import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LikeButton } from "@/components/blog/LikeButton";
import { CommentSection } from "@/components/blog/CommentSection";

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { isAdmin } = useIsAdmin();
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
          tags,
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
  const readingMinutes = estimateReadingTime(post.content);
  const tags = (post as { tags?: string[] }).tags ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.title}
        description={post.excerpt || post.title}
        canonical={`/blog/${post.slug}`}
        image={post.cover_image_url ?? undefined}
        imageAlt={post.title}
        type="article"
        publishedTime={post.published_at ?? undefined}
        author={author?.full_name}
      />
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt || post.title}
        slug={post.slug}
        coverImageUrl={post.cover_image_url}
        publishedAt={post.published_at ?? new Date().toISOString()}
        authorName={author?.full_name ?? "Costa Digital"}
      />
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
                {dateStr && post.published_at && (
                  <p className="text-sm">
                    {t("blog.publishedOn")}{" "}
                    <time dateTime={post.published_at}>{dateStr}</time>
                    {" · "}
                    <span>{readingMinutes} {t("blog.readingTime")}</span>
                  </p>
                )}
              </div>
            </div>
            {post.cover_image_url && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <div
            className="prose prose-lg dark:prose-invert max-w-none mt-8 prose-headings:font-display prose-img:rounded-lg prose-p:leading-relaxed prose-p:mb-6 [&>p:last-of-type]:mb-0 [&_br]:block [&_br]:mb-3"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-8 flex items-center gap-4 border-t pt-6">
          <LikeButton postId={post.id} />
        </div>

        <CommentSection postId={post.id} />

        <div className="mt-12 flex flex-wrap items-center gap-3 pt-8 border-t">
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              {t("blog.backToBlog")}
            </Button>
          </Link>
          {isAdmin && (
            <Link to={`/admin/noticias?edit=${post.id}`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" aria-hidden />
                {t("common.edit")}
              </Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
