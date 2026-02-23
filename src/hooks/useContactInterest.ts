import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useContactInterest() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expressInterest = useCallback(
    async (professionalProfileId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: "login_required" };
      }

      setIsSubmitting(true);
      try {
        const { error } = await supabase.from("contact_interests").insert({
          requester_id: user.id,
          professional_profile_id: professionalProfileId,
        });

        if (error) {
          if (error.code === "23505") {
            return { success: false, error: "already_expressed" };
          }
          throw error;
        }
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al registrar interés";
        return { success: false, error: message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?.id]
  );

  return {
    expressInterest,
    isSubmitting,
    isAuthenticated: !!user,
  };
}
