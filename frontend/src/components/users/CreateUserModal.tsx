// =====================================================
// MODAL DE CRIAÇÃO DE USUÁRIOS HIERÁRQUICOS
// =====================================================

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  XMarkIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/auth';
import { useUserCreationPermissions } from "@/hooks/useUserCreationPermissions";
import { HierarchicalUserService, CreateUserData } from "@/services/hierarchicalUserService";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

// =====================================================
// INTERFACES
// =====================================================

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  prefilledData?: Partial<CreateUserData>;
}

interface FormData {
  email: string;
  nomeCompleto: string;
  tipoUsuario: string;
  tenantId: string;
  secretariaId: string;
  setorId: string;
  cpf: string;
  telefone: string;
  cargo: string;
  sendEmail: boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledData
}) => {
  const { profile: user } = useAuth();
  const { creatableTypes, loading: permissionsLoading } = useUserCreationPermissions();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [formData, setFormData] = useState<FormData>({
    email: '',
    nomeCompleto: '',
    tipoUsuario: '',
    tenantId: profile?.tenant_id || '',
    secretariaId: profile?.secretaria_id || '',
    setorId: '',
    cpf: '',
    telefone: '',
    cargo: '',
    sendEmail: true
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    if (isOpen) {
      // Reset form quando abrir
      setFormData({
        email: prefilledData?.email || '',
        nomeCompleto: prefilledData?.nomeCompleto || '',
        tipoUsuario: prefilledData?.tipoUsuario || '',
        tenantId: prefilledData?.tenantId || profile?.tenant_id || '',
        secretariaId: prefilledData?.secretariaId || profile?.secretaria_id || '',
        setorId: prefilledData?.setorId || '',
        cpf: prefilledData?.cpf || '',
        telefone: prefilledData?.telefone || '',
        cargo: prefilledData?.cargo || '',
        sendEmail: prefilledData?.sendEmail ?? true
      });
      setResult(null);
      loadSecretarias();
    }
  }, [isOpen, prefilledData, profile]);

  useEffect(() => {
    if (formData.secretariaId) {
      loadSetores(formData.secretariaId);
    }
  }, [formData.secretariaId]);

  // =====================================================
  // FUNÇÕES DE CARREGAMENTO
  // =====================================================

  const loadSecretarias = async () => {
    try {
      // Carregar secretarias do tenant
      // TODO: implementar busca das secretarias
    } catch (error) {
      console.error('Erro ao carregar secretarias:', error);
    }
  };

  const loadSetores = async (secretariaId: string) => {
    try {
      // Carregar setores da secretaria
      // TODO: implementar busca dos setores
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
    }
  };

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.nomeCompleto || !formData.tipoUsuario) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const userData: CreateUserData = {
        email: formData.email,
        nomeCompleto: formData.nomeCompleto,
        tipoUsuario: formData.tipoUsuario,
        tenantId: formData.tenantId || undefined,
        secretariaId: formData.secretariaId || undefined,
        setorId: formData.setorId || undefined,
        cpf: formData.cpf || undefined,
        telefone: formData.telefone || undefined,
        cargo: formData.cargo || undefined,
        sendEmail: formData.sendEmail
      };

      const result = await HierarchicalUserService.createUser(userData);
      
      if (result.success) {
        setResult(result);
        onSuccess?.(result);
        
        // Não fechar automaticamente para mostrar as credenciais
        toast.success('Usuário criado com sucesso!');
      } else {
        toast.error(result.message);
      }

    } catch (error: Error | unknown) {
      console.error('Erro ao criar usuário:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const copyPassword = () => {
    if (result?.temporary_password) {
      navigator.clipboard.writeText(result.temporary_password);
      toast.success('Senha copiada para a área de transferência!');
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header */}
                <Dialog.Title as="div" className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <UserPlusIcon className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Criar Novo Usuário
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </Dialog.Title>

                {/* Success Result */}
                {result && result.success && (
                  <Card className="mb-6 border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircleIcon className="h-5 w-5" />
                        Usuário Criado com Sucesso!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-green-700">Email:</Label>
                        <p className="text-green-900">{result.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-green-700">Senha Provisória:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={result.temporary_password}
                            readOnly
                            className="bg-white"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyPassword}
                          >
                            Copiar
                          </Button>
                        </div>
                      </div>
                      <Alert>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Importante:</strong> Anote essas credenciais! A senha provisória expira em 30 dias 
                          e o usuário deve alterá-la no primeiro login.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Form */}
                {!result && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Tipo de Usuário */}
                    <div>
                      <Label htmlFor="tipoUsuario">Tipo de Usuário *</Label>
                      <Select 
                        value={formData.tipoUsuario} 
                        onValueChange={(value) => handleChange('tipoUsuario', value)}
                        disabled={loading || permissionsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {creatableTypes.map(type => (
                            <SelectItem key={type.tipo_usuario} value={type.tipo_usuario}>
                              <div className="flex items-center gap-2">
                                <span>{type.descricao}</span>
                                {type.tenant_limitado && (
                                  <span className="text-xs text-gray-500">(mesmo tenant)</span>
                                )}
                                {type.secretaria_limitada && (
                                  <span className="text-xs text-gray-500">(mesma secretaria)</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dados Básicos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                        <Input
                          id="nomeCompleto"
                          type="text"
                          value={formData.nomeCompleto}
                          onChange={(e) => handleChange('nomeCompleto', e.target.value)}
                          placeholder="Nome completo do usuário"
                          disabled={loading}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="email@exemplo.com"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    {/* Dados Complementares */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => handleChange('cpf', e.target.value)}
                          placeholder="000.000.000-00"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          type="text"
                          value={formData.telefone}
                          onChange={(e) => handleChange('telefone', e.target.value)}
                          placeholder="(00) 00000-0000"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => handleChange('cargo', e.target.value)}
                        placeholder="Cargo do usuário"
                        disabled={loading}
                      />
                    </div>

                    {/* Opções */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendEmail"
                        checked={formData.sendEmail}
                        onCheckedChange={(checked) => handleChange('sendEmail', checked)}
                      />
                      <Label htmlFor="sendEmail">
                        Enviar credenciais por email
                      </Label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
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
                        disabled={loading || permissionsLoading || creatableTypes.length === 0}
                      >
                        {loading ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Close Button when showing result */}
                {result && (
                  <div className="flex justify-end pt-6 border-t">
                    <Button onClick={handleClose}>
                      Fechar
                    </Button>
                  </div>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};