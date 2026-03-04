import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useBlogLikes(postId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likeCount = 0, isLoading: countLoading } = useQuery({
    queryKey: ["blog-likes-count", postId],
    queryFn: async () => {
      if (!postId) return 0;
      const { count, error } = await supabase
        .from("blog_likes")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!postId,
  });

  const { data: hasLiked = false, isLoading: likedLoading } = useQuery({
    queryKey: ["blog-likes-user", postId, user?.id],
    queryFn: async () => {
      if (!postId || !user?.id) return false;
      const { data, error } = await supabase
        .from("blog_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!postId && !!user?.id,
  });

  const { mutate: toggleLike, isPending } = useMutation({
    mutationFn: async () => {
      if (!postId || !user?.id) throw new Error("Not authenticated");

      if (hasLiked) {
        const { error } = await supabase
          .from("blog_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["blog-likes-count", postId] });
      await queryClient.cancelQueries({ queryKey: ["blog-likes-user", postId, user?.id] });

      const prevCount = queryClient.getQueryData<number>(["blog-likes-count", postId]) ?? 0;
      const prevLiked = queryClient.getQueryData<boolean>(["blog-likes-user", postId, user?.id]) ?? false;

      queryClient.setQueryData(["blog-likes-count", postId], prevLiked ? prevCount - 1 : prevCount + 1);
      queryClient.setQueryData(["blog-likes-user", postId, user?.id], !prevLiked);

      return { prevCount, prevLiked };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(["blog-likes-count", postId], context.prevCount);
        queryClient.setQueryData(["blog-likes-user", postId, user?.id], context.prevLiked);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-likes-count", postId] });
      queryClient.invalidateQueries({ queryKey: ["blog-likes-user", postId, user?.id] });
    },
  });

  return {
    likeCount,
    hasLiked,
    toggleLike,
    isLoading: countLoading || likedLoading,
    isPending,
  };
}
