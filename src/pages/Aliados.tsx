import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  TrendingUp,
  Handshake,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const paths = [
  {
    icon: Lightbulb,
    title: "Innova con nosotros",
    description:
      "Resuelve retos reales con IA, software y tecnologías emergentes junto a Ciudad Inmersiva, nuestro laboratorio de innovación.",
    cta: { label: "Ir a Ciudad Inmersiva", href: "https://ciudadinmersiva.com", external: true },
  },
  {
    icon: TrendingUp,
    title: "Invierte en el Caribe",
    description:
      "Conecta con startups de alto potencial a través de Caribe Ventures, nuestro venture studio y fondo pre-seed.",
    cta: { label: "Ir a Caribe Ventures", href: "https://caribe.ventures", external: true },
  },
  {
    icon: Handshake,
    title: "Patrocina el ecosistema",
    description:
      "Apoya eventos, becas y programas que forman talento y cambian vidas en la región.",
    cta: { label: "Ser patrocinador", href: "mailto:hola@costadigital.org", external: true },
  },
  {
    icon: Briefcase,
    title: "Publica oportunidades",
    description:
      "Comparte vacantes y oportunidades con la red de talento tech del Caribe.",
    cta: { label: "Publicar oportunidad", href: "/auth?type=company", external: false },
  },
] as const;

const benefits = [
  "Acceso directo a la mayor red de talento tech del Caribe colombiano.",
  "Visibilidad de marca en eventos, hackathons y comunidades del ecosistema.",
  "Conexión con startups, founders e inversionistas de la región.",
  "Impacto social real: cada alianza forma talento y crea oportunidades.",
];

export default function Aliados() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Para empresas y aliados | Costa Digital"
        description="Tu empresa, fondo u organización puede ser parte de la transformación tecnológica del Caribe colombiano. Innova, invierte, patrocina o publica oportunidades con Costa Digital."
        canonical="/aliados"
        keywords={[
          "aliados tech Caribe",
          "invertir startups Caribe",
          "innovación empresas Barranquilla",
          "Ciudad Inmersiva",
          "Caribe Ventures",
        ]}
      />
      <Navbar />
      <main>
        {/* HERO */}
        <section
          aria-labelledby="aliados-hero-title"
          className="relative overflow-hidden bg-primary py-20 md:py-28"
        >
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          </div>
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground">
                Súmate al movimiento
              </span>
              <h1
                id="aliados-hero-title"
                className="font-display mt-6 text-3xl font-bold text-primary-foreground md:text-5xl"
              >
                Construyamos el epicentro tech de LATAM, juntos
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
                Tu empresa, fondo u organización puede ser parte de la
                transformación tecnológica del Caribe colombiano. Hay un camino
                para cada aliado.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild variant="secondary" size="lg">
                  <a href="mailto:hola@costadigital.org">Conversemos</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/conocenos">Conoce el ecosistema</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO SUMARTE */}
        <section
          aria-labelledby="aliados-paths-title"
          className="py-20 md:py-28"
        >
          <div className="container mx-auto px-4">
            <h2
              id="aliados-paths-title"
              className="font-display text-center text-3xl font-bold text-primary md:text-4xl"
            >
              Cómo sumarte
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Distintas formas de aportar al ecosistema, según tus objetivos y
              tu organización.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {paths.map(({ icon: Icon, title, description, cta }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 flex-1 text-muted-foreground">
                    {description}
                  </p>
                  <div className="mt-6">
                    {cta.external ? (
                      <Button asChild variant="outline" className="w-full">
                        <a
                          href={cta.href}
                          {...(cta.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {cta.label}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full">
                        <Link to={cta.href}>
                          {cta.label}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POR QUÉ ALIARTE */}
        <section
          aria-labelledby="aliados-benefits-title"
          className="bg-muted/30 py-20 md:py-28"
        >
          <div className="container mx-auto px-4">
            <h2
              id="aliados-benefits-title"
              className="font-display text-center text-3xl font-bold text-primary md:text-4xl"
            >
              Por qué aliarte con Costa Digital
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Una alianza con impacto medible para tu marca y para la región.
            </p>
            <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-4">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section aria-labelledby="aliados-cta-title" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="aliados-cta-title"
                className="font-display text-3xl font-bold text-primary md:text-4xl"
              >
                ¿Listo para ser parte del movimiento?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Escríbenos y diseñemos juntos la mejor forma de colaborar.
              </p>
              <div className="mt-8 flex justify-center">
                <Button asChild size="lg">
                  <a href="mailto:hola@costadigital.org">
                    Hablemos
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
