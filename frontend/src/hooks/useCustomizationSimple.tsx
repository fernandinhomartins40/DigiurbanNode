/**
 * HOOK DE CUSTOMIZAÇÃO SIMPLIFICADO - SEM SUPABASE
 * 
 * Implementação básica que pode ser expandida conforme necessário.
 * Remove todas as dependências do Supabase.
 */

import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

export interface TenantBranding {
  id: string;
  tenant_id: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  cor_acento: string;
  nome_sistema: string;
  mostrar_powered_by: boolean;
}

export const useCustomizationSimple = () => {
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Por enquanto, usar configurações padrão
  const defaultBranding: TenantBranding = {
    id: 'default',
    tenant_id: 'default',
    logo_url: null,
    cor_primaria: '#0ea5e9', // sky-500
    cor_secundaria: '#64748b', // slate-500
    cor_acento: '#10b981', // emerald-500
    nome_sistema: 'DigiUrban',
    mostrar_powered_by: true
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      
      // Futuramente, implementar endpoint de customização
      // Por enquanto, usar valores padrão
      setBranding(defaultBranding);
      
    } catch (error) {
      console.warn('Erro ao carregar customização:', error);
      setBranding(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = async (updates: Partial<TenantBranding>) => {
    try {
      setLoading(true);
      
      // Futuramente, implementar endpoint de atualização
      console.log('Atualizando branding:', updates);
      
      setBranding(prev => prev ? { ...prev, ...updates } : defaultBranding);
      
    } catch (error) {
      console.error('Erro ao atualizar customização:', error);
      setError('Erro ao atualizar customização');
    } finally {
      setLoading(false);
    }
  };

  return {
    branding: branding || defaultBranding,
    loading,
    error,
    loadBranding,
    updateBranding,
    
    // Helpers
    getPrimaryColor: () => branding?.cor_primaria || defaultBranding.cor_primaria,
    getSecondaryColor: () => branding?.cor_secundaria || defaultBranding.cor_secundaria,
    getAccentColor: () => branding?.cor_acento || defaultBranding.cor_acento,
    getSystemName: () => branding?.nome_sistema || defaultBranding.nome_sistema,
    shouldShowPoweredBy: () => branding?.mostrar_powered_by ?? defaultBranding.mostrar_powered_by
  };
};

export default useCustomizationSimple;