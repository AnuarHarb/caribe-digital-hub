import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { MessageCircle, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useBlogComments, type BlogComment } from "@/hooks/useBlogComments";
import { Link } from "react-router-dom";

interface CommentSectionProps {
  postId: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function CommentItem({
  comment,
  canDelete,
  onDelete,
  locale,
}: {
  comment: BlogComment;
  canDelete: boolean;
  onDelete: () => void;
  locale: Locale;
}) {
  const author = comment.profiles;
  const timeAgo = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), {
        addSuffix: true,
        locale,
      })
    : "";

  return (
    <li className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarImage src={author?.avatar_url ?? undefined} alt="" />
        <AvatarFallback className="text-xs">
          {getInitials(author?.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {author?.full_name ?? "?"}
          </span>
          <time className="text-xs text-muted-foreground shrink-0">
            {timeAgo}
          </time>
          {canDelete && (
            <button
              onClick={onDelete}
              className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              aria-label="Delete comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </li>
  );
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("es") ? es : enUS;
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { comments, addComment, deleteComment, isLoading, isAdding } =
    useBlogComments(postId);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    addComment(trimmed, { onSuccess: () => setContent("") });
  };

  return (
    <section aria-labelledby="comments-heading" className="mt-10">
      <h2
        id="comments-heading"
        className="flex items-center gap-2 text-lg font-semibold text-foreground"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        {t("blog.comments")}
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
            <AvatarFallback className="text-xs">
              {getInitials(user.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("blog.addComment")}
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isAdding}
                className="gap-2"
              >
                <Send className="h-4 w-4" aria-hidden />
                {t("blog.submitComment")}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">
            {t("blog.loginToComment")}
          </Link>
        </p>
      )}

      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : comments.length > 0 ? (
        <ul className="mt-6 space-y-5">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              canDelete={c.user_id === user?.id || isAdmin}
              onDelete={() => deleteComment(c.id)}
              locale={locale}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground italic">
          {t("blog.noComments")}
        </p>
      )}
    </section>
  );
}
