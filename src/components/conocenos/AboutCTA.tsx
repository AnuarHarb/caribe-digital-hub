import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** CTA final único de la página «Sobre nosotros» (consolida los CTA dispersos). */
export function AboutCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
          Súmate a construir el futuro tech del Caribe
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Como estudiante, voluntario, mentor, aliado o startup: hay un lugar
          para ti en el movimiento.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/auth">Únete a la comunidad</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="mailto:hola@costadigital.org">Sé aliado o escríbenos</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
