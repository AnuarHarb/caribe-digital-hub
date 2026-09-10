import { cn } from "@/lib/utils";

export function MareaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/logos/la-marea.png"
      alt="La Marea"
      className={cn("w-auto", className)}
    />
  );
}
