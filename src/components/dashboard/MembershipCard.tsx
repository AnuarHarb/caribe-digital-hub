import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { MembershipStatusBlock } from "@/components/dashboard/MembershipStatusBlock";

export function MembershipCard() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("portafolio.dashboard.membership.title")}</CardTitle>
        <CardDescription>{t("portafolio.dashboard.membership.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <MembershipStatusBlock compact />
      </CardContent>
    </Card>
  );
}
