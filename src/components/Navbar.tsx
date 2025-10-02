import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import logoImage from "@/assets/costa-digital-logo.png";

export function Navbar() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("nav.logout") + " error");
    } else {
      toast.success(t("nav.logout"));
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoImage} alt="Costa Digital" className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-primary">
            COSTA DIGITAL
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/eventos">
            <Button variant="ghost">{t("nav.events")}</Button>
          </Link>
          
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link to="/admin/eventos">
                    <Button variant="outline">{t("nav.manageEvents")}</Button>
                  </Link>
                  <Link to="/admin/configuracion">
                    <Button variant="outline">{t("nav.settings")}</Button>
                  </Link>
                </>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default">{t("nav.login")}</Button>
            </Link>
          )}

          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
