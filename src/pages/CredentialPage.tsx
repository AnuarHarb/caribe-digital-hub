import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/hooks/useAuth";
import { CredentialCard } from "@/components/credential/CredentialCard";
import { Button } from "@/components/ui/button";

export default function CredentialPage() {
  const { t } = useTranslation();
  const { profile, user } = useProfile();

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-6 md:gap-8 md:py-8">
      <h1 className="text-center font-display text-xl font-bold text-foreground md:text-2xl">
        {t("credential.title")}
      </h1>

      <CredentialCard
        name={profile?.full_name || ""}
        avatarUrl={profile?.avatar_url}
        userId={user?.id || ""}
        memberSince={user?.created_at}
      />

      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {t("credential.description")}
      </p>

      <Link to="/dashboard">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("credential.backToDashboard")}
        </Button>
      </Link>
    </section>
  );
}
