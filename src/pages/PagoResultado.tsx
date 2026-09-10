import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DESCRIPTOR } from "@/content/portafolio";
import { waLink } from "@/lib/waLink";
import { CheckCircle, XCircle, Clock } from "@phosphor-icons/react";

export default function PagoResultado() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? "";
  const transactionId = params.get("id") ?? "";

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", reference, transactionId],
    enabled: !!reference || !!transactionId,
    queryFn: async () => {
      if (transactionId) {
        await supabase.functions.invoke("wompi-webhook", { body: { transactionId } });
      }
      const { data, error } = await supabase.rpc("get_order_status", {
        ref: reference || transactionId,
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const status = order?.status ?? "pending";
  const StatusIcon =
    status === "approved" ? CheckCircle : status === "declined" ? XCircle : Clock;
  const statusColor =
    status === "approved" ? "text-green-600" : status === "declined" ? "text-red-600" : "text-brillante";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${t("portafolio.payment.title")} | ${DESCRIPTOR}`} canonical="/pago/resultado" noindex />
      <Navbar />
      <main className="container mx-auto max-w-lg px-4 py-24 text-center">
        {isLoading ? (
          <p>{t("portafolio.checkout.processing")}</p>
        ) : !order ? (
          <>
            <p className="text-muted-foreground">{t("portafolio.payment.declined")}</p>
            <Link to="/" className="mt-6 inline-block">
              <Button>{t("portafolio.payment.backHome")}</Button>
            </Link>
          </>
        ) : (
          <>
            <StatusIcon className={`mx-auto h-16 w-16 ${statusColor}`} weight="duotone" aria-hidden />
            <h1 className="mt-6 font-display text-2xl font-bold">
              {t(`portafolio.payment.${status === "approved" ? "approved" : status === "declined" ? "declined" : "pending"}`)}
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {t("portafolio.payment.reference")}: {order.reference}
            </p>
            {status === "approved" && (
              <div className="mt-8 space-y-4">
                <p className="text-muted-foreground">{t("portafolio.payment.nextSteps")}</p>
                <a href={waLink("membresia", locale)} target="_blank" rel="noopener noreferrer">
                  <Button>{t("portafolio.payment.welcomeWhatsApp")}</Button>
                </a>
                <Link to="/dashboard" className="block">
                  <Button variant="outline">{t("portafolio.payment.viewMembership")}</Button>
                </Link>
              </div>
            )}
            <Link to="/" className="mt-8 inline-block">
              <Button variant="ghost">{t("portafolio.payment.backHome")}</Button>
            </Link>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
