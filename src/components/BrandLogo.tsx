import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** `onDark` para fondos navy (hero); `default` para nav claro/oscuro. */
  variant?: "default" | "onDark";
  size?: "default" | "lg";
}

export function BrandLogo({
  className,
  variant = "default",
  size = "default",
}: BrandLogoProps) {
  const onDark = variant === "onDark";
  const large = size === "lg";

  return (
    <span className={cn("inline-flex items-center", large ? "gap-3 sm:gap-4" : "gap-2.5 sm:gap-3", className)}>
      <img
        src="/logos/Costa_Digital_Isotipo_fondo_transparente.svg"
        alt=""
        aria-hidden
        className={large ? "h-14 w-14 shrink-0 sm:h-16 sm:w-16" : "h-9 w-9 shrink-0 sm:h-10 sm:w-10"}
        width={large ? 64 : 40}
        height={large ? 64 : 40}
      />
      <span
        className={cn(
          "block font-display font-extrabold tracking-tight",
          large ? "text-2xl sm:text-3xl" : "text-base sm:text-lg",
          onDark
            ? "text-white [&>span]:text-aqua"
            : "text-navy dark:text-white [&>span]:text-brillante dark:[&>span]:text-aqua"
        )}
      >
        COSTA <span>DIGITAL</span>
      </span>
    </span>
  );
}
