import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { MareaLogo } from "@/components/MareaLogo";
import { List, CaretDown, SquaresFour, Gear, SignOut, CreditCard } from "@phosphor-icons/react";
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

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
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
          <CaretDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/dashboard" onClick={onItemClick} className="flex items-center gap-2 cursor-pointer">
            <SquaresFour className="h-4 w-4" />
            {t("nav.dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/credencial" onClick={onItemClick} className="flex items-center gap-2 cursor-pointer">
            <CreditCard className="h-4 w-4" />
            {t("dashboard.credential")}
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              to="/admin"
              onClick={onItemClick}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Gear className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onItemClick?.();
            handleLogout();
          }}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <SignOut className="h-4 w-4" />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const closeMobile = () => setMobileMenuOpen(false);

  const EVENTS_URL = "https://www.codigoabierto.tech/eventos";
  const publicNav = [
    { to: "/membresias", label: t("nav.membresias") },
    { to: "/conocenos", label: t("nav.nosotros") },
  ];

  const navGroups = [
    {
      label: t("nav.ecosistema"),
      items: [
        { to: "/programas", label: t("nav.programas") },
        { to: "/comunidades", label: t("nav.comunidades") },
        { to: "/talento", label: t("nav.talentNetwork") },
        { to: "/aliados", label: t("nav.aliados") },
      ],
      hidden: true,
    },
    {
      label: t("nav.nosotros"),
      items: [
        { to: "/conocenos", label: t("nav.about") },
        { to: "/conocenos#manifiesto", label: t("nav.manifiesto") },
        { to: "/conocenos#equipo", label: t("nav.equipo") },
        { to: "/conocenos#proyectos", label: t("nav.proyectos") },
        { to: "/conocenos#sede", label: t("nav.sede") },
      ],
      hidden: true,
    },
  ];

  const NavLinks = () =>
    isMobile ? (
      <>
        <Link
          to="/noticias"
          onClick={closeMobile}
          aria-label={t("nav.marea")}
          className="flex w-full justify-start px-3 py-2"
        >
          <MareaLogo className="h-8" />
        </Link>
        {publicNav.map((item) => (
          <Link key={item.to} to={item.to} onClick={closeMobile} className="block w-full">
            <Button variant="ghost" className="w-full justify-start">
              {item.label}
            </Button>
          </Link>
        ))}
        <div className="my-2 border-t border-border" aria-hidden />
        {mobileAuthSection}
      </>
    ) : (
      <>
        <Link to="/noticias" aria-label={t("nav.marea")} className="inline-flex items-center px-2 hover:opacity-90">
          <MareaLogo className="h-8" />
        </Link>
        {publicNav.map((item) => (
          <Link key={item.to} to={item.to}>
            <Button variant="ghost">{item.label}</Button>
          </Link>
        ))}
        {desktopAuthSection}
      </>
    );

  const desktopAuthSection = user ? (
    <UserMenu onItemClick={closeMobile} />
  ) : authLoading ? null : (
    <Link to="/auth/signup">
      <Button variant="default">{t("nav.signup")}</Button>
    </Link>
  );

  const mobileAuthSection = user ? (
    <>
      <div className="my-3 border-t border-border" aria-hidden />
      <Link to="/dashboard" onClick={closeMobile} className="block w-full">
        <Button variant="ghost" className="gap-2 justify-start w-full">
          <SquaresFour className="h-4 w-4" aria-hidden />
          {t("nav.dashboard")}
        </Button>
      </Link>
      <Link to="/dashboard/credencial" onClick={closeMobile} className="block w-full">
        <Button variant="ghost" className="gap-2 justify-start w-full">
          <CreditCard className="h-4 w-4" aria-hidden />
          {t("dashboard.credential")}
        </Button>
      </Link>
      {isAdmin && (
        <Link to="/admin" onClick={closeMobile} className="block w-full">
          <Button variant="ghost" className="gap-2 justify-start w-full">
            <Gear className="h-4 w-4" aria-hidden />
            {t("nav.admin")}
          </Button>
        </Link>
      )}
      <Button
        variant="ghost"
        className="gap-2 justify-start w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => {
          closeMobile();
          handleLogout();
        }}
      >
        <SignOut className="h-4 w-4" aria-hidden />
        {t("nav.logout")}
      </Button>
    </>
  ) : authLoading ? null : (
    <Link to={authUrl} onClick={closeMobile} className="block w-full">
      <Button variant="default" className="w-full">{t("nav.login")}</Button>
    </Link>
  );

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Principal">
        <Link to="/" className="flex shrink-0 items-center hover:opacity-90 transition-opacity">
          <BrandLogo />
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
                  <List className="h-5 w-5" aria-hidden />
                  <span className="sr-only">Abrir menú</span>
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
      </nav>
    </header>
    <div className="h-16" aria-hidden />
    </>
  );
}
