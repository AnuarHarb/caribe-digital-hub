import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommunities } from "@/hooks/useCommunities";
import type { CommunityProfile } from "@/hooks/useCommunities";
import { Users, MessageCircle, ExternalLink, MapPin } from "lucide-react";

const FEATURED_EVENTS = [
  {
    name: "Tech Nights",
    logo: "/logos/tech-nights.png",
    url: "https://www.codigoabierto.tech/eventos",
  },
  {
    name: "Barranqui-IA",
    logo: "/logos/barranqui-ia.png",
    url: "https://barranquiia.com",
  },
  {
    name: "Tech Caribe Fest",
    logo: "/logos/tech-caribe-fest.webp",
    url: "https://techcaribe.co",
  },
] as const;

function PillarBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Pilar 02 · Comunidad
    </span>
  );
}

function CommunityCard({ community }: { community: CommunityProfile }) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-border/40 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col gap-5 p-6">
        <header className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt={community.company_name}
                className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Users className="h-12 w-12" aria-hidden />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-foreground">
              {community.company_name}
            </h3>
            <span className="mt-2 inline-flex rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              Comunidad
            </span>
            {(community.location || community.industry) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {community.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-xs text-foreground/80">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {community.location}
                  </span>
                )}
                {community.industry && (
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-border/40 bg-secondary/80 px-2.5 py-1 text-[10px] font-semibold"
                  >
                    {community.industry}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </header>

        {community.description && (
          <p className="flex-1 text-center text-sm leading-relaxed text-foreground/75">
            {community.description}
          </p>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-center gap-2 border-t border-border/50 pt-4">
          {community.whatsapp_url && (
            <Button
              asChild
              size="sm"
              className="gap-2 rounded-full bg-[#25D366] px-4 font-semibold text-white hover:bg-[#1fb855]"
            >
              <a
                href={community.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Unirse al grupo
              </a>
            </Button>
          )}
          {community.website && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-border/70 bg-background/60"
            >
              <a
                href={community.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Web
              </a>
            </Button>
          )}
        </footer>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-4 w-20 rounded-full bg-muted" />
        </div>
        <div className="mt-5 space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
          <div className="h-3 w-4/6 rounded bg-muted" />
        </div>
        <div className="mt-5 flex justify-center gap-2 border-t border-border/50 pt-4">
          <div className="h-8 w-28 rounded-full bg-muted" />
          <div className="h-8 w-16 rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Comunidades() {
  const { data: communities = [], isLoading } = useCommunities();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Comunidades Tech del Caribe | Costa Digital"
        description="Conoce las comunidades tech del Caribe colombiano: desarrolladores, diseñadores, founders y entusiastas que se reúnen, comparten y construyen juntos. Pilar de Comunidad de Costa Digital, impulsado por Fundación Código Abierto."
        canonical="/comunidades"
        keywords={[
          "comunidades tech Caribe",
          "comunidad developers Barranquilla",
          "GDG Barranquilla",
          "tech communities Caribbean",
        ]}
      />
      <Navbar />

      <main>
        {/* HERO */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <PillarBadge />
              <h1 className="mt-6 max-w-3xl font-display text-3xl font-bold text-primary md:text-4xl">
                Las comunidades que mueven el ecosistema tech del Caribe
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
                Desarrolladores, diseñadores, founders y entusiastas que se
                reúnen, comparten y construyen juntos. La comunidad es el tejido
                que une al ecosistema, impulsada por Fundación Código Abierto.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-full">
                  <a href="mailto:hola@costadigital.org">Suma tu comunidad</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* COMMUNITIES GRID */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : communities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Pronto verás aquí las comunidades del ecosistema.
              </p>
            )}
          </div>
        </section>

        {/* EVENTS */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4">
            <div className="rounded-xl bg-slate-900 px-8 py-8 dark:bg-slate-950">
              <h2 className="text-center font-display text-lg font-semibold text-white">
                Eventos destacados
              </h2>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
                {FEATURED_EVENTS.map((event) => (
                  <a
                    key={event.name}
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center transition-opacity hover:opacity-80"
                  >
                    <img
                      src={event.logo}
                      alt={event.name}
                      className="h-12 w-auto object-contain md:h-14"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
                ¿Lideras una comunidad tech en el Caribe?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
                Conecta tu comunidad con el ecosistema de Costa Digital y llega a
                más talento, founders y aliados del Caribe colombiano.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-full">
                  <a href="mailto:hola@costadigital.org">Hablemos</a>
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
