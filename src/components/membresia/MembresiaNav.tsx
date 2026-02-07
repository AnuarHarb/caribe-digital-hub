import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/costa-digital-logo.png";

interface MembresiaNavProps {
  onJoinClick: () => void;
}

export function MembresiaNav({ onJoinClick }: MembresiaNavProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>("que-es");

  const sections = [
    { id: "que-es", label: t("membresia.nav.queEs") },
    { id: "para-quien", label: t("membresia.nav.paraQuien") },
    { id: "beneficios", label: t("membresia.nav.beneficios") },
    { id: "planes", label: t("membresia.nav.planes") },
    { id: "impacto", label: t("membresia.nav.impacto") },
    { id: "faq", label: t("membresia.nav.faq") },
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 dark:border-border/60 bg-background/95 dark:bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center gap-4 overflow-x-auto md:justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 mr-4">
            <img src={logoImage} alt="Costa Digital" className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-primary hidden sm:inline">
              COSTA DIGITAL
            </span>
          </Link>
          <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleClick(id)}
                className={cn(
                  "whitespace-nowrap px-2 py-2 text-sm font-medium transition-colors hover:text-accent md:px-4",
                  activeSection === id
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <LanguageToggle />
            <ThemeToggle />
            <Button onClick={onJoinClick} size="sm" className="hidden sm:inline-flex">
              {t("membresia.nav.unete")}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
