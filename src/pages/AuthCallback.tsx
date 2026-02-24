import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

/**
 * Handles OAuth callback redirects from Supabase (e.g. Google sign-in).
 * Exchanges the auth code for a session and redirects the user.
 */
export default function AuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const code = params.get("code") ?? searchParams.get("code");

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: err }) => {
          if (err) {
            setError(err.message);
            return;
          }
          const next = searchParams.get("next") ?? "/";
          navigate(next.startsWith("/") ? next : "/", { replace: true });
        })
        .catch((err) => {
          setError(err?.message ?? t("common.error"));
        });
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        setError(params.get("error_description") ?? params.get("error") ?? t("common.error"));
        return;
      }
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/", { replace: true });
        } else {
          setError(t("auth.invalidCallback"));
        }
      });
    }
  }, [navigate, searchParams, t]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-xl font-display font-semibold text-destructive">
            {t("auth.authError")}
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
          >
            {t("auth.backToLogin")}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t("auth.processing")}</p>
      </div>
    </main>
  );
}
