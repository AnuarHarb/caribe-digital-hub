import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { ServicesList } from "@/components/portafolio/ServicesList";
import { LegalAnnex } from "@/components/portafolio/MembershipBlocks";
import { DESCRIPTOR } from "@/content/portafolio";
import { useTranslation } from "react-i18next";

export default function Servicios() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Servicios | ${DESCRIPTOR}`}
        description={t("portafolio.services.subtitle")}
        canonical="/servicios"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("portafolio.services.eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-navy dark:text-primary">
            {t("portafolio.services.title")}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("portafolio.services.subtitle")}</p>
        </header>

        <div className="mx-auto mt-12 max-w-4xl">
          <ServicesList />
          <LegalAnnex />
        </div>
      </main>
      <Footer />
    </div>
  );
}
