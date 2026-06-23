import { useSearchParams } from "react-router-dom";
import {
  filterNotes,
  pickHeroNote,
  pickUltimoPulso,
  type Note,
} from "@/content/noticias";
import { isFamiliaId, isPilarId, MAREA } from "@/content/taxonomies";
import { NewsHero } from "@/components/noticias/NewsHero";
import { NewsFilters } from "@/components/noticias/NewsFilters";
import { NewsGrid } from "@/components/noticias/NewsGrid";
import { PulsoBanner } from "@/components/noticias/PulsoBanner";

interface NewsLandingProps {
  notes: Note[];
}

/** Landing de «La Marea»: hero ancla + banner de El Pulso + grid filtrable. */
export function NewsLanding({ notes }: NewsLandingProps) {
  const [searchParams] = useSearchParams();

  const heroNote = pickHeroNote(notes);
  const ultimoPulso = pickUltimoPulso(notes);

  const familiaParam = searchParams.get("familia");
  const pilarParam = searchParams.get("pilar");
  const familia = isFamiliaId(familiaParam) ? familiaParam : null;
  const pilar = isPilarId(pilarParam) ? pilarParam : null;

  const filtered = filterNotes(notes, {
    familia,
    pilar,
    excludeSlug: heroNote?.slug,
  });

  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold text-primary md:text-5xl">
          {MAREA.nombre}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          {MAREA.descriptor}
        </p>
      </header>

      {heroNote && <NewsHero note={heroNote} />}

      <PulsoBanner note={ultimoPulso} />

      <section aria-labelledby="grid-heading" className="space-y-6">
        <h2 id="grid-heading" className="sr-only">
          Todas las notas
        </h2>
        <NewsFilters />
        <NewsGrid
          notes={filtered}
          emptyLabel="Pronto publicaremos más notas. Sube la marea."
        />
      </section>
    </div>
  );
}
