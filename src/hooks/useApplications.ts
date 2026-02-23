import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export function useMyApplications() {
  const { data: professionalProfile } = useQuery({
    queryKey: ["professional-profile-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("professional_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", professionalProfile?.id],
    queryFn: async () => {
      if (!professionalProfile?.id) return [];
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_postings(
            id,
            title,
            status,
            company_profiles(company_name)
          )
        `)
        .eq("professional_id", professionalProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!professionalProfile?.id,
  });

  return {
    applications: applications ?? [],
    isLoading,
  };
}

export function useJobApplications(jobId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          professional_profiles(
            id,
            title,
            bio,
            location,
            years_experience,
            resume_url,
            profiles(full_name, avatar_url)
          )
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => {
      const { data, error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", applicationId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications", jobId] });
    },
  });

  return {
    applications: applications ?? [],
    isLoading,
    updateApplicationStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useApplyToJob() {
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: async ({
      jobId,
      professionalId,
      coverLetter,
    }: {
      jobId: string;
      professionalId: string;
      coverLetter?: string;
    }) => {
      const { data, error } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          professional_id: professionalId,
          cover_letter: coverLetter,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  return {
    apply: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
  };
}
