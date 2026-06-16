import { useTranslation } from "react-i18next";

type PillarKey = "education" | "community" | "innovation" | "capital";

const DOT: Record<PillarKey, string> = {
  education: "bg-blue-500",
  community: "bg-green-500",
  innovation: "bg-purple-500",
  capital: "bg-orange-500",
};

export function PillarBadge({
  pillar,
  className,
}: {
  pillar: PillarKey;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground ${className ?? ""}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[pillar]}`} aria-hidden />
      {t(`landing.pillarTags.${pillar}`)}
    </span>
  );
}
