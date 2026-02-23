import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useActiveCompanyOptional } from "@/contexts/ActiveCompanyContext";
import type { Database } from "@/integrations/supabase/types";

type ProfessionalProfileInsert = Database["public"]["Tables"]["professional_profiles"]["Insert"];
type ProfessionalProfileUpdate = Database["public"]["Tables"]["professional_profiles"]["Update"];
type CompanyProfileInsert = Database["public"]["Tables"]["company_profiles"]["Insert"];
type CompanyProfileUpdate = Database["public"]["Tables"]["company_profiles"]["Update"];

export function useProfessionalProfile(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId ?? user?.id;

  const { data: professionalProfile, isLoading } = useQuery({
    queryKey: ["professional-profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const { data, error } = await supabase
        .from("professional_profiles")
        .select(`
          *,
          professional_skills(*),
          professional_experience(*),
          professional_education(*),
          profiles(full_name, avatar_url)
        `)
        .eq("user_id", targetUserId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<ProfessionalProfileInsert> & Partial<ProfessionalProfileUpdate>) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: result, error } = await supabase
        .from("professional_profiles")
        .upsert(
          { ...data, user_id: user.id },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  return {
    professionalProfile,
    isLoading,
    upsertProfessionalProfile: upsertMutation.mutateAsync,
    isUpserting: upsertMutation.isPending,
  };
}

export function useCompanyProfile(companyId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activeCompany = useActiveCompanyOptional()?.activeCompany;
  const effectiveCompanyId = companyId ?? activeCompany?.id;

  const { data: companyProfile, isLoading } = useQuery({
    queryKey: ["company-profile", effectiveCompanyId],
    queryFn: async () => {
      if (!effectiveCompanyId) return null;
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("id", effectiveCompanyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveCompanyId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<CompanyProfileInsert> & Partial<CompanyProfileUpdate>) => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!effectiveCompanyId) throw new Error("No company selected");
      const { data: result, error } = await supabase
        .from("company_profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", effectiveCompanyId)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile", effectiveCompanyId] });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });

  return {
    companyProfile,
    isLoading,
    upsertCompanyProfile: upsertMutation.mutateAsync,
    isUpserting: upsertMutation.isPending,
  };
}
