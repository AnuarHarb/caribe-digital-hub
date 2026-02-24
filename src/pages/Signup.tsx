import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

type AccountType = Database["public"]["Enums"]["account_type"];

export default function Signup() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get("type") as AccountType | null;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(
    preselectedType === "company" ? "company" : "professional"
  );
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedType === "company" || preselectedType === "professional") {
      setAccountType(preselectedType);
    }
  }, [preselectedType]);

  const authSchema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMinLength")),
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }
      if (accountType === "company" && !companyName?.trim()) {
        toast.error(t("auth.companyNameRequired"));
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || undefined,
            account_type: accountType,
            ...(accountType === "company" && companyName?.trim()
              ? { company_name: companyName.trim() }
              : {}),
          },
        },
      });
      if (error) {
        const isNetworkError = error.message === "Failed to fetch" || error.message?.toLowerCase().includes("fetch");
        const msg = isNetworkError ? t("auth.networkError") : error.message;
        toast.error(msg);
        setLoading(false);
        return;
      }
      toast.success(t("auth.signupSuccess"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="space-y-6">
      <header className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          {t("auth.signup")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("auth.signupDescription")}</p>
      </header>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("auth.accountType")}</Label>
          <p className="text-sm text-muted-foreground">{t("auth.accountTypeDescription")}</p>
          <RadioGroup
            value={accountType}
            onValueChange={(v) => setAccountType(v as AccountType)}
            className="flex gap-4 mt-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="professional" id="type-professional" />
              <span>{t("auth.accountTypeProfessional")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="company" id="type-company" />
              <span>{t("auth.accountTypeCompany")}</span>
            </label>
          </RadioGroup>
        </div>
        {accountType === "company" && (
          <div className="space-y-2">
            <Label htmlFor="signup-company-name">{t("auth.companyName")}</Label>
            <Input
              id="signup-company-name"
              type="text"
              placeholder={t("auth.companyNamePlaceholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required={accountType === "company"}
              autoComplete="organization"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="signup-email">{t("auth.email")}</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">{t("auth.password")}</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.processing") : t("auth.signup")}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("auth.orContinueWith")}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={handleGoogleSignup}
      >
        <GoogleIcon size={20} />
        {t("auth.googleSignup")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link to="/auth" className="font-medium text-accent hover:text-accent/90">
          {t("auth.login")}
        </Link>
      </p>
    </article>
  );
}
