import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Separator } from "@/components/ui/separator";

export function AdminLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="min-w-0">
          <header className="sticky top-16 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
            <SidebarTrigger className="-ml-1" aria-label={t("admin.nav.menu")} />
            <Separator orientation="vertical" className="h-6" />
            <span className="truncate text-sm font-medium text-foreground">
              {t("admin.nav.title")}
            </span>
          </header>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
