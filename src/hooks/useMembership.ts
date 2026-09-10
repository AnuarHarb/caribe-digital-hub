import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Membership {
  id: string;
  plan: "miembro" | "residente";
  starts_at: string;
  ends_at: string;
  creyente_number: number | null;
}

export function useMembership() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["membership", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Membership | null> => {
      const { data } = await supabase
        .from("memberships")
        .select("id, plan, starts_at, ends_at, creyente_number")
        .eq("user_id", user!.id)
        .gte("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
}
