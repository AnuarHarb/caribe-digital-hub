import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DESCRIPTOR, PRODUCTS, type ProductKey } from "@/content/portafolio";
import { formatCop } from "@/lib/formatPrice";
import { useAuth } from "@/hooks/useAuth";
import { invokeFunction } from "@/lib/invokeFunction";
import { tokenizeCard } from "@/lib/wompiPublic";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  SpinnerGap,
} from "@phosphor-icons/react";

const MEMBERSHIP_KEYS = new Set<ProductKey>([
  "miembro_mensual",
  "miembro_anual",
  "residente_mensual",
  "residente_anual",
]);

type Step = "form" | "verifying" | "challenge";

function isMembershipKey(key: string | null): key is ProductKey {
  return !!key && MEMBERSHIP_KEYS.has(key as ProductKey);
}

export default function MembresiasPagar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const productKey = params.get("product");
  const iframeRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("form");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptData, setAcceptData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threeDsHtml, setThreeDsHtml] = useState<string | null>(null);
  const [pendingReference, setPendingReference] = useState<string | null>(null);

  const [card, setCard] = useState({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    holder: "",
  });

  useEffect(() => {
    if (!pendingReference) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const data = await invokeFunction<{
          checkoutUrl?: string;
          paymentSourceStatus?: string;
          threeDsHtml?: string | null;
        }>("create-order", { reference: pendingReference, finalize: true });

        if (cancelled) return;

        if (data.threeDsHtml) {
          setThreeDsHtml(data.threeDsHtml);
          setStep("challenge");
        }

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }

        const status = data.paymentSourceStatus;
        if (status === "DECLINED" || status === "ERROR" || status === "VOIDED") {
          setError(t("portafolio.pagar.sourceFailed"));
          setLoading(false);
          setStep("form");
          setPendingReference(null);
          return;
        }

        setTimeout(poll, 2000);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("portafolio.checkout.error"));
          setLoading(false);
          setStep("form");
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [pendingReference, t]);

  useEffect(() => {
    if (threeDsHtml && iframeRef.current) {
      iframeRef.current.innerHTML = threeDsHtml;
    }
  }, [threeDsHtml]);

  if (!user) {
    const redirect = `/membresias/pagar?product=${encodeURIComponent(productKey ?? "")}`;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (!isMembershipKey(productKey)) {
    return <Navigate to="/membresias" replace />;
  }

  const product = PRODUCTS[productKey];
  const planKey = product.membershipPlan!;
  const isAnnual = productKey.includes("anual");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms || !acceptData) return;

    setLoading(true);
    setError(null);
    setThreeDsHtml(null);
    setStep("verifying");

    try {
      const cardToken = await tokenizeCard({
        number: card.number,
        expMonth: card.expMonth,
        expYear: card.expYear,
        cvc: card.cvc,
        holder: card.holder,
      });

      const data = await invokeFunction<{
        reference: string;
        checkoutUrl?: string;
        paymentSourceStatus?: string;
        threeDsHtml?: string | null;
      }>("create-order", {
        productKey,
        cardToken,
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.threeDsHtml) {
        setThreeDsHtml(data.threeDsHtml);
        setStep("challenge");
      }

      setPendingReference(data.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("portafolio.checkout.error"));
      setLoading(false);
      setStep("form");
    }
  };

  const summary = (
    <Card className="border-line bg-navy text-white">
      <CardHeader className="pb-3">
        <p className="font-mono text-xs uppercase tracking-widest text-aqua">
          {t("portafolio.pagar.summaryEyebrow")}
        </p>
        <CardTitle className="font-display text-xl text-white">
          {t("portafolio.pagar.summaryTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">{t("portafolio.dashboard.membership.plan")}</dt>
            <dd className="font-medium">{t(`portafolio.membership.plans.${planKey}.name`)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">{t("portafolio.pagar.billingCycle")}</dt>
            <dd>{isAnnual ? t("portafolio.pagar.annual") : t("portafolio.pagar.monthly")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">{t("portafolio.pagar.accountEmail")}</dt>
            <dd className="truncate">{user.email}</dd>
          </div>
        </dl>

        <div className="border-t border-white/15 pt-4">
          <div className="flex items-end justify-between">
            <span className="text-white/70">{t("portafolio.pagar.totalToday")}</span>
            <span className="font-mono text-2xl font-bold text-aqua">{formatCop(product.amountCop)}</span>
          </div>
          <p className="mt-2 text-xs text-white/60">{t("portafolio.pagar.autoDebitNote")}</p>
        </div>

        <ul className="space-y-2 border-t border-white/15 pt-4 text-xs text-white/70">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-aqua" weight="duotone" aria-hidden />
            {t("portafolio.pagar.wompiSecure")}
          </li>
          <li className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-aqua" weight="duotone" aria-hidden />
            {t("portafolio.pagar.cardNeverStored")}
          </li>
        </ul>

        <p className="text-xs text-white/50">{t("portafolio.pagar.invoiceNote")}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${t("portafolio.pagar.title")} | ${DESCRIPTOR}`}
        canonical="/membresias/pagar"
        noindex
      />
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
        <Link
          to="/membresias"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("portafolio.pagar.back")}
        </Link>

        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-brillante">
            {t("portafolio.pagar.checkoutEyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {t("portafolio.pagar.title")}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("portafolio.pagar.subtitle")}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-5">
          <aside className="lg:col-span-2 lg:order-2">{summary}</aside>

          <section className="lg:col-span-3 lg:order-1" aria-labelledby="payment-heading">
            {step === "challenge" && threeDsHtml ? (
              <Card>
                <CardHeader>
                  <CardTitle id="payment-heading" className="font-display text-lg">
                    {t("portafolio.pagar.verifyingCard")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{t("portafolio.pagar.challengeHint")}</p>
                </CardHeader>
                <CardContent>
                  <div
                    ref={iframeRef}
                    className="min-h-[420px] overflow-hidden rounded-lg border bg-white"
                  />
                </CardContent>
              </Card>
            ) : step === "verifying" && !threeDsHtml ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <SpinnerGap className="h-10 w-10 animate-spin text-brillante" aria-hidden />
                  <p className="font-medium">{t("portafolio.pagar.verifyingCard")}</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {t("portafolio.pagar.verifyingHint")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle id="payment-heading" className="flex items-center gap-2 font-display text-lg">
                    <CreditCard className="h-5 w-5 text-brillante" weight="duotone" aria-hidden />
                    {t("portafolio.pagar.cardSectionTitle")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{t("portafolio.pagar.cardSectionHint")}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset className="space-y-4" disabled={loading}>
                      <legend className="sr-only">{t("portafolio.pagar.cardLegend")}</legend>
                      <div>
                        <Label htmlFor="card-holder">{t("portafolio.pagar.cardHolder")}</Label>
                        <Input
                          id="card-holder"
                          required
                          autoComplete="cc-name"
                          className="mt-1.5"
                          value={card.holder}
                          onChange={(e) => setCard((c) => ({ ...c, holder: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-number">{t("portafolio.pagar.cardNumber")}</Label>
                        <Input
                          id="card-number"
                          required
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="4242 4242 4242 4242"
                          className="mt-1.5 font-mono"
                          value={card.number}
                          onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="exp-month">{t("portafolio.pagar.expMonth")}</Label>
                          <Input
                            id="exp-month"
                            required
                            placeholder="12"
                            maxLength={2}
                            className="mt-1.5 font-mono"
                            value={card.expMonth}
                            onChange={(e) => setCard((c) => ({ ...c, expMonth: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="exp-year">{t("portafolio.pagar.expYear")}</Label>
                          <Input
                            id="exp-year"
                            required
                            placeholder="29"
                            maxLength={4}
                            className="mt-1.5 font-mono"
                            value={card.expYear}
                            onChange={(e) => setCard((c) => ({ ...c, expYear: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">{t("portafolio.pagar.cvc")}</Label>
                          <Input
                            id="cvc"
                            required
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            maxLength={4}
                            className="mt-1.5 font-mono"
                            value={card.cvc}
                            onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                          />
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <legend className="sr-only">{t("portafolio.pagar.acceptLegend")}</legend>
                      <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={acceptTerms}
                          onCheckedChange={(v) => setAcceptTerms(v === true)}
                          aria-required
                        />
                        <span>
                          {t("portafolio.pagar.acceptTerms")}{" "}
                          <a
                            href="https://wompi.co/assets/downloadble/reglamento-Usuarios-Colombia.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brillante underline"
                          >
                            {t("portafolio.pagar.wompiTerms")}
                          </a>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={acceptData}
                          onCheckedChange={(v) => setAcceptData(v === true)}
                          aria-required
                        />
                        <span>
                          {t("portafolio.pagar.acceptData")}{" "}
                          <a
                            href="https://wompi.co/assets/downloadble/autorizacion-administracion-datos-personales.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brillante underline"
                          >
                            {t("portafolio.pagar.wompiData")}
                          </a>
                        </span>
                      </label>
                    </fieldset>

                    {error && (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-aqua font-display font-bold text-navy hover:bg-aqua/90"
                      size="lg"
                      disabled={loading || !acceptTerms || !acceptData}
                    >
                      {loading ? (
                        <>
                          <SpinnerGap className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          {t("portafolio.checkout.processing")}
                        </>
                      ) : (
                        t("portafolio.pagar.payButton", { amount: formatCop(product.amountCop) })
                      )}
                    </Button>

                    <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                      {t("portafolio.pagar.processedByWompi")}
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
