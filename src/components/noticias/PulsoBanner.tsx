import { useState, type FormEvent } from "react";
import { Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/newsletter";

interface PulsoBannerProps {
  /** Handler opcional; por defecto suscribe vía edge function + Resend. */
  onSubscribe?: (email: string) => void | Promise<void>;
  className?: string;
}

/** Franja de suscripción a El Pulso (newsletter semanal). */
export function PulsoBanner({ onSubscribe, className }: PulsoBannerProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      if (onSubscribe) {
        await onSubscribe(email.trim());
      } else {
        await subscribeToNewsletter(email.trim(), { source: "pulso-banner" });
      }
      toast.success("¡Listo! Te suscribiste al newsletter El Pulso.");
      setEmail("");
    } catch {
      toast.error("No pudimos suscribirte. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="pulso-banner-heading"
      className={`rounded-xl border border-rose-200/70 bg-gradient-to-r from-rose-50 via-rose-50/80 to-orange-50/40 px-5 py-4 dark:border-rose-500/25 dark:from-rose-500/15 dark:via-rose-500/10 dark:to-orange-500/5 md:px-6 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 md:items-center">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-300 md:mt-0"
            aria-hidden
          >
            <Waves className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2
              id="pulso-banner-heading"
              className="font-display text-base font-semibold text-foreground md:text-lg"
            >
              El Pulso — newsletter semanal
            </h2>
            <p className="mt-0.5 text-sm text-rose-800/70 dark:text-rose-200/70">
              Lo que mueve la vaina tech en el Caribe, en tu correo.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:max-w-md md:shrink-0"
        >
          <label htmlFor="pulso-email" className="sr-only">
            Correo electrónico
          </label>
          <Input
            id="pulso-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="border-rose-200/80 bg-background/90 dark:border-rose-500/30"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="shrink-0 bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400"
          >
            Suscribirme
          </Button>
        </form>
      </div>
    </section>
  );
}
