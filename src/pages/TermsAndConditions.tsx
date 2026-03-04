import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";

export default function TermsAndConditions() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Términos y Condiciones | Costa Digital"
        description="Términos y condiciones de uso de la plataforma Costa Digital, el ecosistema tech del Caribe colombiano."
        canonical="/terminos"
      />
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          {t("legal.termsTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("legal.lastUpdated")}: 4 de marzo de 2026
        </p>

        <article className="prose prose-lg dark:prose-invert max-w-none mt-8 prose-headings:font-display">
          <section>
            <h2>1. {t("legal.terms.acceptanceTitle")}</h2>
            <p>{t("legal.terms.acceptanceText")}</p>
          </section>

          <section>
            <h2>2. {t("legal.terms.ecosystemTitle")}</h2>
            <p>{t("legal.terms.ecosystemIntro")}</p>
            <p>{t("legal.terms.ecosystemRegistration")}</p>
            <ul>
              <li>{t("legal.terms.ecosystemBullet1")}</li>
              <li>{t("legal.terms.ecosystemBullet2")}</li>
              <li>{t("legal.terms.ecosystemBullet3")}</li>
            </ul>
            <p>{t("legal.terms.ecosystemVoluntary")}</p>
            <p>{t("legal.terms.ecosystemReserve")}</p>
          </section>

          <section>
            <h2>3. {t("legal.terms.accountsTitle")}</h2>
            <p>{t("legal.terms.accountsText")}</p>
          </section>

          <section>
            <h2>4. {t("legal.terms.contentTitle")}</h2>
            <p>{t("legal.terms.contentText")}</p>
          </section>

          <section>
            <h2>5. {t("legal.terms.intellectualTitle")}</h2>
            <p>{t("legal.terms.intellectualText")}</p>
          </section>

          <section>
            <h2>6. {t("legal.terms.conductTitle")}</h2>
            <p>{t("legal.terms.conductIntro")}</p>
            <ul>
              <li>{t("legal.terms.conductBullet1")}</li>
              <li>{t("legal.terms.conductBullet2")}</li>
              <li>{t("legal.terms.conductBullet3")}</li>
              <li>{t("legal.terms.conductBullet4")}</li>
            </ul>
          </section>

          <section>
            <h2>7. {t("legal.terms.limitationTitle")}</h2>
            <p>{t("legal.terms.limitationText")}</p>
          </section>

          <section>
            <h2>8. {t("legal.terms.modificationsTitle")}</h2>
            <p>{t("legal.terms.modificationsText")}</p>
          </section>

          <section>
            <h2>9. {t("legal.terms.contactTitle")}</h2>
            <p>{t("legal.terms.contactText")}</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
