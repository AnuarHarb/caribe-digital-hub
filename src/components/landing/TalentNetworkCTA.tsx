import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function TalentNetworkCTA() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="talent-network-heading"
      className="py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg md:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Users className="h-7 w-7" aria-hidden />
          </div>
          <h2
            id="talent-network-heading"
            className="mt-6 font-display text-2xl font-bold text-primary md:text-3xl"
          >
            {t("landing.talentNetwork.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t("landing.talentNetwork.subtitle")}
          </p>
          <div className="mt-8">
            <Link to="/talento">
              <Button
                size="lg"
                className="transition-all duration-300 hover:shadow-lg"
              >
                {t("landing.talentNetwork.cta")}
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
