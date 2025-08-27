import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { 
  SuperAdminLayout,
  SuperAdminHeader,
  SuperAdminContent
} from "@/components/super-admin/SuperAdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AnalyticsPage: React.FC = () => {
  return (
    <SuperAdminLayout>
      <SuperAdminHeader 
        title="Analytics Empresariais"
        subtitle="Relatórios detalhados e insights de performance"
        icon={BarChart3}
      />

      <SuperAdminContent>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-sm text-gray-600">Crescimento MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">23,847</p>
                <p className="text-sm text-gray-600">Protocolos/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <PieChart className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">3.2%</p>
                <p className="text-sm text-gray-600">Taxa de Churn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">R$ 89.7K</p>
                <p className="text-sm text-gray-600">MRR Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Receita</CardTitle>
            <CardDescription>
              Monthly Recurring Revenue - últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600">Gráfico de Receita</p>
                <p className="text-sm text-gray-500">Em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
            <CardDescription>
              Divisão de clientes por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">Gráfico de Pizza</p>
                <p className="text-sm text-gray-500">Em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade de Usuários</CardTitle>
            <CardDescription>
              Logins e uso da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-600">Gráfico de Atividade</p>
                <p className="text-sm text-gray-500">Em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Regional</CardTitle>
            <CardDescription>
              Métricas por região/estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-orange-50 to-red-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <p className="text-gray-600">Mapa de Calor</p>
                <p className="text-sm text-gray-500">Em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </SuperAdminContent>
    </SuperAdminLayout>
  );
};

export default AnalyticsPage;