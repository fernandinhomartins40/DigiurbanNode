// =====================================================
// HOOK COMPLETO PARA SECRETARIA DE SAÚDE
// 9 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface UnidadeSaude {
  id: string
  nome: string
  tipo: 'ubs' | 'upf' | 'hospital' | 'clinica' | 'caps' | 'pronto_socorro'
  endereco: string
  telefone: string
  horario_funcionamento: any
  especialidades_disponiveis: string[]
  secretaria_id: string
  ativa: boolean
  created_at: string
}

export interface AgendamentoMedico {
  id: string
  paciente_id: string
  profissional_id: string
  especialidade: string
  data_agendamento: string
  duracao_minutos: number
  status: 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado' | 'reagendado'
  tipo: 'consulta' | 'exame' | 'procedimento' | 'retorno' | 'urgencia'
  observacoes?: string
  lembrete_enviado: boolean
  unidade_saude_id: string
  created_at: string
  
  // Relacionamentos
  paciente?: {
    id: string
    nome: string
    cpf: string
    telefone: string
  }
  profissional?: {
    id: string
    nome: string
    especialidade: string
  }
  unidade_saude?: UnidadeSaude
}

export interface Medicamento {
  id: string
  nome: string
  principio_ativo: string
  concentracao: string
  forma_farmaceutica: string
  categoria: string
  controlado: boolean
  created_at: string
}

export interface EstoqueMedicamento {
  id: string
  medicamento_id: string
  unidade_saude_id: string
  lote: string
  quantidade: number
  quantidade_minima: number
  data_validade: string
  preco_unitario: number
  fornecedor: string
  created_at: string
  updated_at: string
  
  // Relacionamentos
  medicamento?: Medicamento
  unidade_saude?: UnidadeSaude
}

export interface CampanhaSaude {
  id: string
  nome: string
  descricao?: string
  tipo: 'vacinacao' | 'preventivo' | 'educativa' | 'exames'
  publico_alvo: any
  data_inicio: string
  data_fim: string
  meta: number
  realizado: number
  unidades_participantes: string[]
  responsavel_id: string
  ativa: boolean
  created_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
  }
}

export interface EquipeSaudeFamily {
  id: string
  codigo: string
  nome: string
  tipo: 'esf' | 'eab' | 'nasf'
  unidade_saude_id: string
  territorio: any
  micro_areas: number
  populacao_adscrita: number
  responsavel_id: string
  ativa: boolean
  created_at: string
  
  // Relacionamentos
  unidade_saude?: UnidadeSaude
  responsavel?: {
    nome: string
  }
  membros?: MembroEquipe[]
}

export interface MembroEquipe {
  id: string
  equipe_id: string
  profissional_id: string
  funcao: string
  micro_area?: number
  data_entrada: string
  data_saida?: string
  ativo: boolean
  
  // Relacionamentos
  profissional?: {
    nome: string
    email: string
  }
}

export interface SolicitacaoTFD {
  id: string
  paciente_id: string
  medico_solicitante_id: string
  especialidade: string
  procedimento_solicitado: string
  justificativa_medica: string
  cidade_destino: string
  data_solicitacao: string
  data_prevista?: string
  status: 'solicitado' | 'analisando' | 'aprovado' | 'rejeitado' | 'realizado' | 'cancelado'
  valor_estimado?: number
  observacoes?: string
  created_at: string
  
  // Relacionamentos
  paciente?: {
    nome: string
    cpf: string
  }
  medico_solicitante?: {
    nome: string
  }
}

export interface AgendamentoExame {
  id: string
  paciente_id: string
  tipo_exame_id: string
  medico_solicitante_id: string
  data_agendamento: string
  unidade_realizacao_id: string
  status: 'agendado' | 'confirmado' | 'realizado' | 'faltou' | 'cancelado'
  observacoes?: string
  resultado_disponivel: boolean
  data_resultado?: string
  created_at: string
  
  // Relacionamentos
  paciente?: {
    nome: string
  }
  tipo_exame?: {
    nome: string
    categoria: string
    preparacao?: string
  }
  unidade_realizacao?: UnidadeSaude
}

export interface TransportePaciente {
  id: string
  paciente_id: string
  veiculo_id: string
  motorista_id: string
  origem: string
  destino: string
  data_transporte: string
  tipo: 'consulta' | 'exame' | 'internacao' | 'alta' | 'emergencia'
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado'
  km_percorridos?: number
  observacoes?: string
  created_at: string
  
  // Relacionamentos
  paciente?: {
    nome: string
  }
  veiculo?: {
    placa: string
    modelo: string
  }
  motorista?: {
    nome: string
  }
}

export interface VisitaACS {
  id: string
  acs_id: string
  familia_id: string
  data_visita: string
  tipo_visita: 'rotina' | 'busca_ativa' | 'emergencia' | 'acompanhamento'
  situacoes_encontradas: string[]
  encaminhamentos_realizados: string[]
  observacoes?: string
  proxima_visita_prevista?: string
  created_at: string
  
  // Relacionamentos
  acs?: {
    nome: string
  }
  familia?: {
    codigo_familia: string
    responsavel_nome: string
  }
}

export const useSaude = () => {
  // Estados principais
  const [unidadesSaude, setUnidadesSaude] = useState<UnidadeSaude[]>([])
  const [agendamentos, setAgendamentos] = useState<AgendamentoMedico[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [estoquesMedicamentos, setEstoquesMedicamentos] = useState<EstoqueMedicamento[]>([])
  const [campanhasSaude, setCampanhasSaude] = useState<CampanhaSaude[]>([])
  const [equipesSF, setEquipesSF] = useState<EquipeSaudeFamily[]>([])
  const [solicitacoesTFD, setSolicitacoesTFD] = useState<SolicitacaoTFD[]>([])
  const [agendamentosExames, setAgendamentosExames] = useState<AgendamentoExame[]>([])
  const [transportesPacientes, setTransportesPacientes] = useState<TransportePaciente[]>([])
  const [visitasACS, setVisitasACS] = useState<VisitaACS[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadUnidadesSaude(),
        loadAgendamentos(),
        loadMedicamentos(),
        loadEstoquesMedicamentos(),
        loadCampanhasSaude(),
        loadEquipesSaudeFamily(),
        loadSolicitacoesTFD(),
        loadAgendamentosExames(),
        loadTransportesPacientes(),
        loadVisitasACS()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de saúde:', err)
      setError('Erro ao carregar dados de saúde')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. AGENDAMENTOS MÉDICOS
  // =====================================================

  const loadAgendamentos = async (filters?: any) => {
    try {
      let query = supabase
        .from('agendamentos_medicos')
        .select(`
          *,
          paciente:user_profiles!paciente_id(id, nome, cpf, telefone),
          profissional:user_profiles!profissional_id(id, nome),
          unidade_saude:unidades_saude(id, nome, endereco)
        `)
        .order('data_agendamento', { ascending: true })

      if (filters?.data_inicio && filters?.data_fim) {
        query = query
          .gte('data_agendamento', filters.data_inicio)
          .lte('data_agendamento', filters.data_fim)
      }

      if (filters?.unidade_id) {
        query = query.eq('unidade_saude_id', filters.unidade_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setAgendamentos(data || [])
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
    }
  }

  const criarAgendamento = async (dadosAgendamento: Partial<AgendamentoMedico>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos_medicos')
        .insert([{
          ...dadosAgendamento,
          lembrete_enviado: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Agendamento criado com sucesso!')
      await loadAgendamentos()
      return data
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
      toast.error('Erro ao criar agendamento')
      return null
    }
  }

  const atualizarStatusAgendamento = async (id: string, novoStatus: AgendamentoMedico['status']) => {
    try {
      const { error } = await supabase
        .from('agendamentos_medicos')
        .update({ 
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Status do agendamento atualizado!')
      await loadAgendamentos()
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err)
      toast.error('Erro ao atualizar agendamento')
    }
  }

  const enviarLembreteAgendamento = async (agendamentoId: string) => {
    try {
      // Simular envio de SMS/Email
      const { error } = await supabase
        .from('agendamentos_medicos')
        .update({ lembrete_enviado: true })
        .eq('id', agendamentoId)

      if (error) throw error

      toast.success('Lembrete enviado!')
      await loadAgendamentos()
    } catch (err) {
      console.error('Erro ao enviar lembrete:', err)
      toast.error('Erro ao enviar lembrete')
    }
  }

  // =====================================================
  // 2. CONTROLE DE MEDICAMENTOS
  // =====================================================

  const loadMedicamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setMedicamentos(data || [])
    } catch (err) {
      console.error('Erro ao carregar medicamentos:', err)
    }
  }

  const loadEstoquesMedicamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('estoque_medicamentos')
        .select(`
          *,
          medicamento:medicamentos(*),
          unidade_saude:unidades_saude(id, nome)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setEstoquesMedicamentos(data || [])
    } catch (err) {
      console.error('Erro ao carregar estoques:', err)
    }
  }

  const adicionarEstoqueMedicamento = async (dadosEstoque: Partial<EstoqueMedicamento>) => {
    try {
      const { data, error } = await supabase
        .from('estoque_medicamentos')
        .insert([dadosEstoque])
        .select()
        .single()

      if (error) throw error

      toast.success('Estoque adicionado com sucesso!')
      await loadEstoquesMedicamentos()
      return data
    } catch (err) {
      console.error('Erro ao adicionar estoque:', err)
      toast.error('Erro ao adicionar estoque')
      return null
    }
  }

  const dispensarMedicamento = async (estoqueId: string, quantidade: number, pacienteId: string) => {
    try {
      // Verificar estoque disponível
      const { data: estoque, error: estoqueError } = await supabase
        .from('estoque_medicamentos')
        .select('quantidade')
        .eq('id', estoqueId)
        .single()

      if (estoqueError) throw estoqueError

      if (estoque.quantidade < quantidade) {
        toast.error('Quantidade insuficiente em estoque')
        return false
      }

      // Registrar dispensação
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: dispensacaoError } = await supabase
        .from('dispensacao_medicamentos')
        .insert([{
          paciente_id: pacienteId,
          estoque_id: estoqueId,
          quantidade_dispensada: quantidade,
          funcionario_id: user?.id
        }])

      if (dispensacaoError) throw dispensacaoError

      // Atualizar estoque
      const { error: updateError } = await supabase
        .from('estoque_medicamentos')
        .update({ 
          quantidade: estoque.quantidade - quantidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', estoqueId)

      if (updateError) throw updateError

      toast.success('Medicamento dispensado com sucesso!')
      await loadEstoquesMedicamentos()
      return true
    } catch (err) {
      console.error('Erro ao dispensar medicamento:', err)
      toast.error('Erro ao dispensar medicamento')
      return false
    }
  }

  const getMedicamentosEmFalta = () => {
    return estoquesMedicamentos.filter(estoque => 
      estoque.quantidade <= estoque.quantidade_minima
    )
  }

  const getMedicamentosVencendo = (diasAntecipacao: number = 30) => {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + diasAntecipacao)

    return estoquesMedicamentos.filter(estoque => 
      new Date(estoque.data_validade) <= dataLimite
    )
  }

  // =====================================================
  // 3. CAMPANHAS DE SAÚDE
  // =====================================================

  const loadCampanhasSaude = async () => {
    try {
      const { data, error } = await supabase
        .from('campanhas_saude')
        .select(`
          *,
          responsavel:user_profiles(nome)
        `)
        .order('data_inicio', { ascending: false })

      if (error) throw error
      setCampanhasSaude(data || [])
    } catch (err) {
      console.error('Erro ao carregar campanhas:', err)
    }
  }

  const criarCampanha = async (dadosCampanha: Partial<CampanhaSaude>) => {
    try {
      const { data, error } = await supabase
        .from('campanhas_saude')
        .insert([{
          ...dadosCampanha,
          realizado: 0,
          ativa: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Campanha criada com sucesso!')
      await loadCampanhasSaude()
      return data
    } catch (err) {
      console.error('Erro ao criar campanha:', err)
      toast.error('Erro ao criar campanha')
      return null
    }
  }

  const registrarParticipacaoCampanha = async (campanhaId: string, pacienteId: string, tipoProcedimento: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error: participacaoError } = await supabase
        .from('participacao_campanhas')
        .insert([{
          campanha_id: campanhaId,
          paciente_id: pacienteId,
          tipo_procedimento: tipoProcedimento,
          profissional_id: user?.id
        }])

      if (participacaoError) throw participacaoError

      // Atualizar contador da campanha
      const { data: campanha } = await supabase
        .from('campanhas_saude')
        .select('realizado')
        .eq('id', campanhaId)
        .single()

      if (campanha) {
        await supabase
          .from('campanhas_saude')
          .update({ realizado: campanha.realizado + 1 })
          .eq('id', campanhaId)
      }

      toast.success('Participação registrada!')
      await loadCampanhasSaude()
    } catch (err) {
      console.error('Erro ao registrar participação:', err)
      toast.error('Erro ao registrar participação')
    }
  }

  // =====================================================
  // 4. UNIDADES DE SAÚDE
  // =====================================================

  const loadUnidadesSaude = async () => {
    try {
      const { data, error } = await supabase
        .from('unidades_saude')
        .select('*')
        .eq('ativa', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setUnidadesSaude(data || [])
    } catch (err) {
      console.error('Erro ao carregar unidades de saúde:', err)
    }
  }

  // =====================================================
  // 5. EQUIPES DE SAÚDE DA FAMÍLIA
  // =====================================================

  const loadEquipesSaudeFamily = async () => {
    try {
      const { data, error } = await supabase
        .from('equipes_saude_familia')
        .select(`
          *,
          unidade_saude:unidades_saude(id, nome),
          responsavel:user_profiles(nome)
        `)
        .eq('ativa', true)
        .order('codigo', { ascending: true })

      if (error) throw error
      setEquipesSF(data || [])
    } catch (err) {
      console.error('Erro ao carregar equipes ESF:', err)
    }
  }

  // =====================================================
  // 6. TFD (TRATAMENTO FORA DO DOMICÍLIO)
  // =====================================================

  const loadSolicitacoesTFD = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_tfd')
        .select(`
          *,
          paciente:user_profiles!paciente_id(nome, cpf),
          medico_solicitante:user_profiles!medico_solicitante_id(nome)
        `)
        .order('data_solicitacao', { ascending: false })

      if (error) throw error
      setSolicitacoesTFD(data || [])
    } catch (err) {
      console.error('Erro ao carregar solicitações TFD:', err)
    }
  }

  const criarSolicitacaoTFD = async (dadosTFD: Partial<SolicitacaoTFD>) => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_tfd')
        .insert([{
          ...dadosTFD,
          status: 'solicitado'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Solicitação TFD criada!')
      await loadSolicitacoesTFD()
      return data
    } catch (err) {
      console.error('Erro ao criar solicitação TFD:', err)
      toast.error('Erro ao criar solicitação TFD')
      return null
    }
  }

  // =====================================================
  // 7. AGENDAMENTO DE EXAMES
  // =====================================================

  const loadAgendamentosExames = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos_exames')
        .select(`
          *,
          paciente:user_profiles!paciente_id(nome),
          tipo_exame:tipos_exames(nome, categoria, preparacao),
          unidade_realizacao:unidades_saude(nome)
        `)
        .order('data_agendamento', { ascending: true })

      if (error) throw error
      setAgendamentosExames(data || [])
    } catch (err) {
      console.error('Erro ao carregar agendamentos de exames:', err)
    }
  }

  // =====================================================
  // 8. TRANSPORTE DE PACIENTES
  // =====================================================

  const loadTransportesPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('transporte_pacientes')
        .select(`
          *,
          paciente:user_profiles!paciente_id(nome),
          veiculo:veiculos_saude(placa, modelo),
          motorista:user_profiles!motorista_id(nome)
        `)
        .order('data_transporte', { ascending: false })

      if (error) throw error
      setTransportesPacientes(data || [])
    } catch (err) {
      console.error('Erro ao carregar transportes:', err)
    }
  }

  const agendarTransporte = async (dadosTransporte: Partial<TransportePaciente>) => {
    try {
      const { data, error } = await supabase
        .from('transporte_pacientes')
        .insert([{
          ...dadosTransporte,
          status: 'agendado'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Transporte agendado!')
      await loadTransportesPacientes()
      return data
    } catch (err) {
      console.error('Erro ao agendar transporte:', err)
      toast.error('Erro ao agendar transporte')
      return null
    }
  }

  // =====================================================
  // 9. VISITAS DOS ACS
  // =====================================================

  const loadVisitasACS = async () => {
    try {
      const { data, error } = await supabase
        .from('visitas_acs')
        .select(`
          *,
          acs:user_profiles!acs_id(nome)
        `)
        .order('data_visita', { ascending: false })

      if (error) throw error
      setVisitasACS(data || [])
    } catch (err) {
      console.error('Erro ao carregar visitas ACS:', err)
    }
  }

  const registrarVisitaACS = async (dadosVisita: Partial<VisitaACS>) => {
    try {
      const { data, error } = await supabase
        .from('visitas_acs')
        .insert([dadosVisita])
        .select()
        .single()

      if (error) throw error

      toast.success('Visita registrada!')
      await loadVisitasACS()
      return data
    } catch (err) {
      console.error('Erro ao registrar visita:', err)
      toast.error('Erro ao registrar visita')
      return null
    }
  }

  // =====================================================
  // ESTATÍSTICAS E INDICADORES
  // =====================================================

  const getIndicadoresSaude = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const consultasHoje = agendamentos.filter(ag => 
      ag.data_agendamento.startsWith(hoje) && ag.status === 'agendado'
    ).length

    const medicamentosEmFalta = getMedicamentosEmFalta().length
    const medicamentosVencendo = getMedicamentosVencendo().length
    
    const campanhasAtivas = campanhasSaude.filter(c => 
      c.ativa && new Date(c.data_fim) >= new Date()
    ).length

    return {
      consultasHoje,
      medicamentosEmFalta,
      medicamentosVencendo,
      campanhasAtivas,
      unidadesAtivas: unidadesSaude.length,
      equipesESF: equipesSF.length,
      solicitacoesTFDPendentes: solicitacoesTFD.filter(t => 
        ['solicitado', 'analisando'].includes(t.status)
      ).length,
      transportesAgendados: transportesPacientes.filter(t => 
        t.status === 'agendado'
      ).length
    }
  }

  return {
    // Estados
    unidadesSaude,
    agendamentos,
    medicamentos,
    estoquesMedicamentos,
    campanhasSaude,
    equipesSF,
    solicitacoesTFD,
    agendamentosExames,
    transportesPacientes,
    visitasACS,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadAgendamentos,
    loadMedicamentos,
    loadEstoquesMedicamentos,
    loadCampanhasSaude,
    loadEquipesSaudeFamily,
    loadSolicitacoesTFD,
    loadAgendamentosExames,
    loadTransportesPacientes,
    loadVisitasACS,

    // Agendamentos
    criarAgendamento,
    atualizarStatusAgendamento,
    enviarLembreteAgendamento,

    // Medicamentos
    adicionarEstoqueMedicamento,
    dispensarMedicamento,
    getMedicamentosEmFalta,
    getMedicamentosVencendo,

    // Campanhas
    criarCampanha,
    registrarParticipacaoCampanha,

    // TFD
    criarSolicitacaoTFD,

    // Transporte
    agendarTransporte,

    // ACS
    registrarVisitaACS,

    // Indicadores
    getIndicadoresSaude
  }
}