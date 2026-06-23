import { format } from "date-fns";
import { es } from "date-fns/locale";

/** Formatea una fecha ISO (timestamp o YYYY-MM-DD) en español. Null si inválida. */
export function formatFecha(fecha: string): string | null {
  if (!fecha) return null;
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
}
