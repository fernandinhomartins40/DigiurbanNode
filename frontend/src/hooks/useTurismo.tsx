import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";
import { toast } from 'react-hot-toast';

// 🏖️ TURISMO - HOOK COMPLETO COM 6 FUNCIONALIDADES

// Types
interface PontoTuristico {
  id: number;
  nome: string;
  tipo: 'NATURAL' | 'HISTORICO' | 'CULTURAL' | 'RELIGIOSO' | 'AVENTURA';
  categoria?: string;
  endereco: string;
  bairro?: string;
  latitude?: number;
  longitude?: number;
  descricao: string;
  historia?: string;
  melhor_epoca_visita?: string;
  horario_funcionamento?: string;
  valor_entrada: number;
  capacidade_visitantes?: number;
  tem_estacionamento: boolean;
  tem_acessibilidade: boolean;
  tem_guia: boolean;
  infraestrutura?: string[];
  fotos_urls?: string[];
  site_oficial?: string;
  telefone_contato?: string;
  status: 'ATIVO' | 'INATIVO' | 'MANUTENCAO' | 'REFORMA';
  avaliacao_media?: number;
  numero_avaliacoes: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface EstabelecimentoTuristico {
  id: number;
  nome: string;
  tipo: 'HOTEL' | 'POUSADA' | 'RESTAURANTE' | 'AGENCIA' | 'TRANSPORTE';
  categoria?: string;
  cnpj?: string;
  endereco: string;
  bairro?: string;
  telefone?: string;
  email?: string;
  site_oficial?: string;
  redes_sociais?: any;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  capacidade?: number;
  servicos_oferecidos?: string[];
  preco_medio?: number;
  aceita_cartao: boolean;
  tem_wifi: boolean;
  tem_estacionamento: boolean;
  tem_acessibilidade: boolean;
  classificacao_oficial?: string;
  licenca_funcionamento?: string;
  data_licenca?: string;
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'SUSPENSO';
  avaliacao_media?: number;
  numero_avaliacoes: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface EventoTuristico {
  id: number;
  nome: string;
  tipo: 'FESTIVAL' | 'FEIRA' | 'SHOW' | 'EXPOSICAO' | 'CONGRESSO';
  categoria?: string;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
  horario_inicio?: string;
  horario_fim?: string;
  local_realizacao: string;
  organizador?: string;
  telefone_organizador?: string;
  publico_estimado?: number;
  valor_entrada: number;
  tem_estacionamento: boolean;
  tem_alimentacao: boolean;
  tem_hospedagem: boolean;
  atracao_principal?: string;
  programacao_completa?: string;
  patrocinadores?: string[];
  apoios?: string[];
  fotos_urls?: string[];
  site_evento?: string;
  redes_sociais?: any;
  status: 'PLANEJADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface RoteiroTuristico {
  id: number;
  nome: string;
  tipo: 'CULTURAL' | 'AVENTURA' | 'GASTRONOMICO' | 'RELIGIOSO';
  descricao: string;
  duracao_horas?: number;
  dificuldade?: 'FACIL' | 'MODERADO' | 'DIFICIL';
  pontos_turisticos?: number[];
  estabelecimentos?: number[];
  distancia_total_km?: number;
  meio_transporte?: 'A_PE' | 'BICICLETA' | 'CARRO' | 'ONIBUS';
  melhor_epoca?: string;
  preco_estimado?: number;
  inclui_guia: boolean;
  inclui_transporte: boolean;
  inclui_alimentacao: boolean;
  maximo_pessoas?: number;
  idade_minima?: number;
  equipamentos_necessarios?: string[];
  recomendacoes?: string[];
  fotos_urls?: string[];
  mapa_url?: string;
  status: 'ATIVO' | 'INATIVO' | 'MANUTENCAO';
  avaliacao_media?: number;
  numero_avaliacoes: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface InformacaoTuristica {
  id: number;
  titulo: string;
  categoria: 'ATRATIVO' | 'EVENTO' | 'SERVICO' | 'TRANSPORTE' | 'HOSPEDAGEM';
  conteudo: string;
  tags?: string[];
  imagem_url?: string;
  link_externo?: string;
  data_validade?: string;
  visualizacoes: number;
  status: 'ATIVO' | 'INATIVO' | 'VENCIDO';
  created_at: string;
  updated_at: string;
}

interface CampanhaPromocional {
  id: number;
  nome_campanha: string;
  objetivo: string;
  publico_alvo: string;
  canais_divulgacao: string[];
  orcamento_total?: number;
  data_inicio: string;
  data_fim: string;
  metricas_esperadas?: any;
  resultado_obtido?: any;
  material_promocional?: string[];
  responsavel_campanha: string;
  status: 'PLANEJADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Data
interface DashboardTurismo {
  pontos_turisticos_mapeados: number;
  visitantes_estimados_mes: number;
  eventos_agendados: number;
  estabelecimentos_cadastrados: number;
  campanhas_ativas: number;
  receita_turistica_estimada: number;
  empregos_gerados: number;
  indice_avaliacao_turistas: number;
}

export const useTurismo = () => {
  // Estados
  const [pontosTuristicos, setPontosTuristicos] = useState<PontoTuristico[]>([]);
  const [estabelecimentosTuristicos, setEstabelecimentosTuristicos] = useState<EstabelecimentoTuristico[]>([]);
  const [eventosTuristicos, setEventosTuristicos] = useState<EventoTuristico[]>([]);
  const [roteirosTuristicos, setRoteirosTuristicos] = useState<RoteiroTuristico[]>([]);
  const [informacoesTuristicas, setInformacoesTuristicas] = useState<InformacaoTuristica[]>([]);
  const [campanhasPromocionais, setCampanhasPromocionais] = useState<CampanhaPromocional[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardTurismo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 4.1 PONTOS TURÍSTICOS
  const fetchPontosTuristicos = async (tipo?: string, status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('pontos_turisticos')
        .select('*')
        .order('nome', { ascending: true });

      if (tipo) query = query.eq('tipo', tipo);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setPontosTuristicos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPontoTuristico = async (pontoData: Omit<PontoTuristico, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pontos_turisticos')
        .insert([pontoData])
        .select()
        .single();

      if (error) throw error;
      setPontosTuristicos(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePontoTuristico = async (id: number, updates: Partial<PontoTuristico>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pontos_turisticos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPontosTuristicos(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const avaliarPontoTuristico = async (id: number, avaliacao: number, comentario?: string) => {
    const ponto = pontosTuristicos.find(p => p.id === id);
    if (!ponto) return { success: false, error: 'Ponto turístico não encontrado' };

    const novaMedia = ponto.avaliacao_media 
      ? ((ponto.avaliacao_media * ponto.numero_avaliacoes) + avaliacao) / (ponto.numero_avaliacoes + 1)
      : avaliacao;

    return updatePontoTuristico(id, {
      avaliacao_media: Math.round(novaMedia * 100) / 100,
      numero_avaliacoes: ponto.numero_avaliacoes + 1
    });
  };

  // 4.2 INFORMAÇÕES TURÍSTICAS
  const fetchInformacoesTuristicas = async (categoria?: string) => {
    try {
      setLoading(true);
      
      // Simulação para demo
      const informacoesSimuladas: InformacaoTuristica[] = [
        {
          id: 1,
          titulo: 'Como chegar aos principais pontos turísticos',
          categoria: 'TRANSPORTE',
          conteudo: 'Informações detalhadas sobre transporte público e particular para acessar os atrativos da cidade.',
          tags: ['transporte', 'acesso', 'roteiro'],
          visualizacoes: 245,
          status: 'ATIVO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Melhores épocas para visitar a cidade',
          categoria: 'ATRATIVO',
          conteudo: 'Guia completo das estações e eventos sazonais que influenciam a experiência turística.',
          tags: ['clima', 'temporada', 'planejamento'],
          visualizacoes: 189,
          status: 'ATIVO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          titulo: 'Opções de hospedagem para todos os perfis',
          categoria: 'HOSPEDAGEM',
          conteudo: 'Lista completa de hotéis, pousadas e hospedagens alternativas disponíveis no município.',
          tags: ['hospedagem', 'acomodação', 'turismo'],
          visualizacoes: 156,
          status: 'ATIVO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setInformacoesTuristicas(informacoesSimuladas);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createInformacaoTuristica = async (infoData: Omit<InformacaoTuristica, 'id' | 'visualizacoes' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      const novaInfo: InformacaoTuristica = {
        ...infoData,
        id: Date.now(),
        visualizacoes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setInformacoesTuristicas(prev => [novaInfo, ...prev]);
      return { success: true, data: novaInfo };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 4.3 PROGRAMAS DE TURISMO (usando roteiros)
  const fetchRoteirosTuristicos = async (tipo?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('roteiros_turisticos')
        .select('*')
        .order('nome', { ascending: true });

      if (tipo) query = query.eq('tipo', tipo);

      const { data, error } = await query;
      if (error) throw error;
      setRoteirosTuristicos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRoteiroTuristico = async (roteiroData: Omit<RoteiroTuristico, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roteiros_turisticos')
        .insert([roteiroData])
        .select()
        .single();

      if (error) throw error;
      setRoteirosTuristicos(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const criarProgramaTurismoRural = async (nome: string, descricao: string) => {
    return createRoteiroTuristico({
      nome: `Programa Rural - ${nome}`,
      tipo: 'CULTURAL',
      descricao,
      duracao_horas: 8,
      dificuldade: 'FACIL',
      meio_transporte: 'ONIBUS',
      preco_estimado: 120.00,
      inclui_guia: true,
      inclui_transporte: true,
      inclui_alimentacao: true,
      maximo_pessoas: 25,
      status: 'ATIVO',
      avaliacao_media: 0,
      numero_avaliacoes: 0
    });
  };

  const criarProgramaTurismoEcologico = async (nome: string, descricao: string) => {
    return createRoteiroTuristico({
      nome: `Ecoturismo - ${nome}`,
      tipo: 'AVENTURA',
      descricao,
      duracao_horas: 6,
      dificuldade: 'MODERADO',
      meio_transporte: 'A_PE',
      preco_estimado: 80.00,
      inclui_guia: true,
      inclui_transporte: false,
      inclui_alimentacao: false,
      maximo_pessoas: 15,
      equipamentos_necessarios: ['Tênis de trilha', 'Protetor solar', 'Água'],
      status: 'ATIVO',
      avaliacao_media: 0,
      numero_avaliacoes: 0
    });
  };

  // 4.4 EVENTOS E FESTIVAIS
  const fetchEventosTuristicos = async (status?: string, tipo?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('eventos_turisticos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (status) query = query.eq('status', status);
      if (tipo) query = query.eq('tipo', tipo);

      const { data, error } = await query;
      if (error) throw error;
      setEventosTuristicos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEventoTuristico = async (eventoData: Omit<EventoTuristico, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos_turisticos')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;
      setEventosTuristicos(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const organizarFestivalCultural = async (nome: string, descricao: string, dataInicio: string, dataFim?: string) => {
    return createEventoTuristico({
      nome,
      tipo: 'FESTIVAL',
      categoria: 'CULTURAL',
      descricao,
      data_inicio: dataInicio,
      data_fim: dataFim,
      local_realizacao: 'Praça Central',
      publico_estimado: 5000,
      valor_entrada: 0,
      tem_estacionamento: true,
      tem_alimentacao: true,
      tem_hospedagem: false,
      status: 'PLANEJADO'
    });
  };

  // 4.5 CADASTRO TURÍSTICO
  const fetchEstabelecimentosTuristicos = async (tipo?: string, status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('estabelecimentos_turisticos')
        .select('*')
        .order('nome', { ascending: true });

      if (tipo) query = query.eq('tipo', tipo);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setEstabelecimentosTuristicos(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cadastrarEstabelecimentoTuristico = async (estabelecimentoData: Omit<EstabelecimentoTuristico, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estabelecimentos_turisticos')
        .insert([estabelecimentoData])
        .select()
        .single();

      if (error) throw error;
      setEstabelecimentosTuristicos(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const atualizarLicencaEstabelecimento = async (id: number, licenca: string, dataLicenca: string) => {
    return supabase
      .from('estabelecimentos_turisticos')
      .update({ 
        licenca_funcionamento: licenca,
        data_licenca: dataLicenca,
        status: 'ATIVO',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  };

  const certificarEstabelecimento = async (id: number, classificacao: string) => {
    return supabase
      .from('estabelecimentos_turisticos')
      .update({ 
        classificacao_oficial: classificacao,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  };

  // 4.6 PROMOÇÃO E MARKETING
  const fetchCampanhasPromocionais = async (status?: string) => {
    try {
      setLoading(true);
      
      // Simulação para demo
      const campanhasSimuladas: CampanhaPromocional[] = [
        {
          id: 1,
          nome_campanha: 'Descubra nossa cidade - Inverno 2024',
          objetivo: 'Aumentar visitação na temporada de inverno',
          publico_alvo: 'Turistas de cidades próximas interessados em turismo cultural',
          canais_divulgacao: ['Facebook', 'Instagram', 'Google Ads', 'Rádio Local'],
          orcamento_total: 25000.00,
          data_inicio: '2024-05-01',
          data_fim: '2024-07-31',
          responsavel_campanha: 'Coordenador de Marketing Turístico',
          status: 'EM_ANDAMENTO',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome_campanha: 'Festival Gastronômico Regional',
          objetivo: 'Promover a gastronomia local e atrair turistas gourmets',
          publico_alvo: 'Apreciadores de gastronomia regional',
          canais_divulgacao: ['Instagram', 'Influenciadores', 'Site oficial', 'Feiras gastronômicas'],
          orcamento_total: 18000.00,
          data_inicio: '2024-06-15',
          data_fim: '2024-08-15',
          responsavel_campanha: 'Assessora de Comunicação',
          status: 'PLANEJADA',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setCampanhasPromocionais(campanhasSimuladas);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const criarCampanhaPromocional = async (campanhaData: Omit<CampanhaPromocional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      const novaCampanha: CampanhaPromocional = {
        ...campanhaData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCampanhasPromocionais(prev => [novaCampanha, ...prev]);
      return { success: true, data: novaCampanha };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const analisarDemandaTuristica = async (periodo: string) => {
    // Simulação de análise de demanda
    const eventosProximos = eventosTuristicos.filter(e => {
      const dataEvento = new Date(e.data_inicio);
      const agora = new Date();
      const tresMesesFuturos = new Date();
      tresMesesFuturos.setMonth(agora.getMonth() + 3);
      return dataEvento >= agora && dataEvento <= tresMesesFuturos;
    });

    const pontosMaisAvaliados = pontosTuristicos
      .filter(p => p.numero_avaliacoes > 0)
      .sort((a, b) => (b.avaliacao_media || 0) - (a.avaliacao_media || 0))
      .slice(0, 5);

    const estabelecimentosAtivos = estabelecimentosTuristicos.filter(e => e.status === 'ATIVO');

    return {
      periodo,
      eventos_proximos: eventosProximos.length,
      pontos_mais_procurados: pontosMaisAvaliados.map(p => p.nome),
      ocupacao_estimada: '65%', // Simulado
      receita_projetada: eventosProximos.reduce((acc, e) => acc + ((e.publico_estimado || 0) * (e.valor_entrada || 0)), 0),
      estabelecimentos_participantes: estabelecimentosAtivos.length,
      recomendacoes: [
        'Intensificar marketing digital nos próximos 2 meses',
        'Criar pacotes promocionais para baixa temporada',
        'Desenvolver parcerias com agências de turismo regional'
      ]
    };
  };

  // DASHBOARD
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Por enquanto, usar dados mock pois tabelas não existem no backend
      console.warn('Usando dados mock para dashboard turismo - tabelas não implementadas no backend')
      
      const dashboardStats: DashboardTurismo = {
        pontos_turisticos_mapeados: 20,
        visitantes_estimados_mes: 8500,
        eventos_agendados: 12,
        estabelecimentos_cadastrados: 45,
        campanhas_ativas: 3,
        receita_turistica_estimada: 450000,
        empregos_gerados: 180,
        indice_avaliacao_turistas: 4.2
      };

      setDashboardData(dashboardStats);
    } catch (err: any) {
      console.warn('Erro ao carregar dados do dashboard turismo, usando dados mock:', err)
      
      // Fallback para dados mock
      const dashboardStats: DashboardTurismo = {
        pontos_turisticos_mapeados: 20,
        visitantes_estimados_mes: 8500,
        eventos_agendados: 12,
        estabelecimentos_cadastrados: 45,
        campanhas_ativas: 3,
        receita_turistica_estimada: 450000,
        empregos_gerados: 180,
        indice_avaliacao_turistas: 4.2
      };
      
      setDashboardData(dashboardStats);
      setError(null); // Limpar erro pois temos fallback
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    // Por enquanto, apenas carregar dashboard e informações que não dependem de supabase
    fetchInformacoesTuristicas();
    fetchCampanhasPromocionais();
    fetchDashboardData();
  }, []);

  return {
    // Estados
    pontosTuristicos,
    estabelecimentosTuristicos,
    eventosTuristicos,
    roteirosTuristicos,
    informacoesTuristicas,
    campanhasPromocionais,
    dashboardData,
    loading,
    error,
    
    // Pontos Turísticos
    fetchPontosTuristicos,
    createPontoTuristico,
    updatePontoTuristico,
    avaliarPontoTuristico,
    
    // Informações Turísticas
    fetchInformacoesTuristicas,
    createInformacaoTuristica,
    
    // Programas de Turismo
    fetchRoteirosTuristicos,
    createRoteiroTuristico,
    criarProgramaTurismoRural,
    criarProgramaTurismoEcologico,
    
    // Eventos e Festivais
    fetchEventosTuristicos,
    createEventoTuristico,
    organizarFestivalCultural,
    
    // Cadastro Turístico
    fetchEstabelecimentosTuristicos,
    cadastrarEstabelecimentoTuristico,
    atualizarLicencaEstabelecimento,
    certificarEstabelecimento,
    
    // Promoção e Marketing
    fetchCampanhasPromocionais,
    criarCampanhaPromocional,
    analisarDemandaTuristica,
    
    // Dashboard
    fetchDashboardData
  };
};