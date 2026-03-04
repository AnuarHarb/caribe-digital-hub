import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBlogLikes } from "@/hooks/useBlogLikes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { likeCount, hasLiked, toggleLike, isPending } = useBlogLikes(postId);

  const handleClick = () => {
    if (!user) {
      toast({ description: t("blog.loginToLike") });
      return;
    }
    toggleLike();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "gap-2 text-muted-foreground transition-colors",
        hasLiked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart
        className={cn("h-5 w-5", hasLiked && "fill-current")}
        aria-hidden
      />
      <span className="tabular-nums">{likeCount}</span>
      <span className="sr-only">{t("blog.likeArticle")}</span>
    </Button>
  );
}
