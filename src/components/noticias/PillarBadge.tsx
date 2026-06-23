import { cn } from "@/lib/utils";
import { PILARES, type PilarId } from "@/content/taxonomies";

interface PillarBadgeProps {
  pilar: PilarId;
  className?: string;
}

/**
 * Badge de pilar para «La Marea». Independiente del PillarBadge de landing
 * (que usa otros pilares) para no chocar.
 */
export function PillarBadge({ pilar, className }: PillarBadgeProps) {
  const def = PILARES[pilar];
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
