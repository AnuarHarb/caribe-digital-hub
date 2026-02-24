import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const type = params.get("type");
    setIsRecovery(type === "recovery");
  }, []);

  const passwordSchema = z
    .object({
      password: z.string().min(6, t("auth.passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordMismatch"),
      path: ["confirmPassword"],
    });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validation = passwordSchema.safeParse({ password, confirmPassword });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success(t("auth.passwordUpdated"));
      navigate("/auth");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <article className="space-y-6">
        <p className="text-sm text-muted-foreground">{t("auth.invalidResetLink")}</p>
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
          {t("auth.setNewPassword")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.setNewPasswordDescription")}
        </p>
      </header>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">{t("auth.password")}</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.processing") : t("auth.updatePassword")}
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
