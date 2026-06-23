import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { Note } from "@/content/noticias";
import { formatFecha } from "@/content/noticias/format";
import { FAMILIAS, MAREA } from "@/content/taxonomies";
import { toYouTubeEmbed } from "@/lib/youtube";
import { FamilyBadge } from "@/components/noticias/FamilyBadge";
import { PillarBadge } from "@/components/noticias/PillarBadge";
import { FormatTag } from "@/components/noticias/FormatTag";
import { CtaBlock } from "@/components/noticias/CtaBlock";

interface ArticleDetailProps {
  note: Note;
}

export function ArticleDetail({ note }: ArticleDetailProps) {
  const fecha = formatFecha(note.fecha);
  const voz = FAMILIAS[note.familia].voz;
  const ctaEyebrow =
    voz === "comunidad" ? "Aquí se mueve la vaina" : "El Caribe se programa";
  const youtubeEmbed = toYouTubeEmbed(note.videoUrl);

  return (
    <>
      <Link
        to="/noticias"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a {MAREA.nombre}
      </Link>

      <article>
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <FamilyBadge familia={note.familia} />
            <PillarBadge pilar={note.pilar} />
            <FormatTag formato={note.formato} />
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {note.title}
          </h1>

          {note.resumen && (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {note.resumen}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {note.autor && <span className="font-medium text-foreground">{note.autor}</span>}
            {note.autor && fecha && <span aria-hidden>·</span>}
            {fecha && <time dateTime={note.fecha}>{fecha}</time>}
          </div>

          {note.portada && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
              <img
                src={note.portada}
                alt={`Portada de la nota: ${note.title}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </header>

        {youtubeEmbed && (
          <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl bg-muted">
            <iframe
              src={youtubeEmbed}
              title={note.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}

        <div
          className="prose prose-lg dark:prose-invert mt-8 max-w-none prose-headings:font-display prose-img:rounded-lg prose-a:text-accent prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </article>

      {note.cta && (
        <div className="mt-12">
          <CtaBlock cta={note.cta} eyebrow={ctaEyebrow} />
        </div>
      )}
    </>
  );
}
