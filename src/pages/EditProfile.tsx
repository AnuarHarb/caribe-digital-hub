import { ProfileForm } from "@/components/talent/ProfileForm";
import { CompanyProfileForm } from "@/components/jobs/CompanyProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useAuth";

export default function EditProfile() {
  const { t } = useTranslation();
  const { accountType } = useProfile();

  return (
    <article>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.profile")}</CardTitle>
          <CardDescription>
            {accountType === "company"
              ? t("company.editDescription")
              : t("profile.editDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountType === "company" ? <CompanyProfileForm /> : <ProfileForm />}
        </CardContent>
      </Card>
    </article>
  );
}
