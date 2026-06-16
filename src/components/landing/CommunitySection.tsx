import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, ExternalLink, MapPin } from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import type { CommunityProfile } from "@/hooks/useCommunities";
import { PillarBadge } from "@/components/landing/PillarBadge";

const FEATURED_EVENTS = [
  { logo: "/logos/tech-nights.png", url: "https://www.codigoabierto.tech/eventos", name: "Tech Nights", description: "3er sábado de cada mes" },
  { logo: "/logos/barranqui-ia.png", url: "https://barranquiia.com", name: "Barranqui-IA", description: "Hackatón de IA del Caribe" },
  { logo: "/logos/tech-caribe-fest.webp", url: "https://techcaribe.co", name: "Tech Caribe Fest", description: "Festival de tecnología" },
] as const;

function CommunityCard({ community }: { community: CommunityProfile }) {
  const { t } = useTranslation();

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center">
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt=""
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-accent/10 text-accent">
                <Users className="h-10 w-10" aria-hidden />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {community.company_name}
            </h3>
            {community.location && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                {community.location}
              </span>
            )}
          </div>
        </header>

        {community.description && (
          <p className="flex-1 text-center text-sm leading-relaxed text-muted-foreground">
            {community.description}
          </p>
        )}

        <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-border/40 pt-4">
          {community.whatsapp_url && (
            <Button
              asChild
              size="sm"
              className="gap-2 rounded-full bg-[#25D366] px-4 font-semibold text-white shadow-sm hover:bg-[#1fb855]"
            >
              <a
                href={community.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            </Button>
          )}
          {community.website && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
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

export function CommunitySection() {
  const { t } = useTranslation();
  const { data: communities = [], isLoading } = useCommunities();

  const hasDynamic = communities.length > 0;

  return (
    <section
      id="community-section"
      aria-labelledby="community-heading"
      className="py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <PillarBadge pillar="community" />
        </div>
        <h2
          id="community-heading"
          className="mt-4 text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.community.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.community.subtitle")}
        </p>

        {/* Featured events — highlighted at the top */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURED_EVENTS.map((event) => (
              <a
                key={event.name}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/event flex flex-col items-center gap-3 rounded-xl bg-slate-900 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/40"
              >
                <div className="flex h-12 items-center justify-center">
                  <img
                    src={event.logo}
                    alt={event.name}
                    className="h-10 w-auto max-w-[160px] object-contain transition-transform duration-300 group-hover/event:scale-105"
                  />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-white">
                    {event.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {event.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Banner photo */}
        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-xl">
          <img
            src="/events/hackaton-bquilla-2026-comunidad.jpg"
            alt=""
            className="aspect-[21/9] w-full object-cover"
            loading="lazy"
            aria-hidden
          />
        </div>

        {/* Communities grid */}
        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-20 w-20 rounded-xl bg-muted" />
                    <div className="h-5 w-28 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-3/4 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasDynamic ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {t("landing.community.noCommunities")}
          </p>
        )}
      </div>
    </section>
  );
}
