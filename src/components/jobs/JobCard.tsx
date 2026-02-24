import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Briefcase, MapPin, ChevronRight } from "lucide-react";

const EXCERPT_LENGTH = 100;

interface JobCardProps {
  id: string;
  slug: string;
  title: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  location?: string | null;
  workMode?: string | null;
  employmentType?: string | null;
  description?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  createdAt?: string | null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatSalary(
  min?: number | null,
  max?: number | null,
  currency?: string | null
): string | null {
  const curr = currency || "USD";
  if (min != null && max != null) {
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${curr}`;
  }
  if (min != null) return `${min.toLocaleString()}+ ${curr}`;
  if (max != null) return `≤ ${max.toLocaleString()} ${curr}`;
  return null;
}

export function JobCard({
  id,
  slug,
  title,
  companyName,
  companyLogoUrl,
  location,
  workMode,
  employmentType,
  description,
  salaryMin,
  salaryMax,
  salaryCurrency,
  createdAt,
}: JobCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("es") ? es : enUS;

  const excerpt = description
    ? stripHtml(description).slice(0, EXCERPT_LENGTH) +
      (stripHtml(description).length > EXCERPT_LENGTH ? "…" : "")
    : null;

  const salaryStr = formatSalary(salaryMin, salaryMax, salaryCurrency);

  const postedAgo =
    createdAt &&
    formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale });

  return (
    <Card className="group overflow-hidden border border-border/80 bg-card transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Briefcase className="h-6 w-6 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {companyName ?? "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {location && (
            <Badge variant="secondary" className="gap-1 text-xs font-normal">
              <MapPin className="h-3 w-3" aria-hidden />
              {location}
            </Badge>
          )}
          {workMode && (
            <Badge variant="secondary" className="text-xs font-normal">
              {t(`common.workMode.${workMode}`)}
            </Badge>
          )}
          {employmentType && (
            <Badge variant="outline" className="text-xs font-normal">
              {t(`common.employmentType.${employmentType}`)}
            </Badge>
          )}
        </div>

        {excerpt && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}

        {(salaryStr || postedAgo) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {salaryStr && (
              <span className="font-medium text-foreground/90">{salaryStr}</span>
            )}
            {postedAgo && <span>{postedAgo}</span>}
          </div>
        )}

        <Link
          to={`/empleos/${slug}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-md border border-input bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground group/btn"
        >
          {t("landing.featuredJobs.viewJob")}
          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
