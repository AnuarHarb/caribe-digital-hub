import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SERVICES, type Service } from "@/content/portafolio";
import { waLink } from "@/lib/waLink";
import { cn } from "@/lib/utils";

function ServiceLogo({ service }: { service: Service }) {
  if (!service.logo) return null;

  return (
    <div className="mb-4 flex justify-center">
      <img
        src={service.logo}
        alt={service.logoAlt ?? ""}
        className={cn(
          "w-auto object-contain",
          service.key === "cafe404" || service.key === "biblioteca" || service.key === "laMarea" ? "h-20" : "h-12",
          service.logoDark ? "dark:hidden" : (service.key === "software" || service.key === "asesorias") && "dark:invert"
        )}
      />
      {service.logoDark && (
        <img
          src={service.logoDark}
          alt=""
          aria-hidden
          className={cn(
            "hidden w-auto object-contain dark:block",
            service.key === "cafe404" || service.key === "biblioteca" ? "h-20" : "h-12"
          )}
        />
      )}
    </div>
  );
}

function ServiceDetail({
  service,
  locale,
}: {
  service: Service;
  locale: "es" | "en";
}) {
  const { t } = useTranslation();
  const svc = t(`portafolio.services.${service.key}`, { returnObjects: true }) as {
    title: string;
    description?: string;
  };

  return (
    <article
      className={cn(
        "service-copy flex h-full flex-col rounded-2xl border bg-card p-6 text-center",
        service.featured ? "border-2 border-brillante" : "border-line",
        service.social && "border-l-4 border-l-aqua"
      )}
      aria-live="polite"
    >
      <ServiceLogo service={service} />
      <h3
        className={
          service.key === "cafe404" || service.key === "biblioteca" || service.key === "laMarea"
            ? "sr-only"
            : "mb-3 font-display text-xl font-extrabold text-navy dark:text-primary"
        }
      >
        {svc.title}
        {service.featured && (
          <span className="chip-space ml-2 align-middle text-[9px]">
            {t("portafolio.services.membresia.launch")}
          </span>
        )}
      </h3>
      {svc.description && (
        <p className="mb-4 flex-1 text-pretty text-sm text-muted-foreground">{svc.description}</p>
      )}
      <div className="mt-auto flex flex-wrap justify-center gap-2">
        {service.url && (
          <a href={service.url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="secondary">
              {t("portafolio.services.visitAlly", { name: service.logoAlt })}
              <ArrowRight weight="bold" aria-hidden />
            </Button>
          </a>
        )}
        <a href={waLink(service.key, locale)} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline">
            {t("portafolio.services.quote")}
          </Button>
        </a>
      </div>
    </article>
  );
}

const HOUSE_SERVICES = SERVICES.filter((s) => s.key !== "membresia");
const ROTATE_MS = 10_000;

export function ServicesGrid() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const [activeKey, setActiveKey] = useState(HOUSE_SERVICES[0].key);
  const [paused, setPaused] = useState(false);

  const activeService = HOUSE_SERVICES.find((s) => s.key === activeKey) ?? HOUSE_SERVICES[0];

  const selectService = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActiveKey((current) => {
        const i = HOUSE_SERVICES.findIndex((s) => s.key === current);
        return HOUSE_SERVICES[(i + 1) % HOUSE_SERVICES.length].key;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [activeKey, paused]);

  useEffect(() => {
    const tab = document.getElementById(`service-tab-${activeKey}`);
    const list = tab?.parentElement;
    if (!tab || !list) return;
    list.scrollTo({
      left: tab.offsetLeft - list.clientWidth / 2 + tab.clientWidth / 2,
      behavior: "smooth",
    });
  }, [activeKey]);

  const activeTitle = (
    t(`portafolio.services.${activeService.key}`, { returnObjects: true }) as { title: string }
  ).title;

  return (
    <section id="servicios" aria-labelledby="services-heading" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t("portafolio.services.eyebrow")}</p>
          <h2
            id="services-heading"
            className="mt-3 text-balance font-display text-3xl font-bold text-navy md:text-4xl dark:text-primary"
          >
            {t("portafolio.services.title")}
          </h2>
          <p className="mx-auto mt-4 text-pretty text-muted-foreground">
            {t("portafolio.services.subtitle")}
          </p>
        </header>

        <div
          className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("portafolio.services.tabs")}
        >
          {HOUSE_SERVICES.map((service) => {
            const svc = t(`portafolio.services.${service.key}`, { returnObjects: true }) as {
              title: string;
            };
            const selected = service.key === activeKey;
            return (
              <button
                key={service.key}
                type="button"
                role="tab"
                id={`service-tab-${service.key}`}
                aria-selected={selected}
                aria-controls="service-detail-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectService(service.key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                  selected
                    ? "border-brillante bg-brillante text-white"
                    : "border-line bg-card text-muted-foreground hover:border-brillante/50"
                )}
              >
                {svc.title.split("·")[0]?.trim() ?? svc.title}
              </button>
            );
          })}
        </div>

        <div
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <figure className="overflow-hidden rounded-2xl border border-line bg-paper">
            <img
              key={activeService.key}
              src={activeService.image}
              alt={activeTitle}
              className="service-shot aspect-[4/3] h-full w-full object-cover sm:min-h-[360px] lg:min-h-[420px]"
            />
          </figure>

          <div id="service-detail-panel" role="tabpanel" aria-labelledby={`service-tab-${activeKey}`}>
            <ServiceDetail key={activeService.key} service={activeService} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
