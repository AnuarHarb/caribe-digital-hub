import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

type CompanyMemberRole = Database["public"]["Enums"]["company_member_role"];

export type CompanyWithRole = {
  id: string;
  company_name: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  location: string | null;
  company_size: Database["public"]["Enums"]["company_size"] | null;
  role: CompanyMemberRole;
};

export function useMyCompanies() {
  const { user } = useAuth();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["my-companies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("company_members")
        .select(
          `
          company_id,
          role,
          company_profiles (
            id,
            company_name,
            description,
            industry,
            website,
            logo_url,
            location,
            company_size
          )
        `
        )
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((row) => {
        const cp = row.company_profiles as {
          id: string;
          company_name: string;
          description: string | null;
          industry: string | null;
          website: string | null;
          logo_url: string | null;
          location: string | null;
          company_size: Database["public"]["Enums"]["company_size"] | null;
        };
        return {
          ...cp,
          role: row.role as CompanyMemberRole,
        };
      });
    },
    enabled: !!user?.id,
  });

  return { companies, isLoading };
}

export function useCreateCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (companyName: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: company, error: companyError } = await supabase
        .from("company_profiles")
        .insert({ user_id: user.id, company_name: companyName })
        .select()
        .single();
      if (companyError) throw companyError;
      const { error: memberError } = await supabase.from("company_members").insert({
        company_id: company.id,
        user_id: user.id,
        role: "owner",
      });
      if (memberError) throw memberError;
      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });

  return {
    createCompany: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}

export type CompanyMember = {
  id: string;
  user_id: string;
  role: CompanyMemberRole;
  created_at: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

export function useCompanyMembers(companyId: string | undefined) {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["company-members", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("company_members")
        .select(
          `
          id,
          user_id,
          role,
          created_at,
          profiles(full_name, avatar_url)
        `
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CompanyMember[];
    },
    enabled: !!companyId,
  });

  return { members, isLoading };
}

export function useInviteMember() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      companyId,
      email,
      role,
    }: {
      companyId: string;
      email: string;
      role: CompanyMemberRole;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("company_invitations")
        .insert({
          company_id: companyId,
          invited_email: email.trim().toLowerCase(),
          invited_by: user.id,
          role,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invitations"] });
    },
  });

  return {
    inviteMember: mutation.mutateAsync,
    isInviting: mutation.isPending,
  };
}

export type PendingInvitation = {
  id: string;
  company_id: string;
  invited_email: string;
  role: CompanyMemberRole;
  status: string;
  created_at: string | null;
  expires_at: string | null;
  company_profiles: { company_name: string } | null;
};

export function usePendingInvitations() {
  const { user } = useAuth();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["pending-invitations", user?.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from("company_invitations")
        .select(
          `
          id,
          company_id,
          invited_email,
          role,
          status,
          created_at,
          expires_at,
          company_profiles(company_name)
        `
        )
        .eq("invited_email", user.email!.toLowerCase())
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString());
      if (error) throw error;
      return (data ?? []) as PendingInvitation[];
    },
    enabled: !!user?.email,
  });

  return { invitations, isLoading };
}

export function useRespondInvitation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      invitationId,
      accept,
    }: {
      invitationId: string;
      accept: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: inv, error: fetchError } = await supabase
        .from("company_invitations")
        .select("company_id, role")
        .eq("id", invitationId)
        .eq("status", "pending")
        .single();
      if (fetchError || !inv) throw new Error("Invitation not found or already responded");
      if (accept) {
        const { error: insertError } = await supabase.from("company_members").insert({
          company_id: inv.company_id,
          user_id: user.id,
          role: inv.role,
        });
        if (insertError) throw insertError;
      }
      const { error: updateError } = await supabase
        .from("company_invitations")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", invitationId);
      if (updateError) throw updateError;
      return { accept };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });

  return {
    respondInvitation: mutation.mutateAsync,
    isResponding: mutation.isPending,
  };
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      const { error } = await supabase.from("company_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });

  return {
    removeMember: mutation.mutateAsync,
    isRemoving: mutation.isPending,
  };
}
