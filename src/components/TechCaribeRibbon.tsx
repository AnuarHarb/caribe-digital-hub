import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, X } from "lucide-react";

const FEST_URL = "https://www.techcaribe.co/fest";
const STORAGE_KEY = "techcaribe-ribbon-dismissed";

export function TechCaribeRibbon() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true",
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <aside
      aria-label={t("ribbon.badge")}
      className="relative w-full overflow-hidden bg-[linear-gradient(135deg,hsl(215_70%_15%),hsl(215_60%_25%),hsl(174_72%_40%))] text-white"
    >
      <a
        href={FEST_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 px-10 py-2 text-center transition-opacity hover:opacity-95"
      >
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent-foreground">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-foreground/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-foreground" />
          </span>
          {t("ribbon.badge")}
        </span>

        <span className="hidden text-sm font-medium sm:inline">{t("ribbon.text")}</span>
        <span className="text-sm font-medium sm:hidden">{t("ribbon.textShort")}</span>

        <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5 md:inline-flex">
          {t("ribbon.cta")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </a>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("ribbon.dismiss")}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
}
