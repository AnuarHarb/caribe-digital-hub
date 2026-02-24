import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailSchema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const validation = emailSchema.safeParse({ email });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      toast.success(t("auth.resetSuccess"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <article className="space-y-6">
        <header className="space-y-2 text-center lg:text-left">
          <h1 className="text-2xl font-display font-semibold tracking-tight">
            {t("auth.checkYourEmail")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.resetSuccessDescription")}
          </p>
        </header>
        <p className="text-sm text-muted-foreground">
          {t("auth.resetSuccessInstructions")}
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/auth">{t("auth.backToLogin")}</Link>
        </Button>
      </article>
    );
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          {t("auth.forgotPassword")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.forgotPasswordDescription")}
        </p>
      </header>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">{t("auth.email")}</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.processing") : t("auth.resetPassword")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/auth" className="font-medium text-accent hover:text-accent/90">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </article>
  );
}
