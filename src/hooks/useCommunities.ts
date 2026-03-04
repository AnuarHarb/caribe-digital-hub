import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CommunityProfile = {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  whatsapp_url: string | null;
  location: string | null;
  industry: string | null;
};

export function useCommunities() {
  return useQuery({
    queryKey: ["public-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_profiles")
        .select("id, company_name, description, logo_url, website, whatsapp_url, location, industry")
        .eq("profile_type", "community")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommunityProfile[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
