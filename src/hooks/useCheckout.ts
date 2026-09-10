import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ProductKey } from "@/content/portafolio";

interface CheckoutResult {
  reference: string;
  signature: string;
  amountInCents: number;
  publicKey: string;
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

      if (fnError || !data?.reference) {
        throw new Error(fnError?.message ?? "checkout failed");
      }

      const publicKey =
        data.publicKey ?? import.meta.env.VITE_WOMPI_PUBLIC_KEY ?? "";
      const redirectUrl = `${window.location.origin}/pago/resultado`;
      const url = new URL("https://checkout.wompi.co/p/");
      url.searchParams.set("public-key", publicKey);
      url.searchParams.set("currency", "COP");
      url.searchParams.set("amount-in-cents", String(data.amountInCents));
      url.searchParams.set("reference", data.reference);
      url.searchParams.set("signature:integrity", data.signature);
      url.searchParams.set("redirect-url", redirectUrl);
      if (options?.email || user?.email) {
        url.searchParams.set("customer-data:email", options?.email ?? user!.email!);
      }

      window.location.href = url.toString();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
      throw e;
    }
  };

  return { checkout, loading, error, isAuthenticated: !!user };
}
