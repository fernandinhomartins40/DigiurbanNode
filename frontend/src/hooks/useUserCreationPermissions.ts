// =====================================================
// HOOK PARA PERMISSÕES DE CRIAÇÃO DE USUÁRIOS
// =====================================================

import { useState, useEffect } from 'react';
import { HierarchicalUserService, CreatableUserType } from '../services/hierarchicalUserService';
import { useAuth } from '@/auth';

// =====================================================
// INTERFACES
// =====================================================

interface UseUserCreationPermissionsReturn {
  creatableTypes: CreatableUserType[];
  loading: boolean;
  error: string | null;
  canCreateType: (tipo: string) => boolean;
  canCreateInTenant: (tipo: string, tenantId?: string) => boolean;
  canCreateInSecretaria: (tipo: string, tenantId?: string, secretariaId?: string) => boolean;
  hasAnyCreationPermission: boolean;
  refresh: () => void;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useUserCreationPermissions = (): UseUserCreationPermissionsReturn => {
  const { profile: user } = useAuth();
  const [creatableTypes, setCreatableTypes] = useState<CreatableUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // CARREGAR PERMISSÕES
  // =====================================================

  const loadPermissions = async () => {
    if (!user) {
      setCreatableTypes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const types = await HierarchicalUserService.getCreatableUserTypes();
      setCreatableTypes(types);

      console.log('✅ Permissões carregadas:', types);
      
    } catch (err: Error | unknown) {
      console.error('❌ Erro ao carregar permissões:', err);
      setError(err.message);
      setCreatableTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    loadPermissions();
  }, [user]);

  // =====================================================
  // FUNÇÕES DE VERIFICAÇÃO
  // =====================================================

  /**
   * Verificar se pode criar um tipo específico
   */
  const canCreateType = (tipo: string): boolean => {
    return creatableTypes.some(t => t.tipo_usuario === tipo);
  };

  /**
   * Verificar se pode criar tipo em tenant específico
   */
  const canCreateInTenant = (tipo: string, tenantId?: string): boolean => {
    const permission = creatableTypes.find(t => t.tipo_usuario === tipo);
    
    if (!permission) {
      return false;
    }

    // Se não há limitação de tenant, pode criar
    if (!permission.tenant_limitado) {
      return true;
    }

    // Se tem limitação, verificar se é o mesmo tenant do usuário
    if (tenantId && user?.tenantId) {
      return tenantId === user.tenantId;
    }

    // Se não especificou tenant, usar o do usuário atual
    return true;
  };

  /**
   * Verificar se pode criar tipo em secretaria específica
   */
  const canCreateInSecretaria = (
    tipo: string, 
    tenantId?: string, 
    secretariaId?: string
  ): boolean => {
    const permission = creatableTypes.find(t => t.tipo_usuario === tipo);
    
    if (!permission) {
      return false;
    }

    // Verificar tenant primeiro
    if (!canCreateInTenant(tipo, tenantId)) {
      return false;
    }

    // Se não há limitação de secretaria, pode criar
    if (!permission.secretaria_limitada) {
      return true;
    }

    // Se tem limitação, verificar se é a mesma secretaria do usuário
    if (secretariaId && user?.departmentId) {
      return secretariaId === user.departmentId;
    }

    // Se não especificou secretaria, usar a do usuário atual
    return true;
  };

  /**
   * Verificar se tem alguma permissão de criação
   */
  const hasAnyCreationPermission = creatableTypes.length > 0;

  /**
   * Função para refresh das permissões
   */
  const refresh = () => {
    loadPermissions();
  };

  // =====================================================
  // RETURN
  // =====================================================

  return {
    creatableTypes,
    loading,
    error,
    canCreateType,
    canCreateInTenant,
    canCreateInSecretaria,
    hasAnyCreationPermission,
    refresh
  };
};

// =====================================================
// HOOK PARA VERIFICAÇÕES ESPECÍFICAS
// =====================================================

export const useCanCreateUser = () => {
  const { user } = useAuth();
  const { canCreateType, canCreateInTenant, canCreateInSecretaria } = useUserCreationPermissions();

  /**
   * Verificar se pode criar usuário com dados específicos
   */
  const canCreate = async (
    tipo: string,
    tenantId?: string,
    secretariaId?: string
  ): Promise<boolean> => {
    // Verificação básica por tipo
    if (!canCreateType(tipo)) {
      return false;
    }

    // Verificação por tenant
    if (!canCreateInTenant(tipo, tenantId)) {
      return false;
    }

    // Verificação por secretaria
    if (!canCreateInSecretaria(tipo, tenantId, secretariaId)) {
      return false;
    }

    // Verificação adicional via API para casos complexos
    try {
      return await HierarchicalUserService.canCreateUserType(
        tipo,
        tenantId,
        secretariaId
      );
    } catch (error) {
      console.error('❌ Erro na verificação de permissão:', error);
      return false;
    }
  };

  /**
   * Obter mensagem explicativa sobre limitações
   */
  const getPermissionMessage = (tipo: string): string => {
    const { creatableTypes } = useUserCreationPermissions();
    const permission = creatableTypes.find(t => t.tipo_usuario === tipo);

    if (!permission) {
      return 'Você não tem permissão para criar este tipo de usuário';
    }

    if (permission.tenant_limitado && permission.secretaria_limitada) {
      return `Você pode criar ${HierarchicalUserService.getUserTypeLabel(tipo)} apenas no seu tenant e secretaria`;
    }

    if (permission.tenant_limitado) {
      return `Você pode criar ${HierarchicalUserService.getUserTypeLabel(tipo)} apenas no seu tenant`;
    }

    if (permission.secretaria_limitada) {
      return `Você pode criar ${HierarchicalUserService.getUserTypeLabel(tipo)} apenas na sua secretaria`;
    }

    return `Você pode criar ${HierarchicalUserService.getUserTypeLabel(tipo)} sem restrições`;
  };

  return {
    canCreate,
    getPermissionMessage
  };
};