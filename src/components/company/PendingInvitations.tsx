import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePendingInvitations, useRespondInvitation } from "@/hooks/useCompanies";

export function PendingInvitations() {
  const { t } = useTranslation();
  const { invitations, isLoading } = usePendingInvitations();
  const { respondInvitation, isResponding } = useRespondInvitation();

  if (isLoading || invitations.length === 0) return null;

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 shrink-0 text-accent mt-0.5" aria-hidden />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm font-medium">
              {t("company.invitationsTitle")}
            </p>
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {inv.company_profiles?.company_name ?? t("company.unknownCompany")}
                  </span>
                  <span className="text-muted-foreground text-xs uppercase">
                    {t(`company.role.${inv.role}`)}
                  </span>
                  <div className="flex w-full gap-2 sm:w-auto sm:flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                      disabled={isResponding}
                      onClick={() =>
                        respondInvitation({ invitationId: inv.id, accept: false })
                      }
                    >
                      {t("company.decline")}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      disabled={isResponding}
                      onClick={() =>
                        respondInvitation({ invitationId: inv.id, accept: true })
                      }
                    >
                      {t("company.accept")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
