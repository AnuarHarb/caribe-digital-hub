import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  FAMILIA_LIST,
  PILAR_LIST,
  isFamiliaId,
  isPilarId,
} from "@/content/taxonomies";

/**
 * Filtros por familia + pilar con estado en la URL (query params), para que las
 * vistas filtradas sean compartibles y enlazables. Nunca se filtra por formato.
 */
export function NewsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const familiaParam = searchParams.get("familia");
  const pilarParam = searchParams.get("pilar");
  const activeFamilia = isFamiliaId(familiaParam) ? familiaParam : null;
  const activePilar = isPilarId(pilarParam) ? pilarParam : null;
  const hasFilters = Boolean(activeFamilia || activePilar);

  const toggleParam = (key: "familia" | "pilar", value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.get(key) === value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  };

  const clearAll = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("familia");
        next.delete("pilar");
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Por familia
        </legend>
        <div className="flex flex-wrap gap-2">
          {FAMILIA_LIST.map((familia) => {
            const active = activeFamilia === familia.id;
            return (
              <button
                key={familia.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleParam("familia", familia.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? familia.color.badgeActive
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-current" : familia.color.dot,
                  )}
                  aria-hidden
                />
                {familia.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Por pilar
        </legend>
        <div className="flex flex-wrap gap-2">
          {PILAR_LIST.map((pilar) => {
            const active = activePilar === pilar.id;
            return (
              <button
                key={pilar.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleParam("pilar", pilar.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? pilar.color.badgeActive
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-current" : pilar.color.dot,
                  )}
                  aria-hidden
                />
                {pilar.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
