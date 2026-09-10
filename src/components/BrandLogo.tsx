import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** `onDark` para fondos navy (hero); `default` para nav claro/oscuro. */
  variant?: "default" | "onDark";
  size?: "default" | "lg";
}

const LIGHT = "/logos/Costa_Digital_Logo_horizontal.png";
const DARK = "/logos/Costa_Digital_Logo_horizontal_claro.png";

export function BrandLogo({
  className,
  variant = "default",
  size = "default",
}: BrandLogoProps) {
  const height = size === "lg" ? "h-14 sm:h-16" : "h-8 sm:h-9";

  if (variant === "onDark") {
    return (
      <img
        src={DARK}
        alt="Costa Digital · Centro de Innovación"
        className={cn("w-auto", height, className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      <img src={LIGHT} alt="Costa Digital · Centro de Innovación" className={cn("w-auto dark:hidden", height)} />
      <img src={DARK} alt="" className={cn("hidden w-auto dark:block", height)} />
    </span>
  );
}
