import type { Note } from "@/content/noticias";
import { NewsCard } from "@/components/noticias/NewsCard";

interface NewsGridProps {
  notes: Note[];
  emptyLabel?: string;
}

export function NewsGrid({ notes, emptyLabel }: NewsGridProps) {
  if (notes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center text-sm text-muted-foreground">
        {emptyLabel ?? "No hay notas con estos filtros todavía."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NewsCard key={note.slug} note={note} />
      ))}
    </div>
  );
}
