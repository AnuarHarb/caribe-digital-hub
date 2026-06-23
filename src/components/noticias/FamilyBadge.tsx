import { cn } from "@/lib/utils";
import { FAMILIAS, type FamiliaId } from "@/content/taxonomies";

interface FamilyBadgeProps {
  familia: FamiliaId;
  className?: string;
}

/** Badge de familia: punto de color + label de display. Navegación por familia. */
export function FamilyBadge({ familia, className }: FamilyBadgeProps) {
  const def = FAMILIAS[familia];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        def.color.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", def.color.dot)} aria-hidden />
      {def.label}
    </span>
  );
}
