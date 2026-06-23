import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteCta } from "@/content/noticias";

interface CtaBlockProps {
  cta: NoteCta;
  /** Frase de marca opcional encima del CTA (registro de voz por familia). */
  eyebrow?: string;
}

/** Bloque CTA al final de una nota. Empuja uno de los cuatro trabajos editoriales. */
export function CtaBlock({ cta, eyebrow }: CtaBlockProps) {
  if (!cta.url) return null;

  const isExternal = /^https?:\/\//.test(cta.url);

  return (
    <aside className="overflow-hidden rounded-2xl border border-accent/30 bg-[linear-gradient(135deg,hsl(215_70%_15%),hsl(215_60%_25%),hsl(174_72%_40%))] p-6 text-white md:p-8">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {eyebrow}
        </p>
      )}
      <p className="mt-1 font-display text-xl font-bold md:text-2xl">{cta.texto}</p>
      <div className="mt-4">
        {isExternal ? (
          <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <a href={cta.url} target="_blank" rel="noopener noreferrer">
              {cta.texto}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        ) : (
          <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to={cta.url}>
              {cta.texto}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
