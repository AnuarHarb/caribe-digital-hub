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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Users,
  Plus,
} from "lucide-react";
import { useProfile } from "@/hooks/useAuth";

export function DashboardSidebar() {
  const { t } = useTranslation();
  const { accountType } = useProfile();

  const professionalLinks = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/dashboard/perfil", label: t("dashboard.profile"), icon: User },
    { to: "/dashboard/aplicaciones", label: t("dashboard.applications"), icon: FileText },
  ];

  const companyLinks = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/dashboard/empleos", label: t("dashboard.jobs"), icon: Briefcase },
    { to: "/dashboard/empleos/nuevo", label: t("dashboard.newJob"), icon: Plus },
    { to: "/dashboard/candidatos", label: t("dashboard.candidates"), icon: Users },
  ];

  const links = accountType === "company" ? companyLinks : professionalLinks;
  const defaultLabel = accountType === "company" ? t("auth.accountTypeCompany") : t("auth.accountTypeProfessional");

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroupLabel className="text-xs font-semibold">
          {defaultLabel}
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={link.to}
                      end={link.to === "/dashboard"}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <link.icon className="h-4 w-4" aria-hidden />
                      <span>{link.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
