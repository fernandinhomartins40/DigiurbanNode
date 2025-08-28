/**
 * HOOKS SIMPLIFICADOS - SEM DEPENDÊNCIA DO SUPABASE
 * 
 * Implementações básicas para substituir os hooks que dependem do Supabase.
 * Podem ser expandidas conforme necessário.
 */

import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// =====================================================
// HOOK PARA SEGURANÇA
// =====================================================

interface SegurancaData {
  total_ocorrencias: number;
  ocorrencias_abertas: number;
  ocorrencias_resolvidas: number;
  patrulhas_ativas: number;
}

export const useSeguranca = () => {
  const [data, setData] = useState<SegurancaData>({
    total_ocorrencias: 0,
    ocorrencias_abertas: 0,
    ocorrencias_resolvidas: 0,
    patrulhas_ativas: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Futuramente implementar endpoint de segurança
      // Por enquanto, dados mock
      setData({
        total_ocorrencias: 45,
        ocorrencias_abertas: 12,
        ocorrencias_resolvidas: 33,
        patrulhas_ativas: 8
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA SAÚDE
// =====================================================

interface SaudeData {
  total_atendimentos: number;
  consultas_hoje: number;
  leitos_ocupados: number;
  campanhas_ativas: number;
}

export const useSaude = () => {
  const [data, setData] = useState<SaudeData>({
    total_atendimentos: 0,
    consultas_hoje: 0,
    leitos_ocupados: 0,
    campanhas_ativas: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        total_atendimentos: 234,
        consultas_hoje: 18,
        leitos_ocupados: 85,
        campanhas_ativas: 3
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de saúde:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA EDUCAÇÃO
// =====================================================

interface EducacaoData {
  total_alunos: number;
  escolas_ativas: number;
  professores: number;
  projetos_pedagogicos: number;
}

export const useEducacao = () => {
  const [data, setData] = useState<EducacaoData>({
    total_alunos: 0,
    escolas_ativas: 0,
    professores: 0,
    projetos_pedagogicos: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        total_alunos: 1250,
        escolas_ativas: 12,
        professores: 85,
        projetos_pedagogicos: 6
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de educação:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA OBRAS
// =====================================================

interface ObrasData {
  total_obras: number;
  obras_andamento: number;
  obras_concluidas: number;
  orcamento_total: number;
}

export const useObras = () => {
  const [data, setData] = useState<ObrasData>({
    total_obras: 0,
    obras_andamento: 0,
    obras_concluidas: 0,
    orcamento_total: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        total_obras: 28,
        obras_andamento: 12,
        obras_concluidas: 16,
        orcamento_total: 2500000
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de obras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA PLANEJAMENTO
// =====================================================

interface PlanejamentoData {
  projetos_ativos: number;
  metas_cumpridas: number;
  orcamento_executado: number;
  indicadores_positivos: number;
}

export const usePlanejamento = () => {
  const [data, setData] = useState<PlanejamentoData>({
    projetos_ativos: 0,
    metas_cumpridas: 0,
    orcamento_executado: 0,
    indicadores_positivos: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        projetos_ativos: 15,
        metas_cumpridas: 8,
        orcamento_executado: 1800000,
        indicadores_positivos: 12
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de planejamento:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA CULTURA
// =====================================================

interface CulturaData {
  eventos_mes: number;
  espacos_culturais: number;
  projetos_andamento: number;
  artistas_locais: number;
}

export const useCultura = () => {
  const [data, setData] = useState<CulturaData>({
    eventos_mes: 0,
    espacos_culturais: 0,
    projetos_andamento: 0,
    artistas_locais: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        eventos_mes: 24,
        espacos_culturais: 6,
        projetos_andamento: 8,
        artistas_locais: 45
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de cultura:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA ASSISTÊNCIA SOCIAL
// =====================================================

interface AssistenciaSocialData {
  familias_cadastradas: number;
  beneficios_ativos: number;
  programas_sociais: number;
  atendimentos_mes: number;
}

export const useAssistenciaSocial = () => {
  const [data, setData] = useState<AssistenciaSocialData>({
    familias_cadastradas: 0,
    beneficios_ativos: 0,
    programas_sociais: 0,
    atendimentos_mes: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        familias_cadastradas: 890,
        beneficios_ativos: 245,
        programas_sociais: 12,
        atendimentos_mes: 156
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de assistência social:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};

// =====================================================
// HOOK PARA AGRICULTURA
// =====================================================

interface AgriculturaData {
  produtores_cadastrados: number;
  projetos_rurais: number;
  area_cultivada: number;
  cooperativas: number;
}

export const useAgricultura = () => {
  const [data, setData] = useState<AgriculturaData>({
    produtores_cadastrados: 0,
    projetos_rurais: 0,
    area_cultivada: 0,
    cooperativas: 0
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData({
        produtores_cadastrados: 178,
        projetos_rurais: 8,
        area_cultivada: 2850,
        cooperativas: 4
      });
    } catch (error) {
      console.warn('Erro ao carregar dados de agricultura:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refetch: loadData };
};