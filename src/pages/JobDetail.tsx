import { useParams, Link } from "react-router-dom";
import { useJobBySlug } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useApplyToJob } from "@/hooks/useApplications";
import { useMyApplications } from "@/hooks/useApplications";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Briefcase,
  Building2,
  Check,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function parseListText(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n|,|;|•/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { job, isLoading } = useJobBySlug(slug);
  const { user } = useAuth();
  const { professionalProfile } = useProfessionalProfile();
  const { apply, isApplying } = useApplyToJob();
  const { applications } = useMyApplications();
  const [coverLetter, setCoverLetter] = useState("");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const hasApplied =
    applied ||
    (job?.id && applications.some((a) => a.job_id === job.id));

  const handleApplySubmit = async (withCoverLetter: boolean) => {
    if (!job?.id || !professionalProfile?.id) {
      toast.error(t("jobs.needProfile"));
      return;
    }
    try {
      await apply({
        jobId: job.id,
        professionalId: professionalProfile.id,
        coverLetter: withCoverLetter ? coverLetter || undefined : undefined,
      });
      toast.success(t("jobs.applySuccess"));
      setApplied(true);
      setApplyModalOpen(false);
      setCoverLetter("");
    } catch (e) {
      toast.error(
        (e as Error).message?.includes("duplicate")
          ? t("jobs.alreadyApplied")
          : t("common.error")
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto flex min-h-[400px] flex-col items-center justify-center px-4 py-8">
          <h1 className="font-display text-xl font-semibold text-foreground">
            {t("jobs.notFound")}
          </h1>
          <Link to="/empleos" className="mt-4">
            <Button variant="outline">{t("jobs.browse")}</Button>
          </Link>
        </main>
      </div>
    );
  }

  const company = job.company_profiles as {
    company_name?: string;
    id?: string;
    logo_url?: string | null;
    industry?: string | null;
  } | null;

  const responsibilities = parseListText(job.responsibilities);
  const skillsTools = parseListText(job.skills_tools);
  const requirements = parseListText(job.requirements);
  const benefits = parseListText(job.benefits);

  const formatSalary = () => {
    const curr = job.salary_currency || "USD";
    if (job.salary_min != null && job.salary_max != null) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${curr}`;
    }
    if (job.salary_min != null) return `${job.salary_min.toLocaleString()}+ ${curr}`;
    if (job.salary_max != null) return `≤ ${job.salary_max.toLocaleString()} ${curr}`;
    return null;
  };

  const salaryStr = formatSalary();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left column: content */}
            <article className="space-y-8">
              <header>
                <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  {job.title}
                </h1>
                <Link
                  to={`/empresa/${job.company_id}`}
                  className="mt-2 inline-block text-lg text-muted-foreground hover:text-foreground hover:underline"
                >
                  {company?.company_name ?? "-"}
                </Link>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.status !== "active" && (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                      {job.status === "draft" ? t("jobs.statusDraft") : t("jobs.statusClosed")}
                    </Badge>
                  )}
                  {job.location && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {job.location}
                    </Badge>
                  )}
                  {job.work_mode && (
                    <Badge variant="secondary">
                      {t(`common.workMode.${job.work_mode}`)}
                    </Badge>
                  )}
                  {job.employment_type && (
                    <Badge variant="secondary">
                      {t(`common.employmentType.${job.employment_type}`)}
                    </Badge>
                  )}
                  {salaryStr && (
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="h-3.5 w-3.5" aria-hidden />
                      {salaryStr}
                    </Badge>
                  )}
                </div>
              </header>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("jobs.description")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {job.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("jobs.responsibilities")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {responsibilities.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {skillsTools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("jobs.skillsTools")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillsTools.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {job.job_required_skills &&
                (job.job_required_skills as { skill_name: string }[]).length >
                  0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("jobs.skills")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(job.job_required_skills as { skill_name: string }[]).map(
                          (s) => (
                            <Badge key={s.skill_name} variant="secondary">
                              {s.skill_name}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("jobs.requirements")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {requirements.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-muted-foreground"
                        >
                          <span className="text-foreground">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("jobs.benefits")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {benefits.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </article>

            {/* Right sidebar: company + apply */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4" aria-hidden />
                      {company?.company_name ?? "-"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage
                          src={company?.logo_url ?? undefined}
                          alt=""
                        />
                        <AvatarFallback className="rounded-lg bg-accent/20 text-accent">
                          {getInitials(company?.company_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {company?.industry && (
                          <p className="text-sm text-muted-foreground">
                            {company.industry}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link to={`/empresa/${job.company_id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        {t("company.viewProfile")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-accent/30 bg-accent/5">
                  <CardContent className="pt-6">
                    {hasApplied ? (
                      <div className="flex items-center gap-2 rounded-lg bg-accent/20 px-4 py-3 text-accent">
                        <Check className="h-5 w-5 shrink-0" aria-hidden />
                        <span className="font-medium">{t("jobs.applied")}</span>
                      </div>
                    ) : user && professionalProfile ? (
                      <>
                        <Button
                          size="lg"
                          className="w-full gap-2"
                          onClick={() => setApplyModalOpen(true)}
                        >
                          <Briefcase className="h-5 w-5" aria-hidden />
                          {t("jobs.quickApply")}
                        </Button>
                        <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>{job.title}</DialogTitle>
                              <DialogDescription>
                                {company?.company_name ?? "-"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Textarea
                                  placeholder={t("jobs.coverLetterPlaceholder")}
                                  value={coverLetter}
                                  onChange={(e) => setCoverLetter(e.target.value)}
                                  rows={5}
                                  className="resize-none"
                                  autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                  {t("jobs.coverLetterTip")}
                                </p>
                              </div>
                            </div>
                            <DialogFooter className="flex-col gap-2 sm:flex-row">
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => handleApplySubmit(false)}
                                disabled={isApplying}
                              >
                                {isApplying ? t("common.loading") : t("jobs.sendWithoutMessage")}
                              </Button>
                              <Button
                                className="w-full sm:w-auto"
                                onClick={() => handleApplySubmit(true)}
                                disabled={isApplying}
                              >
                                {isApplying ? t("common.loading") : t("jobs.sendWithMessage")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Link
                        to={
                          user
                            ? "/dashboard/perfil"
                            : "/auth?type=professional"
                        }
                      >
                        <Button size="lg" className="w-full gap-2">
                          <Briefcase className="h-5 w-5" aria-hidden />
                          {t("jobs.quickApply")}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
