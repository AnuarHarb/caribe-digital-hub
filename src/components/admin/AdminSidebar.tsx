import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/costa-digital-logo.png";

export function AdminSidebar() {
  const { t } = useTranslation();

  const links = [
    { to: "/admin", label: t("admin.nav.dashboard"), icon: LayoutDashboard, end: true },
    { to: "/admin/usuarios", label: t("admin.nav.users"), icon: Users, end: false },
    { to: "/admin/organizaciones", label: t("admin.nav.organizations"), icon: Building2, end: false },
    { to: "/admin/ofertas", label: t("admin.nav.jobs"), icon: Briefcase, end: false },
    { to: "/admin/noticias", label: t("admin.nav.news"), icon: Newspaper, end: false },
  ];

  return (
    <Sidebar className="!top-14 !h-[calc(100vh-3.5rem)]">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="Costa Digital"
            className="h-9 w-9 shrink-0 rounded-lg object-contain"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-display text-sm font-semibold text-sidebar-foreground dark:text-foreground">
              Costa Digital
            </span>
            <span className="truncate text-xs text-sidebar-foreground/70 dark:text-foreground/85">
              {t("admin.nav.title")}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {links.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={link.to}
                      end={link.end}
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
      </SidebarContent>
    </Sidebar>
  );
}
