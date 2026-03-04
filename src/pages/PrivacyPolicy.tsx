import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Aviso de Privacidad | Costa Digital"
        description="Aviso de privacidad y política de tratamiento de datos personales de Costa Digital, el ecosistema tech del Caribe colombiano."
        canonical="/aviso-de-privacidad"
      />
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          {t("legal.privacyTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("legal.lastUpdated")}: 4 de marzo de 2026
        </p>

        <article className="prose prose-lg dark:prose-invert max-w-none mt-8 prose-headings:font-display">
          <section>
            <h2>1. {t("legal.privacy.collectionTitle")}</h2>
            <p>{t("legal.privacy.collectionIntro")}</p>
            <ul>
              <li>{t("legal.privacy.collectionBullet1")}</li>
              <li>{t("legal.privacy.collectionBullet2")}</li>
              <li>{t("legal.privacy.collectionBullet3")}</li>
              <li>{t("legal.privacy.collectionBullet4")}</li>
            </ul>
          </section>

          <section>
            <h2>2. {t("legal.privacy.useTitle")}</h2>
            <p>{t("legal.privacy.useIntro")}</p>
            <ul>
              <li>{t("legal.privacy.useBullet1")}</li>
              <li>{t("legal.privacy.useBullet2")}</li>
              <li>{t("legal.privacy.useBullet3")}</li>
              <li>{t("legal.privacy.useBullet4")}</li>
              <li>{t("legal.privacy.useBullet5")}</li>
            </ul>
          </section>

          <section>
            <h2>3. {t("legal.privacy.sharingTitle")}</h2>
            <p>{t("legal.privacy.sharingText")}</p>
          </section>

          <section>
            <h2>4. {t("legal.privacy.publicTitle")}</h2>
            <p>{t("legal.privacy.publicText")}</p>
          </section>

          <section>
            <h2>5. {t("legal.privacy.securityTitle")}</h2>
            <p>{t("legal.privacy.securityText")}</p>
          </section>

          <section>
            <h2>6. {t("legal.privacy.rightsTitle")}</h2>
            <p>{t("legal.privacy.rightsIntro")}</p>
            <ul>
              <li>{t("legal.privacy.rightsBullet1")}</li>
              <li>{t("legal.privacy.rightsBullet2")}</li>
              <li>{t("legal.privacy.rightsBullet3")}</li>
              <li>{t("legal.privacy.rightsBullet4")}</li>
            </ul>
          </section>

          <section>
            <h2>7. {t("legal.privacy.cookiesTitle")}</h2>
            <p>{t("legal.privacy.cookiesText")}</p>
          </section>

          <section>
            <h2>8. {t("legal.privacy.changesTitle")}</h2>
            <p>{t("legal.privacy.changesText")}</p>
          </section>

          <section>
            <h2>9. {t("legal.privacy.contactTitle")}</h2>
            <p>{t("legal.privacy.contactText")}</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
