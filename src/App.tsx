import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PanelLayout } from "@/components/layout/PanelLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegistroPage from "./pages/auth/RegistroPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MentoresPage from "./pages/mentores/MentoresPage";
import MentorPerfilPage from "./pages/mentores/MentorPerfilPage";
import CursosPage from "./pages/cursos/CursosPage";
import CursoDetallePage from "./pages/cursos/CursoDetallePage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";

// Mentor panel
import MentorDashboardPage from "./pages/panel/mentor/MentorDashboardPage";
import MentorCursosPage from "./pages/panel/mentor/MentorCursosPage";
import MentorCursoDetallePage from "./pages/panel/mentor/MentorCursoDetallePage";
import MentorPerfilPagePanel from "./pages/panel/mentor/MentorPerfilPage";
import MentorFinanzasPage from "./pages/panel/mentor/MentorFinanzasPage";

// Admin panel
import AdminDashboardPage from "./pages/panel/admin/AdminDashboardPage";
import AdminUsuariosPage from "./pages/panel/admin/AdminUsuariosPage";
import AdminMentoresPage from "./pages/panel/admin/AdminMentoresPage";
import AdminCursosPage from "./pages/panel/admin/AdminCursosPage";
import AdminEstadisticasPage from "./pages/panel/admin/AdminEstadisticasPage";
import AdminConfiguracionPage from "./pages/panel/admin/AdminConfiguracionPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* App layout (navbar) */}
            <Route element={<AppLayout />}>
              <Route path="/mentores" element={<MentoresPage />} />
              <Route path="/mentores/:id" element={<MentorPerfilPage />} />
              <Route path="/cursos" element={<CursosPage />} />
              <Route path="/cursos/:id" element={<CursoDetallePage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Mentor panel */}
            <Route
              element={
                <ProtectedRoute requiredRole="mentor">
                  <PanelLayout variant="mentor" />
                </ProtectedRoute>
              }
            >
              <Route path="/panel/mentor" element={<MentorDashboardPage />} />
              <Route path="/panel/mentor/cursos" element={<MentorCursosPage />} />
              <Route path="/panel/mentor/cursos/:cursoId" element={<MentorCursoDetallePage />} />
              <Route path="/panel/mentor/perfil" element={<MentorPerfilPagePanel />} />
              <Route path="/panel/mentor/finanzas" element={<MentorFinanzasPage />} />
            </Route>

            {/* Admin panel */}
            <Route
              element={
                <ProtectedRoute requiredRole="admin">
                  <PanelLayout variant="admin" />
                </ProtectedRoute>
              }
            >
              <Route path="/panel/admin" element={<AdminDashboardPage />} />
              <Route path="/panel/admin/usuarios" element={<AdminUsuariosPage />} />
              <Route path="/panel/admin/mentores" element={<AdminMentoresPage />} />
              <Route path="/panel/admin/cursos" element={<AdminCursosPage />} />
              <Route path="/panel/admin/estadisticas" element={<AdminEstadisticasPage />} />
              <Route path="/panel/admin/configuracion" element={<AdminConfiguracionPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
