import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useMembership, type Membership } from "@/hooks/useMembership";

function billingLabel(membership: Membership, t: (key: string) => string) {
  if (!membership.product_key) return null;
  const annual = membership.product_key.includes("anual");
  return annual ? t("portafolio.pagar.annual") : t("portafolio.pagar.monthly");
}

export function MembershipStatusBlock({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: membership, isLoading } = useMembership();
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (isLoading) return null;

  const handleCancel = async () => {
    if (!membership) return;
    setCanceling(true);
    setCancelError(null);
    try {
      const { error } = await supabase.functions.invoke("cancel-membership", {
        body: { membershipId: membership.id },
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["membership"] });
    } catch {
      setCancelError(t("portafolio.dashboard.membership.cancelError"));
    } finally {
      setCanceling(false);
    }
  };

  if (!membership) {
    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <p className="text-sm text-muted-foreground">{t("portafolio.dashboard.membership.none")}</p>
        <Link to="/membresias">
          <Button variant="outline" size="sm">
            {t("portafolio.dashboard.membership.cta")}
          </Button>
        </Link>
      </div>
    );
  }

  const billing = billingLabel(membership, t);
  const isCanceled = !!membership.canceled_at;
  const hasAutoDebit = !!membership.wompi_payment_source_id && membership.renew && !isCanceled;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-sm">
        <span className="text-muted-foreground">{t("portafolio.dashboard.membership.plan")}: </span>
        {t(`portafolio.membership.plans.${membership.plan}.name`)}
        {billing && (
          <span className="text-muted-foreground"> · {billing}</span>
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        {isCanceled
          ? t("portafolio.dashboard.membership.canceledUntil", {
              date: new Date(membership.ends_at).toLocaleDateString(),
            })
          : `${t("portafolio.dashboard.membership.expires")}: ${new Date(membership.ends_at).toLocaleDateString()}`}
      </p>
      {membership.card_last_four && (
        <p className="text-sm text-muted-foreground">
          {t("portafolio.dashboard.membership.cardEnding", { lastFour: membership.card_last_four })}
        </p>
      )}
      {isCanceled && (
        <p className="text-sm text-muted-foreground">
          {t("portafolio.dashboard.membership.noMoreCharges")}
        </p>
      )}
      {membership.creyente_number && (
        <p className="font-mono text-sm text-brillante">
          {t("portafolio.dashboard.membership.creyente")} #{membership.creyente_number}
        </p>
      )}
      {hasAutoDebit && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={canceling}>
              {t("portafolio.dashboard.membership.cancel")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("portafolio.dashboard.membership.cancelTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("portafolio.dashboard.membership.cancelDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("portafolio.dashboard.membership.cancelBack")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={canceling}>
                {t("portafolio.dashboard.membership.cancelConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {cancelError && (
        <p className="text-sm text-red-600" role="alert">
          {cancelError}
        </p>
      )}
      {!compact && (
        <Link to="/membresias">
          <Button variant="outline" size="sm">
            {t("portafolio.dashboard.membership.cta")}
          </Button>
        </Link>
      )}
    </div>
  );
}
