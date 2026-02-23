import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@/i18n/config";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminSettings from "./pages/AdminSettings";
import JobBoard from "./pages/JobBoard";
import JobDetail from "./pages/JobDetail";
import TalentDirectory from "./pages/TalentDirectory";
import PublicProfile from "./pages/PublicProfile";
import CompanyPublicProfile from "./pages/CompanyPublicProfile";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import MyApplications from "./pages/MyApplications";
import ManageJobs from "./pages/ManageJobs";
import CreateJob from "./pages/CreateJob";
import ViewApplicants from "./pages/ViewApplicants";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/shared/DashboardLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/empleos" element={<JobBoard />} />
            <Route path="/empleos/:id" element={<JobDetail />} />
            <Route path="/talento" element={<TalentDirectory />} />
            <Route path="/perfil/:id" element={<PublicProfile />} />
            <Route path="/empresa/:id" element={<CompanyPublicProfile />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="perfil" element={<EditProfile />} />
              <Route path="aplicaciones" element={<MyApplications />} />
              <Route path="empleos" element={<ManageJobs />} />
              <Route path="empleos/nuevo" element={<CreateJob />} />
              <Route path="candidatos" element={<ViewApplicants />} />
            </Route>
            <Route path="/admin/configuracion" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
