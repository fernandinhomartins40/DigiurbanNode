// ====================================================================
// 🏛️ REGISTRO DE TENANT - DIGIURBAN AUTH SYSTEM
// ====================================================================
// Componente para registro de prefeituras usando sistema JWT local
// Formulário multi-step com validação completa e UX otimizada
// ====================================================================

import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '@/auth/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Building, Mail, Lock, User, Phone, MapPin, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// ====================================================================
// INTERFACES
// ====================================================================

interface TenantFormData {
  // Dados do tenant
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  plano: 'basico' | 'profissional' | 'empresarial';
  
  // Dados do admin
  admin_nome_completo: string;
  admin_email: string;
  admin_password: string;
  admin_confirm_password: string;
}

interface TenantFormErrors {
  [key: string]: string;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export const RegisterTenant: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantFormData>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    plano: 'basico',
    admin_nome_completo: '',
    admin_email: '',
    admin_password: '',
    admin_confirm_password: ''
  });
  
  const [errors, setErrors] = useState<TenantFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const totalSteps = 2;

  // ================================================================
  // VALIDAÇÃO DO FORMULÁRIO
  // ================================================================

  const validateStep1 = useCallback((data: TenantFormData): TenantFormErrors => {
    const errors: TenantFormErrors = {};

    // Validar nome da prefeitura
    if (!data.nome.trim()) {
      errors.nome = 'Nome da prefeitura é obrigatório';
    } else if (data.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    // Validar email institucional
    if (!data.email.trim()) {
      errors.email = 'Email institucional é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email deve ter formato válido';
    }

    // Validar telefone (opcional, mas se preenchido deve ser válido)
    if (data.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(data.telefone)) {
      errors.telefone = 'Telefone deve ter formato válido: (00) 0000-0000';
    }

    // Validar plano
    if (!['basico', 'profissional', 'empresarial'].includes(data.plano)) {
      errors.plano = 'Selecione um plano válido';
    }

    return errors;
  }, []);

  const validateStep2 = useCallback((data: TenantFormData): TenantFormErrors => {
    const errors: TenantFormErrors = {};

    // Validar nome do administrador
    if (!data.admin_nome_completo.trim()) {
      errors.admin_nome_completo = 'Nome do administrador é obrigatório';
    } else if (data.admin_nome_completo.trim().length < 2) {
      errors.admin_nome_completo = 'Nome deve ter pelo menos 2 caracteres';
    } else if (data.admin_nome_completo.trim().split(' ').length < 2) {
      errors.admin_nome_completo = 'Digite o nome completo';
    }

    // Validar email do administrador
    if (!data.admin_email.trim()) {
      errors.admin_email = 'Email do administrador é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.admin_email)) {
      errors.admin_email = 'Email deve ter formato válido';
    }

    // Validar senha do administrador
    if (!data.admin_password) {
      errors.admin_password = 'Senha é obrigatória';
    } else {
      const passwordErrors = [];
      
      if (data.admin_password.length < 8) {
        passwordErrors.push('pelo menos 8 caracteres');
      }
      if (!/[a-z]/.test(data.admin_password)) {
        passwordErrors.push('uma letra minúscula');
      }
      if (!/[A-Z]/.test(data.admin_password)) {
        passwordErrors.push('uma letra maiúscula');
      }
      if (!/\d/.test(data.admin_password)) {
        passwordErrors.push('um número');
      }
      if (!/[@$!%*?&]/.test(data.admin_password)) {
        passwordErrors.push('um símbolo (@$!%*?&)');
      }
      
      if (passwordErrors.length > 0) {
        errors.admin_password = `Senha deve ter ${passwordErrors.join(', ')}`;
      }
    }

    // Validar confirmação de senha
    if (!data.admin_confirm_password) {
      errors.admin_confirm_password = 'Confirmação de senha é obrigatória';
    } else if (data.admin_password !== data.admin_confirm_password) {
      errors.admin_confirm_password = 'Senhas não coincidem';
    }

    return errors;
  }, []);

  // ================================================================
  // HANDLERS DOS EVENTOS
  // ================================================================

  const handleInputChange = useCallback((field: keyof TenantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro específico quando usuário corrigir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const formatPhone = useCallback((value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('telefone', formatted);
  }, [formatPhone, handleInputChange]);

  const handleNextStep = useCallback(() => {
    const validationErrors = currentStep === 1 ? validateStep1(formData) : {};
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [currentStep, formData, validateStep1]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validar step atual
      const validationErrors = validateStep2(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Limpar erros
      setErrors({});

      // Preparar dados para envio
      const tenantData = {
        nome: formData.nome.trim(),
        email: formData.email.toLowerCase().trim(),
        telefone: formData.telefone,
        endereco: formData.endereco.trim(),
        plano: formData.plano,
        admin_nome_completo: formData.admin_nome_completo.trim(),
        admin_email: formData.admin_email.toLowerCase().trim(),
        admin_password: formData.admin_password
      };

      // Registrar tenant
      const result = await AuthService.registerTenant(tenantData);

      if (result.success) {
        setIsRegistered(true);
        toast.success('Prefeitura cadastrada com sucesso!');
      } else {
        throw new Error(result.error || 'Erro no cadastro');
      }

    } catch (error) {
      console.error('Erro no registro do tenant:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro no cadastro';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateStep2]);

  const togglePasswordVisibility = useCallback((field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  }, []);

  // ================================================================
  // RENDER - TELA DE SUCESSO
  // ================================================================

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl text-center">
            <CardContent className="pt-8 pb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Prefeitura Cadastrada!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Sua prefeitura foi cadastrada com sucesso. O administrador receberá um email para ativar a conta.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/auth/login')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Acessar Sistema
                </Button>
                
                <Link 
                  to="/auth/login"
                  className="block text-sm text-gray-500 hover:text-gray-700"
                >
                  Voltar ao login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ================================================================
  // RENDER - FORMULÁRIO
  // ================================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Prefeitura</h1>
          <p className="text-gray-600 mt-2">Digitalize sua gestão municipal</p>
        </div>

        {/* Indicador de progresso */}
        <div className="flex items-center justify-center mb-8">
          {Array.from({ length: totalSteps }, (_, index) => (
            <React.Fragment key={index}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center justify-center mb-6 text-sm text-gray-600">
          <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>
            1. Dados da Prefeitura
          </span>
          <span className="mx-4">•</span>
          <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>
            2. Administrador
          </span>
        </div>

        {/* Card do formulário */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentStep === 1 ? 'Dados da Prefeitura' : 'Dados do Administrador'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 
                ? 'Informe os dados institucionais da prefeitura'
                : 'Crie a conta do administrador do sistema'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {/* Erro geral */}
              {errors.general && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Step 1 - Dados da Prefeitura */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Nome da Prefeitura */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium">
                      Nome da Prefeitura *
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Prefeitura Municipal de..."
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className={`pl-10 ${errors.nome ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.nome && (
                      <p className="text-sm text-red-600">{errors.nome}</p>
                    )}
                  </div>

                  {/* Email Institucional */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Institucional *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@prefeitura.gov.br"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-sm font-medium">
                      Telefone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="telefone"
                        type="text"
                        placeholder="(00) 0000-0000"
                        value={formData.telefone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`pl-10 ${errors.telefone ? 'border-red-500' : ''}`}
                        maxLength={15}
                      />
                    </div>
                    {errors.telefone && (
                      <p className="text-sm text-red-600">{errors.telefone}</p>
                    )}
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-sm font-medium">
                      Endereço
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="endereco"
                        type="text"
                        placeholder="Rua, número, bairro, cidade"
                        value={formData.endereco}
                        onChange={(e) => handleInputChange('endereco', e.target.value)}
                        className={`pl-10 ${errors.endereco ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.endereco && (
                      <p className="text-sm text-red-600">{errors.endereco}</p>
                    )}
                  </div>

                  {/* Plano */}
                  <div className="space-y-2">
                    <Label htmlFor="plano" className="text-sm font-medium">
                      Plano *
                    </Label>
                    <Select
                      value={formData.plano}
                      onValueChange={(value) => handleInputChange('plano', value as typeof formData.plano)}
                    >
                      <SelectTrigger className={errors.plano ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">
                          <div className="flex flex-col">
                            <span className="font-medium">Básico</span>
                            <span className="text-xs text-gray-500">Para cidades até 20.000 habitantes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="profissional">
                          <div className="flex flex-col">
                            <span className="font-medium">Profissional</span>
                            <span className="text-xs text-gray-500">Para cidades até 100.000 habitantes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="empresarial">
                          <div className="flex flex-col">
                            <span className="font-medium">Empresarial</span>
                            <span className="text-xs text-gray-500">Para cidades acima de 100.000 habitantes</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.plano && (
                      <p className="text-sm text-red-600">{errors.plano}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 - Dados do Administrador */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* Nome do Administrador */}
                  <div className="space-y-2">
                    <Label htmlFor="admin_nome_completo" className="text-sm font-medium">
                      Nome Completo do Administrador *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin_nome_completo"
                        type="text"
                        placeholder="Nome completo do administrador"
                        value={formData.admin_nome_completo}
                        onChange={(e) => handleInputChange('admin_nome_completo', e.target.value)}
                        className={`pl-10 ${errors.admin_nome_completo ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.admin_nome_completo && (
                      <p className="text-sm text-red-600">{errors.admin_nome_completo}</p>
                    )}
                  </div>

                  {/* Email do Administrador */}
                  <div className="space-y-2">
                    <Label htmlFor="admin_email" className="text-sm font-medium">
                      Email do Administrador *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin_email"
                        type="email"
                        placeholder="admin@prefeitura.gov.br"
                        value={formData.admin_email}
                        onChange={(e) => handleInputChange('admin_email', e.target.value)}
                        className={`pl-10 ${errors.admin_email ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.admin_email && (
                      <p className="text-sm text-red-600">{errors.admin_email}</p>
                    )}
                  </div>

                  {/* Senha do Administrador */}
                  <div className="space-y-2">
                    <Label htmlFor="admin_password" className="text-sm font-medium">
                      Senha *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin_password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha forte"
                        value={formData.admin_password}
                        onChange={(e) => handleInputChange('admin_password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.admin_password ? 'border-red-500' : ''}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.admin_password && (
                      <p className="text-sm text-red-600">{errors.admin_password}</p>
                    )}
                  </div>

                  {/* Confirmar Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="admin_confirm_password" className="text-sm font-medium">
                      Confirmar Senha *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin_confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Digite a senha novamente"
                        value={formData.admin_confirm_password}
                        onChange={(e) => handleInputChange('admin_confirm_password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.admin_confirm_password ? 'border-red-500' : ''}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.admin_confirm_password && (
                      <p className="text-sm text-red-600">{errors.admin_confirm_password}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de navegação */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                ) : (
                  <Link to="/auth/login">
                    <Button variant="outline" type="button">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao Login
                    </Button>
                  </Link>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4 mr-2" />
                        Cadastrar Prefeitura
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Links adicionais */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <span>Já tem conta? </span>
              <Link 
                to="/auth/login" 
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Digiurban. Transformando a gestão municipal.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterTenant;