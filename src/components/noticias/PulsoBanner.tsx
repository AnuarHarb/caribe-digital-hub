import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAREA } from "@/content/taxonomies";
import type { Note } from "@/content/noticias";

interface PulsoBannerProps {
  /** Último News semanal, para mostrar el resumen de la semana. */
  note?: Note;
  /**
   * Handler de suscripción. Si no se pasa, usa un stub.
   * TODO(backend): conectar a integración de correo/WhatsApp real.
   */
  onSubscribe?: (email: string) => void | Promise<void>;
  className?: string;
}

/** Banner ancla de El Pulso, reutilizable dentro y fuera de /noticias. */
export function PulsoBanner({ note, onSubscribe, className }: PulsoBannerProps) {
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
        // TODO(backend): reemplazar stub por suscripción real (correo/WhatsApp).
        console.info("[PulsoBanner] onSubscribe stub:", email.trim());
      }
      toast.success("¡Listo! Te llega El Pulso. Sube la marea.");
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
      className={`overflow-hidden rounded-2xl border border-rose-200/60 bg-rose-50 p-6 dark:border-rose-500/20 dark:bg-rose-500/10 md:p-8 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
            <Waves className="h-3.5 w-3.5" aria-hidden />
            El Pulso · semanal
          </span>
          <h2
            id="pulso-banner-heading"
            className="mt-3 font-display text-xl font-bold text-foreground md:text-2xl"
          >
            {MAREA.grito} Recibe El Pulso.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {note?.resumen ??
              "El resumen de lo que mueve la vaina tech en el Caribe, cada semana en tu correo."}
          </p>
          {note && (
            <Link
              to={`/noticias/${note.slug}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:underline dark:text-rose-400"
            >
              Leer la última edición
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-2 sm:flex-row"
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
            className="bg-background"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="shrink-0 bg-rose-600 text-white hover:bg-rose-700"
          >
            Recibe El Pulso
          </Button>
        </form>
      </div>
    </section>
  );
}
