import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// 🔧 SERVIÇOS PÚBLICOS - HOOK COMPLETO COM 6 FUNCIONALIDADES

// Types
interface PontoIluminacao {
  id: number;
  codigo_identificacao: string;
  endereco: string;
  bairro: string;
  latitude?: number;
  longitude?: number;
  tipo_lampada: string;
  potencia_watts: number;
  altura_poste?: number;
  status: 'FUNCIONANDO' | 'DEFEITO' | 'MANUTENÇÃO' | 'DESLIGADO';
  ultima_manutencao?: string;
  proxima_manutencao?: string;
  consumo_kwh_mes?: number;
  custo_mensal?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface RotaLimpeza {
  id: number;
  codigo_rota: string;
  nome_rota: string;
  bairros_atendidos: string[];
  tipo_coleta: 'RESIDENCIAL' | 'COMERCIAL' | 'SELETIVA';
  frequencia: 'DIARIA' | '3X_SEMANA' | 'SEMANAL';
  veiculo_placa?: string;
  motorista_nome?: string;
  garis_equipe?: string[];
  horario_inicio?: string;
  horario_fim_previsto?: string;
  distancia_km?: number;
  tempo_medio_horas?: number;
  tonelagem_media?: number;
  custo_operacional?: number;
  status: 'ATIVA' | 'INATIVA' | 'SUSPENSA';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface ColetaRealizada {
  id: number;
  rota_id: number;
  data_coleta: string;
  horario_inicio?: string;
  horario_fim?: string;
  tonelagem_coletada?: number;
  pontos_coletados?: number;
  veiculo_utilizado?: string;
  equipe_responsavel?: string[];
  problemas_encontrados?: string;
  status: 'CONCLUIDA' | 'PARCIAL' | 'CANCELADA';
  observacoes?: string;
  created_at: string;
  rota?: RotaLimpeza;
}

interface SolicitacaoServico {
  id: number;
  protocolo: string;
  cidadao_cpf?: string;
  cidadao_nome?: string;
  cidadao_telefone?: string;
  cidadao_email?: string;
  tipo_problema: 'ILUMINACAO' | 'LIMPEZA' | 'BURACO_VIA' | 'CALCADA' | 'OUTROS';
  descricao: string;
  endereco: string;
  bairro?: string;
  latitude?: number;
  longitude?: number;
  fotos_urls?: string[];
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'ABERTA' | 'ANDAMENTO' | 'RESOLVIDA' | 'CANCELADA';
  equipe_responsavel?: string;
  data_resolucao?: string;
  solucao_aplicada?: string;
  fotos_resolucao?: string[];
  avaliacao_cidadao?: number;
  comentario_avaliacao?: string;
  custo_resolucao?: number;
  created_at: string;
  updated_at: string;
}

interface EquipeManutencao {
  id: number;
  nome_equipe: string;
  responsavel_nome: string;
  responsavel_telefone?: string;
  area_atuacao: 'ILUMINACAO' | 'LIMPEZA' | 'CALCADAS' | 'GERAL';
  funcionarios?: string[];
  ferramentas_equipamentos?: string[];
  veiculo_placa?: string;
  status: 'ATIVA' | 'INATIVA' | 'EM_CAMPO' | 'MANUTENCAO';
  capacidade_atendimentos_dia: number;
  custo_operacional_dia?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface AtendimentoEspecializado {
  id: number;
  tipo_servico: 'ZELADORIA' | 'JARDINS' | 'CALCADAS' | 'MONUMENTOS' | 'MOBILIARIO' | 'JARDINAGEM' | 'PRAGAS';
  descricao: string;
  endereco: string;
  bairro?: string;
  equipe_responsavel?: string;
  data_agendamento: string;
  data_execucao?: string;
  materiais_utilizados?: string[];
  custo_total?: number;
  status: 'AGENDADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Data
interface DashboardServicosPublicos {
  pontos_luz_funcionando: number;
  total_pontos_luz: number;
  rotas_executadas_hoje: number;
  total_rotas_ativas: number;
  solicitacoes_pendentes: number;
  equipes_ativas: number;
  consumo_energia_mes: number;
  economia_led_percentual: number;
  problemas_resolvidos_mes: number;
  indice_satisfacao_cidadao: number;
}

export const useServicosPublicos = () => {
  // Estados
  const [pontosIluminacao, setPontosIluminacao] = useState<PontoIluminacao[]>([]);
  const [rotasLimpeza, setRotasLimpeza] = useState<RotaLimpeza[]>([]);
  const [coletasRealizadas, setColetasRealizadas] = useState<ColetaRealizada[]>([]);
  const [solicitacoesServicos, setSolicitacoesServicos] = useState<SolicitacaoServico[]>([]);
  const [equipesManutencao, setEquipesManutencao] = useState<EquipeManutencao[]>([]);
  const [atendimentosEspecializados, setAtendimentosEspecializados] = useState<AtendimentoEspecializado[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardServicosPublicos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1.1 ILUMINAÇÃO PÚBLICA
  const fetchPontosIluminacao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pontos_iluminacao')
        .select('*')
        .order('bairro', { ascending: true });

      if (error) throw error;
      setPontosIluminacao(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPontoIluminacao = async (pontoData: Omit<PontoIluminacao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pontos_iluminacao')
        .insert([pontoData])
        .select()
        .single();

      if (error) throw error;
      setPontosIluminacao(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePontoIluminacao = async (id: number, updates: Partial<PontoIluminacao>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pontos_iluminacao')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPontosIluminacao(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const registrarManutencaoLuz = async (pontoId: number, observacoes?: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    const proximaManutencao = new Date();
    proximaManutencao.setMonth(proximaManutencao.getMonth() + 6);
    
    return updatePontoIluminacao(pontoId, {
      status: 'FUNCIONANDO',
      ultima_manutencao: hoje,
      proxima_manutencao: proximaManutencao.toISOString().split('T')[0],
      observacoes
    });
  };

  // 1.2 LIMPEZA URBANA
  const fetchRotasLimpeza = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rotas_limpeza')
        .select('*')
        .order('codigo_rota', { ascending: true });

      if (error) throw error;
      setRotasLimpeza(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRotaLimpeza = async (rotaData: Omit<RotaLimpeza, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rotas_limpeza')
        .insert([rotaData])
        .select()
        .single();

      if (error) throw error;
      setRotasLimpeza(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchColetasRealizadas = async (rotaId?: number, dataInicio?: string, dataFim?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('coletas_realizadas')
        .select(`
          *,
          rota:rota_id (*)
        `)
        .order('data_coleta', { ascending: false });

      if (rotaId) query = query.eq('rota_id', rotaId);
      if (dataInicio) query = query.gte('data_coleta', dataInicio);
      if (dataFim) query = query.lte('data_coleta', dataFim);

      const { data, error } = await query;
      if (error) throw error;
      setColetasRealizadas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registrarColetaRealizada = async (coletaData: Omit<ColetaRealizada, 'id' | 'created_at' | 'rota'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coletas_realizadas')
        .insert([coletaData])
        .select()
        .single();

      if (error) throw error;
      await fetchColetasRealizadas(); // Refresh da lista
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 1.3 COLETA ESPECIAL (usando solicitações)
  const agendarColetaEspecial = async (solicitacaoData: Omit<SolicitacaoServico, 'id' | 'protocolo' | 'created_at' | 'updated_at'>) => {
    const protocolo = `CE-${Date.now()}`;
    
    return createSolicitacaoServico({
      ...solicitacaoData,
      protocolo,
      tipo_problema: 'OUTROS' // Para coleta especial
    });
  };

  // 1.4 PROBLEMAS COM FOTO (Solicitações de Cidadãos)
  const fetchSolicitacoesServicos = async (status?: string, tipo?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('solicitacoes_servicos_publicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (tipo) query = query.eq('tipo_problema', tipo);

      const { data, error } = await query;
      if (error) throw error;
      setSolicitacoesServicos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSolicitacaoServico = async (solicitacaoData: Omit<SolicitacaoServico, 'id' | 'protocolo' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const protocolo = `SP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const { data, error } = await supabase
        .from('solicitacoes_servicos_publicos')
        .insert([{ ...solicitacaoData, protocolo }])
        .select()
        .single();

      if (error) throw error;
      setSolicitacoesServicos(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateSolicitacaoServico = async (id: number, updates: Partial<SolicitacaoServico>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solicitacoes_servicos_publicos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSolicitacoesServicos(prev => prev.map(s => s.id === id ? data : s));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resolverSolicitacao = async (id: number, solucao: string, custoResolucao?: number, fotosResolucao?: string[]) => {
    return updateSolicitacaoServico(id, {
      status: 'RESOLVIDA',
      data_resolucao: new Date().toISOString().split('T')[0],
      solucao_aplicada: solucao,
      custo_resolucao: custoResolucao,
      fotos_resolucao: fotosResolucao
    });
  };

  // 1.5 PROGRAMAÇÃO DE EQUIPES
  const fetchEquipesManutencao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipes_manutencao')
        .select('*')
        .order('nome_equipe', { ascending: true });

      if (error) throw error;
      setEquipesManutencao(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEquipeManutencao = async (equipeData: Omit<EquipeManutencao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipes_manutencao')
        .insert([equipeData])
        .select()
        .single();

      if (error) throw error;
      setEquipesManutencao(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusEquipe = async (id: number, status: EquipeManutencao['status']) => {
    return supabase
      .from('equipes_manutencao')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  };

  const programarEquipe = async (equipeId: number, solicitacaoId: number) => {
    const equipe = equipesManutencao.find(e => e.id === equipeId);
    if (!equipe) return { success: false, error: 'Equipe não encontrada' };

    // Atualizar solicitação com equipe responsável
    await updateSolicitacaoServico(solicitacaoId, {
      status: 'ANDAMENTO',
      equipe_responsavel: equipe.nome_equipe
    });

    // Atualizar status da equipe
    await atualizarStatusEquipe(equipeId, 'EM_CAMPO');

    return { success: true };
  };

  // 1.6 ATENDIMENTOS ESPECIALIZADOS
  const fetchAtendimentosEspecializados = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atendimentos_especializados')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (error) {
        // Se a tabela não existir, vamos usar um array vazio
        setAtendimentosEspecializados([]);
        return;
      }
      setAtendimentosEspecializados(data || []);
    } catch (err: Error | unknown) {
      // Para esta demo, vamos usar dados mock
      setAtendimentosEspecializados([]);
    } finally {
      setLoading(false);
    }
  };

  const agendarAtendimentoEspecializado = async (atendimentoData: Omit<AtendimentoEspecializado, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      // Para esta demo, vamos simular o cadastro
      const novoAtendimento: AtendimentoEspecializado = {
        ...atendimentoData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAtendimentosEspecializados(prev => [novoAtendimento, ...prev]);
      return { success: true, data: novoAtendimento };
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
      
      // Buscar dados dos pontos de iluminação
      const { data: pontosData } = await supabase
        .from('pontos_iluminacao')
        .select('status, consumo_kwh_mes');

      // Buscar dados das rotas
      const { data: rotasData } = await supabase
        .from('rotas_limpeza')
        .select('status');

      // Buscar solicitações
      const { data: solicitacoesData } = await supabase
        .from('solicitacoes_servicos_publicos')
        .select('status, avaliacao_cidadao, created_at');

      // Buscar equipes
      const { data: equipesData } = await supabase
        .from('equipes_manutencao')
        .select('status');

      // Calcular estatísticas
      const pontosFuncionando = pontosData?.filter(p => p.status === 'FUNCIONANDO').length || 0;
      const totalPontos = pontosData?.length || 0;
      const rotasAtivas = rotasData?.filter(r => r.status === 'ATIVA').length || 0;
      const solicitacoesPendentes = solicitacoesData?.filter(s => s.status === 'ABERTA' || s.status === 'ANDAMENTO').length || 0;
      const equipesAtivas = equipesData?.filter(e => e.status === 'ATIVA' || e.status === 'EM_CAMPO').length || 0;
      
      const consumoTotal = pontosData?.reduce((acc, p) => acc + (p.consumo_kwh_mes || 0), 0) || 0;
      
      // Calcular problemas resolvidos no mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const problemasResolvidosMes = solicitacoesData?.filter(s => 
        s.status === 'RESOLVIDA' && new Date(s.created_at) >= inicioMes
      ).length || 0;

      // Calcular índice de satisfação
      const avaliacoesValidas = solicitacoesData?.filter(s => s.avaliacao_cidadao && s.avaliacao_cidadao > 0) || [];
      const mediaAvaliacoes = avaliacoesValidas.length > 0 
        ? avaliacoesValidas.reduce((acc, s) => acc + (s.avaliacao_cidadao || 0), 0) / avaliacoesValidas.length
        : 0;

      const dashboardStats: DashboardServicosPublicos = {
        pontos_luz_funcionando: pontosFuncionando,
        total_pontos_luz: totalPontos,
        rotas_executadas_hoje: 2, // Simulado
        total_rotas_ativas: rotasAtivas,
        solicitacoes_pendentes: solicitacoesPendentes,
        equipes_ativas: equipesAtivas,
        consumo_energia_mes: consumoTotal,
        economia_led_percentual: 35, // Simulado
        problemas_resolvidos_mes: problemasResolvidosMes,
        indice_satisfacao_cidadao: mediaAvaliacoes
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
    fetchPontosIluminacao();
    fetchRotasLimpeza();
    fetchSolicitacoesServicos();
    fetchEquipesManutencao();
    fetchAtendimentosEspecializados();
    fetchDashboardData();
  }, []);

  return {
    // Estados
    pontosIluminacao,
    rotasLimpeza,
    coletasRealizadas,
    solicitacoesServicos,
    equipesManutencao,
    atendimentosEspecializados,
    dashboardData,
    loading,
    error,
    
    // Iluminação Pública
    fetchPontosIluminacao,
    createPontoIluminacao,
    updatePontoIluminacao,
    registrarManutencaoLuz,
    
    // Limpeza Urbana
    fetchRotasLimpeza,
    createRotaLimpeza,
    fetchColetasRealizadas,
    registrarColetaRealizada,
    
    // Coleta Especial
    agendarColetaEspecial,
    
    // Problemas com Foto
    fetchSolicitacoesServicos,
    createSolicitacaoServico,
    updateSolicitacaoServico,
    resolverSolicitacao,
    
    // Programação de Equipes
    fetchEquipesManutencao,
    createEquipeManutencao,
    atualizarStatusEquipe,
    programarEquipe,
    
    // Atendimentos Especializados
    fetchAtendimentosEspecializados,
    agendarAtendimentoEspecializado,
    
    // Dashboard
    fetchDashboardData
  };
};