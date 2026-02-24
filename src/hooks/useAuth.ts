import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });

      if (event === "SIGNED_IN" && session?.user) {
        const meta = session.user.user_metadata;
        const avatarUrl = meta?.avatar_url || meta?.picture;
        if (avatarUrl) {
          supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile && !profile.avatar_url) {
                supabase
                  .from("profiles")
                  .update({
                    avatar_url: avatarUrl,
                    full_name: meta?.full_name || meta?.name || undefined,
                  })
                  .eq("id", session.user.id)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ["profile", session.user.id] });
                  });
              }
            });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const user = session?.user ?? null;
  const isAuthenticated = !!user;

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
  };
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const accountType = profile?.account_type ?? null;

  const updateProfile = async (updates: {
    full_name?: string;
    account_type?: AccountType;
    avatar_url?: string;
    phone?: string;
    address?: string;
    city?: string;
    date_of_birth?: string;
    document_type?: string;
    document_number?: string;
    document_url?: string;
  }) => {
    if (!user?.id) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  return {
    user,
    profile,
    accountType,
    isLoading,
    updateProfile,
  };
}
