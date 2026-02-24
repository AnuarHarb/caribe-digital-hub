import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

type AvailabilityStatus = "available" | "open_to_offers" | "not_looking";

interface TalentCardProps {
  id: string;
  title?: string | null;
  location?: string | null;
  yearsExperience?: number | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  skills?: string[];
  bio?: string | null;
  availability?: AvailabilityStatus | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function avatarBadgeVariant(availability: AvailabilityStatus | null | undefined): string {
  switch (availability) {
    case "available":
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "open_to_offers":
      return "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "not_looking":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function TalentCard({
  id,
  title,
  location,
  yearsExperience,
  fullName,
  avatarUrl,
  skills = [],
  bio,
  availability,
}: TalentCardProps) {
  const { t } = useTranslation();
  const displaySkills = skills.slice(0, 3);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0 rounded-lg">
            <AvatarImage src={avatarUrl ?? undefined} alt={fullName ?? ""} />
            <AvatarFallback className="rounded-lg bg-accent/20 text-accent">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{fullName ?? "-"}</h3>
            <p className="text-sm text-muted-foreground truncate">{title ?? "-"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {location && <span>{location}</span>}
          {yearsExperience != null && (
            <span>• {t("landing.featuredTalent.years", { count: yearsExperience })}</span>
          )}
        </div>
        {displaySkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        )}
        {bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
        )}
        {availability && (
          <Badge
            variant="outline"
            className={`text-xs font-normal ${avatarBadgeVariant(availability)}`}
          >
            {t(`common.availability.${availability}`)}
          </Badge>
        )}
        <Link to={`/perfil/${id}`} className="mt-4 block">
          <Button variant="outline" size="sm" className="w-full">
            {t("landing.featuredTalent.viewProfile")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
