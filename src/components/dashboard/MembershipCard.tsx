import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";

export function MembershipCard() {
  const { t } = useTranslation();
  const { data: membership, isLoading } = useMembership();

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("portafolio.dashboard.membership.title")}</CardTitle>
        <CardDescription>
          {membership
            ? `${t("portafolio.dashboard.membership.plan")}: ${membership.plan}`
            : t("portafolio.dashboard.membership.none")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {membership && (
          <>
            <p className="text-sm text-muted-foreground">
              {t("portafolio.dashboard.membership.expires")}:{" "}
              {new Date(membership.ends_at).toLocaleDateString()}
            </p>
            {membership.creyente_number && (
              <p className="font-mono text-sm text-brillante">
                {t("portafolio.dashboard.membership.creyente")} #{membership.creyente_number}
              </p>
            )}
          </>
        )}
        <Link to="/membresias">
          <Button variant="outline" size="sm">
            {t("portafolio.dashboard.membership.cta")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
