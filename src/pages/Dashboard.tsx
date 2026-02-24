import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useMyApplications } from "@/hooks/useApplications";
import { useCompanyJobs } from "@/hooks/useJobs";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building2, Briefcase, FileText, ArrowRight, Plus } from "lucide-react";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import { PendingInvitations } from "@/components/company/PendingInvitations";
import { CreateCompanyDialog } from "@/components/company/CreateCompanyDialog";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { accountType, profile, user } = useProfile();
  const { professionalProfile } = useProfessionalProfile();
  const { activeCompany, companies } = useActiveCompany();
  const { applications } = useMyApplications();
  const { jobs } = useCompanyJobs();
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);

  const { percentage } =
    accountType === "professional"
      ? calculateProfileCompletion(profile, professionalProfile)
      : { percentage: 100 };

  const hasCompanies = companies.length > 0;

  if (hasCompanies) {
    return (
      <article className="space-y-8">
        <PendingInvitations />
        <header>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground md:text-3xl">
            {t("nav.dashboard")}
            <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wide">
              Beta
            </Badge>
          </h1>
          <p className="mt-1 text-muted-foreground">
            {activeCompany?.company_name
              ? `${t("auth.accountTypeCompany")}: ${activeCompany.company_name}`
              : t("dashboard.welcomeCompany")}
          </p>
        </header>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            {t("dashboard.sectionPersonal")}
          </h2>
          <div className="mb-6">
            <Link to="/dashboard/perfil">
              <Button variant="outline" size="default" className="gap-2">
                <User className="h-4 w-4" aria-hidden />
                {t("dashboard.profile")}
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            {t("dashboard.sectionCompany")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{t("dashboard.jobs")}</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">{t("dashboard.activeJobs")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/dashboard/empleos/nuevo">
                  <Button size="default" className="px-4 py-2">{t("dashboard.newJob")}</Button>
                </Link>
                <Link to="/dashboard/empleos">
                  <Button variant="outline" size="default" className="px-4 py-2 my-4">
                    {t("dashboard.manageJobs")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{t("dashboard.candidates")}</CardTitle>
              <User className="h-5 w-5 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/candidatos">
                <Button variant="outline" size="default" className="px-4 py-2">
                  {t("dashboard.viewCandidates")}
                </Button>
              </Link>
            </CardContent>
          </Card>
          </div>
        </section>

        {!activeCompany && (
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle>{t("dashboard.completeProfile")}</CardTitle>
              <CardDescription>{t("dashboard.completeProfileDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/empresa">
                <Button className="px-5 py-2.5">{t("dashboard.completeProfile")}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </article>
    );
  }

  if (accountType === "company") {
    return (
      <article className="space-y-6">
        <PendingInvitations />
        <header>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground md:text-3xl">
            {t("nav.dashboard")}
            <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wide">
              Beta
            </Badge>
          </h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.welcomeCompany")}</p>
        </header>
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle>{t("company.createFirst")}</CardTitle>
            <CardDescription>{t("company.createDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="gap-2" onClick={() => setCreateCompanyOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              {t("company.createNew")}
            </Button>
          </CardContent>
        </Card>
        <CreateCompanyDialog open={createCompanyOpen} onOpenChange={setCreateCompanyOpen} />
      </article>
    );
  }

  return (
    <article className="space-y-8">
      <PendingInvitations />
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          {t("dashboard.sectionPersonal")}
        </h2>
        <div className="space-y-6">
        <Card className="border-accent/20 bg-gradient-to-br from-card to-muted/20">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-background">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="bg-accent/20 text-accent-foreground text-lg">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground md:text-2xl">
                  {profile?.full_name || t("dashboard.welcomeProfessional")}
                </h1>
                <p className="text-muted-foreground">
                  {professionalProfile?.title || t("profile.editDescription")}
                </p>
              </div>
            </div>
            <Link to="/dashboard/perfil">
              <Button variant="outline" size="default" className="gap-2 px-4 py-2">
                {t("common.edit")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {percentage < 100 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("profile.completionTitle")}</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
            </div>
            <CardDescription>{t("profile.completionDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={percentage} className="h-2" />
            <Link to="/dashboard/perfil">
              <Button variant="outline" size="default" className="px-5 py-2.5 my-4">
                {t("profile.completeProfile")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t("dashboard.applications")}</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-sm text-muted-foreground">{t("dashboard.applicationsCount")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/empleos">
                <Button size="default" className="px-4 py-2">{t("jobs.browse")}</Button>
              </Link>
              <Link to="/dashboard/aplicaciones">
                <Button variant="outline" size="default" className="px-4 py-2">
                  {t("dashboard.viewApplications")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t("dashboard.profile")}</CardTitle>
            <User className="h-5 w-5 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-4">
            {(professionalProfile || profile?.full_name || profile?.city || user?.email) ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                {user?.email && (
                  <p>
                    <span className="font-medium text-foreground">{t("profile.email")}:</span>{" "}
                    {user.email}
                  </p>
                )}
                {profile?.full_name && (
                  <p>
                    <span className="font-medium text-foreground">{t("profile.fullName")}:</span>{" "}
                    {profile.full_name}
                  </p>
                )}
                {professionalProfile?.title && (
                  <p>
                    <span className="font-medium text-foreground">{t("profile.title")}:</span>{" "}
                    {professionalProfile.title}
                  </p>
                )}
                {(professionalProfile?.location || profile?.city) && (
                  <p>
                    <span className="font-medium text-foreground">{t("profile.location")}:</span>{" "}
                    {professionalProfile?.location || profile?.city}
                  </p>
                )}
                {professionalProfile?.years_experience != null && (
                  <p>
                    <span className="font-medium text-foreground">{t("profile.yearsExperience")}:</span>{" "}
                    {professionalProfile.years_experience} {t("profile.yearsShort")}
                  </p>
                )}
                {professionalProfile?.availability && (
                  <p>
                    <span className="font-medium text-foreground">{t("profile.availability")}:</span>{" "}
                    {t(`common.availability.${professionalProfile.availability}`)}
                  </p>
                )}
                {!user?.email &&
                  !profile?.full_name &&
                  !professionalProfile?.title &&
                  !professionalProfile?.location &&
                  !profile?.city &&
                  professionalProfile?.years_experience == null &&
                  !professionalProfile?.availability && (
                    <p>{t("dashboard.completeProfileDescription")}</p>
                  )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.completeProfileDescription")}</p>
            )}
            <Link to="/dashboard/perfil">
              <Button variant="outline" size="default" className="px-4 py-2 my-4">
                {professionalProfile ? t("common.edit") : t("dashboard.createProfile")}
              </Button>
            </Link>
          </CardContent>
        </Card>
        </div>
        </div>
      </section>

      {!professionalProfile && (
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle>{t("dashboard.completeProfile")}</CardTitle>
            <CardDescription>{t("dashboard.completeProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/perfil">
              <Button className="px-5 py-2.5">{t("dashboard.completeProfile")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
