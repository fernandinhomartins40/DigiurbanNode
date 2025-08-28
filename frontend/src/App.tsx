
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UnifiedSidebar } from "@/components/UnifiedSidebar"
import { AuthProvider } from "@/auth"
import { PermissionsProvider } from "@/contexts/PermissionsContext"
import { StyleSystemProvider } from "@/hooks/useStyleSystem"
import AdminApp from "@/components/AdminApp"

// Protected Route Components
import ProtectedRoute, { AdminRoute, CitizenRoute, SuperAdminRoute } from "@/components/ProtectedRoute"

// Public Pages
import LandingPage from "./pages/LandingPage"
import Login from "./pages/auth/Login"
import AdminLogin from "./pages/admin/auth/AdminLogin"
import SuperAdminLogin from "./pages/super-admin/auth/SuperAdminLogin"
import CidadaoLogin from "./pages/cidadao/auth/CidadaoLogin"
import Unauthorized from "./pages/Unauthorized"

// 🚨 PROVISÓRIO: Componente de registro de super admin  
import SuperAdminRegistration from "./components/auth/SuperAdminRegistration"

// Protected Pages
import Index from "./pages/Index"
import Dashboard from "./pages/Dashboard"
import Protocolos from "./pages/Protocolos"
import ProtocoloDetalhes from "./pages/DetalhesProtocolo"
import CriarProtocolo from "./pages/CriarProtocolo"

// Super Admin Pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard"
import SuperAdminLayout from "./components/SuperAdminLayout"
import TenantsManagement from "./pages/super-admin/TenantsManagement"
import UsersManagementPage from "./pages/super-admin/UsersManagementPage"
import AnalyticsPage from "./pages/super-admin/AnalyticsPage"
import BillingManagement from "./pages/super-admin/BillingManagement"
import MonitoringManagement from "./pages/super-admin/MonitoringManagement"
import OperationsManagement from "./pages/super-admin/OperationsManagement"
import SettingsManagement from "./pages/super-admin/SettingsManagement"
import SchemaManagement from "./pages/super-admin/SchemaManagement"

// Secretarias (all protected)
import GabineteDashboard from "./pages/gabinete/DashboardGabinete"
import Saude from "./pages/saude/DashboardSaude"
import Educacao from "./pages/educacao/DashboardEducacao"
import AssistenciaSocial from "./pages/assistencia-social/ProgramasSociais"
import Obras from "./pages/obras-publicas/DashboardObras"
import Agricultura from "./pages/agricultura/DashboardAgricultura"
import Meio from "./pages/meio-ambiente/ProgramasAmbientais"
import Turismo from "./pages/turismo/DashboardTurismo"
import Esportes from "./pages/esportes/DashboardEsportes"
import Cultura from "./pages/cultura/ProjetosCulturais"
import Administracao from "./pages/administracao/GerenciamentoUsuarios"
import Financas from "./pages/planejamento-urbano/AprovacaoProjetos"
import Planejamento from "./pages/planejamento-urbano/MapaUrbano"
import Procuradoria from "./pages/gabinete/AuditoriaTransparencia"
import Controladoria from "./pages/gabinete/MonitoramentoKPIs"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PermissionsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <StyleSystemProvider>
            <Routes>
              {/* ========================================== */}
              {/* PUBLIC ROUTES (NO AUTHENTICATION NEEDED) */}
              {/* ========================================== */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Login Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route path="/cidadao/login" element={<CidadaoLogin />} />
              
              {/* 🚨 PROVISÓRIO: Rota de registro de super admin - REMOVER APÓS USO! */}
              <Route path="/super-admin-registration" element={<SuperAdminRegistration />} />

              {/* ========================================== */}
              {/* PROTECTED ADMIN ROUTES */}
              {/* ========================================== */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <UnifiedSidebar />
                      <main className="flex-1 p-6 overflow-y-auto">
                        <AdminApp />
                      </main>
                    </div>
                  </SidebarProvider>
                </AdminRoute>
              } />

              {/* ========================================== */}
              {/* PROTECTED CITIZEN ROUTES */}
              {/* ========================================== */}
              <Route path="/cidadao/*" element={
                <CitizenRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Routes>
                      <Route path="dashboard" element={<div className="p-6">Dashboard do Cidadão</div>} />
                      <Route path="servicos" element={<div className="p-6">Catálogo de Serviços</div>} />
                      <Route path="protocolos" element={<div className="p-6">Meus Protocolos</div>} />
                    </Routes>
                  </div>
                </CitizenRoute>
              } />

              {/* ========================================== */}
              {/* PROTECTED SUPER ADMIN ROUTES */}
              {/* ========================================== */}
              <Route path="/super-admin/*" element={
                <SuperAdminRoute>
                  <SuperAdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<SuperAdminDashboard />} />
                      <Route path="tenants" element={<TenantsManagement />} />
                      <Route path="users" element={<UsersManagementPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="billing" element={<BillingManagement />} />
                      <Route path="monitoring" element={<MonitoringManagement />} />
                      <Route path="operations" element={<OperationsManagement />} />
                      <Route path="settings" element={<SettingsManagement />} />
                      <Route path="schema" element={<SchemaManagement />} />
                    </Routes>
                  </SuperAdminLayout>
                </SuperAdminRoute>
              } />

              {/* ========================================== */}
              {/* LEGACY ROUTES (BACKWARD COMPATIBILITY) */}
              {/* ========================================== */}
              
              {/* Redirect old dashboard routes to admin */}
              <Route path="/dashboard-interno" element={
                <AdminRoute>
                  <Index />
                </AdminRoute>
              } />
              
              <Route path="/dashboard" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
              
              <Route path="/protocolos" element={
                <AdminRoute>
                  <Protocolos />
                </AdminRoute>
              } />
              
              {/* Legacy secretarias routes */}
              <Route path="/secretarias/*" element={
                <AdminRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <UnifiedSidebar />
                      <main className="flex-1 p-6 overflow-y-auto">
                        <Routes>
                          <Route path="gabinete" element={<GabineteDashboard />} />
                          <Route path="saude" element={<Saude />} />
                          <Route path="educacao" element={<Educacao />} />
                          <Route path="assistencia-social" element={<AssistenciaSocial />} />
                          <Route path="obras" element={<Obras />} />
                          <Route path="agricultura" element={<Agricultura />} />
                          <Route path="meio-ambiente" element={<Meio />} />
                          <Route path="turismo" element={<Turismo />} />
                          <Route path="esportes" element={<Esportes />} />
                          <Route path="cultura" element={<Cultura />} />
                          <Route path="administracao" element={<Administracao />} />
                          <Route path="financas" element={<Financas />} />
                          <Route path="planejamento" element={<Planejamento />} />
                          <Route path="procuradoria" element={<Procuradoria />} />
                          <Route path="controladoria" element={<Controladoria />} />
                        </Routes>
                      </main>
                    </div>
                  </SidebarProvider>
                </AdminRoute>
              } />

              {/* Catch all - 404 */}
              <Route path="*" element={<Unauthorized />} />
            </Routes>
            </StyleSystemProvider>
          </BrowserRouter>
        </TooltipProvider>
      </PermissionsProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
