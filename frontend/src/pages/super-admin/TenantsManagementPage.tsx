import React from 'react';
import { Building2, Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TenantsManagementPage: React.FC = () => {
  // Mock data para demonstração
  const tenants = [
    {
      id: '1',
      nome: 'Prefeitura de São Paulo',
      codigo: 'sp-capital',
      plano: 'ENTERPRISE',
      status: 'ativo',
      usuarios: 847,
      protocolos: 12543,
      ultimoAcesso: '2025-08-19',
      valorMensal: 15000
    },
    {
      id: '2', 
      nome: 'Prefeitura do Rio de Janeiro',
      codigo: 'rj-capital',
      plano: 'PROFESSIONAL',
      status: 'ativo',
      usuarios: 523,
      protocolos: 8721,
      ultimoAcesso: '2025-08-19',
      valorMensal: 8500
    },
    {
      id: '3',
      nome: 'Prefeitura de Campinas',
      codigo: 'sp-campinas',
      plano: 'STARTER',
      status: 'suspenso',
      usuarios: 156,
      protocolos: 2341,
      ultimoAcesso: '2025-08-15',
      valorMensal: 2500
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700 border-green-200';
      case 'suspenso': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inativo': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPlanColor = (plano: string) => {
    switch (plano) {
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PROFESSIONAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'STARTER': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              Gestão de Municípios
            </h1>
            <p className="text-gray-600 mt-2">
              Administre todas as prefeituras e suas configurações
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Município
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tenants */}
      <div className="grid gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tenant.nome}</h3>
                    <p className="text-gray-500">Código: {tenant.codigo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Status */}
                  <div className="text-center">
                    <Badge className={getStatusColor(tenant.status)}>
                      {tenant.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Status</p>
                  </div>

                  {/* Plano */}
                  <div className="text-center">
                    <Badge className={getPlanColor(tenant.plano)}>
                      {tenant.plano}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Plano</p>
                  </div>

                  {/* Usuários */}
                  <div className="text-center">
                    <p className="font-semibold">{tenant.usuarios.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Usuários</p>
                  </div>

                  {/* Protocolos */}
                  <div className="text-center">
                    <p className="font-semibold">{tenant.protocolos.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Protocolos/mês</p>
                  </div>

                  {/* Valor */}
                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      R$ {tenant.valorMensal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Mensal</p>
                  </div>

                  {/* Ações */}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Último acesso: {tenant.ultimoAcesso}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm">
                      Relatórios
                    </Button>
                    <Button variant="outline" size="sm">
                      Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{tenants.length}</p>
              <p className="text-sm text-gray-600">Total Municípios</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {tenants.filter(t => t.status === 'ativo').length}
              </p>
              <p className="text-sm text-gray-600">Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {tenants.reduce((acc, t) => acc + t.usuarios, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Usuários</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                R$ {tenants.reduce((acc, t) => acc + t.valorMensal, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Receita Mensal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantsManagementPage;