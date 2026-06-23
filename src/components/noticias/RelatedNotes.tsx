import type { Note } from "@/content/noticias";
import { NewsCard } from "@/components/noticias/NewsCard";

interface RelatedNotesProps {
  notes: Note[];
  title?: string;
}

/** 2–3 notas relacionadas (mismo pilar o familia). */
export function RelatedNotes({ notes, title = "Sigue leyendo" }: RelatedNotesProps) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2
        id="related-heading"
        className="mb-6 font-display text-xl font-bold text-primary md:text-2xl"
      >
        {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NewsCard key={note.slug} note={note} />
        ))}
      </div>
    </section>
  );
}
