import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Briefcase } from "lucide-react";

interface JobCardProps {
  id: string;
  slug: string;
  title: string;
  companyName?: string;
  location?: string | null;
  workMode?: string | null;
  employmentType?: string | null;
}

export function JobCard({
  id,
  slug,
  title,
  companyName,
  location,
  workMode,
  employmentType,
}: JobCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Briefcase className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            <p className="text-sm text-muted-foreground">{companyName ?? "-"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {location && <span>{location}</span>}
          {workMode && <span>• {t(`common.workMode.${workMode}`)}</span>}
          {employmentType && <span>• {t(`common.employmentType.${employmentType}`)}</span>}
        </div>
        <Link to={`/empleos/${slug}`} className="mt-4 block">
          <Button variant="outline" size="sm" className="w-full">
            {t("landing.featuredJobs.viewJob")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
