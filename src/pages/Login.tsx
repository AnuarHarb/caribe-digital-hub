import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

export default function Login() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "company" || type === "professional") {
      const redirect = searchParams.get("redirect");
      const signupUrl = redirect
        ? `/auth/signup?type=${type}&redirect=${encodeURIComponent(redirect)}`
        : `/auth/signup?type=${type}`;
      navigate(signupUrl, { replace: true });
    }
  }, [searchParams, navigate]);

  const authSchema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMinLength")),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(
          error.message.includes("Invalid login credentials") ? t("auth.invalidCredentials") : error.message
        );
        setLoading(false);
        return;
      }
      toast.success(t("auth.welcome"));
      const redirectParam = searchParams.get("redirect");
      const fromState = (location.state as { from?: { pathname?: string; search?: string } })?.from;
      const redirectTo =
        redirectParam && redirectParam.startsWith("/") && redirectParam !== "/auth"
          ? redirectParam
          : fromState?.pathname
            ? fromState.pathname + (fromState.search ?? "")
            : "/";
      navigate(redirectTo);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
          {t("auth.login")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("auth.loginDescription")}</p>
      </header>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">{t("auth.email")}</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">{t("auth.password")}</Label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-accent hover:text-accent/90 font-medium"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.processing") : t("auth.login")}
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
        onClick={handleGoogleLogin}
      >
        <GoogleIcon size={20} />
        {t("auth.googleLogin")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link to="/auth/signup" className="font-medium text-accent hover:text-accent/90">
          {t("auth.signup")}
        </Link>
      </p>
    </article>
  );
}
