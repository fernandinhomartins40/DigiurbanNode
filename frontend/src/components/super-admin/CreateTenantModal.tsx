import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  Key,
  Send,
  CheckCircle2
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTenantService } from "@/services/tenantService";
import { 
  validatePrefeituraData, 
  maskCNPJ, 
  maskCEP, 
  maskPhone, 
  generateSlug,
  validateCNPJ,
  cleanNumeric
} from "@/utils/validators";

// ====================================================================
// UTILITÁRIOS
// ====================================================================

// Geração de UUID compatível com todos os browsers
const generateUUID = (): string => {
  // Verificar se crypto.randomUUID está disponível (browsers modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para browsers mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ====================================================================
// INTERFACES E TIPOS
// ====================================================================

interface CreateTenantForm {
  // Dados da Prefeitura APENAS
  nome: string;
  cidade: string;
  estado: string;
  populacao: number;
  cnpj: string;
  endereco: string;
  cep: string;
  plano: 'starter' | 'professional' | 'enterprise';
  responsavel_nome?: string; // Opcional para contato
  responsavel_email?: string; // Não cria usuário
  responsavel_telefone?: string;
}

interface PlanConfig {
  id: 'starter' | 'professional' | 'enterprise';
  nome: string;
  preco: number;
  limite_usuarios: number;
  recursos: string[];
  recomendado?: boolean;
}

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenantData: CreateTenantForm) => void;
}

// ====================================================================
// CONFIGURAÇÕES DE PLANOS
// ====================================================================

const PLANOS: PlanConfig[] = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 1200,
    limite_usuarios: 50,
    recursos: [
      'Até 50 usuários',
      'Protocolos ilimitados',
      'Relatórios básicos',
      'Suporte por email',
      'Backup semanal'
    ]
  },
  {
    id: 'professional',
    nome: 'Professional',
    preco: 4500,
    limite_usuarios: 150,
    recursos: [
      'Até 150 usuários',
      'Protocolos ilimitados',
      'Relatórios avançados',
      'Dashboard analítico',
      'Suporte prioritário',
      'Backup diário',
      'Integrações básicas'
    ],
    recomendado: true
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 10000,
    limite_usuarios: 500,
    recursos: [
      'Até 500 usuários',
      'Protocolos ilimitados',
      'Relatórios personalizados',
      'Dashboard executivo',
      'Suporte 24/7',
      'Backup em tempo real',
      'Integrações avançadas',
      'SSL customizado',
      'Personalização completa'
    ]
  }
];

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { createTenant } = useTenantService();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdTenant, setCreatedTenant] = useState<any | null>(null);
  const [formData, setFormData] = useState<CreateTenantForm>({
    // Dados da Prefeitura APENAS
    nome: '',
    cidade: '',
    estado: 'SP',
    populacao: 0,
    cnpj: '',
    endereco: '',
    cep: '',
    plano: 'professional',
    
    // Dados de contato opcionais (NÃO criam usuário)
    responsavel_nome: '',
    responsavel_email: '',
    responsavel_telefone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====================================================================
  // FUNÇÕES DE VALIDAÇÃO
  // ====================================================================

  const validateStep1 = (): boolean => {
    // Usar validação robusta específica para prefeituras
    const validation = validatePrefeituraData({
      nome: formData.nome,
      cnpj: formData.cnpj,
      cidade: formData.cidade,
      estado: formData.estado,
      populacao: formData.populacao,
      cep: formData.cep || undefined,
    });
    
    setErrors(validation.errors);
    return validation.isValid;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validação dos campos opcionais de contato usando validações robustas
    if (formData.responsavel_email) {
      const validation = validatePrefeituraData({
        nome: 'temp', cnpj: '11111111000100', cidade: 'temp', 
        estado: 'SP', populacao: 1000,
        responsavel_email: formData.responsavel_email
      });
      if (validation.errors.responsavel_email) {
        newErrors.responsavel_email = validation.errors.responsavel_email;
      }
    }

    if (formData.responsavel_telefone) {
      const validation = validatePrefeituraData({
        nome: 'temp', cnpj: '11111111000100', cidade: 'temp', 
        estado: 'SP', populacao: 1000,
        responsavel_telefone: formData.responsavel_telefone
      });
      if (validation.errors.responsavel_telefone) {
        newErrors.responsavel_telefone = validation.errors.responsavel_telefone;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ====================================================================
  // HANDLERS
  // ====================================================================

  const handleInputChange = (field: keyof CreateTenantForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handler para inputs com máscara
  const handleMaskedInputChange = (field: keyof CreateTenantForm, value: string, maskFunction: (value: string) => string) => {
    const maskedValue = maskFunction(value);
    setFormData(prev => ({ ...prev, [field]: maskedValue }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlanSelect = (plano: PlanConfig) => {
    setFormData(prev => ({
      ...prev,
      plano: plano.id
    }));
  };

  const handleNext = () => {
    setLoading(true);
    try {
      if (step === 1 && validateStep1()) {
        setStep(2);
      } else if (step === 2 && validateStep2()) {
        setStep(3);
      } else if (step === 3) {
        setStep(4);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('🏛️ Criando APENAS tenant (organização)...');
      
      // Criar APENAS tenant usando TenantService com dados limpos
      const tenantResult = await createTenant({
        nome: formData.nome.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.toUpperCase().trim(),
        populacao: formData.populacao,
        cnpj: cleanNumeric(formData.cnpj), // Limpar CNPJ para enviar apenas números
        endereco: formData.endereco?.trim(),
        cep: formData.cep ? cleanNumeric(formData.cep) : undefined,
        plano: formData.plano,
        responsavel_nome: formData.responsavel_nome?.trim(),
        responsavel_email: formData.responsavel_email?.trim().toLowerCase(),
        responsavel_telefone: formData.responsavel_telefone ? cleanNumeric(formData.responsavel_telefone) : undefined
      });

      setCreatedTenant(tenantResult);

      console.log('✅ Tenant criado com sucesso:', tenantResult.id);
      
      // Chamar callback do componente pai
      onSubmit(formData);
      
      // Ir para step final de sucesso
      setStep(5);
      
    } catch (error: Error | unknown) {
      console.error('❌ Erro ao criar tenant:', error);
      alert(`Erro ao criar prefeitura: ${error.message}\n\nPor favor, tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCreatedTenant(null);
    setFormData({
      nome: '',
      cidade: '',
      estado: 'SP',
      populacao: 0,
      cnpj: '',
      endereco: '',
      cep: '',
      plano: 'professional',
      responsavel_nome: '',
      responsavel_email: '',
      responsavel_telefone: ''
    });
    setErrors({});
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // ====================================================================
  // RENDER DOS STEPS
  // ====================================================================

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600">
        <Building2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Dados da Prefeitura</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome da Prefeitura *</label>
          <Input
            placeholder="Ex: Prefeitura Municipal de..."
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className={errors.nome ? 'border-red-500' : ''}
          />
          {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">CNPJ *</label>
          <Input
            placeholder="00.000.000/0000-00"
            value={formData.cnpj}
            onChange={(e) => handleMaskedInputChange('cnpj', e.target.value, maskCNPJ)}
            className={errors.cnpj ? 'border-red-500' : ''}
          />
          {errors.cnpj && <p className="text-xs text-red-500">{errors.cnpj}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cidade *</label>
          <Input
            placeholder="Nome da cidade"
            value={formData.cidade}
            onChange={(e) => handleInputChange('cidade', e.target.value)}
            className={errors.cidade ? 'border-red-500' : ''}
          />
          {errors.cidade && <p className="text-xs text-red-500">{errors.cidade}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado *</label>
          <select
            value={formData.estado}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

        <div className="space-y-2">
          <label className="text-sm font-medium">População *</label>
          <Input
            type="number"
            placeholder="Ex: 50000"
            value={formData.populacao || ''}
            onChange={(e) => handleInputChange('populacao', parseInt(e.target.value) || 0)}
            className={errors.populacao ? 'border-red-500' : ''}
          />
          {errors.populacao && <p className="text-xs text-red-500">{errors.populacao}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">CEP</label>
          <Input
            placeholder="00000-000"
            value={formData.cep}
            onChange={(e) => handleMaskedInputChange('cep', e.target.value, maskCEP)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Endereço Completo</label>
        <Input
          placeholder="Rua, Avenida, número..."
          value={formData.endereco}
          onChange={(e) => handleInputChange('endereco', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600">
        <User className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Dados de Contato (Opcional)</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Informações opcionais de contato para facilitar comunicação futura. Não será criado usuário nesta etapa.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do Responsável</label>
          <Input
            placeholder="Ex: João Silva (Prefeito)"
            value={formData.responsavel_nome}
            onChange={(e) => handleInputChange('responsavel_nome', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email de Contato</label>
          <Input
            type="email"
            placeholder="contato@prefeitura.gov.br"
            value={formData.responsavel_email}
            onChange={(e) => handleInputChange('responsavel_email', e.target.value)}
            className={errors.responsavel_email ? 'border-red-500' : ''}
          />
          {errors.responsavel_email && <p className="text-xs text-red-500">{errors.responsavel_email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Telefone de Contato</label>
          <Input
            placeholder="(11) 99999-9999"
            value={formData.responsavel_telefone}
            onChange={(e) => handleMaskedInputChange('responsavel_telefone', e.target.value, maskPhone)}
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Importante</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Estas informações são apenas para contato. Para criar usuários administradores, 
              use a função específica após a criação do tenant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600">
        <CreditCard className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Seleção de Plano</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Escolha o plano mais adequado para a prefeitura. Pode ser alterado posteriormente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANOS.map((plano) => (
          <Card 
            key={plano.id}
            className={`cursor-pointer transition-all ${
              formData.plano === plano.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            } ${plano.recomendado ? 'border-green-500' : ''}`}
            onClick={() => handlePlanSelect(plano)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plano.nome}</CardTitle>
                {plano.recomendado && (
                  <Badge className="bg-green-100 text-green-800">Recomendado</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(plano.preco)}
                </span>
                <span className="text-sm text-gray-500">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plano.recursos.map((recurso, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedPlan = PLANOS.find(p => p.id === formData.plano);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-blue-600">
          <Check className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Confirmação</h3>
        </div>
        
        <p className="text-sm text-gray-600">
          Revise os dados antes de criar o tenant. Todas as informações podem ser editadas posteriormente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados da Prefeitura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Prefeitura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Nome:</strong> {formData.nome}</div>
              <div><strong>Cidade:</strong> {formData.cidade}, {formData.estado}</div>
              <div><strong>População:</strong> {formData.populacao.toLocaleString()}</div>
              <div><strong>CNPJ:</strong> {formData.cnpj}</div>
            </CardContent>
          </Card>

          {/* Dados de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Responsável:</strong> {formData.responsavel_nome || 'Não informado'}</div>
              <div><strong>Email:</strong> {formData.responsavel_email || 'Não informado'}</div>
              <div><strong>Telefone:</strong> {formData.responsavel_telefone || 'Não informado'}</div>
              <div className="text-xs text-gray-500 mt-2">
                * Dados apenas para contato, não será criado usuário
              </div>
            </CardContent>
          </Card>

          {/* Plano Selecionado */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Plano: {selectedPlan?.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">
                  {formatCurrency(selectedPlan?.preco || 0)}/mês
                </span>
                <Badge className="bg-blue-100 text-blue-800">
                  Até {formData.limite_usuarios} usuários
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.backup_automatico ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Backup automático</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.personalizacao_ativa ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Personalização</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.ssl_customizado ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>SSL customizado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.integracao_terceiros ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Integrações</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-green-900">Prefeitura Criada com Sucesso!</h3>
          <p className="text-sm text-gray-600 mt-2">
            O tenant foi criado e está pronto para uso.
          </p>
        </div>
      </div>

      {createdTenant && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Building2 className="h-5 w-5" />
              Dados do Tenant Criado
            </CardTitle>
            <CardDescription className="text-green-700">
              Informações da organização criada no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <label className="text-xs font-medium text-green-700 uppercase tracking-wide">
                  ID do Tenant
                </label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-sm">{createdTenant.id}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(createdTenant.id)}
                    className="text-green-600 border-green-200"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <label className="text-xs font-medium text-green-700 uppercase tracking-wide">
                  Código do Tenant
                </label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-sm font-bold">{createdTenant.tenant_code}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(createdTenant.tenant_code)}
                    className="text-green-600 border-green-200"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Próximo Passo: Criar Administrador</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    O tenant foi criado com sucesso. Agora você pode criar o usuário administrador 
                    usando o botão "Criar Admin" na lista de tenants.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900">Status Atual</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Tenant criado: ✅</li>
                    <li>• Administrador: ⏳ Pendente (criar separadamente)</li>
                    <li>• Status: 🏛️ Tenant sem admin</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ====================================================================
  // RENDER PRINCIPAL
  // ====================================================================

  return (
    <DialogLarge open={isOpen} onOpenChange={handleClose}>
      <DialogLargeContent>
        <DialogLargeHeader>
          <DialogLargeTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6 text-blue-600" />
            Criar Nova Prefeitura (Organização)
          </DialogLargeTitle>
          <DialogLargeDescription>
            Configure apenas os dados organizacionais. O administrador será criado separadamente.
          </DialogLargeDescription>
        </DialogLargeHeader>


        <DialogLargeBody className="scrollbar-modal">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`
                    w-12 h-0.5 mx-2 
                    ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </div>
        </DialogLargeBody>

        <DialogLargeFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 1 && step < 5 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {step < 5 && (
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
            )}
            
            {step < 4 ? (
              <Button onClick={handleNext} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Próximo'
                )}
              </Button>
            ) : step === 4 ? (
              <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Prefeitura'
                )}
              </Button>
            ) : (
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Finalizar
              </Button>
            )}
          </div>
        </DialogLargeFooter>
      </DialogLargeContent>
    </DialogLarge>
  );
};

export default CreateTenantModal;