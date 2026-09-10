import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ProductKey } from "@/content/portafolio";

interface CheckoutResult {
  reference: string;
  checkoutUrl: string;
}

export function useCheckout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (
    productKey: ProductKey,
    options?: { email?: string; wallConsent?: boolean }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke<CheckoutResult>(
        "create-order",
        {
          body: {
            productKey,
            email: options?.email ?? user?.email,
            wallConsent: options?.wallConsent ?? false,
          },
        }
      );

      if (fnError || !data?.checkoutUrl) {
        throw new Error(fnError?.message ?? "checkout failed");
      }

      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
      throw e;
    }
  };

  return { checkout, loading, error, isAuthenticated: !!user };
}
