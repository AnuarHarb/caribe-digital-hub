import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@/i18n/config";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import AdminSettings from "./pages/AdminSettings";
import JobBoard from "./pages/JobBoard";
import JobDetail from "./pages/JobDetail";
import TalentDirectory from "./pages/TalentDirectory";
import PublicProfile from "./pages/PublicProfile";
import CompanyPublicProfile from "./pages/CompanyPublicProfile";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import Curriculum from "./pages/Curriculum";
import MyApplications from "./pages/MyApplications";
import ManageJobs from "./pages/ManageJobs";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import ViewApplicants from "./pages/ViewApplicants";
import CompanySettings from "./pages/CompanySettings";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import ForCompanies from "./pages/ForCompanies";
import NotFound from "./pages/NotFound";
import { AuthLayout } from "./components/auth/AuthLayout";
import { DashboardLayout } from "./components/shared/DashboardLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { ActiveCompanyProvider } from "./contexts/ActiveCompanyContext";

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
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/empleos" element={<JobBoard />} />
            <Route path="/empleos/:slug" element={<JobDetail />} />
            <Route path="/talento" element={<TalentDirectory />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/perfil/:id" element={<PublicProfile />} />
            <Route path="/para-empresas" element={<ForCompanies />} />
            <Route path="/empresa/:id" element={<CompanyPublicProfile />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ActiveCompanyProvider>
                    <DashboardLayout />
                  </ActiveCompanyProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="perfil" element={<EditProfile />} />
              <Route path="curriculum" element={<Curriculum />} />
              <Route path="aplicaciones" element={<MyApplications />} />
              <Route path="empleos" element={<ManageJobs />} />
              <Route path="empleos/nuevo" element={<CreateJob />} />
              <Route path="empleos/:id/edit" element={<EditJob />} />
              <Route path="candidatos" element={<ViewApplicants />} />
              <Route path="empresa" element={<CompanySettings />} />
            </Route>
            <Route path="/admin/configuracion" element={<AdminSettings />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
