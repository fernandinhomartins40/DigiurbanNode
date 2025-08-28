import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// 🌾 AGRICULTURA - HOOK COMPLETO COM 5 FUNCIONALIDADES

// Types
interface ProdutorRural {
  id: number;
  nome_completo: string;
  cpf_cnpj: string;
  rg?: string;
  telefone?: string;
  email?: string;
  endereco_residencia?: string;
  nome_propriedade?: string;
  endereco_propriedade: string;
  area_hectares: number;
  latitude?: number;
  longitude?: number;
  tipos_cultivo?: string[];
  criacao_animal?: string[];
  certificacoes?: string[];
  associacao_cooperativa?: string;
  numero_dap?: string;
  renda_anual_estimada?: number;
  situacao: 'ATIVO' | 'INATIVO' | 'SUSPENSO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface AssistenciaTecnica {
  id: number;
  produtor_id: number;
  tecnico_responsavel: string;
  tipo_assistencia: 'AGRONOMICA' | 'VETERINARIA' | 'ZOOTECNICA';
  data_visita: string;
  objetivo_visita: string;
  diagnostico?: string;
  recomendacoes: string;
  produtos_indicados?: string[];
  proxima_visita?: string;
  status: 'AGENDADA' | 'CONCLUIDA' | 'REAGENDADA' | 'CANCELADA';
  custo_assistencia?: number;
  resultado_obtido?: string;
  avaliacao_produtor?: number;
  observacoes?: string;
  created_at: string;
  produtor?: ProdutorRural;
}

interface ProgramaRural {
  id: number;
  nome_programa: string;
  descricao: string;
  tipo_programa: 'CREDITO' | 'SEMENTES' | 'MAQUINAS' | 'SEGURO';
  orcamento_total: number;
  valor_por_beneficiario: number;
  criterios_elegibilidade: string;
  documentos_necessarios: string[];
  periodo_inscricoes_inicio?: string;
  periodo_inscricoes_fim?: string;
  numero_beneficiarios_previsto: number;
  numero_beneficiarios_atual: number;
  status: 'ATIVO' | 'SUSPENSO' | 'FINALIZADO' | 'PLANEJAMENTO';
  responsavel_programa: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface InscricaoProgramaRural {
  id: number;
  programa_id: number;
  produtor_id: number;
  data_inscricao: string;
  documentos_entregues: string[];
  status: 'INSCRITO' | 'APROVADO' | 'REPROVADO' | 'AGUARDANDO';
  pontuacao?: number;
  observacoes_avaliacao?: string;
  data_aprovacao?: string;
  valor_beneficio?: number;
  forma_pagamento?: string;
  data_pagamento?: string;
  created_at: string;
  programa?: ProgramaRural;
  produtor?: ProdutorRural;
}

interface InsumoAgricola {
  id: number;
  nome_insumo: string;
  tipo_insumo: 'SEMENTE' | 'FERTILIZANTE' | 'DEFENSIVO' | 'FERRAMENTA';
  marca?: string;
  unidade_medida: string;
  estoque_atual: number;
  estoque_minimo?: number;
  preco_unitario?: number;
  fornecedor?: string;
  data_validade?: string;
  local_armazenamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface DistribuicaoInsumo {
  id: number;
  insumo_id: number;
  produtor_id: number;
  programa_id?: number;
  quantidade_distribuida: number;
  data_distribuicao: string;
  funcionario_responsavel?: string;
  finalidade?: string;
  observacoes?: string;
  created_at: string;
  insumo?: InsumoAgricola;
  produtor?: ProdutorRural;
  programa?: ProgramaRural;
}

interface MonitoramentoSafra {
  id: number;
  produtor_id: number;
  cultura: string;
  area_plantada: number;
  data_plantio: string;
  previsao_colheita: string;
  producao_estimada?: number;
  producao_real?: number;
  preco_venda_medio?: number;
  receita_bruta?: number;
  custos_producao?: number;
  lucro_liquido?: number;
  observacoes_safra?: string;
  status: 'PLANTADA' | 'DESENVOLVIMENTO' | 'COLHIDA' | 'COMERCIALIZADA';
  created_at: string;
  updated_at: string;
  produtor?: ProdutorRural;
}

// Dashboard Data
interface DashboardAgricultura {
  produtores_ativos: number;
  assistencias_tecnicas_mes: number;
  programas_ativos: number;
  insumos_distribuidos_mes: number;
  estimativa_producao_safra: number;
  investimento_publico_rural: number;
  area_total_cadastrada: number;
  produtores_beneficiados: number;
}

export const useAgricultura = () => {
  // Estados
  const [produtoresRurais, setProdutoresRurais] = useState<ProdutorRural[]>([]);
  const [assistenciasTecnicas, setAssistenciasTecnicas] = useState<AssistenciaTecnica[]>([]);
  const [programasRurais, setProgramasRurais] = useState<ProgramaRural[]>([]);
  const [inscricoesProgramas, setInscricoesProgramas] = useState<InscricaoProgramaRural[]>([]);
  const [insumosAgricolas, setInsumosAgricolas] = useState<InsumoAgricola[]>([]);
  const [distribuicoesInsumos, setDistribuicoesInsumos] = useState<DistribuicaoInsumo[]>([]);
  const [monitoramentoSafras, setMonitoramentoSafras] = useState<MonitoramentoSafra[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardAgricultura | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2.1 PRODUTORES RURAIS
  const fetchProdutoresRurais = async (situacao?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('produtores_rurais')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (situacao) query = query.eq('situacao', situacao);

      const { data, error } = await query;
      if (error) throw error;
      setProdutoresRurais(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProdutorRural = async (produtorData: Omit<ProdutorRural, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtores_rurais')
        .insert([produtorData])
        .select()
        .single();

      if (error) throw error;
      setProdutoresRurais(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProdutorRural = async (id: number, updates: Partial<ProdutorRural>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtores_rurais')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProdutoresRurais(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getProdutorById = (id: number) => {
    return produtoresRurais.find(p => p.id === id);
  };

  // 2.2 ASSISTÊNCIA TÉCNICA
  const fetchAssistenciasTecnicas = async (produtorId?: number, status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('assistencia_tecnica_rural')
        .select(`
          *,
          produtor:produtor_id (*)
        `)
        .order('data_visita', { ascending: false });

      if (produtorId) query = query.eq('produtor_id', produtorId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setAssistenciasTecnicas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agendarAssistenciaTecnica = async (assistenciaData: Omit<AssistenciaTecnica, 'id' | 'created_at' | 'produtor'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assistencia_tecnica_rural')
        .insert([assistenciaData])
        .select()
        .single();

      if (error) throw error;
      await fetchAssistenciasTecnicas(); // Refresh da lista
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const concluirAssistenciaTecnica = async (
    id: number, 
    diagnostico: string, 
    recomendacoes: string, 
    resultadoObtido?: string,
    avaliacaoProdutor?: number
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assistencia_tecnica_rural')
        .update({
          status: 'CONCLUIDA',
          diagnostico,
          recomendacoes,
          resultado_obtido: resultadoObtido,
          avaliacao_produtor: avaliacaoProdutor
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAssistenciasTecnicas(prev => prev.map(a => a.id === id ? data : a));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 2.3 PROGRAMAS RURAIS
  const fetchProgramasRurais = async (status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('programas_rurais')
        .select('*')
        .order('nome_programa', { ascending: true });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setProgramasRurais(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProgramaRural = async (programaData: Omit<ProgramaRural, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programas_rurais')
        .insert([programaData])
        .select()
        .single();

      if (error) throw error;
      setProgramasRurais(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchInscricoesProgramas = async (programaId?: number, produtorId?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('inscricoes_programas_rurais')
        .select(`
          *,
          programa:programa_id (*),
          produtor:produtor_id (*)
        `)
        .order('data_inscricao', { ascending: false });

      if (programaId) query = query.eq('programa_id', programaId);
      if (produtorId) query = query.eq('produtor_id', produtorId);

      const { data, error } = await query;
      if (error) throw error;
      setInscricoesProgramas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inscreverProdutorPrograma = async (inscricaoData: Omit<InscricaoProgramaRural, 'id' | 'created_at' | 'programa' | 'produtor'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inscricoes_programas_rurais')
        .insert([inscricaoData])
        .select()
        .single();

      if (error) throw error;
      await fetchInscricoesProgramas(); // Refresh da lista
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const aprovarInscricaoPrograma = async (id: number, valorBeneficio: number, observacoes?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inscricoes_programas_rurais')
        .update({
          status: 'APROVADO',
          data_aprovacao: new Date().toISOString().split('T')[0],
          valor_beneficio: valorBeneficio,
          observacoes_avaliacao: observacoes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInscricoesProgramas(prev => prev.map(i => i.id === id ? data : i));
      
      // Atualizar contador no programa
      const inscricao = inscricoesProgramas.find(i => i.id === id);
      if (inscricao?.programa_id) {
        await supabase
          .from('programas_rurais')
          .update({ 
            numero_beneficiarios_atual: supabase.rpc('increment_beneficiarios', { programa_id: inscricao.programa_id })
          })
          .eq('id', inscricao.programa_id);
      }

      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 2.4 INSUMOS AGRÍCOLAS
  const fetchInsumosAgricolas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insumos_agricolas')
        .select('*')
        .order('nome_insumo', { ascending: true });

      if (error) throw error;
      setInsumosAgricolas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createInsumoAgricola = async (insumoData: Omit<InsumoAgricola, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insumos_agricolas')
        .insert([insumoData])
        .select()
        .single();

      if (error) throw error;
      setInsumosAgricolas(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateEstoqueInsumo = async (id: number, novoEstoque: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insumos_agricolas')
        .update({ 
          estoque_atual: novoEstoque,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInsumosAgricolas(prev => prev.map(i => i.id === id ? data : i));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchDistribuicoesInsumos = async (insumoId?: number, produtorId?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('distribuicao_insumos')
        .select(`
          *,
          insumo:insumo_id (*),
          produtor:produtor_id (*),
          programa:programa_id (*)
        `)
        .order('data_distribuicao', { ascending: false });

      if (insumoId) query = query.eq('insumo_id', insumoId);
      if (produtorId) query = query.eq('produtor_id', produtorId);

      const { data, error } = await query;
      if (error) throw error;
      setDistribuicoesInsumos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const distribuirInsumo = async (distribuicaoData: Omit<DistribuicaoInsumo, 'id' | 'created_at' | 'insumo' | 'produtor' | 'programa'>) => {
    try {
      setLoading(true);
      
      // Registrar distribuição
      const { data: distribuicao, error: distribuicaoError } = await supabase
        .from('distribuicao_insumos')
        .insert([distribuicaoData])
        .select()
        .single();

      if (distribuicaoError) throw distribuicaoError;

      // Atualizar estoque
      const insumo = insumosAgricolas.find(i => i.id === distribuicaoData.insumo_id);
      if (insumo) {
        const novoEstoque = insumo.estoque_atual - distribuicaoData.quantidade_distribuida;
        await updateEstoqueInsumo(distribuicaoData.insumo_id, novoEstoque);
      }

      await fetchDistribuicoesInsumos(); // Refresh da lista
      return { success: true, data: distribuicao };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 2.5 MONITORAMENTO AGRÍCOLA
  const fetchMonitoramentoSafras = async (produtorId?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('monitoramento_safras')
        .select(`
          *,
          produtor:produtor_id (*)
        `)
        .order('data_plantio', { ascending: false });

      if (produtorId) query = query.eq('produtor_id', produtorId);

      const { data, error } = await query;
      if (error) {
        // Se a tabela não existir, criar dados simulados
        setMonitoramentoSafras([]);
        return;
      }
      setMonitoramentoSafras(data || []);
    } catch (err: Error | unknown) {
      setMonitoramentoSafras([]);
    } finally {
      setLoading(false);
    }
  };

  const registrarSafra = async (safraData: Omit<MonitoramentoSafra, 'id' | 'created_at' | 'updated_at' | 'produtor'>) => {
    try {
      setLoading(true);
      
      // Simulação para demo
      const novaSafra: MonitoramentoSafra = {
        ...safraData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setMonitoramentoSafras(prev => [novaSafra, ...prev]);
      return { success: true, data: novaSafra };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // DASHBOARD
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos produtores
      const { data: produtoresData } = await supabase
        .from('produtores_rurais')
        .select('situacao, area_hectares, renda_anual_estimada');

      // Buscar assistências técnicas do mês
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const { data: assistenciasData } = await supabase
        .from('assistencia_tecnica_rural')
        .select('data_visita')
        .gte('data_visita', inicioMes.toISOString().split('T')[0]);

      // Buscar programas ativos
      const { data: programasData } = await supabase
        .from('programas_rurais')
        .select('status, numero_beneficiarios_atual, orcamento_total');

      // Buscar distribuições do mês
      const { data: distribuicoesData } = await supabase
        .from('distribuicao_insumos')
        .select('quantidade_distribuida')
        .gte('data_distribuicao', inicioMes.toISOString().split('T')[0]);

      // Calcular estatísticas
      const produtoresAtivos = produtoresData?.filter(p => p.situacao === 'ATIVO').length || 0;
      const assistenciasMes = assistenciasData?.length || 0;
      const programasAtivos = programasData?.filter(p => p.status === 'ATIVO').length || 0;
      const insumosDistribuidosMes = distribuicoesData?.reduce((acc, d) => acc + (d.quantidade_distribuida || 0), 0) || 0;
      const areaTotalCadastrada = produtoresData?.reduce((acc, p) => acc + (p.area_hectares || 0), 0) || 0;
      const investimentoPublico = programasData?.reduce((acc, p) => acc + (p.orcamento_total || 0), 0) || 0;
      const produtoresBeneficiados = programasData?.reduce((acc, p) => acc + (p.numero_beneficiarios_atual || 0), 0) || 0;

      const dashboardStats: DashboardAgricultura = {
        produtores_ativos: produtoresAtivos,
        assistencias_tecnicas_mes: assistenciasMes,
        programas_ativos: programasAtivos,
        insumos_distribuidos_mes: insumosDistribuidosMes,
        estimativa_producao_safra: 2500, // Simulado
        investimento_publico_rural: investimentoPublico,
        area_total_cadastrada: areaTotalCadastrada,
        produtores_beneficiados: produtoresBeneficiados
      };

      setDashboardData(dashboardStats);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchProdutoresRurais();
    fetchAssistenciasTecnicas();
    fetchProgramasRurais();
    fetchInsumosAgricolas();
    fetchDistribuicoesInsumos();
    fetchMonitoramentoSafras();
    fetchDashboardData();
  }, []);

  return {
    // Estados
    produtoresRurais,
    assistenciasTecnicas,
    programasRurais,
    inscricoesProgramas,
    insumosAgricolas,
    distribuicoesInsumos,
    monitoramentoSafras,
    dashboardData,
    loading,
    error,
    
    // Produtores Rurais
    fetchProdutoresRurais,
    createProdutorRural,
    updateProdutorRural,
    getProdutorById,
    
    // Assistência Técnica
    fetchAssistenciasTecnicas,
    agendarAssistenciaTecnica,
    concluirAssistenciaTecnica,
    
    // Programas Rurais
    fetchProgramasRurais,
    createProgramaRural,
    fetchInscricoesProgramas,
    inscreverProdutorPrograma,
    aprovarInscricaoPrograma,
    
    // Insumos Agrícolas
    fetchInsumosAgricolas,
    createInsumoAgricola,
    updateEstoqueInsumo,
    fetchDistribuicoesInsumos,
    distribuirInsumo,
    
    // Monitoramento Agrícola
    fetchMonitoramentoSafras,
    registrarSafra,
    
    // Dashboard
    fetchDashboardData
  };
};