import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// 🏆 ESPORTES - HOOK COMPLETO COM 7 FUNCIONALIDADES

// Types
interface EquipamentoEsportivo {
  id: number;
  nome: string;
  tipo: 'QUADRA' | 'CAMPO' | 'PISCINA' | 'GINASIO' | 'PISTA';
  modalidades: string[];
  endereco: string;
  bairro?: string;
  capacidade_pessoas?: number;
  area_m2?: number;
  tem_iluminacao: boolean;
  tem_arquibancada: boolean;
  tem_vestiario: boolean;
  status: 'ATIVO' | 'MANUTENCAO' | 'REFORMA' | 'INATIVO';
  horario_funcionamento_inicio?: string;
  horario_funcionamento_fim?: string;
  valor_hora_locacao?: number;
  responsavel_local?: string;
  telefone_contato?: string;
  ultima_manutencao?: string;
  proxima_manutencao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface AgendamentoEquipamento {
  id: number;
  equipamento_id: number;
  solicitante_nome: string;
  solicitante_telefone?: string;
  solicitante_email?: string;
  data_uso: string;
  horario_inicio: string;
  horario_fim: string;
  modalidade?: string;
  numero_participantes?: number;
  tipo_uso: 'TREINO' | 'JOGO' | 'AULA' | 'EVENTO';
  valor_pagamento?: number;
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO';
  observacoes?: string;
  created_at: string;
  equipamento?: EquipamentoEsportivo;
}

interface EscolinhaEsportiva {
  id: number;
  nome: string;
  modalidade: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number;
  equipamento_id?: number;
  professor_responsavel: string;
  professor_telefone?: string;
  dias_semana: string[];
  horario_inicio: string;
  horario_fim: string;
  numero_vagas: number;
  vagas_ocupadas: number;
  valor_mensalidade: number;
  material_necessario?: string[];
  status: 'ATIVA' | 'INATIVA' | 'SUSPENSA' | 'FINALIZADA';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  equipamento?: EquipamentoEsportivo;
}

interface AtletaEscolinha {
  id: number;
  escolinha_id: number;
  nome_completo: string;
  data_nascimento: string;
  cpf?: string;
  endereco?: string;
  telefone?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  data_matricula: string;
  situacao: 'ATIVO' | 'INATIVO' | 'TRANSFERIDO' | 'FORMADO';
  observacoes_medicas?: string;
  autorizacao_imagem: boolean;
  observacoes?: string;
  created_at: string;
  escolinha?: EscolinhaEsportiva;
}

interface AtletaMunicipal {
  id: number;
  nome_completo: string;
  data_nascimento: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  modalidade_principal: string;
  categoria: string;
  nivel: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'ELITE';
  clube_origem?: string;
  data_inicio_programa: string;
  bolsa_valor_mensal: number;
  tipo_apoio?: string[];
  tecnico_responsavel?: string;
  resultados_principais?: string[];
  metas_temporada?: string[];
  status: 'ATIVO' | 'LICENCIADO' | 'TRANSFERIDO' | 'APOSENTADO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface EventoEsportivo {
  id: number;
  nome: string;
  tipo_evento: 'CAMPEONATO' | 'TORNEIO' | 'FESTIVAL' | 'CORRIDA';
  modalidades: string[];
  data_inicio: string;
  data_fim?: string;
  local_realizacao: string;
  equipamentos_utilizados?: number[];
  publico_estimado?: number;
  numero_participantes?: number;
  valor_inscricao: number;
  premiacao_total?: number;
  organizador_responsavel?: string;
  patrocinadores?: string[];
  status: 'PLANEJADO' | 'INSCRICOES_ABERTAS' | 'EM_ANDAMENTO' | 'FINALIZADO';
  regulamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface RecursoEsportivo {
  id: number;
  tipo_recurso: 'ORCAMENTO' | 'MATERIAL' | 'PATRIMONIO' | 'CONVENIO';
  descricao: string;
  valor_total?: number;
  categoria_esportiva?: string;
  fornecedor?: string;
  data_aquisicao?: string;
  data_vencimento?: string;
  responsavel_gestao: string;
  status: 'ATIVO' | 'VENCIDO' | 'RENOVADO' | 'CANCELADO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Data
interface DashboardEsportes {
  equipamentos_ativos: number;
  total_equipamentos: number;
  escolinhas_ativas: number;
  atletas_programas: number;
  eventos_periodo: number;
  participacao_populacao_percent: number;
  investimento_per_capita: number;
  modalidades_oferecidas: number;
}

export const useEsportes = () => {
  // Estados
  const [equipamentosEsportivos, setEquipamentosEsportivos] = useState<EquipamentoEsportivo[]>([]);
  const [agendamentosEquipamentos, setAgendamentosEquipamentos] = useState<AgendamentoEquipamento[]>([]);
  const [escolinhasEsportivas, setEscolinhasEsportivas] = useState<EscolinhaEsportiva[]>([]);
  const [atletasEscolinhas, setAtletasEscolinhas] = useState<AtletaEscolinha[]>([]);
  const [atletasMunicipais, setAtletasMunicipais] = useState<AtletaMunicipal[]>([]);
  const [eventosEsportivos, setEventosEsportivos] = useState<EventoEsportivo[]>([]);
  const [recursosEsportivos, setRecursosEsportivos] = useState<RecursoEsportivo[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardEsportes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3.1 EQUIPAMENTOS ESPORTIVOS
  const fetchEquipamentosEsportivos = async (status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('equipamentos_esportivos')
        .select('*')
        .order('nome', { ascending: true });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setEquipamentosEsportivos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEquipamentoEsportivo = async (equipamentoData: Omit<EquipamentoEsportivo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipamentos_esportivos')
        .insert([equipamentoData])
        .select()
        .single();

      if (error) throw error;
      setEquipamentosEsportivos(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateEquipamentoEsportivo = async (id: number, updates: Partial<EquipamentoEsportivo>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipamentos_esportivos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEquipamentosEsportivos(prev => prev.map(e => e.id === id ? data : e));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchAgendamentosEquipamentos = async (equipamentoId?: number, dataInicio?: string, dataFim?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('agendamentos_equipamentos')
        .select(`
          *,
          equipamento:equipamento_id (*)
        `)
        .order('data_uso', { ascending: true });

      if (equipamentoId) query = query.eq('equipamento_id', equipamentoId);
      if (dataInicio) query = query.gte('data_uso', dataInicio);
      if (dataFim) query = query.lte('data_uso', dataFim);

      const { data, error } = await query;
      if (error) throw error;
      setAgendamentosEquipamentos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAgendamentoEquipamento = async (agendamentoData: Omit<AgendamentoEquipamento, 'id' | 'created_at' | 'equipamento'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agendamentos_equipamentos')
        .insert([agendamentoData])
        .select()
        .single();

      if (error) throw error;
      await fetchAgendamentosEquipamentos(); // Refresh da lista
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 3.2 COMPETIÇÕES MUNICIPAIS (usando eventos)
  const organizarCompeticionMunicipal = async (eventoData: Omit<EventoEsportivo, 'id' | 'created_at' | 'updated_at'>) => {
    return createEventoEsportivo({ ...eventoData, tipo_evento: 'CAMPEONATO' });
  };

  // 3.3 ESCOLINHAS ESPORTIVAS
  const fetchEscolinhasEsportivas = async (status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('escolinhas_esportivas')
        .select(`
          *,
          equipamento:equipamento_id (*)
        `)
        .order('nome', { ascending: true });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setEscolinhasEsportivas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEscolinhaEsportiva = async (escolinhaData: Omit<EscolinhaEsportiva, 'id' | 'created_at' | 'updated_at' | 'equipamento'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escolinhas_esportivas')
        .insert([escolinhaData])
        .select()
        .single();

      if (error) throw error;
      await fetchEscolinhasEsportivas(); // Refresh da lista
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchAtletasEscolinhas = async (escolinhaId?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('atletas_escolinhas')
        .select(`
          *,
          escolinha:escolinha_id (*)
        `)
        .order('nome_completo', { ascending: true });

      if (escolinhaId) query = query.eq('escolinha_id', escolinhaId);

      const { data, error } = await query;
      if (error) throw error;
      setAtletasEscolinhas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const matricularAtletaEscolinha = async (atletaData: Omit<AtletaEscolinha, 'id' | 'created_at' | 'escolinha'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atletas_escolinhas')
        .insert([atletaData])
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar vagas ocupadas na escolinha
      const escolinha = escolinhasEsportivas.find(e => e.id === atletaData.escolinha_id);
      if (escolinha) {
        await supabase
          .from('escolinhas_esportivas')
          .update({ vagas_ocupadas: escolinha.vagas_ocupadas + 1 })
          .eq('id', atletaData.escolinha_id);
      }

      await fetchAtletasEscolinhas(); // Refresh da lista
      await fetchEscolinhasEsportivas(); // Refresh das escolinhas
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 3.4 ATIVIDADES COMUNITÁRIAS (usando escolinhas com categoria especial)
  const criarAtividadeComunitaria = async (atividadeData: Omit<EscolinhaEsportiva, 'id' | 'created_at' | 'updated_at' | 'equipamento'>) => {
    return createEscolinhaEsportiva({
      ...atividadeData,
      nome: `Atividade Comunitária - ${atividadeData.modalidade}`,
      valor_mensalidade: 0 // Atividades comunitárias são gratuitas
    });
  };

  // 3.5 ATLETAS E TALENTOS
  const fetchAtletasMunicipais = async (status?: string, modalidade?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('atletas_municipais')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (status) query = query.eq('status', status);
      if (modalidade) query = query.eq('modalidade_principal', modalidade);

      const { data, error } = await query;
      if (error) throw error;
      setAtletasMunicipais(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cadastrarAtletaMunicipal = async (atletaData: Omit<AtletaMunicipal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atletas_municipais')
        .insert([atletaData])
        .select()
        .single();

      if (error) throw error;
      setAtletasMunicipais(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const atualizarBolsaAtleta = async (id: number, valorBolsa: number, tipoApoio: string[]) => {
    return supabase
      .from('atletas_municipais')
      .update({ 
        bolsa_valor_mensal: valorBolsa,
        tipo_apoio: tipoApoio,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  };

  const registrarResultadoAtleta = async (id: number, novoResultado: string) => {
    try {
      const atleta = atletasMunicipais.find(a => a.id === id);
      if (!atleta) return { success: false, error: 'Atleta não encontrado' };

      const resultadosAtualizados = [...(atleta.resultados_principais || []), novoResultado];
      
      const { data, error } = await supabase
        .from('atletas_municipais')
        .update({ 
          resultados_principais: resultadosAtualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAtletasMunicipais(prev => prev.map(a => a.id === id ? data : a));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // 3.6 EVENTOS ESPORTIVOS
  const fetchEventosEsportivos = async (status?: string, tipoEvento?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('eventos_esportivos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (status) query = query.eq('status', status);
      if (tipoEvento) query = query.eq('tipo_evento', tipoEvento);

      const { data, error } = await query;
      if (error) throw error;
      setEventosEsportivos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEventoEsportivo = async (eventoData: Omit<EventoEsportivo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos_esportivos')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;
      setEventosEsportivos(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateStatusEvento = async (id: number, novoStatus: EventoEsportivo['status']) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos_esportivos')
        .update({ 
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEventosEsportivos(prev => prev.map(e => e.id === id ? data : e));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 3.7 GESTÃO DE RECURSOS
  const fetchRecursosEsportivos = async (tipoRecurso?: string) => {
    try {
      setLoading(true);
      
      // Simulação para demo - normalmente viria do banco
      const recursosSimulados: RecursoEsportivo[] = [
        {
          id: 1,
          tipo_recurso: 'ORCAMENTO',
          descricao: 'Orçamento Anual Esportes 2024',
          valor_total: 850000.00,
          responsavel_gestao: 'Secretário de Esportes',
          status: 'ATIVO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          tipo_recurso: 'MATERIAL',
          descricao: 'Bolas, redes e equipamentos esportivos',
          valor_total: 45000.00,
          fornecedor: 'Esportes Total Ltda',
          data_aquisicao: '2024-01-15',
          responsavel_gestao: 'Coordenador de Materiais',
          status: 'ATIVO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          tipo_recurso: 'CONVENIO',
          descricao: 'Convênio com Federação de Futebol',
          valor_total: 120000.00,
          data_vencimento: '2024-12-31',
          responsavel_gestao: 'Assessor Jurídico',
          status: 'ATIVO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setRecursosEsportivos(recursosSimulados);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const criarRecursoEsportivo = async (recursoData: Omit<RecursoEsportivo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      const novoRecurso: RecursoEsportivo = {
        ...recursoData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setRecursosEsportivos(prev => [novoRecurso, ...prev]);
      return { success: true, data: novoRecurso };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const calcularRetornoInvestimento = (modalidade: string, periodo: number) => {
    // Simulação de cálculo ROI baseado em participação e resultados
    const participacaoEscolas = escolinhasEsportivas.filter(e => e.modalidade.includes(modalidade.toUpperCase())).length;
    const atletasModalidade = atletasMunicipais.filter(a => a.modalidade_principal.includes(modalidade.toUpperCase())).length;
    const eventosModalidade = eventosEsportivos.filter(e => e.modalidades.some(m => m.includes(modalidade.toUpperCase()))).length;
    
    const impactoSocial = (participacaoEscolas * 25) + (atletasModalidade * 10) + (eventosModalidade * 50);
    const investimentoEstimado = participacaoEscolas * 2000 + atletasModalidade * 800 + eventosModalidade * 5000;
    
    const roi = investimentoEstimado > 0 ? (impactoSocial / investimentoEstimado) * 100 : 0;
    
    return {
      impacto_social: impactoSocial,
      investimento_estimado: investimentoEstimado,
      roi_percentual: Math.round(roi * 100) / 100,
      modalidade,
      periodo
    };
  };

  // DASHBOARD
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos equipamentos
      const { data: equipamentosData } = await supabase
        .from('equipamentos_esportivos')
        .select('status, capacidade_pessoas');

      // Buscar escolinhas ativas
      const { data: escolinhasData } = await supabase
        .from('escolinhas_esportivas')
        .select('status, vagas_ocupadas');

      // Buscar atletas municipais
      const { data: atletasData } = await supabase
        .from('atletas_municipais')
        .select('status, modalidade_principal');

      // Buscar eventos do período
      const inicioAno = new Date(new Date().getFullYear(), 0, 1);
      const { data: eventosData } = await supabase
        .from('eventos_esportivos')
        .select('status, numero_participantes')
        .gte('data_inicio', inicioAno.toISOString().split('T')[0]);

      // Calcular estatísticas
      const equipamentosAtivos = equipamentosData?.filter(e => e.status === 'ATIVO').length || 0;
      const totalEquipamentos = equipamentosData?.length || 0;
      const escolinhasAtivas = escolinhasData?.filter(e => e.status === 'ATIVA').length || 0;
      const atletasPrograma = atletasData?.filter(a => a.status === 'ATIVO').length || 0;
      const eventosPeriodo = eventosData?.length || 0;
      
      // Calcular participação da população (simulado)
      const totalVagasEscolinhas = escolinhasData?.reduce((acc, e) => acc + (e.vagas_ocupadas || 0), 0) || 0;
      const participantesEventos = eventosData?.reduce((acc, e) => acc + (e.numero_participantes || 0), 0) || 0;
      const populacaoEstimada = 50000; // Simulado
      const participacaoPercent = Math.round(((totalVagasEscolinhas + participantesEventos) / populacaoEstimada) * 100 * 100) / 100;
      
      // Modalidades únicas oferecidas
      const modalidadesEscolinhas = new Set(escolinhasEsportivas.map(e => e.modalidade));
      const modalidadesAtletas = new Set(atletasMunicipais.map(a => a.modalidade_principal));
      const modalidadesUnicas = new Set([...modalidadesEscolinhas, ...modalidadesAtletas]);

      const dashboardStats: DashboardEsportes = {
        equipamentos_ativos: equipamentosAtivos,
        total_equipamentos: totalEquipamentos,
        escolinhas_ativas: escolinhasAtivas,
        atletas_programas: atletasPrograma,
        eventos_periodo: eventosPeriodo,
        participacao_populacao_percent: participacaoPercent,
        investimento_per_capita: 17.00, // Simulado - R$ 850.000 / 50.000 habitantes
        modalidades_oferecidas: modalidadesUnicas.size
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
    fetchEquipamentosEsportivos();
    fetchAgendamentosEquipamentos();
    fetchEscolinhasEsportivas();
    fetchAtletasEscolinhas();
    fetchAtletasMunicipais();
    fetchEventosEsportivos();
    fetchRecursosEsportivos();
    fetchDashboardData();
  }, []);

  return {
    // Estados
    equipamentosEsportivos,
    agendamentosEquipamentos,
    escolinhasEsportivas,
    atletasEscolinhas,
    atletasMunicipais,
    eventosEsportivos,
    recursosEsportivos,
    dashboardData,
    loading,
    error,
    
    // Equipamentos Esportivos
    fetchEquipamentosEsportivos,
    createEquipamentoEsportivo,
    updateEquipamentoEsportivo,
    fetchAgendamentosEquipamentos,
    createAgendamentoEquipamento,
    
    // Competições Municipais
    organizarCompeticionMunicipal,
    
    // Escolinhas Esportivas
    fetchEscolinhasEsportivas,
    createEscolinhaEsportiva,
    fetchAtletasEscolinhas,
    matricularAtletaEscolinha,
    
    // Atividades Comunitárias
    criarAtividadeComunitaria,
    
    // Atletas e Talentos
    fetchAtletasMunicipais,
    cadastrarAtletaMunicipal,
    atualizarBolsaAtleta,
    registrarResultadoAtleta,
    
    // Eventos Esportivos
    fetchEventosEsportivos,
    createEventoEsportivo,
    updateStatusEvento,
    
    // Gestão de Recursos
    fetchRecursosEsportivos,
    criarRecursoEsportivo,
    calcularRetornoInvestimento,
    
    // Dashboard
    fetchDashboardData
  };
};