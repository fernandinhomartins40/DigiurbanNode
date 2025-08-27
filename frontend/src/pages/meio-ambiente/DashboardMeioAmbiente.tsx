import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Users, Calendar, Activity } from "lucide-react";

const DashboardMeioAmbiente: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <TreePine className="mr-3 h-8 w-8 text-green-500" />
            Dashboard Secretaria de Meio Ambiente
          </h1>
          <p className="text-muted-foreground">Visão geral dos indicadores ambientais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenças Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+25% em relação à ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denúncias Atendidas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas Protegidas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+3 novas áreas este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">2 novos programas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Licenças Ambientais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Licenças de Operação</span>
                <span className="text-sm text-green-600">23 ativas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Licenças Prévia</span>
                <span className="text-sm text-blue-600">12 em análise</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Licenças de Instalação</span>
                <span className="text-sm text-orange-600">8 pendentes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Renovações</span>
                <span className="text-sm text-yellow-600">5 próximas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programas Ambientais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reflorestamento</span>
                <span className="text-sm text-green-600">2.500 mudas plantadas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coleta Seletiva</span>
                <span className="text-sm text-blue-600">85% participação</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Educação Ambiental</span>
                <span className="text-sm text-purple-600">12 escolas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monitoramento Água</span>
                <span className="text-sm text-cyan-600">15 pontos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMeioAmbiente;