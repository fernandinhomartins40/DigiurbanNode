import { useState, useEffect } from 'react';
import { APIClient } from "@/auth";

// 🏠 HABITAÇÃO - HOOK COMPLETO COM 5 FUNCIONALIDADES

// Types
interface ProgramaHabitacional {
  id: number;
  nome: string;
  tipo_programa: 'CASA_PROPRIA' | 'ALUGUEL_SOCIAL' | 'MELHORIAS' | 'REGULARIZACAO';
  descricao: string;
  orcamento_total: number;
  numero_beneficiarios_previsto: number;
  numero_beneficiarios_atual: number;
  valor_por_familia: number;
  criterios_elegibilidade: string;
  documentos_necessarios: string[];
  renda_maxima_familia: number;
  pontuacao_minima?: number;
  periodo_inscricoes_inicio?: string;
  periodo_inscricoes_fim?: string;
  local_entrega?: string;
  tipo_imovel?: string;
  area_m2?: number;
  numero_comodos?: number;
  tem_escritura: boolean;
  prazo_entrega_meses?: number;
  responsavel_programa: string;
  telefone_responsavel?: string;
  status: 'ATIVO' | 'SUSPENSO' | 'FINALIZADO' | 'PLANEJAMENTO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface CadastroHabitacional {
  id: number;
  protocolo: string;
  nome_titular: string;
  cpf_titular: string;
  rg_titular?: string;
  data_nascimento: string;
  estado_civil?: string;
  telefone: string;
  email?: string;
  endereco_atual: string;
  bairro_atual?: string;
  tempo_residencia_anos?: number;
  situacao_moradia: 'PROPRIA' | 'ALUGADA' | 'CEDIDA' | 'INVADIDA' | 'OUTROS';
  valor_aluguel?: number;
  numero_pessoas_familia: number;
  renda_familiar_mensal: number;
  tem_deficiente: boolean;
  tem_idoso: boolean;
  tem_crianca: boolean;
  condicoes_moradia_atual?: string;
  area_interesse?: string[];
  pontuacao_total: number;
  data_cadastro: string;
  situacao: 'ATIVO' | 'INATIVO' | 'CONTEMPLADO' | 'DESQUALIFICADO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface ComposicaoFamiliar {
  id: number;
  cadastro_id: number;
  nome_completo: string;
  parentesco: string;
  cpf?: string;
  data_nascimento: string;
  tem_renda: boolean;
  valor_renda?: number;
  profissao?: string;
  tem_deficiencia: boolean;
  tipo_deficiencia?: string;
  estuda: boolean;
  observacoes?: string;
  created_at: string;
}

interface InscricaoHabitacional {
  id: number;
  programa_id: number;
  cadastro_id: number;
  data_inscricao: string;
  documentos_entregues: string[];
  pontuacao_obtida?: number;
  classificacao?: number;
  status: 'INSCRITO' | 'APROVADO' | 'REPROVADO' | 'CONTEMPLADO';
  data_avaliacao?: string;
  parecer_social?: string;
  observacoes_avaliacao?: string;
  data_contemplacao?: string;
  endereco_imovel_contemplado?: string;
  valor_financiamento?: number;
  observacoes?: string;
  created_at: string;
  programa?: ProgramaHabitacional;
  cadastro?: CadastroHabitacional;
}

interface MelhoriaHabitacional {
  id: number;
  protocolo: string;
  beneficiario_nome: string;
  beneficiario_cpf: string;
  endereco_imovel: string;
  tipo_melhoria: 'REFORMA' | 'AMPLIACAO' | 'ACESSIBILIDADE' | 'SANEAMENTO';
  descricao_servicos: string;
  materiais_fornecidos?: string[];
  mao_obra_inclusa: boolean;
  valor_investimento: number;
  contrapartida_beneficiario: number;
  data_aprovacao?: string;
  data_inicio_prevista?: string;
  data_conclusao_prevista?: string;
  data_inicio_real?: string;
  data_conclusao_real?: string;
  empresa_executora?: string;
  responsavel_tecnico?: string;
  percentual_execucao: number;
  status: 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'SUSPENSO' | 'CANCELADO';
  fotos_antes?: string[];
  fotos_depois?: string[];
  avaliacao_beneficiario?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface RegularizacaoFundiaria {
  id: number;
  protocolo: string;
  nome_area: string;
  endereco_area: string;
  bairro?: string;
  area_total_m2: number;
  numero_familias: number;
  situacao_legal: 'IRREGULAR' | 'EM_REGULARIZACAO' | 'REGULARIZADO';
  tipo_regularizacao?: 'USUCAPIAO' | 'REURB' | 'LEGITIMACAO_POSSE';
  orgao_responsavel?: string;
  data_inicio_processo?: string;
  data_conclusao_prevista?: string;
  data_conclusao_real?: string;
  documentos_necessarios?: string[];
  documentos_obtidos?: string[];
  custos_processo?: number;
  beneficiarios_contemplados?: string[];
  observacoes_processo?: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'SUSPENSO' | 'CANCELADO';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Data
interface DashboardHabitacao {
  familias_programas_habitacionais: number;
  unidades_entregues_periodo: number;
  processos_regularizacao_andamento: number;
  melhorias_realizadas_mes: number;
  deficit_habitacional_percentual: number;
  investimento_habitacao: number;
  familias_beneficiadas_total: number;
  indice_qualidade_habitacional: number;
}

export const useHabitacao = () => {
  // Estados
  const [programasHabitacionais, setProgramasHabitacionais] = useState<ProgramaHabitacional[]>([]);
  const [cadastrosHabitacionais, setCadastrosHabitacionais] = useState<CadastroHabitacional[]>([]);
  const [composicoesFamiliares, setComposicoesFamiliares] = useState<ComposicaoFamiliar[]>([]);
  const [inscricoesHabitacionais, setInscricoesHabitacionais] = useState<InscricaoHabitacional[]>([]);
  const [melhorias, setMelhorias] = useState<MelhoriaHabitacional[]>([]);
  const [regularizacoes, setRegularizacoes] = useState<RegularizacaoFundiaria[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardHabitacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5.1 PROGRAMAS HABITACIONAIS
  const fetchProgramasHabitacionais = async (status?: string, tipo?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('programas_habitacionais')
        .select('*')
        .order('nome', { ascending: true });

      if (status) query = query.eq('status', status);
      if (tipo) query = query.eq('tipo_programa', tipo);

      const { data, error } = await query;
      if (error) throw error;
      setProgramasHabitacionais(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProgramaHabitacional = async (programaData: Omit<ProgramaHabitacional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programas_habitacionais')
        .insert([programaData])
        .select()
        .single();

      if (error) throw error;
      setProgramasHabitacionais(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProgramaHabitacional = async (id: number, updates: Partial<ProgramaHabitacional>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programas_habitacionais')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProgramasHabitacionais(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const organizarSorteioPublico = async (programaId: number, numeroContemplados: number) => {
    try {
      // Buscar inscrições aprovadas para o programa
      const { data: inscricoes, error: inscricoesError } = await supabase
        .from('inscricoes_habitacionais')
        .select('*')
        .eq('programa_id', programaId)
        .eq('status', 'APROVADO');

      if (inscricoesError) throw inscricoesError;
      if (!inscricoes || inscricoes.length === 0) {
        return { success: false, error: 'Nenhuma inscrição aprovada encontrada' };
      }

      // Simular sorteio (randomização)
      const inscricoesEmbaralhadas = [...inscricoes].sort(() => Math.random() - 0.5);
      const contemplados = inscricoesEmbaralhadas.slice(0, numeroContemplados);

      // Atualizar status dos contemplados
      for (const contemplado of contemplados) {
        await supabase
          .from('inscricoes_habitacionais')
          .update({ 
            status: 'CONTEMPLADO',
            data_contemplacao: new Date().toISOString().split('T')[0]
          })
          .eq('id', contemplado.id);
      }

      await fetchInscricoesHabitacionais(); // Refresh da lista
      return { 
        success: true, 
        contemplados: contemplados.map(c => ({
          id: c.id,
          classificacao: contemplados.indexOf(c) + 1
        }))
      };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // 5.2 REGULARIZAÇÃO FUNDIÁRIA
  const fetchRegularizacoesFundiarias = async (situacao?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('regularizacao_fundiaria')
        .select('*')
        .order('nome_area', { ascending: true });

      if (situacao) query = query.eq('situacao_legal', situacao);

      const { data, error } = await query;
      if (error) throw error;
      setRegularizacoes(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRegularizacaoFundiaria = async (regularizacaoData: Omit<RegularizacaoFundiaria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const protocolo = `RF-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('regularizacao_fundiaria')
        .insert([{ ...regularizacaoData, protocolo }])
        .select()
        .single();

      if (error) throw error;
      setRegularizacoes(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateRegularizacaoFundiaria = async (id: number, updates: Partial<RegularizacaoFundiaria>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('regularizacao_fundiaria')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRegularizacoes(prev => prev.map(r => r.id === id ? data : r));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const mapearAreasIrregulares = async (areaData: {
    nome: string;
    endereco: string;
    area_m2: number;
    familias: number;
  }) => {
    return createRegularizacaoFundiaria({
      nome_area: areaData.nome,
      endereco_area: areaData.endereco,
      area_total_m2: areaData.area_m2,
      numero_familias: areaData.familias,
      situacao_legal: 'IRREGULAR',
      status: 'EM_ANDAMENTO',
      protocolo: '' // Será preenchido automaticamente
    });
  };

  // 5.3 MELHORIAS HABITACIONAIS
  const fetchMelhoriasHabitacionais = async (status?: string, tipo?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('melhorias_habitacionais')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (tipo) query = query.eq('tipo_melhoria', tipo);

      const { data, error } = await query;
      if (error) throw error;
      setMelhorias(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMelhoriaHabitacional = async (melhoriaData: Omit<MelhoriaHabitacional, 'id' | 'protocolo' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const protocolo = `MH-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('melhorias_habitacionais')
        .insert([{ ...melhoriaData, protocolo }])
        .select()
        .single();

      if (error) throw error;
      setMelhorias(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateMelhoriaHabitacional = async (id: number, updates: Partial<MelhoriaHabitacional>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('melhorias_habitacionais')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMelhorias(prev => prev.map(m => m.id === id ? data : m));
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const aprovarMelhoria = async (id: number, valorInvestimento: number, prazoExecucao: string) => {
    return updateMelhoriaHabitacional(id, {
      status: 'APROVADO',
      data_aprovacao: new Date().toISOString().split('T')[0],
      valor_investimento: valorInvestimento,
      data_conclusao_prevista: prazoExecucao
    });
  };

  const iniciarExecucaoMelhoria = async (id: number, empresaExecutora: string, responsavelTecnico: string) => {
    return updateMelhoriaHabitacional(id, {
      status: 'EM_EXECUCAO',
      data_inicio_real: new Date().toISOString().split('T')[0],
      empresa_executora: empresaExecutora,
      responsavel_tecnico: responsavelTecnico,
      percentual_execucao: 0
    });
  };

  const atualizarProgressoMelhoria = async (id: number, percentual: number) => {
    const status = percentual >= 100 ? 'CONCLUIDO' : 'EM_EXECUCAO';
    const dataTermino = percentual >= 100 ? new Date().toISOString().split('T')[0] : undefined;
    
    return updateMelhoriaHabitacional(id, {
      percentual_execucao: percentual,
      status,
      ...(dataTermino && { data_conclusao_real: dataTermino })
    });
  };

  // 5.4 HABITAÇÃO SOCIAL
  const criarAluguelSocial = async (beneficiario: string, cpf: string, valorAluguel: number, prazoMeses: number) => {
    return createProgramaHabitacional({
      nome: `Aluguel Social - ${beneficiario}`,
      tipo_programa: 'ALUGUEL_SOCIAL',
      descricao: `Auxílio aluguel para ${beneficiario} por ${prazoMeses} meses`,
      orcamento_total: valorAluguel * prazoMeses,
      numero_beneficiarios_previsto: 1,
      numero_beneficiarios_atual: 1,
      valor_por_familia: valorAluguel,
      criterios_elegibilidade: 'Situação de emergência habitacional comprovada',
      documentos_necessarios: ['CPF', 'RG', 'Comprovante de renda', 'Laudo social'],
      renda_maxima_familia: 1500.00,
      responsavel_programa: 'Coordenação de Habitação Social',
      status: 'ATIVO',
      tem_escritura: false
    });
  };

  const atenderEmergenciaHabitacional = async (dadosEmergencia: {
    nome: string;
    cpf: string;
    endereco: string;
    situacao: string;
    pessoas_familia: number;
  }) => {
    // Criar programa de emergência
    const programaEmergencia = await createProgramaHabitacional({
      nome: `Emergência Habitacional - ${dadosEmergencia.nome}`,
      tipo_programa: 'ALUGUEL_SOCIAL',
      descricao: `Atendimento emergencial: ${dadosEmergencia.situacao}`,
      orcamento_total: 2400.00, // 6 meses x R$ 400
      numero_beneficiarios_previsto: 1,
      numero_beneficiarios_atual: 1,
      valor_por_familia: 400.00,
      criterios_elegibilidade: 'Situação de emergência comprovada',
      documentos_necessarios: ['CPF', 'RG', 'Laudo de emergência'],
      renda_maxima_familia: 1500.00,
      responsavel_programa: 'Defesa Civil / Habitação',
      status: 'ATIVO',
      tem_escritura: false
    });

    // Criar cadastro emergencial
    if (programaEmergencia.success) {
      const cadastroEmergencial = await createCadastroHabitacional({
        nome_titular: dadosEmergencia.nome,
        cpf_titular: dadosEmergencia.cpf,
        data_nascimento: '1980-01-01', // Padrão para emergências
        telefone: '(11) 99999-9999',
        endereco_atual: dadosEmergencia.endereco,
        situacao_moradia: 'OUTROS',
        numero_pessoas_familia: dadosEmergencia.pessoas_familia,
        renda_familiar_mensal: 0,
        tem_deficiente: false,
        tem_idoso: false,
        tem_crianca: dadosEmergencia.pessoas_familia > 2,
        pontuacao_total: 100, // Pontuação máxima para emergência
        data_cadastro: new Date().toISOString().split('T')[0],
        situacao: 'CONTEMPLADO',
        protocolo: ''
      });

      return { programaEmergencia, cadastroEmergencial };
    }

    return programaEmergencia;
  };

  // 5.5 CONTROLE HABITACIONAL
  const fetchCadastrosHabitacionais = async (situacao?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('cadastro_habitacional')
        .select('*')
        .order('data_cadastro', { ascending: false });

      if (situacao) query = query.eq('situacao', situacao);

      const { data, error } = await query;
      if (error) throw error;
      setCadastrosHabitacionais(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCadastroHabitacional = async (cadastroData: Omit<CadastroHabitacional, 'id' | 'protocolo' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const protocolo = `CAD-HAB-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('cadastro_habitacional')
        .insert([{ ...cadastroData, protocolo }])
        .select()
        .single();

      if (error) throw error;
      setCadastrosHabitacionais(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const calcularPontuacaoFamilia = (dadosFamilia: {
    renda: number;
    pessoas: number;
    temDeficiente: boolean;
    temIdoso: boolean;
    temCrianca: boolean;
    situacaoMoradia: string;
    tempoResidencia: number;
  }) => {
    let pontuacao = 0;
    
    // Critério renda (0-30 pontos)
    if (dadosFamilia.renda <= 1000) pontuacao += 30;
    else if (dadosFamilia.renda <= 2000) pontuacao += 20;
    else if (dadosFamilia.renda <= 3000) pontuacao += 10;
    
    // Critério composição familiar (0-25 pontos)
    pontuacao += Math.min(dadosFamilia.pessoas * 3, 15); // Máximo 15 pontos
    if (dadosFamilia.temDeficiente) pontuacao += 10;
    if (dadosFamilia.temIdoso) pontuacao += 5;
    if (dadosFamilia.temCrianca) pontuacao += 5;
    
    // Critério situação moradia (0-20 pontos)
    switch (dadosFamilia.situacaoMoradia) {
      case 'INVADIDA': pontuacao += 20; break;
      case 'ALUGADA': pontuacao += 15; break;
      case 'CEDIDA': pontuacao += 10; break;
      case 'OUTROS': pontuacao += 15; break;
    }
    
    // Critério tempo de residência (0-15 pontos)
    pontuacao += Math.min(dadosFamilia.tempoResidencia * 2, 15);
    
    return Math.min(pontuacao, 100); // Máximo 100 pontos
  };

  const fetchInscricoesHabitacionais = async (programaId?: number, status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('inscricoes_habitacionais')
        .select(`
          *,
          programa:programa_id (*),
          cadastro:cadastro_id (*)
        `)
        .order('pontuacao_obtida', { ascending: false });

      if (programaId) query = query.eq('programa_id', programaId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      setInscricoesHabitacionais(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inscreverFamiliaPrograma = async (programaId: number, cadastroId: number, documentos: string[]) => {
    try {
      setLoading(true);
      const cadastro = cadastrosHabitacionais.find(c => c.id === cadastroId);
      if (!cadastro) return { success: false, error: 'Cadastro não encontrado' };

      const { data, error } = await supabase
        .from('inscricoes_habitacionais')
        .insert([{
          programa_id: programaId,
          cadastro_id: cadastroId,
          data_inscricao: new Date().toISOString().split('T')[0],
          documentos_entregues: documentos,
          pontuacao_obtida: cadastro.pontuacao_total,
          status: 'INSCRITO'
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchInscricoesHabitacionais(); // Refresh da lista
      return { success: true, data };
    } catch (err: Error | unknown) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const analisarDeficitHabitacional = async () => {
    try {
      // Buscar dados dos cadastros
      const { data: cadastros } = await supabase
        .from('cadastro_habitacional')
        .select('situacao, situacao_moradia, numero_pessoas_familia, renda_familiar_mensal');

      // Buscar programas ativos
      const { data: programas } = await supabase
        .from('programas_habitacionais')
        .select('numero_beneficiarios_previsto, numero_beneficiarios_atual, status');

      const cadastrosAtivos = cadastros?.filter(c => c.situacao === 'ATIVO') || [];
      const programasAtivos = programas?.filter(p => p.status === 'ATIVO') || [];
      
      // Cálculos do déficit
      const familiasCadastradas = cadastrosAtivos.length;
      const familiasEmSituacaoPrecaria = cadastrosAtivos.filter(c => 
        c.situacao_moradia === 'INVADIDA' || c.situacao_moradia === 'OUTROS'
      ).length;
      
      const ofertaTotal = programasAtivos.reduce((acc, p) => acc + p.numero_beneficiarios_previsto, 0);
      const atendimentosRealizados = programasAtivos.reduce((acc, p) => acc + p.numero_beneficiarios_atual, 0);
      
      const deficitAbsoluto = familiasCadastradas - atendimentosRealizados;
      const deficitPercentual = familiasCadastradas > 0 ? (deficitAbsoluto / familiasCadastradas) * 100 : 0;
      
      // Análise por faixa de renda
      const faixaRenda1 = cadastrosAtivos.filter(c => c.renda_familiar_mensal <= 1500).length;
      const faixaRenda2 = cadastrosAtivos.filter(c => c.renda_familiar_mensal > 1500 && c.renda_familiar_mensal <= 3000).length;
      const faixaRenda3 = cadastrosAtivos.filter(c => c.renda_familiar_mensal > 3000).length;

      return {
        familias_cadastradas: familiasCadastradas,
        deficit_absoluto: deficitAbsoluto,
        deficit_percentual: Math.round(deficitPercentual * 100) / 100,
        situacao_precaria: familiasEmSituacaoPrecaria,
        oferta_total: ofertaTotal,
        atendimentos_realizados: atendimentosRealizados,
        distribuicao_renda: {
          ate_1500: faixaRenda1,
          de_1501_3000: faixaRenda2,
          acima_3000: faixaRenda3
        },
        recomendacoes: [
          deficitPercentual > 50 ? 'Ampliar urgentemente programas habitacionais' : 'Manter ritmo atual de atendimento',
          familiasEmSituacaoPrecaria > 10 ? 'Priorizar regularização fundiária' : 'Continuar monitoramento',
          faixaRenda1 > (familiasCadastradas * 0.6) ? 'Focar em programas para baixa renda' : 'Diversificar programas'
        ]
      };
    } catch (err: Error | unknown) {
      setError(err.message);
      return null;
    }
  };

  // DASHBOARD
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos programas
      const { data: programasData } = await supabase
        .from('programas_habitacionais')
        .select('status, numero_beneficiarios_atual, orcamento_total');

      // Buscar inscrições contempladas
      const { data: inscricoesData } = await supabase
        .from('inscricoes_habitacionais')
        .select('status, data_contemplacao');

      // Buscar melhorias do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const { data: melhoriasData } = await supabase
        .from('melhorias_habitacionais')
        .select('status, created_at')
        .gte('created_at', inicioMes.toISOString());

      // Buscar regularizações em andamento
      const { data: regularizacoesData } = await supabase
        .from('regularizacao_fundiaria')
        .select('status, numero_familias');

      // Buscar total de cadastros
      const { data: cadastrosData } = await supabase
        .from('cadastro_habitacional')
        .select('situacao');

      // Calcular estatísticas
      const programasAtivos = programasData?.filter(p => p.status === 'ATIVO').length || 0;
      const familiasProgramas = programasData?.reduce((acc, p) => acc + (p.numero_beneficiarios_atual || 0), 0) || 0;
      const unidadesEntregues = inscricoesData?.filter(i => i.status === 'CONTEMPLADO').length || 0;
      const melhoriasRealizadas = melhoriasData?.filter(m => m.status === 'CONCLUIDO').length || 0;
      const regularizacoesAndamento = regularizacoesData?.filter(r => r.status === 'EM_ANDAMENTO').length || 0;
      const investimentoTotal = programasData?.reduce((acc, p) => acc + (p.orcamento_total || 0), 0) || 0;
      
      // Cálculo do déficit habitacional (simulado)
      const cadastrosAtivos = cadastrosData?.filter(c => c.situacao === 'ATIVO').length || 0;
      const deficitPercentual = cadastrosAtivos > 0 ? Math.round(((cadastrosAtivos - familiasProgramas) / cadastrosAtivos) * 100 * 100) / 100 : 0;
      
      // Índice de qualidade habitacional (simulado)
      const indiceQualidade = Math.max(0, 100 - deficitPercentual);

      const dashboardStats: DashboardHabitacao = {
        familias_programas_habitacionais: familiasProgramas,
        unidades_entregues_periodo: unidadesEntregues,
        processos_regularizacao_andamento: regularizacoesAndamento,
        melhorias_realizadas_mes: melhoriasRealizadas,
        deficit_habitacional_percentual: deficitPercentual,
        investimento_habitacao: investimentoTotal,
        familias_beneficiadas_total: familiasProgramas + melhoriasRealizadas,
        indice_qualidade_habitacional: indiceQualidade
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
    fetchProgramasHabitacionais();
    fetchCadastrosHabitacionais();
    fetchInscricoesHabitacionais();
    fetchMelhoriasHabitacionais();
    fetchRegularizacoesFundiarias();
    fetchDashboardData();
  }, []);

  return {
    // Estados
    programasHabitacionais,
    cadastrosHabitacionais,
    composicoesFamiliares,
    inscricoesHabitacionais,
    melhorias,
    regularizacoes,
    dashboardData,
    loading,
    error,
    
    // Programas Habitacionais
    fetchProgramasHabitacionais,
    createProgramaHabitacional,
    updateProgramaHabitacional,
    organizarSorteioPublico,
    
    // Regularização Fundiária
    fetchRegularizacoesFundiarias,
    createRegularizacaoFundiaria,
    updateRegularizacaoFundiaria,
    mapearAreasIrregulares,
    
    // Melhorias Habitacionais
    fetchMelhoriasHabitacionais,
    createMelhoriaHabitacional,
    updateMelhoriaHabitacional,
    aprovarMelhoria,
    iniciarExecucaoMelhoria,
    atualizarProgressoMelhoria,
    
    // Habitação Social
    criarAluguelSocial,
    atenderEmergenciaHabitacional,
    
    // Controle Habitacional
    fetchCadastrosHabitacionais,
    createCadastroHabitacional,
    calcularPontuacaoFamilia,
    fetchInscricoesHabitacionais,
    inscreverFamiliaPrograma,
    analisarDeficitHabitacional,
    
    // Dashboard
    fetchDashboardData
  };
};