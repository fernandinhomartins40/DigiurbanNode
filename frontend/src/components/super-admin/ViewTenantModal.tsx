import React from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  FileText,
  Activity,
  Settings,
  CreditCard,
  Shield,
  Globe,
  Database
} from 'lucide-react';
import {
  DialogLarge,
  DialogLargeContent,
  DialogLargeHeader,
  DialogLargeBody,
  DialogLargeTitle,
} from '../ui/dialog-large';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

// ====================================================================
// INTERFACES
// ====================================================================

interface Tenant {
  id: string;
  nome: string;
  tenant_code: string;
  cidade: string;
  estado: string;
  populacao: number;
  status: 'ativo' | 'inativo' | 'suspenso' | 'trial';
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  data_criacao: string;
  ultimo_acesso: string;
  usuarios_ativos: number;
  limite_usuarios: number;
  protocolos_mes: number;
  valor_mensal: number;
  // Usar campos compatíveis
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
  configuracoes: {
    personalizacao_ativa: boolean;
    backup_automatico: boolean;
    ssl_customizado: boolean;
    integracao_terceiros: boolean;
  };
  metricas: {
    uptime: number;
    satisfacao: number;
    tempo_resposta: number;
    tickets_abertos: number;
  };
}

interface ViewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const ViewTenantModal: React.FC<ViewTenantModalProps> = ({
  isOpen,
  onClose,
  tenant
}) => {
  if (!tenant) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      suspenso: 'bg-red-100 text-red-800',
      trial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.inativo;
  };

  const getPlanColor = (plano: string) => {
    const colors = {
      STARTER: 'bg-purple-100 text-purple-800',
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-green-100 text-green-800'
    };
    return colors[plano as keyof typeof colors] || colors.STARTER;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'text-green-600';
    if (uptime >= 98) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DialogLarge open={isOpen} onOpenChange={onClose}>
      <DialogLargeContent>
        <DialogLargeHeader>
          <DialogLargeTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{tenant.nome}</div>
              <div className="text-sm text-gray-500 font-normal">{tenant.tenant_code}</div>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge className={getStatusColor(tenant.status)}>{tenant.status?.toUpperCase() || 'INDEFINIDO'}</Badge>
              <Badge className={getPlanColor(tenant.plano)}>{tenant.plano}</Badge>
            </div>
          </DialogLargeTitle>
        </DialogLargeHeader>

        <DialogLargeBody className="scrollbar-modal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Cidade:</span>
                  <div className="mt-1">{tenant.cidade}, {tenant.estado}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">População:</span>
                  <div className="mt-1">{formatNumber(tenant.populacao)} habitantes</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Data de Criação:</span>
                  <div className="mt-1">{formatDate(tenant.data_criacao)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Último Acesso:</span>
                  <div className="mt-1">{formatDate(tenant.ultimo_acesso)}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <span className="font-medium text-gray-600">Status do Sistema:</span>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Sistema Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Monitoramento Ativo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Responsável Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium text-gray-600">Nome:</span>
                <div className="mt-1 text-lg">{tenant.responsavel_nome || 'Não informado'}</div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{tenant.responsavel_email || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{tenant.responsavel_telefone || 'Não informado'}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span>Administrador do Sistema</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Uso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Uso e Capacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Usuários Ativos</span>
                  <span className="font-medium">
                    {tenant.usuarios_ativos} / {tenant.limite_usuarios}
                  </span>
                </div>
                <Progress 
                  value={(tenant.usuarios_ativos / tenant.limite_usuarios) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((tenant.usuarios_ativos / tenant.limite_usuarios) * 100).toFixed(1)}% da capacidade utilizada
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold">{formatNumber(tenant.protocolos_mes)}</div>
                  <div className="text-xs text-gray-600">Protocolos/Mês</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold">{formatCurrency(tenant.valor_mensal)}</div>
                  <div className="text-xs text-gray-600">Mensalidade</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Performance e Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getUptimeColor(tenant.metricas.uptime)}`}>
                    {tenant.metricas.uptime}%
                  </div>
                  <div className="text-xs text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tenant.metricas.satisfacao}★
                  </div>
                  <div className="text-xs text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tenant.metricas.tempo_resposta}s
                  </div>
                  <div className="text-xs text-gray-600">Tempo Resposta</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    tenant.metricas.tickets_abertos > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tenant.metricas.tickets_abertos}
                  </div>
                  <div className="text-xs text-gray-600">Tickets Abertos</div>
                </div>
              </div>
              
              {tenant.metricas.tickets_abertos > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Atenção Necessária</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Existem {tenant.metricas.tickets_abertos} tickets de suporte em aberto
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações e Recursos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Configurações e Recursos Ativados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tenant.configuracoes.personalizacao_ativa ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Globe className={`h-5 w-5 ${
                      tenant.configuracoes.personalizacao_ativa ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Personalização</div>
                    <div className={`text-xs ${
                      tenant.configuracoes.personalizacao_ativa ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {tenant.configuracoes.personalizacao_ativa ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tenant.configuracoes.backup_automatico ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Database className={`h-5 w-5 ${
                      tenant.configuracoes.backup_automatico ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Backup Automático</div>
                    <div className={`text-xs ${
                      tenant.configuracoes.backup_automatico ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {tenant.configuracoes.backup_automatico ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tenant.configuracoes.ssl_customizado ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Shield className={`h-5 w-5 ${
                      tenant.configuracoes.ssl_customizado ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">SSL Customizado</div>
                    <div className={`text-xs ${
                      tenant.configuracoes.ssl_customizado ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {tenant.configuracoes.ssl_customizado ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tenant.configuracoes.integracao_terceiros ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Settings className={`h-5 w-5 ${
                      tenant.configuracoes.integracao_terceiros ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Integrações</div>
                    <div className={`text-xs ${
                      tenant.configuracoes.integracao_terceiros ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {tenant.configuracoes.integracao_terceiros ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </DialogLargeBody>
      </DialogLargeContent>
    </DialogLarge>
  );
};

export default ViewTenantModal;