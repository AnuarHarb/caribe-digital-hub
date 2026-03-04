import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BlogComment {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

export function useBlogComments(postId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["blog-comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("blog_comments")
        .select("id, content, created_at, user_id, profiles(full_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as BlogComment[];
    },
    enabled: !!postId,
  });

  const { mutate: addComment, isPending: isAdding } = useMutation({
    mutationFn: async (content: string) => {
      if (!postId || !user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("blog_comments")
        .insert({ post_id: postId, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["blog-comments-count", postId] });
    },
  });

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["blog-comments-count", postId] });
    },
  });

  return {
    comments,
    commentCount: comments.length,
    addComment,
    deleteComment,
    isLoading,
    isAdding,
    isDeleting,
  };
}
