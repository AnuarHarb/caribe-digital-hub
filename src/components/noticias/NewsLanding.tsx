import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WhatsappLogo } from "@phosphor-icons/react";
import {
  filterNotes,
  pickHeroNote,
  type Note,
} from "@/content/noticias";
import { isFamiliaId, isPilarId } from "@/content/taxonomies";
import { NewsHero } from "@/components/noticias/NewsHero";
import { NewsFilters } from "@/components/noticias/NewsFilters";
import { NewsGrid } from "@/components/noticias/NewsGrid";
import { PulsoBanner } from "@/components/noticias/PulsoBanner";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/waLink";
import { MareaLogo } from "@/components/MareaLogo";

interface NewsLandingProps {
  notes: Note[];
}

/** Landing de «Costa Digital News»: hero ancla + banner de El Pulso + grid filtrable. */
export function NewsLanding({ notes }: NewsLandingProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const [searchParams] = useSearchParams();

  const heroNote = pickHeroNote(notes);

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
        <h1 className="flex justify-center">
          <MareaLogo className="h-24 md:h-32" />
          <span className="sr-only">La Marea</span>
        </h1>
      </header>

      {heroNote && <NewsHero note={heroNote} />}

      <PulsoBanner />

      <section aria-labelledby="grid-heading" className="space-y-6">
        <h2 id="grid-heading" className="sr-only">
          Todas las notas
        </h2>
        <NewsFilters />
        <NewsGrid
          notes={filtered}
          emptyLabel="Pronto publicaremos más notas. Mantente al día."
        />
      </section>

      <section
        aria-labelledby="contar-heading"
        className="rounded-2xl bg-navy px-6 py-12 text-center text-white md:px-12 md:py-16"
      >
        <h2
          id="contar-heading"
          className="text-balance font-display text-2xl font-extrabold md:text-3xl"
        >
          {t("blog.contarTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-white/80">
          {t("blog.contarText")}
        </p>
        <a
          href={waLink("mareaReportero", locale)}
          className="mt-6 inline-flex"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg">
            <WhatsappLogo weight="fill" aria-hidden />
            {t("blog.contarCta")}
          </Button>
        </a>
      </section>
    </div>
  );
}
