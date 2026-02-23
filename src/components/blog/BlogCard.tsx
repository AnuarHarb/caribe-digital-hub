import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Newspaper } from "lucide-react";

export interface BlogPostCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  author?: { full_name?: string; avatar_url?: string } | null;
}

interface BlogCardProps {
  post: BlogPostCardData;
  variant?: "compact" | "full";
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function BlogCard({ post, variant = "full" }: BlogCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("es") ? es : enUS;
  const dateStr = post.published_at
    ? format(new Date(post.published_at), "d MMM yyyy", { locale })
    : null;

  if (variant === "compact") {
    return (
      <Link to={`/blog/${post.slug}`} className="block">
        <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full flex flex-col">
          <div className="aspect-video w-full bg-muted overflow-hidden">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Newspaper className="h-12 w-12 text-muted-foreground" aria-hidden />
              </div>
            )}
          </div>
          <CardHeader className="pb-2 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.excerpt}</p>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {dateStr && <span>{dateStr}</span>}
              {post.author?.full_name && (
                <span className="truncate ml-2">{post.author.full_name}</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              {t("landing.news.readMore")}
            </Button>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug}`} className="block">
      <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full flex flex-col">
        <div className="aspect-video w-full bg-muted overflow-hidden">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Newspaper className="h-12 w-12 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <CardHeader className="pb-2 flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{post.excerpt}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author?.avatar_url} alt="" />
              <AvatarFallback className="text-xs">
                {getInitials(post.author?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-xs text-muted-foreground">
              {post.author?.full_name && <span className="truncate block">{post.author.full_name}</span>}
              {dateStr && <span>{dateStr}</span>}
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3">
            {t("landing.news.readMore")}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
