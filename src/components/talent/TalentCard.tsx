import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

interface TalentCardProps {
  id: string;
  title?: string | null;
  location?: string | null;
  yearsExperience?: number | null;
  fullName?: string | null;
}

export function TalentCard({ id, title, location, yearsExperience, fullName }: TalentCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <User className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{fullName ?? "-"}</h3>
            <p className="text-sm text-muted-foreground truncate">{title ?? "-"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {location && <span>{location}</span>}
          {yearsExperience != null && (
            <span>• {t("landing.featuredTalent.years", { count: yearsExperience })}</span>
          )}
        </div>
        <Link to={`/perfil/${id}`} className="mt-4 block">
          <Button variant="outline" size="sm" className="w-full">
            {t("landing.featuredTalent.viewProfile")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
