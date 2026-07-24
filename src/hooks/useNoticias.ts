import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapRowToNote, type Note } from "@/content/noticias";

const SELECT = `
  id,
  slug,
  title,
  excerpt,
  content,
  cover_image_url,
  published_at,
  created_at,
  updated_at,
  tags,
  familia,
  pilar,
  formato,
  destacado,
  video_url,
  cta_texto,
  cta_url,
  author_id,
  status,
  profiles(full_name)
`;

/** Lista de notas publicadas (Costa Digital News), ordenadas por fecha desc. */
export function useNoticias() {
  return useQuery({
    queryKey: ["noticias"],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(SELECT)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []).map((row) =>
        mapRowToNote(row as Parameters<typeof mapRowToNote>[0]),
      );
    },
  });
}

/**
 * Una nota por slug. Los admins pueden ver borradores (RLS lo permite); el
 * público solo ve publicadas.
 */
export function useNoticia(slug: string | undefined) {
  return useQuery({
    queryKey: ["noticia", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Note | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select(SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapRowToNote(data as Parameters<typeof mapRowToNote>[0]);
    },
  });
}
