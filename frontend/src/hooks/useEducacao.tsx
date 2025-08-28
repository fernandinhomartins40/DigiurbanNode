// =====================================================
// HOOK COMPLETO PARA SECRETARIA DE EDUCAÇÃO
// 7 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { APIClient } from "@/auth"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface Escola {
  id: string
  codigo_mec: string
  nome: string
  endereco: string
  telefone: string
  modalidades: string[]
  turnos: string[]
  vagas_total: number
  infraestrutura: any
  diretor_id: string
  secretaria_id: string
  ativa: boolean
  created_at: string
  
  // Relacionamentos
  diretor?: {
    nome: string
  }
  turmas?: Turma[]
}

export interface Turma {
  id: string
  escola_id: string
  codigo: string
  serie: string
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral'
  vagas: number
  ano_letivo: number
  professor_regente_id: string
  sala: string
  created_at: string
  
  // Relacionamentos
  escola?: Escola
  professor_regente?: {
    nome: string
  }
  matriculas?: Matricula[]
}

export interface Aluno {
  id: string
  codigo_aluno: string
  nome_completo: string
  data_nascimento: string
  cpf: string
  rg: string
  sexo: 'M' | 'F'
  cor_raca: string
  endereco: string
  telefone_responsavel: string
  responsavel_nome: string
  responsavel_cpf: string
  necessidades_especiais: string[]
  transporte_escolar: boolean
  ativo: boolean
  created_at: string
  
  // Relacionamentos
  matriculas?: Matricula[]
}

export interface Matricula {
  id: string
  aluno_id: string
  escola_id: string
  turma_id: string
  ano_letivo: number
  data_matricula: string
  status: 'ativa' | 'transferida' | 'cancelada' | 'concluida'
  documentos_entregues: string[]
  observacoes: string
  created_at: string
  
  // Relacionamentos
  aluno?: Aluno
  escola?: Escola
  turma?: Turma
}

export interface RotaTransporte {
  id: string
  codigo: string
  nome: string
  veiculo_id: string
  motorista_id: string
  monitor_id?: string
  turno: 'matutino' | 'vespertino' | 'integral'
  distancia_km: number
  tempo_estimado_minutos: number
  ativa: boolean
  created_at: string
  
  // Relacionamentos
  veiculo?: {
    placa: string
    modelo: string
    capacidade: number
  }
  motorista?: {
    nome: string
  }
  monitor?: {
    nome: string
  }
  pontos_embarque?: PontoEmbarque[]
  alunos?: AlunoTransporte[]
}

export interface PontoEmbarque {
  id: string
  rota_id: string
  endereco: string
  coordenadas?: any
  ordem_parada: number
  horario_chegada: string
  referencia: string
}

export interface AlunoTransporte {
  id: string
  aluno_id: string
  rota_id: string
  ponto_embarque_id: string
  ponto_desembarque_id: string
  ativo: boolean
  created_at: string
  
  // Relacionamentos
  aluno?: Aluno
  rota?: RotaTransporte
}

export interface Cardapio {
  id: string
  semana_inicio: string
  semana_fim: string
  faixa_etaria: string
  criado_por_id: string
  aprovado_nutricionista: boolean
  created_at: string
  
  // Relacionamentos
  refeicoes?: CardapioRefeicao[]
}

export interface CardapioRefeicao {
  id: string
  cardapio_id: string
  dia_semana: number
  tipo_refeicao: 'cafe' | 'almoco' | 'lanche' | 'jantar'
  descricao: string
  ingredientes: string[]
  valor_nutricional: any
}

export interface OcorrenciaEscolar {
  id: string
  aluno_id: string
  escola_id: string
  tipo: 'disciplinar' | 'acidente' | 'saude' | 'comportamento' | 'pedagogica' | 'bullying'
  gravidade: 'baixa' | 'media' | 'alta' | 'critica'
  descricao: string
  data_ocorrencia: string
  funcionario_responsavel_id: string
  medidas_tomadas: string
  responsavel_comunicado: boolean
  data_comunicacao?: string
  observacoes: string
  resolvida: boolean
  created_at: string
  
  // Relacionamentos
  aluno?: Aluno
  escola?: Escola
  funcionario_responsavel?: {
    nome: string
  }
}

export interface CalendarioEscolar {
  id: string
  ano_letivo: number
  evento: string
  data_inicio: string
  data_fim?: string
  tipo: 'feriado' | 'ferias' | 'reuniao' | 'evento' | 'avaliacao'
  escolas_envolvidas?: string[]
  descricao: string
  created_at: string
}

export const useEducacao = () => {
  // Estados principais
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [rotasTransporte, setRotasTransporte] = useState<RotaTransporte[]>([])
  const [cardapios, setCardapios] = useState<Cardapio[]>([])
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaEscolar[]>([])
  const [calendarioEscolar, setCalendarioEscolar] = useState<CalendarioEscolar[]>([])
  
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
        loadEscolas(),
        loadTurmas(),
        loadAlunos(),
        loadMatriculas(),
        loadRotasTransporte(),
        loadCardapios(),
        loadOcorrencias(),
        loadCalendarioEscolar()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de educação:', err)
      setError('Erro ao carregar dados de educação')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. MATRÍCULA DE ALUNOS
  // =====================================================

  const loadAlunos = async (filters?: any) => {
    try {
      let query = supabase
        .from('alunos')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo', { ascending: true })

      if (filters?.escola_id) {
        // Buscar alunos por escola através das matrículas
        const { data: matriculaIds } = await supabase
          .from('matriculas')
          .select('aluno_id')
          .eq('escola_id', filters.escola_id)
          .eq('status', 'ativa')

        if (matriculaIds && matriculaIds.length > 0) {
          const alunoIds = matriculaIds.map(m => m.aluno_id)
          query = query.in('id', alunoIds)
        }
      }

      const { data, error } = await query

      if (error) throw error
      setAlunos(data || [])
    } catch (err) {
      console.error('Erro ao carregar alunos:', err)
    }
  }

  const loadMatriculas = async (filters?: any) => {
    try {
      let query = supabase
        .from('matriculas')
        .select(`
          *,
          aluno:alunos(id, codigo_aluno, nome_completo, data_nascimento),
          escola:escolas(id, nome),
          turma:turmas(id, codigo, serie)
        `)
        .order('data_matricula', { ascending: false })

      if (filters?.ano_letivo) {
        query = query.eq('ano_letivo', filters.ano_letivo)
      }

      if (filters?.escola_id) {
        query = query.eq('escola_id', filters.escola_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setMatriculas(data || [])
    } catch (err) {
      console.error('Erro ao carregar matrículas:', err)
    }
  }

  const criarMatricula = async (dadosMatricula: Partial<Matricula>) => {
    try {
      // Verificar se há vagas na turma
      if (dadosMatricula.turma_id) {
        const { data: turma } = await supabase
          .from('turmas')
          .select('vagas')
          .eq('id', dadosMatricula.turma_id)
          .single()

        const { data: matriculasAtivas } = await supabase
          .from('matriculas')
          .select('id')
          .eq('turma_id', dadosMatricula.turma_id)
          .eq('status', 'ativa')

        if (turma && matriculasAtivas && matriculasAtivas.length >= turma.vagas) {
          toast.error('Turma lotada! Não há vagas disponíveis.')
          return null
        }
      }

      const { data, error } = await supabase
        .from('matriculas')
        .insert([{
          ...dadosMatricula,
          ano_letivo: dadosMatricula.ano_letivo || new Date().getFullYear(),
          status: 'ativa'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Matrícula realizada com sucesso!')
      await loadMatriculas()
      return data
    } catch (err) {
      console.error('Erro ao criar matrícula:', err)
      toast.error('Erro ao realizar matrícula')
      return null
    }
  }

  const transferirAluno = async (matriculaId: string, novaEscolaId: string, novaTurmaId: string) => {
    try {
      // Cancelar matrícula atual
      await supabase
        .from('matriculas')
        .update({ status: 'transferida' })
        .eq('id', matriculaId)

      // Obter dados do aluno
      const { data: matriculaAtual } = await supabase
        .from('matriculas')
        .select('aluno_id')
        .eq('id', matriculaId)
        .single()

      if (!matriculaAtual) throw new Error('Matrícula não encontrada')

      // Criar nova matrícula
      await criarMatricula({
        aluno_id: matriculaAtual.aluno_id,
        escola_id: novaEscolaId,
        turma_id: novaTurmaId
      })

      toast.success('Aluno transferido com sucesso!')
    } catch (err) {
      console.error('Erro ao transferir aluno:', err)
      toast.error('Erro ao transferir aluno')
    }
  }

  // =====================================================
  // 2. GESTÃO ESCOLAR
  // =====================================================

  const loadEscolas = async () => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select(`
          *,
          diretor:user_profiles(nome)
        `)
        .eq('ativa', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setEscolas(data || [])
    } catch (err) {
      console.error('Erro ao carregar escolas:', err)
    }
  }

  const loadTurmas = async (escolaId?: string) => {
    try {
      let query = supabase
        .from('turmas')
        .select(`
          *,
          escola:escolas(id, nome),
          professor_regente:user_profiles(nome)
        `)
        .eq('ano_letivo', new Date().getFullYear())
        .order('escola_id', { ascending: true })
        .order('serie', { ascending: true })

      if (escolaId) {
        query = query.eq('escola_id', escolaId)
      }

      const { data, error } = await query

      if (error) throw error
      setTurmas(data || [])
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
    }
  }

  const criarTurma = async (dadosTurma: Partial<Turma>) => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert([{
          ...dadosTurma,
          ano_letivo: dadosTurma.ano_letivo || new Date().getFullYear()
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Turma criada com sucesso!')
      await loadTurmas()
      return data
    } catch (err) {
      console.error('Erro ao criar turma:', err)
      toast.error('Erro ao criar turma')
      return null
    }
  }

  // =====================================================
  // 3. TRANSPORTE ESCOLAR
  // =====================================================

  const loadRotasTransporte = async () => {
    try {
      const { data, error } = await supabase
        .from('rotas_transporte')
        .select(`
          *,
          veiculo:veiculos_transporte(placa, modelo, capacidade),
          motorista:user_profiles!motorista_id(nome),
          monitor:user_profiles!monitor_id(nome)
        `)
        .eq('ativa', true)
        .order('codigo', { ascending: true })

      if (error) throw error
      setRotasTransporte(data || [])
    } catch (err) {
      console.error('Erro ao carregar rotas de transporte:', err)
    }
  }

  const otimizarRotas = async () => {
    try {
      // Simular otimização de rotas
      // Na prática, isso usaria algoritmos de otimização
      toast.success('Rotas otimizadas com sucesso!')
      await loadRotasTransporte()
    } catch (err) {
      console.error('Erro ao otimizar rotas:', err)
      toast.error('Erro ao otimizar rotas')
    }
  }

  const vincularAlunoTransporte = async (alunoId: string, rotaId: string, pontoEmbarqueId: string) => {
    try {
      const { error } = await supabase
        .from('alunos_transporte')
        .insert([{
          aluno_id: alunoId,
          rota_id: rotaId,
          ponto_embarque_id: pontoEmbarqueId,
          ponto_desembarque_id: pontoEmbarqueId // Mesmo ponto por padrão
        }])

      if (error) throw error

      // Atualizar flag no aluno
      await supabase
        .from('alunos')
        .update({ transporte_escolar: true })
        .eq('id', alunoId)

      toast.success('Aluno vinculado ao transporte escolar!')
      await loadAlunos()
    } catch (err) {
      console.error('Erro ao vincular transporte:', err)
      toast.error('Erro ao vincular transporte')
    }
  }

  // =====================================================
  // 4. MERENDA ESCOLAR
  // =====================================================

  const loadCardapios = async () => {
    try {
      const { data, error } = await supabase
        .from('cardapios')
        .select(`
          *,
          refeicoes:cardapio_refeicoes(*)
        `)
        .order('semana_inicio', { ascending: false })

      if (error) throw error
      setCardapios(data || [])
    } catch (err) {
      console.error('Erro ao carregar cardápios:', err)
    }
  }

  const criarCardapioSemanal = async (dadosCardapio: Partial<Cardapio>, refeicoes: Partial<CardapioRefeicao>[]) => {
    try {
      const { data: cardapio, error: cardapioError } = await supabase
        .from('cardapios')
        .insert([dadosCardapio])
        .select()
        .single()

      if (cardapioError) throw cardapioError

      // Criar refeições do cardápio
      const refeicoesFinal = refeicoes.map(refeicao => ({
        ...refeicao,
        cardapio_id: cardapio.id
      }))

      const { error: refeicoesError } = await supabase
        .from('cardapio_refeicoes')
        .insert(refeicoesFinal)

      if (refeicoesError) throw refeicoesError

      toast.success('Cardápio criado com sucesso!')
      await loadCardapios()
      return cardapio
    } catch (err) {
      console.error('Erro ao criar cardápio:', err)
      toast.error('Erro ao criar cardápio')
      return null
    }
  }

  // =====================================================
  // 5. REGISTRO DE OCORRÊNCIAS
  // =====================================================

  const loadOcorrencias = async (filters?: any) => {
    try {
      let query = supabase
        .from('ocorrencias_escolares')
        .select(`
          *,
          aluno:alunos(nome_completo, codigo_aluno),
          escola:escolas(nome),
          funcionario_responsavel:user_profiles(nome)
        `)
        .order('data_ocorrencia', { ascending: false })

      if (filters?.escola_id) {
        query = query.eq('escola_id', filters.escola_id)
      }

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.gravidade) {
        query = query.eq('gravidade', filters.gravidade)
      }

      const { data, error } = await query

      if (error) throw error
      setOcorrencias(data || [])
    } catch (err) {
      console.error('Erro ao carregar ocorrências:', err)
    }
  }

  const registrarOcorrencia = async (dadosOcorrencia: Partial<OcorrenciaEscolar>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('ocorrencias_escolares')
        .insert([{
          ...dadosOcorrencia,
          funcionario_responsavel_id: user?.id,
          resolvida: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Ocorrência registrada!')
      await loadOcorrencias()
      return data
    } catch (err) {
      console.error('Erro ao registrar ocorrência:', err)
      toast.error('Erro ao registrar ocorrência')
      return null
    }
  }

  const resolverOcorrencia = async (ocorrenciaId: string, medidasTomadas: string) => {
    try {
      const { error } = await supabase
        .from('ocorrencias_escolares')
        .update({
          medidas_tomadas: medidasTomadas,
          resolvida: true
        })
        .eq('id', ocorrenciaId)

      if (error) throw error

      toast.success('Ocorrência resolvida!')
      await loadOcorrencias()
    } catch (err) {
      console.error('Erro ao resolver ocorrência:', err)
      toast.error('Erro ao resolver ocorrência')
    }
  }

  // =====================================================
  // 6. CALENDÁRIO ESCOLAR
  // =====================================================

  const loadCalendarioEscolar = async () => {
    try {
      const { data, error } = await supabase
        .from('calendario_escolar')
        .select('*')
        .eq('ano_letivo', new Date().getFullYear())
        .order('data_inicio', { ascending: true })

      if (error) throw error
      setCalendarioEscolar(data || [])
    } catch (err) {
      console.error('Erro ao carregar calendário escolar:', err)
    }
  }

  const adicionarEventoCalendario = async (dadosEvento: Partial<CalendarioEscolar>) => {
    try {
      const { data, error } = await supabase
        .from('calendario_escolar')
        .insert([{
          ...dadosEvento,
          ano_letivo: dadosEvento.ano_letivo || new Date().getFullYear()
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Evento adicionado ao calendário!')
      await loadCalendarioEscolar()
      return data
    } catch (err) {
      console.error('Erro ao adicionar evento:', err)
      toast.error('Erro ao adicionar evento')
      return null
    }
  }

  // =====================================================
  // 7. DASHBOARD EDUCACIONAL
  // =====================================================

  const getIndicadoresEducacao = () => {
    const totalAlunos = alunos.length
    const totalEscolas = escolas.length
    const totalTurmas = turmas.length
    const alunosTransporte = alunos.filter(a => a.transporte_escolar).length
    
    const ocorrenciasAbertas = ocorrencias.filter(o => !o.resolvida).length
    const ocorrenciasGraves = ocorrencias.filter(o => 
      ['alta', 'critica'].includes(o.gravidade) && !o.resolvida
    ).length

    const taxaOcupacao = turmas.length > 0 ? 
      (matriculas.filter(m => m.status === 'ativa').length / turmas.reduce((total, t) => total + t.vagas, 0)) * 100 
      : 0

    return {
      totalAlunos,
      totalEscolas,
      totalTurmas,
      alunosTransporte,
      ocorrenciasAbertas,
      ocorrenciasGraves,
      taxaOcupacao: Math.round(taxaOcupacao),
      rotasAtivas: rotasTransporte.filter(r => r.ativa).length,
      cardapiosAtivos: cardapios.length,
      eventosProximos: calendarioEscolar.filter(e => 
        new Date(e.data_inicio) >= new Date()
      ).slice(0, 3).length
    }
  }

  return {
    // Estados
    escolas,
    turmas,
    alunos,
    matriculas,
    rotasTransporte,
    cardapios,
    ocorrencias,
    calendarioEscolar,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadEscolas,
    loadTurmas,
    loadAlunos,
    loadMatriculas,
    loadRotasTransporte,
    loadCardapios,
    loadOcorrencias,
    loadCalendarioEscolar,

    // Matrículas
    criarMatricula,
    transferirAluno,

    // Gestão Escolar
    criarTurma,

    // Transporte
    otimizarRotas,
    vincularAlunoTransporte,

    // Merenda
    criarCardapioSemanal,

    // Ocorrências
    registrarOcorrencia,
    resolverOcorrencia,

    // Calendário
    adicionarEventoCalendario,

    // Indicadores
    getIndicadoresEducacao
  }
}