import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useActiveCompanyOptional } from "@/contexts/ActiveCompanyContext";
import type { Database } from "@/integrations/supabase/types";

type ProfessionalProfileInsert = Database["public"]["Tables"]["professional_profiles"]["Insert"];
type ProfessionalProfileUpdate = Database["public"]["Tables"]["professional_profiles"]["Update"];
type CompanyProfileInsert = Database["public"]["Tables"]["company_profiles"]["Insert"];
type CompanyProfileUpdate = Database["public"]["Tables"]["company_profiles"]["Update"];
type SkillLevel = Database["public"]["Enums"]["skill_level"];
type SkillInsert = Database["public"]["Tables"]["professional_skills"]["Insert"];
type ExperienceInsert = Database["public"]["Tables"]["professional_experience"]["Insert"];
type ExperienceUpdate = Database["public"]["Tables"]["professional_experience"]["Update"];
type EducationInsert = Database["public"]["Tables"]["professional_education"]["Insert"];
type EducationUpdate = Database["public"]["Tables"]["professional_education"]["Update"];

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
          professional_experience(*, display_order),
          professional_education(*),
          profiles(full_name, avatar_url)
        `)
        .eq("user_id", targetUserId)
        .maybeSingle();
      if (data?.professional_experience) {
        data.professional_experience.sort(
          (a: { display_order: number }, b: { display_order: number }) =>
            a.display_order - b.display_order
        );
      }
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<ProfessionalProfileInsert> & Partial<ProfessionalProfileUpdate>) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("professional_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let result, error;
      if (existing?.id) {
        ({ data: result, error } = await supabase
          .from("professional_profiles")
          .update(data)
          .eq("id", existing.id)
          .select()
          .single());
      } else {
        ({ data: result, error } = await supabase
          .from("professional_profiles")
          .insert({ ...data, user_id: user.id })
          .select()
          .single());
      }

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

export function useSkills(professionalId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: { skill_name: string; skill_level?: SkillLevel }) => {
      if (!professionalId) throw new Error("Professional profile required");
      const { data: result, error } = await supabase
        .from("professional_skills")
        .insert({
          professional_id: professionalId,
          skill_name: data.skill_name,
          skill_level: data.skill_level ?? "intermediate",
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase.from("professional_skills").delete().eq("id", skillId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  return {
    addSkill: addMutation.mutateAsync,
    deleteSkill: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useExperience(professionalId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: Omit<ExperienceInsert, "professional_id">) => {
      if (!professionalId) throw new Error("Professional profile required");
      const toDate = (v: string | null | undefined) =>
        v && v.length === 7 ? `${v}-01` : v || null;
      const payload = {
        ...data,
        professional_id: professionalId,
        start_date: toDate(data.start_date),
        end_date: toDate(data.end_date),
      };
      const { data: result, error } = await supabase
        .from("professional_experience")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & ExperienceUpdate) => {
      const toDate = (v: string | null | undefined) =>
        v && v.length === 7 ? `${v}-01` : v || null;
      const payload = {
        ...data,
        ...(data.start_date != null && { start_date: toDate(data.start_date) }),
        ...(data.end_date != null && { end_date: toDate(data.end_date) }),
      };
      const { data: result, error } = await supabase
        .from("professional_experience")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (experienceId: string) => {
      const { error } = await supabase
        .from("professional_experience")
        .delete()
        .eq("id", experienceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase
          .from("professional_experience")
          .update({ display_order: index })
          .eq("id", id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  return {
    addExperience: addMutation.mutateAsync,
    updateExperience: updateMutation.mutateAsync,
    deleteExperience: deleteMutation.mutateAsync,
    reorderExperience: reorderMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}

export function useEducation(professionalId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: Omit<EducationInsert, "professional_id">) => {
      if (!professionalId) throw new Error("Professional profile required");
      const toDate = (v: string | null | undefined) =>
        v && v.length === 7 ? `${v}-01` : v || null;
      const payload = {
        ...data,
        professional_id: professionalId,
        start_date: toDate(data.start_date),
        end_date: toDate(data.end_date),
      };
      const { data: result, error } = await supabase
        .from("professional_education")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & EducationUpdate) => {
      const toDate = (v: string | null | undefined) =>
        v && v.length === 7 ? `${v}-01` : v || null;
      const payload = {
        ...data,
        ...(data.start_date != null && { start_date: toDate(data.start_date) }),
        ...(data.end_date != null && { end_date: toDate(data.end_date) }),
      };
      const { data: result, error } = await supabase
        .from("professional_education")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (educationId: string) => {
      const { error } = await supabase
        .from("professional_education")
        .delete()
        .eq("id", educationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-profile", user?.id] });
    },
  });

  return {
    addEducation: addMutation.mutateAsync,
    updateEducation: updateMutation.mutateAsync,
    deleteEducation: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
