import { useState } from "react";
import { ProfileForm } from "@/components/talent/ProfileForm";
import { PersonalInfoForm } from "@/components/talent/PersonalInfoForm";
import { CompanyProfileForm } from "@/components/jobs/CompanyProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { CreateCompanyDialog } from "@/components/company/CreateCompanyDialog";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import { Plus } from "lucide-react";

export default function EditProfile() {
  const { t } = useTranslation();
  const { accountType, profile } = useProfile();
  const { professionalProfile } = useProfessionalProfile();
  const { activeCompany, companies } = useActiveCompany();
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);

  const { percentage } =
    accountType === "professional"
      ? calculateProfileCompletion(profile, professionalProfile)
      : { percentage: 100 };

  const hasCompanies = companies.length > 0;

  if (accountType === "company") {
    if (!hasCompanies) {
      return (
        <article>
          <Card>
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
      <article>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.profile")}</CardTitle>
            <CardDescription>{t("company.editDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyProfileForm companyId={activeCompany?.id} />
          </CardContent>
        </Card>
      </article>
    );
  }

  return (
    <article className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("profile.completionTitle")}</CardTitle>
            <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
          </div>
          <CardDescription>{t("profile.completionDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={percentage} className="h-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.profile")}</CardTitle>
          <CardDescription>{t("profile.editDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">{t("profile.tabPersonal")}</TabsTrigger>
              <TabsTrigger value="professional">{t("profile.tabProfessional")}</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-6">
              <PersonalInfoForm />
            </TabsContent>
            <TabsContent value="professional" className="mt-6">
              <ProfileForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </article>
  );
}
