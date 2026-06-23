import { Link } from "react-router-dom";
import type { Note } from "@/content/noticias";
import { formatFecha } from "@/content/noticias/format";
import { FamilyBadge } from "@/components/noticias/FamilyBadge";
import { PillarBadge } from "@/components/noticias/PillarBadge";
import { FormatTag } from "@/components/noticias/FormatTag";

interface NewsCardProps {
  note: Note;
}

export function NewsCard({ note }: NewsCardProps) {
  const fecha = formatFecha(note.fecha);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">
      <Link
        to={`/noticias/${note.slug}`}
        className="flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          {note.portada ? (
            <img
              src={note.portada}
              alt={`Portada de la nota: ${note.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted-foreground/10" aria-hidden />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <FamilyBadge familia={note.familia} />
            <PillarBadge pilar={note.pilar} />
            <FormatTag formato={note.formato} />
          </div>

          <h3 className="font-display text-lg font-bold leading-snug text-foreground">
            {note.title}
          </h3>

          {note.resumen && (
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {note.resumen}
            </p>
          )}

          <footer className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {note.autor && <span>{note.autor}</span>}
            {note.autor && fecha && <span aria-hidden>·</span>}
            {fecha && <time dateTime={note.fecha}>{fecha}</time>}
          </footer>
        </div>
      </Link>
    </article>
  );
}
