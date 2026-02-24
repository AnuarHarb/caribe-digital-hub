import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import logoImage from "@/assets/costa-digital-logo.png";
import { Menu, ChevronDown, LayoutDashboard, Settings, LogOut, Newspaper } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const authUrl = `/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdminStatus();
  }, [user?.id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("nav.logout") + " error");
    } else {
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.setQueryData(["auth-session"], null);
      toast.success(t("nav.logout"));
      navigate("/");
    }
  };

  const UserMenu = ({ onItemClick }: { onItemClick?: () => void }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-accent/20 text-accent-foreground text-sm">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline truncate max-w-[120px]">
            {profile?.full_name || user?.email || t("nav.dashboard")}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/dashboard" onClick={onItemClick} className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            {t("nav.dashboard")}
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/admin/configuracion"
                onClick={onItemClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                {t("nav.admin")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/admin/blog"
                onClick={onItemClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Newspaper className="h-4 w-4" />
                {t("nav.blog")}
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onItemClick?.();
            handleLogout();
          }}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const NavLinks = () => (
    <>
      <Link to="/empleos" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost">{t("nav.jobs")}</Button>
      </Link>
      <Link to="/talento" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost">{t("nav.talent")}</Button>
      </Link>
      <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost">{t("nav.blog")}</Button>
      </Link>
      {user ? (
        <UserMenu onItemClick={() => setMobileMenuOpen(false)} />
      ) : (
        <Link to={authUrl} onClick={() => setMobileMenuOpen(false)}>
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
          <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wide">
            Beta
          </Badge>
        </Link>

        {!isMobile ? (
          <div className="flex items-center gap-4">
            <NavLinks />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        ) : (
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
