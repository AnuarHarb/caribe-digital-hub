import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface FinalCTAProps {
  onJoinClick: () => void;
}

export function FinalCTA({ onJoinClick }: FinalCTAProps) {
  const { t } = useTranslation();
  
  const scrollToPlans = () => {
    const element = document.getElementById("planes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent/20 dark:from-primary/90 dark:via-secondary dark:to-accent/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="font-display text-3xl font-bold text-primary-foreground dark:text-foreground md:text-4xl lg:text-5xl">
            {t("membresia.finalCta.title")}
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button onClick={onJoinClick} size="lg" className="text-base">
              {t("membresia.finalCta.ctaPrimary")}
            </Button>
            <Button
              onClick={scrollToPlans}
              variant="outline"
              size="lg"
              className="text-base bg-background/90 dark:bg-card/90 backdrop-blur border-2 dark:border-accent/50"
            >
              {t("membresia.finalCta.ctaSecondary")}
              <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
