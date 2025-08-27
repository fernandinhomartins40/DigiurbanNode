import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SuperAdminRoute } from './ProtectedRoute';

// Super Admin Components
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";
import TenantsManagement from "@/pages/super-admin/TenantsManagement";
import UsersManagement from "@/pages/super-admin/UsersManagement";
import BillingManagement from "@/pages/super-admin/BillingManagement";
import AnalyticsManagement from "@/pages/super-admin/AnalyticsManagement";
import MonitoringManagement from "@/pages/super-admin/MonitoringManagement";
import OperationsManagement from "@/pages/super-admin/OperationsManagement";
import SettingsManagement from "@/pages/super-admin/SettingsManagement";
import SchemaManagement from "@/pages/super-admin/SchemaManagement";

// Auth Components
import SuperAdminLogin from "@/pages/super-admin/auth/SuperAdminLogin";

// Layout Components
import SuperAdminLayout from './SuperAdminLayout';

// Error Components
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

const SuperAdminApp: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes - Sem proteção para permitir login */}
      <Route path="/login" element={<SuperAdminLogin />} />
      <Route path="/auth/login" element={<SuperAdminLogin />} />
      
      {/* Super Admin Dashboard - Rota Principal */}
      <Route path="/" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <SuperAdminDashboard />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />
      
      <Route path="/dashboard" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <SuperAdminDashboard />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Sistema de Gestão de Tenants */}
      <Route path="/tenants" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <TenantsManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Gestão de Usuários */}
      <Route path="/users" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <UsersManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Gestão Financeira */}
      <Route path="/billing" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <BillingManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Analytics e Relatórios */}
      <Route path="/analytics" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <AnalyticsManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Sistema de Monitoramento */}
      <Route path="/monitoring" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <MonitoringManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Ferramentas Operacionais */}
      <Route path="/operations" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <OperationsManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Configurações Globais */}
      <Route path="/settings" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <SettingsManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Schema Management */}
      <Route path="/schema" element={
        <SuperAdminRoute>
          <SuperAdminLayout>
            <SchemaManagement />
          </SuperAdminLayout>
        </SuperAdminRoute>
      } />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default SuperAdminApp;