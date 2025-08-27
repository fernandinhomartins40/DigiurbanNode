import { supabase } from './supabase';
import { servicesCache, organizationCache, CacheKeys } from './cache';

// =====================================================
// TIPOS DE DADOS
// =====================================================

export interface Secretaria {
  id: string;
  codigo: string;
  nome: string;
  sigla: string;
  descricao?: string;
  responsavel_id?: string;
  email_oficial?: string;
  telefone?: string;
  endereco?: any;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicoMunicipal {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  secretaria_responsavel_id: string;
  setor_responsavel_id?: string;
  requer_documentos: boolean;
  documentos_necessarios: string[];
  prazo_resposta_dias: number;
  prazo_resolucao_dias: number;
  taxa_servico: number;
  status: 'ativo' | 'inativo' | 'em_revisao';
  requer_aprovacao_admin: boolean;
  aprovado_por?: string;
  aprovado_em?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relacionamentos
  secretaria?: Secretaria;
}

// =====================================================
// SERVIÇO DE SECRETARIAS
// =====================================================

export const secretariasService = {
  // Listar todas as secretarias ativas
  async listarAtivas(): Promise<Secretaria[]> {
    return organizationCache.getOrSet(
      CacheKeys.secretariasAtivas(),
      async () => {
        const { data, error } = await supabase
          .from('secretarias')
          .select('*')
          .eq('ativa', true)
          .order('nome');

        if (error) throw error;
        return data || [];
      },
      60 * 60 * 1000 // 1 hora - dados estruturais mudam pouco
    );
  },

  // Buscar secretaria por ID
  async buscarPorId(id: string): Promise<Secretaria | null> {
    return organizationCache.getOrSet(
      CacheKeys.secretaria(id),
      async () => {
        const { data, error } = await supabase
          .from('secretarias')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        return data;
      },
      60 * 60 * 1000 // 1 hora
    );
  },

  // Criar nova secretaria (apenas admins)
  async criar(dadosSecretaria: Omit<Secretaria, 'id' | 'created_at' | 'updated_at'>): Promise<Secretaria> {
    const { data, error } = await supabase
      .from('secretarias')
      .insert(dadosSecretaria)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar secretaria
  async atualizar(id: string, dadosSecretaria: Partial<Secretaria>): Promise<Secretaria> {
    const { data, error } = await supabase
      .from('secretarias')
      .update(dadosSecretaria)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// SERVIÇO DE SERVIÇOS MUNICIPAIS
// =====================================================

export const servicosService = {
  // Listar todos os serviços ativos
  async listarAtivos(categoria?: string): Promise<ServicoMunicipal[]> {
    const cacheKey = categoria ? 
      CacheKeys.servicosAtivos(categoria) : 
      CacheKeys.servicosAtivos();

    return servicesCache.getOrSet(
      cacheKey,
      async () => {
        let query = supabase
          .from('servicos_municipais')
          .select(`
            *,
            secretaria:secretarias(*)
          `)
          .eq('status', 'ativo');

        if (categoria) {
          query = query.eq('categoria', categoria);
        }

        const { data, error } = await query.order('nome');

        if (error) throw error;
        return data || [];
      },
      10 * 60 * 1000 // 10 minutos
    );
  },

  // Buscar serviço por ID
  async buscarPorId(id: string): Promise<ServicoMunicipal | null> {
    const { data, error } = await supabase
      .from('servicos_municipais')
      .select(`
        *,
        secretaria:secretarias(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Buscar serviços por secretaria
  async listarPorSecretaria(secretariaId: string): Promise<ServicoMunicipal[]> {
    const { data, error } = await supabase
      .from('servicos_municipais')
      .select(`
        *,
        secretaria:secretarias(*)
      `)
      .eq('secretaria_responsavel_id', secretariaId)
      .eq('status', 'ativo')
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  // Buscar categorias únicas
  async listarCategorias(): Promise<string[]> {
    const { data, error } = await supabase
      .from('servicos_municipais')
      .select('categoria')
      .eq('status', 'ativo')
      .order('categoria');

    if (error) throw error;
    
    const categorias = [...new Set(data?.map(item => item.categoria) || [])];
    return categorias;
  },

  // Criar novo serviço (apenas secretários e admins)
  async criar(dadosServico: Omit<ServicoMunicipal, 'id' | 'created_at' | 'updated_at' | 'secretaria'>): Promise<ServicoMunicipal> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('servicos_municipais')
      .insert({
        ...dadosServico,
        created_by: user.user?.id
      })
      .select(`
        *,
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar serviço
  async atualizar(id: string, dadosServico: Partial<ServicoMunicipal>): Promise<ServicoMunicipal> {
    const { data, error } = await supabase
      .from('servicos_municipais')
      .update(dadosServico)
      .eq('id', id)
      .select(`
        *,
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Aprovar serviço (apenas admins)
  async aprovar(id: string, observacoes?: string): Promise<ServicoMunicipal> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('servicos_municipais')
      .update({
        status: 'ativo' as const,
        aprovado_por: user.user?.id,
        aprovado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Rejeitar serviço (apenas admins)
  async rejeitar(id: string, motivo: string): Promise<ServicoMunicipal> {
    const { data, error } = await supabase
      .from('servicos_municipais')
      .update({
        status: 'inativo' as const
      })
      .eq('id', id)
      .select(`
        *,
        secretaria:secretarias(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// UTILITÁRIOS
// =====================================================

export const servicosUtils = {
  // Formatar categoria para exibição
  formatarCategoria(categoria: string): string {
    const categorias: Record<string, string> = {
      'financas': 'Finanças',
      'saude': 'Saúde',
      'educacao': 'Educação',
      'obras': 'Obras e Urbanismo',
      'meio-ambiente': 'Meio Ambiente',
      'assistencia-social': 'Assistência Social',
      'seguranca': 'Segurança',
      'cultura': 'Cultura',
      'esportes': 'Esportes',
      'turismo': 'Turismo',
      'agricultura': 'Agricultura',
      'habitacao': 'Habitação'
    };
    
    return categorias[categoria] || categoria;
  },

  // Calcular prazo final baseado no prazo em dias
  calcularPrazoFinal(dias: number): Date {
    const agora = new Date();
    agora.setDate(agora.getDate() + dias);
    return agora;
  },

  // Verificar se serviço requer documentos
  verificarDocumentosObrigatorios(servico: ServicoMunicipal): boolean {
    return servico.requer_documentos && servico.documentos_necessarios.length > 0;
  },

  // Formatar taxa do serviço
  formatarTaxa(taxa: number): string {
    if (taxa === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(taxa);
  }
};

// =====================================================
// HOOK PARA INTEGRAÇÃO COM REACT
// =====================================================

import { useState, useEffect } from 'react';

export const useServicos = (categoria?: string) => {
  const [servicos, setServicos] = useState<ServicoMunicipal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarServicos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicosService.listarAtivos(categoria);
        setServicos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    carregarServicos();
  }, [categoria]);

  const recarregar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicosService.listarAtivos(categoria);
      setServicos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  return {
    servicos,
    loading,
    error,
    recarregar
  };
};

export const useSecretarias = () => {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarSecretarias = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await secretariasService.listarAtivas();
        setSecretarias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar secretarias');
      } finally {
        setLoading(false);
      }
    };

    carregarSecretarias();
  }, []);

  return {
    secretarias,
    loading,
    error
  };
};