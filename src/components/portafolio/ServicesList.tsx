import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SERVICES, type Service } from "@/content/portafolio";
import { formatCop } from "@/lib/formatPrice";
import { waLink } from "@/lib/waLink";
import { CheckoutButton } from "@/components/portafolio/MembershipBlocks";
import { Cafe404Credit } from "@/components/landing/Cafe404";
import type { ProductKey } from "@/content/portafolio";

function ServiceBlock({ service }: { service: Service }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";

  const svc = t(`portafolio.services.${service.key}`, { returnObjects: true }) as {
    title: string;
    description?: string;
    tagline?: string;
    items: Record<string, { name: string; note?: string }>;
  };
  return (
    <article
      id={service.anchor}
      className={`scroll-mt-24 rounded-2xl border bg-card ${
        service.featured ? "border-2 border-brillante" : "border-line"
      } ${service.social ? "border-l-4 border-l-aqua" : ""}`}
    >
      <header className="border-b border-line px-6 py-5">
        {(service.key === "cafe404" || service.key === "biblioteca" || service.key === "laMarea") && service.logo && (
          <>
            <img
              src={service.logo}
              alt=""
              className={`h-20 w-auto object-contain ${service.logoDark ? "dark:hidden" : ""}`}
              aria-hidden
            />
            {service.logoDark && (
              <img
                src={service.logoDark}
                alt=""
                className="hidden h-20 w-auto object-contain dark:block"
                aria-hidden
              />
            )}
          </>
        )}
        <h2
          className={
            service.key === "cafe404" || service.key === "biblioteca" || service.key === "laMarea"
              ? "sr-only"
              : "font-display text-xl font-extrabold text-navy dark:text-primary"
          }
        >
          {svc.title}
          {service.featured && (
            <span className="chip-space ml-2 align-middle text-[9px]">
              {t("portafolio.services.membresia.launch")}
            </span>
          )}
        </h2>
      </header>

      <div className="px-6 py-5">
        {svc.tagline && <p className="font-mono text-sm text-brillante">{svc.tagline}</p>}
        {svc.description && <p className="mt-2 max-w-2xl text-muted-foreground">{svc.description}</p>}
        {service.key === "cafe404" && (
          <Cafe404Credit className="mt-3 max-w-2xl text-pretty text-muted-foreground" />
        )}

        <table className="mt-6 w-full text-sm">
          <tbody>
            {service.items.map((item) => {
              const row = svc.items[item.key];
              if (!row) return null;

              let priceLabel = "";
              if (item.priceCop != null) {
                priceLabel = item.priceFrom
                  ? `${t("portafolio.services.from")} ${formatCop(item.priceCop, locale)}`
                  : formatCop(item.priceCop, locale);
              } else if (item.key === "diagnostico") {
                priceLabel = t("portafolio.services.free");
              } else if (item.key === "namingAuditorio") {
                priceLabel = t("portafolio.services.negotiable");
              } else if (item.key === "perfilesComunidad") {
                priceLabel = t("portafolio.services.noCost");
              } else if (item.key === "planAnual") {
                priceLabel = t("portafolio.services.membresia.items.planAnual.note");
              }

              return (
                <tr key={item.key} className="border-t border-line">
                  <td className="py-3 pr-4 align-top">
                    <strong className="text-navy dark:text-primary">{row.name}</strong>
                    {row.note && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{row.note}</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono text-brillante whitespace-nowrap align-top">
                    {priceLabel}
                  </td>
                  <td className="py-3 pl-4 text-right align-top">
                    {item.payable && item.productKey ? (
                      <CheckoutButton
                        productKey={item.productKey as ProductKey}
                        label={t("portafolio.services.pay")}
                      />
                    ) : (
                      <a href={waLink(service.key, locale)} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          {t("portafolio.services.quote")}
                        </Button>
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function ServicesList() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {SERVICES.map((service) => (
        <ServiceBlock key={service.key} service={service} />
      ))}
      <p className="text-sm text-muted-foreground">{t("portafolio.services.footnote")}</p>
    </div>
  );
}
