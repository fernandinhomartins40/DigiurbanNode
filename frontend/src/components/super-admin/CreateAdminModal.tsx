import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
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

// ====================================================================
// INTERFACES
// ====================================================================

interface Tenant {
  id: string;
  nome: string;
  tenant_code: string;
  cidade: string;
  estado: string;
  has_admin?: boolean;
}

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSubmit: (adminData: {
    nome_completo: string;
    email: string;
    password: string;
    telefone?: string;
  }) => Promise<void>;
}

// ====================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ====================================================================

const validateAdminData = (data: {
  nome_completo: string;
  email: string;
  password: string;
  telefone?: string;
}) => {
  const errors: string[] = [];

  // Validar nome completo
  if (!data.nome_completo || data.nome_completo.trim().length < 2) {
    errors.push('Nome completo deve ter pelo menos 2 caracteres');
  }
  if (data.nome_completo.length > 150) {
    errors.push('Nome completo deve ter no máximo 150 caracteres');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Email deve ter formato válido');
  }

  // Validar senha
  if (!data.password || data.password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (data.password && !passwordRegex.test(data.password)) {
    errors.push('Senha deve conter ao menos: 1 maiúscula, 1 minúscula, 1 número e 1 símbolo');
  }

  // Validar telefone (opcional)
  if (data.telefone && data.telefone.trim() !== '') {
    const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(data.telefone)) {
      errors.push('Telefone deve ter formato brasileiro válido: (11) 99999-9999');
    }
  }

  return errors;
};

const maskPhone = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Aplica máscara conforme o tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@$!%*?&';

  let password = '';

  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Completar com caracteres aleatórios
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    password: '',
    telefone: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ====================================================================
  // HANDLERS
  // ====================================================================

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nome_completo: '',
        email: '',
        password: '',
        telefone: ''
      });
      setErrors([]);
      setShowPassword(false);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'telefone' ? maskPhone(value) : value
    }));

    // Limpar erros ao digitar
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateAdminData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!tenant) {
      setErrors(['Nenhum tenant selecionado']);
      return;
    }

    try {
      setLoading(true);
      setErrors([]);

      await onSubmit({
        nome_completo: formData.nome_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefone: formData.telefone.trim() || undefined
      });

      // Modal será fechado pelo componente pai

    } catch (error) {
      console.error('Erro ao criar admin:', error);
      setErrors([
        error instanceof Error ? error.message : 'Erro desconhecido ao criar administrador'
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // RENDER
  // ====================================================================

  if (!tenant) {
    return null;
  }

  return (
    <DialogLarge open={isOpen} onOpenChange={handleClose}>
      <DialogLargeContent className="max-w-2xl">
        <DialogLargeHeader>
          <DialogLargeTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Criar Administrador
          </DialogLargeTitle>
          <DialogLargeDescription>
            Criar conta de administrador para o tenant <strong>{tenant.nome}</strong>
          </DialogLargeDescription>
        </DialogLargeHeader>

        <DialogLargeBody>
          {/* Informações do Tenant */}
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Tenant Selecionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p className="text-gray-900">{tenant.nome}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Código:</span>
                  <p className="text-gray-900">{tenant.tenant_code}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Localização:</span>
                  <p className="text-gray-900">{tenant.cidade}, {tenant.estado}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status Admin:</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    Sem Administrador
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  placeholder="Nome completo do administrador"
                  className="pl-9"
                  disabled={loading}
                  maxLength={150}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Senha segura"
                  className="pl-9 pr-20"
                  disabled={loading}
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleGeneratePassword}
                    disabled={loading}
                    className="h-6 px-2 text-xs"
                  >
                    Gerar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    {showPassword ?
                      <EyeOff className="h-3 w-3" /> :
                      <Eye className="h-3 w-3" />
                    }
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo
              </p>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="pl-9"
                  disabled={loading}
                  maxLength={15}
                />
              </div>
            </div>

            {/* Mensagens de Erro */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Corrija os seguintes erros:
                    </h4>
                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Aviso de Segurança */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Importante:</p>
                  <p>O administrador criado poderá fazer login imediatamente. Certifique-se de compartilhar as credenciais de forma segura.</p>
                </div>
              </div>
            </div>
          </form>
        </DialogLargeBody>

        <DialogLargeFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando Admin...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Criar Administrador
              </>
            )}
          </Button>
        </DialogLargeFooter>
      </DialogLargeContent>
    </DialogLarge>
  );
};

export default CreateAdminModal;