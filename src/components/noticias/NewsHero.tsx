import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Note } from "@/content/noticias";
import { formatFecha } from "@/content/noticias/format";
import { FamilyBadge } from "@/components/noticias/FamilyBadge";
import { PillarBadge } from "@/components/noticias/PillarBadge";
import { FormatTag } from "@/components/noticias/FormatTag";

interface NewsHeroProps {
  note: Note;
}

export function NewsHero({ note }: NewsHeroProps) {
  const fecha = formatFecha(note.fecha);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Link
        to={`/noticias/${note.slug}`}
        className="grid rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-2"
      >
        <div className="aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-auto md:h-full">
          {note.portada ? (
            <img
              src={note.portada}
              alt={`Portada de la nota destacada: ${note.title}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20" aria-hidden />
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <FamilyBadge familia={note.familia} />
            <PillarBadge pilar={note.pilar} />
            <FormatTag formato={note.formato} />
          </div>

          <h2 className="font-display text-2xl font-bold leading-tight text-foreground md:text-4xl">
            {note.title}
          </h2>

          {note.resumen && (
            <p className="text-base leading-relaxed text-muted-foreground">
              {note.resumen}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {note.autor && <span>{note.autor}</span>}
            {note.autor && fecha && <span aria-hidden>·</span>}
            {fecha && <time dateTime={note.fecha}>{fecha}</time>}
          </div>

          <span className="mt-2 inline-flex items-center gap-1 font-semibold text-accent">
            Leer la nota
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
