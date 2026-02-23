import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useCompanyProfile } from "@/hooks/useProfile";
import { useMyApplications } from "@/hooks/useApplications";
import { useCompanyJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, Briefcase, FileText } from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();
  const { accountType } = useProfile();
  const { professionalProfile } = useProfessionalProfile();
  const { companyProfile } = useCompanyProfile();
  const { applications } = useMyApplications();
  const { jobs } = useCompanyJobs();

  if (accountType === "company") {
    return (
      <article className="space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-primary">
            {t("nav.dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {companyProfile?.company_name
              ? `${t("auth.accountTypeCompany")}: ${companyProfile.company_name}`
              : t("dashboard.welcomeCompany")}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t("dashboard.jobs")}</CardTitle>
              <Link to="/dashboard/empleos/nuevo">
                <Button size="sm">{t("dashboard.newJob")}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.activeJobs")}
              </p>
              <Link to="/dashboard/empleos" className="mt-4 block">
                <Button variant="outline" size="sm">
                  {t("dashboard.manageJobs")}
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("dashboard.candidates")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/candidatos">
                <Button variant="outline" size="sm">
                  {t("dashboard.viewCandidates")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        {!companyProfile && (
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.completeProfile")}</CardTitle>
              <CardDescription>{t("dashboard.completeProfileDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/perfil">
                <Button>{t("dashboard.completeProfile")}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </article>
    );
  }

  return (
    <article className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("nav.dashboard")}
        </h1>
        <p className="text-muted-foreground">
          {professionalProfile?.title
            ? `${professionalProfile.title}`
            : t("dashboard.welcomeProfessional")}
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("dashboard.applications")}</CardTitle>
            <Link to="/empleos">
              <Button size="sm">{t("jobs.browse")}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.applicationsCount")}
            </p>
            <Link to="/dashboard/aplicaciones" className="mt-4 block">
              <Button variant="outline" size="sm">
                {t("dashboard.viewApplications")}
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.profile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/perfil">
              <Button variant="outline" size="sm">
                {professionalProfile ? t("common.edit") : t("dashboard.createProfile")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      {!professionalProfile && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.completeProfile")}</CardTitle>
            <CardDescription>{t("dashboard.completeProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/perfil">
              <Button>{t("dashboard.completeProfile")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
