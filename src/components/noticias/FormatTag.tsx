import { cn } from "@/lib/utils";
import { FORMATOS, type FormatoId } from "@/content/taxonomies";

interface FormatTagProps {
  formato: FormatoId;
  className?: string;
}

/** Tag secundario de formato. El formato es tratamiento visual, no navegación. */
export function FormatTag({ formato, className }: FormatTagProps) {
  const def = FORMATOS[formato];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {def.label}
    </span>
  );
}
