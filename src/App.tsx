import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@/i18n/config";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminJobs from "./pages/admin/AdminJobs";
import JobDetail from "./pages/JobDetail";
import TalentNetwork from "./pages/TalentNetwork";
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
import AdminNews from "./pages/admin/AdminNews";
import ForCompanies from "./pages/ForCompanies";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import { AuthLayout } from "./components/auth/AuthLayout";
import { DashboardLayout } from "./components/shared/DashboardLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { AdminRoute } from "./components/admin/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ActiveCompanyProvider } from "./contexts/ActiveCompanyContext";
import { GoogleAnalytics } from "./components/GoogleAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleAnalytics />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/talento" element={<TalentNetwork />} />
            <Route path="/empleos" element={<Navigate to="/talento" replace />} />
            <Route path="/empleos/:slug" element={<JobDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/perfil/:slug" element={<PublicProfile />} />
            <Route path="/para-empresas" element={<ForCompanies />} />
            <Route path="/terminos" element={<TermsAndConditions />} />
            <Route path="/aviso-de-privacidad" element={<PrivacyPolicy />} />
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
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="organizaciones" element={<AdminOrganizations />} />
              <Route path="ofertas" element={<AdminJobs />} />
              <Route
                path="noticias"
                element={
                  <ErrorBoundary>
                    <AdminNews />
                  </ErrorBoundary>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
