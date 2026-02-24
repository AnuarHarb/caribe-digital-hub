import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Users,
  Plus,
  Settings,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import { CompanySwitcher } from "@/components/company/CompanySwitcher";
import logoImage from "@/assets/costa-digital-logo.png";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function DashboardSidebar() {
  const { t } = useTranslation();
  const { accountType, profile } = useProfile();
  const { professionalProfile } = useProfessionalProfile();
  const { activeCompany, companies } = useActiveCompany();

  const { percentage } =
    accountType === "professional"
      ? calculateProfileCompletion(profile, professionalProfile)
      : { percentage: 100 };

  const hasCompanies = companies.length > 0;

  const personalLinks = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/dashboard/perfil", label: t("dashboard.profile"), icon: User },
    ...(accountType === "professional"
      ? [
          { to: "/dashboard/curriculum", label: t("curriculum.title"), icon: ScrollText },
          { to: "/dashboard/aplicaciones", label: t("dashboard.applications"), icon: FileText },
        ]
      : []),
  ];

  const companyLinks = hasCompanies
    ? [
        { to: "/dashboard/empleos", label: t("dashboard.jobs"), icon: Briefcase },
        { to: "/dashboard/empleos/nuevo", label: t("dashboard.newJob"), icon: Plus },
        { to: "/dashboard/candidatos", label: t("dashboard.candidates"), icon: Users },
        { to: "/dashboard/empresa", label: t("company.settingsTitle"), icon: Settings },
      ]
    : [];

  const showCompanyLogo = hasCompanies && activeCompany?.logo_url;
  const defaultLabel = activeCompany?.company_name ?? profile?.full_name ?? t("auth.accountTypeProfessional");

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          {showCompanyLogo ? (
            <img
              src={activeCompany!.logo_url!}
              alt={activeCompany!.company_name}
              className="h-9 w-9 shrink-0 rounded-lg object-contain bg-background"
            />
          ) : (
            <img
              src={logoImage}
              alt="Costa Digital"
              className="h-9 w-9 shrink-0 rounded-lg object-contain"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-display text-sm font-semibold text-sidebar-foreground dark:text-foreground">
              {showCompanyLogo ? activeCompany!.company_name : "Costa Digital"}
            </span>
            {hasCompanies ? (
              <CompanySwitcher />
            ) : (
              <span className="truncate text-xs text-sidebar-foreground/70 dark:text-foreground/85">
                {defaultLabel}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground dark:text-foreground/90">
            {t("dashboard.sectionPersonal")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1">
              {personalLinks.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={link.to}
                      end={link.to === "/dashboard"}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-3 py-2.5 transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent/80"
                            : "text-sidebar-foreground dark:text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-foreground"
                        )
                      }
                    >
                      <link.icon className="h-5 w-5 shrink-0" aria-hidden />
                      <span>{link.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {companyLinks.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground dark:text-foreground/90">
              {t("dashboard.sectionCompany")}
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="gap-1">
                {companyLinks.map((link) => (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={link.to}
                        end={link.to === "/dashboard"}
                        className={({ isActive }) =>
                          cn(
                            "rounded-lg px-3 py-2.5 transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent/80"
                              : "text-sidebar-foreground dark:text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-foreground"
                          )
                        }
                      >
                        <link.icon className="h-5 w-5 shrink-0" aria-hidden />
                        <span>{link.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {accountType === "professional" && percentage < 100 && (
          <>
            <SidebarSeparator className="mx-3 my-2" />
            <SidebarGroup className="px-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sidebar-foreground/80 dark:text-foreground/90">
                  {t("profile.completionTitle")}
                </span>
                <span className="text-xs font-semibold text-accent">{percentage}%</span>
              </div>
              <Progress value={percentage} className="mt-2 h-1.5" />
              <NavLink
                to="/dashboard/perfil"
                className="mt-2 block text-xs font-medium text-accent hover:underline"
              >
                {t("profile.completeProfile")}
              </NavLink>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-accent/20 text-accent-foreground text-sm">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-sm font-medium text-sidebar-foreground dark:text-foreground">
              {profile?.full_name || t("dashboard.welcomeProfessional")}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70 dark:text-foreground/85">
              {hasCompanies
                ? activeCompany?.company_name || t("dashboard.welcomeCompany")
                : professionalProfile?.title || t("profile.editDescription")}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
