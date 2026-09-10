import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckout } from "@/hooks/useCheckout";
import { formatCop } from "@/lib/formatPrice";
import { CREYENTES_MAX, type ProductKey } from "@/content/portafolio";
import { waLink } from "@/lib/waLink";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAY_PLANS: { productKey: ProductKey; planKey: "miembro" | "residente"; annual?: boolean }[] = [
  { productKey: "miembro_mensual", planKey: "miembro" },
  { productKey: "miembro_anual", planKey: "miembro", annual: true },
  { productKey: "residente_mensual", planKey: "residente" },
  { productKey: "residente_anual", planKey: "residente", annual: true },
];

export function CheckoutButton({
  productKey,
  label,
  requireAuth = true,
}: {
  productKey: ProductKey;
  label: string;
  requireAuth?: boolean;
}) {
  const { t } = useTranslation();
  const { checkout, loading, error, isAuthenticated } = useCheckout();
  const [email, setEmail] = useState("");

  if (requireAuth && !isAuthenticated) {
    return (
      <Link to={`/auth?redirect=${encodeURIComponent("/membresias")}`}>
        <Button className="w-full">{t("portafolio.checkout.loginToPay")}</Button>
      </Link>
    );
  }

  const handlePay = async () => {
    if (!isAuthenticated && !email) return;
    try {
      await checkout(productKey, { email: email || undefined });
    } catch {
      /* error already set on the hook */
    }
  };

  return (
    <div className="space-y-3">
      {!isAuthenticated && (
        <Input
          type="email"
          placeholder={t("portafolio.checkout.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label={t("portafolio.checkout.emailPlaceholder")}
        />
      )}
      <Button onClick={handlePay} disabled={loading || (!isAuthenticated && !email)} className="w-full">
        {loading ? t("portafolio.checkout.processing") : label}
      </Button>
      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {t("portafolio.checkout.error")}
        </p>
      )}
    </div>
  );
}

export function CreyentesWall() {
  const { t } = useTranslation();
  const { data: members = [] } = useQuery({
    queryKey: ["creyentes-wall"],
    queryFn: async () => {
      const { data } = await supabase
        .from("memberships")
        .select("wall_name, creyente_number")
        .not("wall_name", "is", null)
        .not("creyente_number", "is", null)
        .order("creyente_number");
      return data ?? [];
    },
  });

  if (members.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">{t("portafolio.membership.wall.empty")}</p>;
  }

  return (
    <ul className="mt-6 flex flex-wrap gap-3">
      {members.map((m) => (
        <li
          key={m.creyente_number}
          className="rounded-full border border-line bg-white px-4 py-2 font-mono text-sm"
        >
          #{m.creyente_number} · {m.wall_name}
        </li>
      ))}
    </ul>
  );
}

export function CreyentesCounter() {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ["creyentes-count"],
    queryFn: async () => {
      const { data: row } = await supabase.from("memberships_public_count").select("*").maybeSingle();
      const taken = row?.creyentes_taken ?? 0;
      return CREYENTES_MAX - taken;
    },
  });

  return (
    <p className="mt-2 font-mono text-sm text-brillante">
      {t("portafolio.membership.creyentesRemaining", {
        count: data ?? CREYENTES_MAX,
        max: CREYENTES_MAX,
      })}
    </p>
  );
}

export function MembershipPlans() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-2">
      {(["miembro", "residente"] as const).map((planKey) => {
        const plan = t(`portafolio.membership.plans.${planKey}`, { returnObjects: true }) as {
          name: string;
          price: string;
          normalPrice?: string;
          period: string;
          slots?: string;
          benefits: string[];
        };
        const monthly = PAY_PLANS.find((p) => p.planKey === planKey && !p.annual)!;
        const annual = PAY_PLANS.find((p) => p.planKey === planKey && p.annual)!;

        return (
          <article
            key={planKey}
            id={planKey}
            className="flex flex-col rounded-2xl border border-line bg-card p-8"
          >
            <h3 className="font-display text-2xl font-extrabold">{plan.name}</h3>
            {plan.slots && <p className="text-sm text-muted-foreground">{plan.slots}</p>}
            <p className="mt-4 font-mono text-3xl text-brillante">
              {plan.price}
              <span className="text-base text-muted-foreground">{plan.period}</span>
            </p>
            {plan.normalPrice && (
              <p className="text-sm text-muted-foreground line-through">{plan.normalPrice}</p>
            )}
            <ul className="mt-6 flex-1 space-y-2">
              {plan.benefits.map((b) => (
                <li key={b} className="flex gap-2 text-sm">
                  <span className="text-aqua">→</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4">
              <CheckoutButton
                productKey={monthly.productKey}
                label={t("portafolio.membership.ctaPay")}
              />
              <CheckoutButton
                productKey={annual.productKey}
                label={`${t("portafolio.membership.ctaAnnual")} (${formatCop(
                  planKey === "miembro" ? 700000 : 2500000,
                  locale
                )})`}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function MembershipExtras() {
  const { t } = useTranslation();

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2">
      <article className="rounded-2xl border border-line p-6">
        <h3 className="font-display text-lg font-bold">
          {t("portafolio.membership.plans.coworkDia.name")}
        </h3>
        <p className="font-mono text-xl text-brillante">
          {t("portafolio.membership.plans.coworkDia.price")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("portafolio.membership.plans.coworkDia.description")}
        </p>
        <div className="mt-4">
          <CheckoutButton productKey="cowork_dia" label={t("portafolio.membership.ctaPay")} />
        </div>
      </article>
      <article className="rounded-2xl border border-brillante/30 bg-brillante/5 p-6">
        <h3 className="font-display text-lg font-bold">{t("portafolio.membership.creyentes")}</h3>
        <CreyentesCounter />
        <p className="mt-4 text-pretty text-sm text-muted-foreground">
          {t("portafolio.membership.creyentesLead")}
        </p>
        <dl className="mt-4 space-y-4">
          {(
            t("portafolio.membership.creyentesGifts", { returnObjects: true }) as {
              title: string;
              why: string;
            }[]
          ).map((gift) => (
            <div key={gift.title}>
              <dt className="font-display font-extrabold text-navy dark:text-primary">{gift.title}</dt>
              <dd className="mt-1 text-pretty text-sm text-muted-foreground">{gift.why}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}

export function MembershipFaq() {
  const { t } = useTranslation();
  const keys = ["q1", "q2", "q3", "q4"] as const;

  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="font-display text-2xl font-bold">
        {t("portafolio.membership.faq.title")}
      </h2>
      <Accordion type="single" collapsible className="mt-6">
        {keys.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>
              {t(`portafolio.membership.faq.${key}.q`)}
            </AccordionTrigger>
            <AccordionContent>
              {t(`portafolio.membership.faq.${key}.a`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function LegalAnnex() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="legal-heading" className="mt-16 rounded-2xl border border-line p-8">
      <p className="eyebrow">{t("portafolio.legal.eyebrow")}</p>
      <h2 id="legal-heading" className="mt-2 font-display text-2xl font-bold">
        {t("portafolio.legal.title")}
      </h2>
      <p className="mt-2 text-muted-foreground">{t("portafolio.legal.subtitle")}</p>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="pb-3 pr-4">Servicio</th>
            <th className="pb-3 pr-4">Factura</th>
            <th className="pb-3">Por qué</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-line">
            <td className="py-4 pr-4 align-top">{t("portafolio.legal.fca.services")}</td>
            <td className="py-4 pr-4 align-top font-mono text-brillante">
              {t("portafolio.legal.fca.entity")}
            </td>
            <td className="py-4 align-top text-muted-foreground">{t("portafolio.legal.fca.why")}</td>
          </tr>
          <tr>
            <td className="py-4 pr-4 align-top">{t("portafolio.legal.ci.services")}</td>
            <td className="py-4 pr-4 align-top font-mono text-brillante">
              {t("portafolio.legal.ci.entity")}
            </td>
            <td className="py-4 align-top text-muted-foreground">{t("portafolio.legal.ci.why")}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
