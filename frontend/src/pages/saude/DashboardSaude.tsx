import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Calendar, Activity } from "lucide-react";

const DashboardSaude: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="mr-3 h-8 w-8 text-red-500" />
            Dashboard Secretaria de Saúde
          </h1>
          <p className="text-muted-foreground">Visão geral dos indicadores de saúde pública</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+15% em relação à ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+8% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">-2% em relação à semana passada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergências</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">-25% em relação à ontem</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Unidades de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">UBS Centro</span>
                <span className="text-sm text-green-600">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">UBS Bairro Alto</span>
                <span className="text-sm text-green-600">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hospital Municipal</span>
                <span className="text-sm text-yellow-600">Ocupação Alta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pronto Socorro</span>
                <span className="text-sm text-green-600">Funcionando</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programas de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vacinação COVID-19</span>
                <span className="text-sm text-blue-600">92% cobertura</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Programa Hipertensos</span>
                <span className="text-sm text-blue-600">1,245 cadastrados</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Saúde da Mulher</span>
                <span className="text-sm text-blue-600">89 consultas/mês</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Puericultura</span>
                <span className="text-sm text-blue-600">156 crianças</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSaude;