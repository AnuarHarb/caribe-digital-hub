import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Separator } from "@/components/ui/separator";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
