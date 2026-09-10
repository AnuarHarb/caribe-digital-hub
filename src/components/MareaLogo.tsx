import { cn } from "@/lib/utils";

const OSCURO = "/logos/la-marea-black.png";
const CLARO = "/logos/la-marea.png";

export function MareaLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img src={OSCURO} alt="La Marea" className="h-full w-auto dark:hidden" />
      <img src={CLARO} alt="" className="hidden h-full w-auto dark:block" aria-hidden />
    </span>
  );
}
