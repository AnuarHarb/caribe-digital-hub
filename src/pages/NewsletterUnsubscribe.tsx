import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "success" | "already" | "error";

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") ?? "").trim();
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "Procesando tu baja…" : "Este enlace de baja no es válido."
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", {
          body: { token },
        });

        if (cancelled) return;

        if (error || data?.error) {
          setStatus("error");
          setMessage(data?.error ?? error?.message ?? "No pudimos procesar tu baja.");
          return;
        }

        if (data?.alreadyUnsubscribed) {
          setStatus("already");
          setMessage("Ya estabas dado de baja de Costa Digital News.");
          return;
        }

        setStatus("success");
        setMessage("Listo. Ya no recibirás Costa Digital News en este correo.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("No pudimos procesar tu baja. Intenta de nuevo más tarde.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const Icon =
    status === "loading"
      ? Loader2
      : status === "error"
        ? XCircle
        : CheckCircle2;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Darse de baja | Costa Digital News"
        description="Cancelar suscripción a Costa Digital News."
        canonical="/newsletter/baja"
        noindex
      />
      <Navbar />
      <main className="container mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <Icon
          className={`mb-4 h-12 w-12 ${
            status === "loading"
              ? "animate-spin text-muted-foreground"
              : status === "error"
                ? "text-destructive"
                : "text-primary"
          }`}
          aria-hidden
        />
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          {status === "error" ? "No se pudo completar la baja" : "Baja del newsletter"}
        </h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <Button asChild className="mt-8">
          <Link to="/noticias">Volver a Costa Digital News</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
