import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCompanyOptional } from "@/contexts/ActiveCompanyContext";
import type { Database } from "@/integrations/supabase/types";

type JobPostingInsert = Database["public"]["Tables"]["job_postings"]["Insert"];
type JobPostingUpdate = Database["public"]["Tables"]["job_postings"]["Update"];

export type JobFilters = {
  work_mode?: string;
  employment_type?: string;
  search?: string;
};

export function useJobs(filters?: JobFilters, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("job_postings")
        .select(`
          *,
          company_profiles(company_name, logo_url, industry),
          job_required_skills(skill_name, is_required)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (filters?.work_mode) {
        query = query.eq("work_mode", filters.work_mode);
      }
      if (filters?.employment_type) {
        query = query.eq("employment_type", filters.employment_type);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    jobs: jobs ?? [],
    isLoading,
  };
}

export function useJob(jobId: string | undefined, options?: { enabled?: boolean }) {
  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          company_profiles(*),
          job_required_skills(*)
        `)
        .eq("id", jobId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId && (options?.enabled ?? true),
  });

  return {
    job,
    isLoading,
  };
}

export function useJobBySlug(slug: string | undefined, options?: { enabled?: boolean }) {
  const { data: job, isLoading } = useQuery({
    queryKey: ["job", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          company_profiles(*),
          job_required_skills(*)
        `)
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug && (options?.enabled ?? true),
  });

  return {
    job,
    isLoading,
  };
}

export function useCompanyJobs(companyId?: string) {
  const queryClient = useQueryClient();
  const activeCompany = useActiveCompanyOptional()?.activeCompany;
  const effectiveCompanyId = companyId ?? activeCompany?.id;

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["company-jobs", effectiveCompanyId],
    queryFn: async () => {
      if (!effectiveCompanyId) return [];
      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          job_required_skills(*)
        `)
        .eq("company_id", effectiveCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveCompanyId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobPostingInsert) => {
      const { data: result, error } = await supabase
        .from("job_postings")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: JobPostingUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from("job_postings")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("job_postings").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: (_, jobId) => {
      queryClient.setQueryData(
        ["company-jobs", effectiveCompanyId],
        (old: typeof jobs) => (old ?? []).filter((j) => j.id !== jobId)
      );
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  return {
    jobs: jobs ?? [],
    isLoading,
    createJob: createMutation.mutateAsync,
    updateJob: updateMutation.mutateAsync,
    deleteJob: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
