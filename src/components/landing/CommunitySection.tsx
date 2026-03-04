import { useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, ExternalLink, MapPin } from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import type { CommunityProfile } from "@/hooks/useCommunities";

const SCROLL_SPEED = 0.4;

const FEATURED_EVENTS = [
  { logo: "/logos/tech-nights.png", url: "https://www.codigoabierto.tech/eventos", name: "Tech Nights" },
  { logo: "/logos/barranqui-ia.png", url: "https://barranquiia.com", name: "Barranqui-IA" },
  { logo: "/logos/tech-caribe-fest.webp", url: "https://techcaribe.co", name: "Tech Caribe Fest" },
] as const;

function Carousel({ communities }: { communities: CommunityProfile[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, pos: 0 });

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (track) track.style.transform = `translateX(${positionRef.current}px)`;
  }, []);

  const normalizePosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const halfWidth = track.scrollWidth / 2;
    if (positionRef.current > 0) positionRef.current -= halfWidth;
    if (positionRef.current <= -halfWidth) positionRef.current += halfWidth;
  }, []);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const track = trackRef.current;
      if (!track || isPausedRef.current || isDraggingRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const halfWidth = track.scrollWidth / 2;
      positionRef.current -= SCROLL_SPEED;
      if (positionRef.current <= -halfWidth) positionRef.current += halfWidth;
      applyTransform();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [communities.length, applyTransform]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isPausedRef.current = true;
    dragStartRef.current = { x: e.clientX, pos: positionRef.current };
    containerRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - dragStartRef.current.x;
    positionRef.current = dragStartRef.current.pos + delta;
    normalizePosition();
    applyTransform();
    dragStartRef.current = { x: e.clientX, pos: positionRef.current };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      containerRef.current?.releasePointerCapture?.(e.pointerId);
      isDraggingRef.current = false;
    }
    isPausedRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="group/carousel mt-12 overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { if (!isDraggingRef.current) isPausedRef.current = false; }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        ref={trackRef}
        className="flex items-stretch gap-6"
        style={{ width: "max-content" }}
      >
        {[...communities, ...communities].map((community, idx) => (
          <CommunityCard key={`${community.id}-${idx}`} community={community} />
        ))}
      </div>
    </div>
  );
}

function CommunityCard({ community }: { community: CommunityProfile }) {
  const { t } = useTranslation();

  return (
    <Card className="group relative flex h-full min-h-[380px] min-w-[320px] max-w-[340px] flex-col overflow-hidden border border-border/40 bg-card/90 shadow-[0_10px_30px_-12px_hsl(var(--accent)/0.35)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_hsl(var(--accent)/0.5)]">
      <div
        className="absolute -left-20 -top-20 h-56 w-56 rounded-full opacity-35 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-55"
        aria-hidden
        style={{
          background: "hsl(var(--accent) / 0.45)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "linear-gradient(145deg, hsl(var(--accent) / 0.08) 0%, transparent 45%, hsl(var(--accent) / 0.12) 100%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-full w-1.5 opacity-85"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.3) 100%)",
        }}
      />
      <CardContent className="relative flex flex-1 flex-col gap-5 p-6">
        <header className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt=""
                className="h-28 w-28 object-contain drop-shadow-[0_8px_16px_hsl(var(--accent)/0.25)] transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Users className="h-14 w-14" aria-hidden />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground leading-tight tracking-tight">
              {community.company_name}
            </h3>
            <span className="mt-2 inline-flex rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {t("company.type.community")}
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
                  <Badge variant="secondary" className="rounded-full border border-border/40 bg-secondary/80 px-2.5 py-1 text-[10px] font-semibold">
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

        <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-border/50 pt-4">
          {community.whatsapp_url && (
            <Button
              asChild
              size="sm"
              className="gap-2 rounded-full bg-[#25D366] px-4 font-semibold text-white shadow-[0_8px_18px_rgba(37,211,102,0.35)] hover:bg-[#1fb855] hover:shadow-[0_10px_22px_rgba(37,211,102,0.45)]"
            >
              <a
                href={community.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t("landing.community.joinWhatsApp")}
              </a>
            </Button>
          )}
          {community.website && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-border/70 bg-background/60 backdrop-blur-sm"
            >
              <a
                href={community.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
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
      aria-labelledby="community-heading"
      className="overflow-x-hidden py-20 md:py-28 bg-muted/30"
    >
      <div className="container mx-auto min-w-0 px-4">
        <h2
          id="community-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.community.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.community.subtitle")}
        </p>

        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-muted" />
                    <div className="h-5 w-32 rounded bg-muted" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasDynamic ? (
          <Carousel communities={communities} />
        ) : (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {t("landing.community.noCommunities")}
          </p>
        )}

        <div className="mt-12 rounded-xl bg-slate-900 px-8 py-6 dark:bg-slate-950">
          <h3 className="text-center font-display text-lg font-semibold text-white">
            {t("landing.community.eventsTitle")}
          </h3>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
            {FEATURED_EVENTS.map((event) => (
              <a
                key={event.name}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex max-w-[280px] items-center justify-center transition-opacity hover:opacity-80"
              >
                <img
                  src={event.logo}
                  alt={event.name}
                  className="h-12 w-auto max-w-[280px] object-contain md:h-14"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
