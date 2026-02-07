import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import logoImage from "@/assets/costa-digital-logo.png";

interface HeroProps {
  onJoinClick: () => void;
}

export function Hero({ onJoinClick }: HeroProps) {
  const { t } = useTranslation();
  
  const scrollToPlans = () => {
    const element = document.getElementById("planes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent/20 dark:from-primary/90 dark:via-secondary dark:to-accent/30 py-20 md:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 dark:opacity-10"></div>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logoImage} 
              alt="Costa Digital Logo" 
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg dark:drop-shadow-xl"
            />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground dark:text-foreground md:text-6xl lg:text-7xl">
            {t("membresia.hero.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90 dark:text-foreground/90 md:text-xl lg:text-2xl">
            {t("membresia.hero.subtitle")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button onClick={onJoinClick} size="lg" className="text-base">
              {t("membresia.hero.ctaPrimary")}
            </Button>
            <Button onClick={scrollToPlans} variant="outline" size="lg" className="text-base bg-background/90 dark:bg-card/90 backdrop-blur border-2 dark:border-accent/50">
              {t("membresia.hero.ctaSecondary")}
              <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
    </section>
  );
}
