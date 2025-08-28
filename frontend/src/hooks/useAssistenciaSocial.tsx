// =====================================================
// HOOK COMPLETO PARA ASSISTÊNCIA SOCIAL
// 7 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { APIClient } from "@/auth"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface FamiliaVulneravel {
  id: string
  responsavel_id: string
  codigo_familia: string
  endereco: string
  coordenadas?: any
  renda_familiar: number
  composicao_familiar: number
  situacao_moradia: string
  vulnerabilidade_score: number
  classificacao: 'baixa' | 'media' | 'alta' | 'critica'
  nis: string
  cadastro_unico: boolean
  data_ultima_atualizacao: string
  ativa: boolean
  created_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
    cpf: string
    telefone: string
  }
  membros?: MembroFamilia[]
  atendimentos?: AtendimentoSocial[]
  visitas?: VisitaDomiciliar[]
  beneficios?: BeneficiarioPrograma[]
}

export interface MembroFamilia {
  id: string
  familia_id: string
  user_profile_id?: string
  nome: string
  cpf?: string
  data_nascimento?: string
  parentesco: string
  escolaridade?: string
  profissao?: string
  renda_individual?: number
  condicoes_especiais: string[]
  created_at: string
}

export interface CentroAssistencia {
  id: string
  tipo: 'cras' | 'creas'
  nome: string
  endereco: string
  telefone: string
  territorio_atendimento: any
  capacidade_atendimento: number
  coordenador_id: string
  equipe_tecnica: number
  ativo: boolean
  created_at: string
  
  // Relacionamentos
  coordenador?: {
    nome: string
  }
  atendimentos?: AtendimentoSocial[]
}

export interface AtendimentoSocial {
  id: string
  familia_id: string
  centro_id: string
  tecnico_responsavel_id: string
  data_atendimento: string
  tipo_atendimento: string
  servico_prestado: string
  demanda_apresentada?: string
  intervencao_realizada?: string
  encaminhamentos: string[]
  proxima_acao?: string
  status: 'aberto' | 'acompanhamento' | 'encerrado'
  observacoes?: string
  
  // Relacionamentos
  familia?: FamiliaVulneravel
  centro?: CentroAssistencia
  tecnico_responsavel?: {
    nome: string
  }
}

export interface ProgramaSocial {
  id: string
  nome: string
  descricao?: string
  tipo: 'federal' | 'estadual' | 'municipal'
  criterios_elegibilidade: any
  valor_beneficio: number
  periodicidade: string
  data_inicio: string
  data_fim?: string
  meta_beneficiarios?: number
  ativo: boolean
  created_at: string
  
  // Relacionamentos
  beneficiarios?: BeneficiarioPrograma[]
}

export interface BeneficiarioPrograma {
  id: string
  programa_id: string
  familia_id: string
  membro_beneficiario_id: string
  data_inclusao: string
  status: 'ativo' | 'suspenso' | 'cancelado' | 'transferido'
  valor_recebido: number
  motivo_suspensao?: string
  data_ultima_revisao?: string
  contrapartidas_cumpridas: boolean
  observacoes?: string
  
  // Relacionamentos
  programa?: ProgramaSocial
  familia?: FamiliaVulneravel
  membro_beneficiario?: MembroFamilia
  pagamentos?: PagamentoBeneficio[]
}

export interface PagamentoBeneficio {
  id: string
  beneficiario_id: string
  competencia: string
  valor_pago: number
  data_pagamento?: string
  forma_pagamento?: string
  status: 'pendente' | 'pago' | 'cancelado' | 'devolvido'
  observacoes?: string
}

export interface TipoAuxilioEmergencial {
  id: string
  nome: string
  descricao?: string
  tipo: string
  valor_estimado: number
  itens_composicao: string[]
  periodicidade_maxima: number
  criterios: any
  ativo: boolean
}

export interface EntregaEmergencial {
  id: string
  familia_id: string
  tipo_auxilio_id: string
  data_solicitacao: string
  data_entrega?: string
  quantidade: number
  funcionario_entrega_id?: string
  motivo: string
  observacoes?: string
  status: 'solicitado' | 'aprovado' | 'entregue' | 'cancelado'
  
  // Relacionamentos
  familia?: FamiliaVulneravel
  tipo_auxilio?: TipoAuxilioEmergencial
  funcionario_entrega?: {
    nome: string
  }
}

export interface VisitaDomiciliar {
  id: string
  familia_id: string
  tecnico_responsavel_id: string
  data_visita: string
  hora_inicio?: string
  hora_fim?: string
  objetivo_visita: string
  situacao_encontrada?: string
  riscos_identificados: string[]
  encaminhamentos_realizados: string[]
  proxima_visita_prevista?: string
  fotos_anexas: string[]
  observacoes?: string
  familia_presente: boolean
  created_at: string
  
  // Relacionamentos
  familia?: FamiliaVulneravel
  tecnico_responsavel?: {
    nome: string
  }
}

export interface ServicoEspecializado {
  id: string
  nome: string
  tipo: 'psicologico' | 'juridico' | 'profissionalizante' | 'orientacao'
  descricao?: string
  profissional_responsavel_id?: string
  local_atendimento?: string
  dias_funcionamento: number[]
  horarios: any
  capacidade_atendimento?: number
  ativo: boolean
  
  // Relacionamentos
  profissional_responsavel?: {
    nome: string
  }
  atendimentos?: AtendimentoEspecializado[]
}

export interface AtendimentoEspecializado {
  id: string
  servico_id: string
  familia_id: string
  membro_atendido_id?: string
  data_atendimento: string
  profissional_id: string
  tipo_atendimento?: string
  demanda?: string
  intervencao?: string
  resultado?: string
  encaminhamentos: string[]
  retorno_necessario: boolean
  data_retorno?: string
  observacoes?: string
  
  // Relacionamentos
  servico?: ServicoEspecializado
  familia?: FamiliaVulneravel
  membro_atendido?: MembroFamilia
  profissional?: {
    nome: string
  }
}

export const useAssistenciaSocial = () => {
  // Estados principais
  const [familiasVulneraveis, setFamiliasVulneraveis] = useState<FamiliaVulneravel[]>([])
  const [centrosAssistencia, setCentrosAssistencia] = useState<CentroAssistencia[]>([])
  const [atendimentosSociais, setAtendimentosSociais] = useState<AtendimentoSocial[]>([])
  const [programasSociais, setProgramasSociais] = useState<ProgramaSocial[]>([])
  const [beneficiariosPrograma, setBeneficiariosPrograma] = useState<BeneficiarioPrograma[]>([])
  const [entregasEmergenciais, setEntregasEmergenciais] = useState<EntregaEmergencial[]>([])
  const [visitasDomiciliares, setVisitasDomiciliares] = useState<VisitaDomiciliar[]>([])
  const [atendimentosEspecializados, setAtendimentosEspecializados] = useState<AtendimentoEspecializado[]>([])
  const [tiposAuxilio, setTiposAuxilio] = useState<TipoAuxilioEmergencial[]>([])
  const [servicosEspecializados, setServicosEspecializados] = useState<ServicoEspecializado[]>([])
  
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
        loadFamiliasVulneraveis(),
        loadCentrosAssistencia(),
        loadAtendimentosSociais(),
        loadProgramasSociais(),
        loadBeneficiariosPrograma(),
        loadEntregasEmergenciais(),
        loadVisitasDomiciliares(),
        loadAtendimentosEspecializados(),
        loadTiposAuxilio(),
        loadServicosEspecializados()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de assistência social:', err)
      setError('Erro ao carregar dados de assistência social')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. FAMÍLIAS VULNERÁVEIS
  // =====================================================

  const loadFamiliasVulneraveis = async (filters?: any) => {
    try {
      let query = supabase
        .from('familias_vulneraveis')
        .select(`
          *,
          responsavel:user_profiles(nome, cpf, telefone),
          membros:membros_familia(*),
          atendimentos:atendimentos_sociais(*),
          visitas:visitas_domiciliares(*)
        `)
        .eq('ativa', true)
        .order('vulnerabilidade_score', { ascending: false })

      if (filters?.classificacao) {
        query = query.eq('classificacao', filters.classificacao)
      }

      if (filters?.renda_maxima) {
        query = query.lte('renda_familiar', filters.renda_maxima)
      }

      const { data, error } = await query

      if (error) throw error
      setFamiliasVulneraveis(data || [])
    } catch (err) {
      console.error('Erro ao carregar famílias vulneráveis:', err)
    }
  }

  const cadastrarFamiliaVulneravel = async (dadosFamilia: Partial<FamiliaVulneravel>, membros: Partial<MembroFamilia>[]) => {
    try {
      // Calcular vulnerabilidade score baseado nos critérios
      const vulnerabilidade_score = calcularVulnerabilidade(dadosFamilia, membros)
      const classificacao = getClassificacaoVulnerabilidade(vulnerabilidade_score)

      const { data: familia, error: familiaError } = await supabase
        .from('familias_vulneraveis')
        .insert([{
          ...dadosFamilia,
          vulnerabilidade_score,
          classificacao,
          ativa: true
        }])
        .select()
        .single()

      if (familiaError) throw familiaError

      // Cadastrar membros da família
      if (membros.length > 0) {
        const membrosFinal = membros.map(membro => ({
          ...membro,
          familia_id: familia.id
        }))

        const { error: membrosError } = await supabase
          .from('membros_familia')
          .insert(membrosFinal)

        if (membrosError) throw membrosError
      }

      toast.success('Família cadastrada com sucesso!')
      await loadFamiliasVulneraveis()
      return familia
    } catch (err) {
      console.error('Erro ao cadastrar família:', err)
      toast.error('Erro ao cadastrar família')
      return null
    }
  }

  const calcularVulnerabilidade = (familia: Partial<FamiliaVulneravel>, membros: Partial<MembroFamilia>[]): number => {
    let score = 0

    // Renda per capita
    if (familia.renda_familiar && familia.composicao_familiar) {
      const rendaPerCapita = familia.renda_familiar / familia.composicao_familiar
      if (rendaPerCapita < 89) score += 40 // Extrema pobreza
      else if (rendaPerCapita < 178) score += 30 // Pobreza
      else if (rendaPerCapita < 500) score += 20 // Baixa renda
    }

    // Situação de moradia
    if (familia.situacao_moradia === 'cedida') score += 15
    else if (familia.situacao_moradia === 'alugada') score += 10

    // Composição familiar
    if (familia.composicao_familiar && familia.composicao_familiar > 5) score += 10

    // Condições especiais dos membros
    membros.forEach(membro => {
      if (membro.condicoes_especiais) {
        if (membro.condicoes_especiais.includes('gestante')) score += 10
        if (membro.condicoes_especiais.includes('deficiente')) score += 15
        if (membro.condicoes_especiais.includes('idoso')) score += 10
        if (membro.condicoes_especiais.includes('crianca')) score += 5
      }
    })

    return Math.min(score, 100) // Máximo 100 pontos
  }

  const getClassificacaoVulnerabilidade = (score: number): 'baixa' | 'media' | 'alta' | 'critica' => {
    if (score >= 80) return 'critica'
    if (score >= 60) return 'alta'
    if (score >= 40) return 'media'
    return 'baixa'
  }

  const atualizarVulnerabilidadeFamilia = async (familiaId: string) => {
    try {
      const { data: familia } = await supabase
        .from('familias_vulneraveis')
        .select('*')
        .eq('id', familiaId)
        .single()

      const { data: membros } = await supabase
        .from('membros_familia')
        .select('*')
        .eq('familia_id', familiaId)

      if (familia && membros) {
        const novoScore = calcularVulnerabilidade(familia, membros)
        const novaClassificacao = getClassificacaoVulnerabilidade(novoScore)

        await supabase
          .from('familias_vulneraveis')
          .update({
            vulnerabilidade_score: novoScore,
            classificacao: novaClassificacao,
            data_ultima_atualizacao: new Date().toISOString().split('T')[0]
          })
          .eq('id', familiaId)

        toast.success('Vulnerabilidade atualizada!')
        await loadFamiliasVulneraveis()
      }
    } catch (err) {
      console.error('Erro ao atualizar vulnerabilidade:', err)
      toast.error('Erro ao atualizar vulnerabilidade')
    }
  }

  // =====================================================
  // 2. CRAS E CREAS
  // =====================================================

  const loadCentrosAssistencia = async () => {
    try {
      const { data, error } = await supabase
        .from('centros_assistencia')
        .select(`
          *,
          coordenador:user_profiles(nome),
          atendimentos:atendimentos_sociais(*)
        `)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setCentrosAssistencia(data || [])
    } catch (err) {
      console.error('Erro ao carregar centros de assistência:', err)
    }
  }

  const loadAtendimentosSociais = async (filters?: any) => {
    try {
      let query = supabase
        .from('atendimentos_sociais')
        .select(`
          *,
          familia:familias_vulneraveis(codigo_familia, classificacao),
          centro:centros_assistencia(nome, tipo),
          tecnico_responsavel:user_profiles(nome)
        `)
        .order('data_atendimento', { ascending: false })

      if (filters?.centro_id) {
        query = query.eq('centro_id', filters.centro_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setAtendimentosSociais(data || [])
    } catch (err) {
      console.error('Erro ao carregar atendimentos sociais:', err)
    }
  }

  const registrarAtendimentoSocial = async (dadosAtendimento: Partial<AtendimentoSocial>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('atendimentos_sociais')
        .insert([{
          ...dadosAtendimento,
          tecnico_responsavel_id: user?.id,
          status: 'aberto'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Atendimento registrado!')
      await loadAtendimentosSociais()
      return data
    } catch (err) {
      console.error('Erro ao registrar atendimento:', err)
      toast.error('Erro ao registrar atendimento')
      return null
    }
  }

  // =====================================================
  // 3. PROGRAMAS SOCIAIS
  // =====================================================

  const loadProgramasSociais = async () => {
    try {
      const { data, error } = await supabase
        .from('programas_sociais')
        .select(`
          *,
          beneficiarios:beneficiarios_programas(*)
        `)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setProgramasSociais(data || [])
    } catch (err) {
      console.error('Erro ao carregar programas sociais:', err)
    }
  }

  const loadBeneficiariosPrograma = async (filters?: any) => {
    try {
      let query = supabase
        .from('beneficiarios_programas')
        .select(`
          *,
          programa:programas_sociais(nome, valor_beneficio),
          familia:familias_vulneraveis(codigo_familia, classificacao),
          membro_beneficiario:membros_familia(nome, parentesco)
        `)
        .order('data_inclusao', { ascending: false })

      if (filters?.programa_id) {
        query = query.eq('programa_id', filters.programa_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setBeneficiariosPrograma(data || [])
    } catch (err) {
      console.error('Erro ao carregar beneficiários:', err)
    }
  }

  const incluirBeneficiarioPrograma = async (programaId: string, familiaId: string, membroId: string) => {
    try {
      // Verificar elegibilidade
      const { data: familia } = await supabase
        .from('familias_vulneraveis')
        .select('*')
        .eq('id', familiaId)
        .single()

      const { data: programa } = await supabase
        .from('programas_sociais')
        .select('*')
        .eq('id', programaId)
        .single()

      if (!familia || !programa) {
        toast.error('Família ou programa não encontrado')
        return null
      }

      // Verificar critérios de elegibilidade
      const elegivel = verificarElegibilidade(familia, programa)
      if (!elegivel) {
        toast.error('Família não atende aos critérios do programa')
        return null
      }

      const { data, error } = await supabase
        .from('beneficiarios_programas')
        .insert([{
          programa_id: programaId,
          familia_id: familiaId,
          membro_beneficiario_id: membroId,
          valor_recebido: programa.valor_beneficio,
          status: 'ativo',
          contrapartidas_cumpridas: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Beneficiário incluído no programa!')
      await loadBeneficiariosPrograma()
      return data
    } catch (err) {
      console.error('Erro ao incluir beneficiário:', err)
      toast.error('Erro ao incluir beneficiário')
      return null
    }
  }

  const verificarElegibilidade = (familia: FamiliaVulneravel, programa: ProgramaSocial): boolean => {
    const criterios = programa.criterios_elegibilidade

    if (criterios.renda_per_capita) {
      const rendaPerCapita = familia.renda_familiar / familia.composicao_familiar
      if (rendaPerCapita > criterios.renda_per_capita) return false
    }

    if (criterios.composicao_minima) {
      if (familia.composicao_familiar < criterios.composicao_minima) return false
    }

    if (criterios.classificacao_minima) {
      const niveis = ['baixa', 'media', 'alta', 'critica']
      const nivelAtual = niveis.indexOf(familia.classificacao)
      const nivelMinimo = niveis.indexOf(criterios.classificacao_minima)
      if (nivelAtual < nivelMinimo) return false
    }

    return true
  }

  // =====================================================
  // 4. GERENCIAMENTO DE BENEFÍCIOS
  // =====================================================

  const gerarPagamentosBeneficio = async (competencia: string) => {
    try {
      const beneficiariosAtivos = beneficiariosPrograma.filter(b => 
        b.status === 'ativo' && b.contrapartidas_cumpridas
      )

      const pagamentos = beneficiariosAtivos.map(beneficiario => ({
        beneficiario_id: beneficiario.id,
        competencia: competencia,
        valor_pago: beneficiario.valor_recebido,
        status: 'pendente'
      }))

      const { error } = await supabase
        .from('pagamentos_beneficios')
        .insert(pagamentos)

      if (error) throw error

      toast.success(`Pagamentos gerados para ${beneficiariosAtivos.length} beneficiários!`)
    } catch (err) {
      console.error('Erro ao gerar pagamentos:', err)
      toast.error('Erro ao gerar pagamentos')
    }
  }

  const suspenderBeneficio = async (beneficiarioId: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('beneficiarios_programas')
        .update({
          status: 'suspenso',
          motivo_suspensao: motivo
        })
        .eq('id', beneficiarioId)

      if (error) throw error

      toast.success('Benefício suspenso!')
      await loadBeneficiariosPrograma()
    } catch (err) {
      console.error('Erro ao suspender benefício:', err)
      toast.error('Erro ao suspender benefício')
    }
  }

  // =====================================================
  // 5. ENTREGAS EMERGENCIAIS
  // =====================================================

  const loadTiposAuxilio = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_auxilio_emergencial')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setTiposAuxilio(data || [])
    } catch (err) {
      console.error('Erro ao carregar tipos de auxílio:', err)
    }
  }

  const loadEntregasEmergenciais = async (filters?: any) => {
    try {
      let query = supabase
        .from('entregas_emergenciais')
        .select(`
          *,
          familia:familias_vulneraveis(codigo_familia, classificacao),
          tipo_auxilio:tipos_auxilio_emergencial(nome, tipo),
          funcionario_entrega:user_profiles(nome)
        `)
        .order('data_solicitacao', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setEntregasEmergenciais(data || [])
    } catch (err) {
      console.error('Erro ao carregar entregas emergenciais:', err)
    }
  }

  const solicitarAuxilioEmergencial = async (dadosEntrega: Partial<EntregaEmergencial>) => {
    try {
      const { data, error } = await supabase
        .from('entregas_emergenciais')
        .insert([{
          ...dadosEntrega,
          status: 'solicitado'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Auxílio emergencial solicitado!')
      await loadEntregasEmergenciais()
      return data
    } catch (err) {
      console.error('Erro ao solicitar auxílio:', err)
      toast.error('Erro ao solicitar auxílio')
      return null
    }
  }

  const aprovarEntregaEmergencial = async (entregaId: string) => {
    try {
      const { error } = await supabase
        .from('entregas_emergenciais')
        .update({ status: 'aprovado' })
        .eq('id', entregaId)

      if (error) throw error

      toast.success('Entrega aprovada!')
      await loadEntregasEmergenciais()
    } catch (err) {
      console.error('Erro ao aprovar entrega:', err)
      toast.error('Erro ao aprovar entrega')
    }
  }

  const confirmarEntregaEmergencial = async (entregaId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('entregas_emergenciais')
        .update({
          status: 'entregue',
          data_entrega: new Date().toISOString().split('T')[0],
          funcionario_entrega_id: user?.id
        })
        .eq('id', entregaId)

      if (error) throw error

      toast.success('Entrega confirmada!')
      await loadEntregasEmergenciais()
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err)
      toast.error('Erro ao confirmar entrega')
    }
  }

  // =====================================================
  // 6. REGISTRO DE VISITAS
  // =====================================================

  const loadVisitasDomiciliares = async (filters?: any) => {
    try {
      let query = supabase
        .from('visitas_domiciliares')
        .select(`
          *,
          familia:familias_vulneraveis(codigo_familia, endereco),
          tecnico_responsavel:user_profiles(nome)
        `)
        .order('data_visita', { ascending: false })

      if (filters?.tecnico_id) {
        query = query.eq('tecnico_responsavel_id', filters.tecnico_id)
      }

      const { data, error } = await query

      if (error) throw error
      setVisitasDomiciliares(data || [])
    } catch (err) {
      console.error('Erro ao carregar visitas domiciliares:', err)
    }
  }

  const agendarVisitaDomiciliar = async (dadosVisita: Partial<VisitaDomiciliar>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('visitas_domiciliares')
        .insert([{
          ...dadosVisita,
          tecnico_responsavel_id: user?.id,
          familia_presente: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Visita agendada!')
      await loadVisitasDomiciliares()
      return data
    } catch (err) {
      console.error('Erro ao agendar visita:', err)
      toast.error('Erro ao agendar visita')
      return null
    }
  }

  const registrarVisitaRealizada = async (visitaId: string, dadosVisita: Partial<VisitaDomiciliar>) => {
    try {
      const { error } = await supabase
        .from('visitas_domiciliares')
        .update(dadosVisita)
        .eq('id', visitaId)

      if (error) throw error

      toast.success('Visita registrada!')
      await loadVisitasDomiciliares()
    } catch (err) {
      console.error('Erro ao registrar visita:', err)
      toast.error('Erro ao registrar visita')
    }
  }

  // =====================================================
  // 7. ATENDIMENTOS ESPECIALIZADOS
  // =====================================================

  const loadServicosEspecializados = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos_especializados')
        .select(`
          *,
          profissional_responsavel:user_profiles(nome),
          atendimentos:atendimentos_especializados(*)
        `)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setServicosEspecializados(data || [])
    } catch (err) {
      console.error('Erro ao carregar serviços especializados:', err)
    }
  }

  const loadAtendimentosEspecializados = async (filters?: any) => {
    try {
      let query = supabase
        .from('atendimentos_especializados')
        .select(`
          *,
          servico:servicos_especializados(nome, tipo),
          familia:familias_vulneraveis(codigo_familia),
          membro_atendido:membros_familia(nome),
          profissional:user_profiles(nome)
        `)
        .order('data_atendimento', { ascending: false })

      if (filters?.servico_id) {
        query = query.eq('servico_id', filters.servico_id)
      }

      const { data, error } = await query

      if (error) throw error
      setAtendimentosEspecializados(data || [])
    } catch (err) {
      console.error('Erro ao carregar atendimentos especializados:', err)
    }
  }

  const agendarAtendimentoEspecializado = async (dadosAtendimento: Partial<AtendimentoEspecializado>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('atendimentos_especializados')
        .insert([{
          ...dadosAtendimento,
          profissional_id: user?.id,
          retorno_necessario: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Atendimento especializado agendado!')
      await loadAtendimentosEspecializados()
      return data
    } catch (err) {
      console.error('Erro ao agendar atendimento:', err)
      toast.error('Erro ao agendar atendimento')
      return null
    }
  }

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadoresAssistencia = () => {
    const familiasAcompanhadas = familiasVulneraveis.length
    const familiasCriticas = familiasVulneraveis.filter(f => f.classificacao === 'critica').length
    const beneficiariosAtivos = beneficiariosPrograma.filter(b => b.status === 'ativo').length
    const visitasRealizadas = visitasDomiciliares.length
    const atendimentosAbertos = atendimentosSociais.filter(a => a.status === 'aberto').length
    const entregasPendentes = entregasEmergenciais.filter(e => e.status === 'solicitado').length

    return {
      familiasAcompanhadas,
      familiasCriticas,
      beneficiariosAtivos,
      visitasRealizadas,
      atendimentosAbertos,
      entregasPendentes,
      centrosAtivos: centrosAssistencia.filter(c => c.ativo).length,
      programasAtivos: programasSociais.filter(p => p.ativo).length
    }
  }

  return {
    // Estados
    familiasVulneraveis,
    centrosAssistencia,
    atendimentosSociais,
    programasSociais,
    beneficiariosPrograma,
    entregasEmergenciais,
    visitasDomiciliares,
    atendimentosEspecializados,
    tiposAuxilio,
    servicosEspecializados,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadFamiliasVulneraveis,
    loadCentrosAssistencia,
    loadAtendimentosSociais,
    loadProgramasSociais,
    loadBeneficiariosPrograma,
    loadEntregasEmergenciais,
    loadVisitasDomiciliares,
    loadAtendimentosEspecializados,
    loadTiposAuxilio,
    loadServicosEspecializados,

    // Famílias Vulneráveis
    cadastrarFamiliaVulneravel,
    atualizarVulnerabilidadeFamilia,

    // Atendimentos Sociais
    registrarAtendimentoSocial,

    // Programas Sociais
    incluirBeneficiarioPrograma,
    gerarPagamentosBeneficio,
    suspenderBeneficio,

    // Entregas Emergenciais
    solicitarAuxilioEmergencial,
    aprovarEntregaEmergencial,
    confirmarEntregaEmergencial,

    // Visitas Domiciliares
    agendarVisitaDomiciliar,
    registrarVisitaRealizada,

    // Atendimentos Especializados
    agendarAtendimentoEspecializado,

    // Indicadores
    getIndicadoresAssistencia
  }
}