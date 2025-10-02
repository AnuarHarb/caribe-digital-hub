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
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const NavLinks = () => (
    <>
      <Link to="/eventos" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost">{t("nav.events")}</Button>
      </Link>
      
      {user ? (
        <>
          {isAdmin && (
            <>
              <Link to="/admin/eventos" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline">{t("nav.manageEvents")}</Button>
              </Link>
              <Link to="/admin/configuracion" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline">{t("nav.settings")}</Button>
              </Link>
            </>
          )}
          <Button variant="ghost" onClick={handleLogout}>
            {t("nav.logout")}
          </Button>
        </>
      ) : (
        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
          <Button variant="default">{t("nav.login")}</Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoImage} alt="Costa Digital" className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-primary">
            COSTA DIGITAL
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile ? (
          <div className="flex items-center gap-4">
            <NavLinks />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        ) : (
          /* Mobile Navigation */
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </nav>
  );
}
