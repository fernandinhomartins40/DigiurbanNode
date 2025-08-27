import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  DialogLarge,
  DialogLargeContent,
  DialogLargeDescription,
  DialogLargeFooter,
  DialogLargeHeader,
  DialogLargeTitle,
  DialogLargeBody,
} from '../ui/dialog-large';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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

interface EditTenantForm {
  nome: string;
  cidade: string;
  estado: string;
  populacao: number;
  responsavel_nome: string;
  responsavel_email: string;
  responsavel_telefone: string;
  status: 'ativo' | 'inativo' | 'suspenso' | 'trial';
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  limite_usuarios: number;
}

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSubmit: (tenantId: string, tenantData: EditTenantForm) => void;
}

// ====================================================================
// CONFIGURAÇÕES DE PLANOS
// ====================================================================

const PLANOS = {
  STARTER: { nome: 'Starter', preco: 1200, limite: 50 },
  PROFESSIONAL: { nome: 'Professional', preco: 4500, limite: 150 },
  ENTERPRISE: { nome: 'Enterprise', preco: 10000, limite: 500 }
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const EditTenantModal: React.FC<EditTenantModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditTenantForm>({
    nome: '',
    cidade: '',
    estado: 'SP',
    populacao: 0,
    responsavel_nome: '',
    responsavel_email: '',
    responsavel_telefone: '',
    status: 'ativo',
    plano: 'PROFESSIONAL',
    limite_usuarios: 150
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====================================================================
  // EFEITOS
  // ====================================================================

  useEffect(() => {
    if (tenant && isOpen) {
      setFormData({
        nome: tenant.nome,
        cidade: tenant.cidade,
        estado: tenant.estado,
        populacao: tenant.populacao,
        responsavel_nome: tenant.responsavel_nome || '',
        responsavel_email: tenant.responsavel_email || '',
        responsavel_telefone: tenant.responsavel_telefone || '',
        status: tenant.status,
        plano: tenant.plano,
        limite_usuarios: tenant.limite_usuarios
      });
      setErrors({});
    }
  }, [tenant, isOpen]);

  // ====================================================================
  // VALIDAÇÕES
  // ====================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da prefeitura é obrigatório';
    }
    
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    if (formData.populacao <= 0) {
      newErrors.populacao = 'População deve ser maior que 0';
    }
    
    if (!formData.responsavel_nome.trim()) {
      newErrors.responsavel_nome = 'Nome do responsável é obrigatório';
    }
    
    if (!formData.responsavel_email.trim()) {
      newErrors.responsavel_email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.responsavel_email)) {
      newErrors.responsavel_email = 'Email inválido';
    }
    
    if (!formData.responsavel_telefone.trim()) {
      newErrors.responsavel_telefone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ====================================================================
  // HANDLERS
  // ====================================================================

  const handleInputChange = (field: keyof EditTenantForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlanoChange = (novoPlano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') => {
    const planoConfig = PLANOS[novoPlano];
    setFormData(prev => ({
      ...prev,
      plano: novoPlano,
      limite_usuarios: planoConfig.limite
    }));
  };

  const handleSubmit = async () => {
    if (!tenant || !validateForm()) return;

    setLoading(true);
    try {
      console.log('💾 Salvando alterações do tenant:', tenant.id);
      await onSubmit(tenant.id, formData);
      handleClose();
    } catch (error) {
      console.error('❌ Erro ao atualizar tenant:', error);
      alert(`Erro ao salvar: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      suspenso: 'bg-red-100 text-red-800',
      trial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.ativo;
  };

  const getPlanColor = (plano: string) => {
    const colors = {
      STARTER: 'bg-purple-100 text-purple-800',
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-green-100 text-green-800'
    };
    return colors[plano as keyof typeof colors] || colors.PROFESSIONAL;
  };

  if (!tenant) return null;

  // ====================================================================
  // RENDER
  // ====================================================================

  return (
    <DialogLarge open={isOpen} onOpenChange={handleClose}>
      <DialogLargeContent>
        <DialogLargeHeader>
          <DialogLargeTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">Editar Prefeitura</div>
              <div className="text-sm text-gray-500 font-normal">{tenant.tenant_code}</div>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge className={getStatusColor(formData.status)}>
                {formData.status.toUpperCase()}
              </Badge>
              <Badge className={getPlanColor(formData.plano)}>
                {formData.plano}
              </Badge>
            </div>
          </DialogLargeTitle>
          <DialogLargeDescription>
            Atualize as informações da prefeitura e do responsável principal
          </DialogLargeDescription>
        </DialogLargeHeader>

        <DialogLargeBody className="scrollbar-modal">
          <div className="space-y-6">
          
          {/* Dados da Prefeitura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Dados da Prefeitura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Prefeitura *</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={errors.nome ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={loading}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="suspenso">Suspenso</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade *</label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className={errors.cidade ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.cidade && <p className="text-xs text-red-500">{errors.cidade}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={loading}
                  >
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="BA">Bahia</option>
                    <option value="GO">Goiás</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">População *</label>
                  <Input
                    type="number"
                    value={formData.populacao || ''}
                    onChange={(e) => handleInputChange('populacao', parseInt(e.target.value) || 0)}
                    className={errors.populacao ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.populacao && <p className="text-xs text-red-500">{errors.populacao}</p>}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <Input
                    value={formData.responsavel_nome}
                    onChange={(e) => handleInputChange('responsavel_nome', e.target.value)}
                    className={errors.responsavel_nome ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.responsavel_nome && <p className="text-xs text-red-500">{errors.responsavel_nome}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.responsavel_email}
                    onChange={(e) => handleInputChange('responsavel_email', e.target.value)}
                    className={errors.responsavel_email ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.responsavel_email && <p className="text-xs text-red-500">{errors.responsavel_email}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Telefone *</label>
                  <Input
                    value={formData.responsavel_telefone}
                    onChange={(e) => handleInputChange('responsavel_telefone', e.target.value)}
                    className={errors.responsavel_telefone ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.responsavel_telefone && <p className="text-xs text-red-500">{errors.responsavel_telefone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano e Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Plano e Limites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PLANOS).map(([key, plano]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${
                      formData.plano === key 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => !loading && handlePlanoChange(key as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="font-semibold text-lg">{plano.nome}</div>
                      <div className="text-2xl font-bold text-green-600 my-2">
                        {formatCurrency(plano.preco)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Até {plano.limite} usuários
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Limite de Usuários:</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {formData.limite_usuarios} usuários
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso sobre alterações */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900">Importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  • Alterações no plano podem afetar a funcionalidade disponível para o tenant<br/>
                  • Mudanças no status podem impactar o acesso dos usuários<br/>
                  • O responsável receberá um email sobre as alterações realizadas
                </p>
              </div>
            </div>
          </div>
          </div>
        </DialogLargeBody>

        <DialogLargeFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogLargeFooter>
      </DialogLargeContent>
    </DialogLarge>
  );
};

export default EditTenantModal;