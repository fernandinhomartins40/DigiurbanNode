import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Calendar, Activity } from "lucide-react";

const DashboardAssistenciaSocial: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8 text-purple-500" />
            Dashboard Secretaria de Assistência Social
          </h1>
          <p className="text-muted-foreground">Visão geral dos programas e atendimentos sociais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">+18% em relação à ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Famílias Cadastradas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,432</div>
            <p className="text-xs text-muted-foreground">+6% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefícios Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">+12 novos benefícios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Emergenciais</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">-15% em relação à semana passada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CRAS e CREAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CRAS Centro</span>
                <span className="text-sm text-green-600">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CRAS Bairro Alto</span>
                <span className="text-sm text-green-600">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CREAS Municipal</span>
                <span className="text-sm text-yellow-600">Capacidade Máxima</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Casa de Passagem</span>
                <span className="text-sm text-green-600">Disponível</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programas Sociais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auxílio Brasil</span>
                <span className="text-sm text-blue-600">456 famílias</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">BPC</span>
                <span className="text-sm text-blue-600">123 beneficiários</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tarifa Social Energia</span>
                <span className="text-sm text-blue-600">89 cadastros</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Casa da Família</span>
                <span className="text-sm text-blue-600">234 atendimentos/mês</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAssistenciaSocial;