import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Users,
  FileText,
  Database,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

// ====================================================================
// INTERFACES
// ====================================================================

interface Tenant {
  id: string;
  nome: string;
  tenant_code: string;
  cidade: string;
  estado: string;
  usuarios_ativos: number;
  protocolos_mes: number;
  status: 'ativo' | 'inativo' | 'suspenso' | 'trial';
  plano: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

interface DeleteTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onConfirm: (tenantId: string) => void;
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

const DeleteTenantModal: React.FC<DeleteTenantModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState(1);

  const handleConfirm = async () => {
    if (!tenant) {
      console.error('❌ Erro: Nenhum tenant selecionado para exclusão');
      return;
    }
    
    if (!tenant.id || tenant.id.trim() === '') {
      console.error('❌ Erro: ID do tenant é inválido:', tenant.id);
      alert('Erro: ID do tenant não é válido');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🗑️ Excluindo tenant:', tenant.nome, '(ID:', tenant.id, ')');
      await onConfirm(tenant.id);
      handleClose();
    } catch (error: Error | unknown) {
      console.error('❌ Erro ao excluir tenant:', error);
      const errorMessage = error?.message || error || 'Erro desconhecido';
      alert(`Erro ao excluir: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setConfirmText('');
    setLoading(false);
    onClose();
  };

  const isConfirmValid = confirmText.toLowerCase() === tenant?.nome.toLowerCase();

  if (!tenant) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-2rem)] mx-4 my-2 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-900">Excluir Prefeitura</div>
              <div className="text-sm text-gray-500 font-normal">Ação irreversível</div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-red-600">
            Esta ação é permanente e não pode ser desfeita. Todos os dados serão perdidos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-modal">
          {step === 1 && (
            <div className="space-y-6">
              {/* Informações do Tenant */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">{tenant.nome}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(tenant.status)}>
                      {tenant.status?.toUpperCase() || 'INDEFINIDO'}
                    </Badge>
                    <Badge className={getPlanColor(tenant.plano)}>
                      {tenant.plano}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-red-700">
                  <div><strong>Código:</strong> {tenant.tenant_code}</div>
                  <div><strong>Localização:</strong> {tenant.cidade}, {tenant.estado}</div>
                </div>
              </CardContent>
            </Card>

            {/* Impactos da Exclusão */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-red-600" />
                Dados que serão PERMANENTEMENTE excluídos:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-900">
                      {formatNumber(tenant.usuarios_ativos)}
                    </div>
                    <div className="text-xs text-red-600">Usuários</div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-900">
                      {formatNumber(tenant.protocolos_mes)}
                    </div>
                    <div className="text-xs text-red-600">Protocolos/Mês</div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardContent className="p-4 text-center">
                    <Database className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-900">
                      TODOS
                    </div>
                    <div className="text-xs text-red-600">Dados históricos</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Avisos importantes */}
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">⚠️ ATENÇÃO - Esta exclusão irá:</h4>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Remover todos os {tenant.usuarios_ativos} usuários do sistema</li>
                  <li>Excluir permanentemente todos os protocolos e documentos</li>
                  <li>Apagar todo o histórico e dados analíticos</li>
                  <li>Cancelar a assinatura e cobrança do plano {tenant.plano}</li>
                  <li>Desativar integrações e backups automaticamente</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">💡 Alternativas:</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li><strong>Suspender:</strong> Desativa temporariamente sem perder dados</li>
                  <li><strong>Inativar:</strong> Mantém dados mas bloqueia acesso</li>
                  <li><strong>Fazer backup:</strong> Exportar dados antes da exclusão</li>
                </ul>
              </div>
            </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-900">Confirmação Final</h3>
                <p className="text-sm text-red-600 mt-2">
                  Digite exatamente o nome da prefeitura para confirmar a exclusão:
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm text-red-600 font-mono">
                  {tenant.nome}
                </div>
              </div>
              
              <Input
                placeholder="Digite o nome da prefeitura aqui"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={`text-center ${isConfirmValid ? 'border-green-500' : 'border-red-500'}`}
                disabled={loading}
              />
              
              {confirmText && !isConfirmValid && (
                <p className="text-xs text-red-500">
                  O nome não confere. Digite exatamente: {tenant.nome}
                </p>
              )}
            </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          
          <div className="flex gap-2">
            {step === 1 && (
              <Button 
                variant="destructive"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Continuar Exclusão
              </Button>
            )}
            
            {step === 2 && (
              <Button 
                variant="destructive"
                onClick={handleConfirm}
                disabled={loading || !isConfirmValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    EXCLUIR DEFINITIVAMENTE
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTenantModal;