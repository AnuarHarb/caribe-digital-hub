import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { DESCRIPTOR } from "@/content/portafolio";
import {
  MembershipPlans,
  MembershipExtras,
  MembershipFaq,
  LegalAnnex,
  CreyentesWall,
} from "@/components/portafolio/MembershipBlocks";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function Membresias() {
  const { t } = useTranslation();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ["q1", "q2", "q3", "q4"].map((key) => ({
      "@type": "Question",
      name: t(`portafolio.membership.faq.${key}.q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`portafolio.membership.faq.${key}.a`),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Membresías | ${DESCRIPTOR}`}
        description={t("portafolio.membership.subtitle")}
        canonical="/membresias"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("portafolio.membership.eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-navy dark:text-primary">
            {t("portafolio.membership.title")}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("portafolio.membership.subtitle")}</p>
        </header>

        <MembershipPlans />
        <MembershipExtras />
        <CreyentesWall />
        <MembershipFaq />

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold">{t("portafolio.membership.agreements.title")}</h2>
          <ul className="mt-4 space-y-2">
            {(t("portafolio.membership.agreements.items", { returnObjects: true }) as string[]).map(
              (item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-aqua">→</span>
                  {item}
                </li>
              )
            )}
          </ul>
        </section>

        <LegalAnnex />
      </main>
      <Footer />
    </div>
  );
}
