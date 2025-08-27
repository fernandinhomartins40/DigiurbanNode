// =====================================================
// HOOK COMPLETO PARA SECRETARIA DE CULTURA
// 6 FUNCIONALIDADES INTEGRADAS
// =====================================================

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'

// =====================================================
// INTERFACES E TIPOS
// =====================================================

export interface EspacoCultural {
  id: string
  nome: string
  tipo: 'teatro' | 'biblioteca' | 'centro_cultural' | 'auditorio' | 'praca' | 'museu' | 'galeria'
  endereco: string
  capacidade_maxima: number
  infraestrutura: any
  horario_funcionamento: any
  valor_locacao: number
  secretaria_id: string
  responsavel_id: string
  ativo: boolean
  created_at: string
  updated_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
  }
  reservas?: ReservaEspaco[]
}

export interface ReservaEspaco {
  id: string
  espaco_id: string
  solicitante_id: string
  evento_nome: string
  data_inicio: string
  data_fim: string
  tipo_evento: string
  publico_esperado: number
  observacoes?: string
  status: 'solicitado' | 'aprovado' | 'realizado' | 'cancelado'
  valor_total: number
  created_at: string
  
  // Relacionamentos
  espaco?: EspacoCultural
  solicitante?: {
    nome: string
    email: string
    telefone: string
  }
}

export interface EditalCultural {
  id: string
  titulo: string
  descricao?: string
  tipo: 'musica' | 'teatro' | 'danca' | 'artes_visuais' | 'literatura' | 'audiovisual' | 'cultura_popular'
  valor_total: number
  valor_por_projeto?: number
  data_abertura: string
  data_encerramento: string
  criterios_avaliacao: any
  documentos_exigidos: string[]
  responsavel_id: string
  ativo: boolean
  created_at: string
  
  // Relacionamentos
  responsavel?: {
    nome: string
  }
  projetos?: ProjetoCultural[]
}

export interface ProjetoCultural {
  id: string
  edital_id: string
  proponente_id: string
  titulo: string
  descricao: string
  objetivos?: string
  publico_alvo?: string
  cronograma: any
  orcamento: any
  documentos: string[]
  pontuacao: number
  status: 'inscrito' | 'em_avaliacao' | 'aprovado' | 'rejeitado' | 'em_execucao' | 'concluido'
  data_inscricao: string
  data_aprovacao?: string
  observacoes?: string
  
  // Relacionamentos
  edital?: EditalCultural
  proponente?: {
    nome: string
    email: string
  }
}

export interface EventoCultural {
  id: string
  nome: string
  descricao?: string
  tipo: string
  data_inicio: string
  data_fim?: string
  local?: string
  espaco_id?: string
  publico_esperado?: number
  publico_real?: number
  orcamento_total?: number
  gasto_real?: number
  organizador_id: string
  status: 'planejando' | 'confirmado' | 'realizado' | 'cancelado'
  licencas_necessarias: string[]
  fornecedores: any
  artistas: any
  avaliacao_pos_evento?: any
  created_at: string
  
  // Relacionamentos
  espaco?: EspacoCultural
  organizador?: {
    nome: string
  }
}

export interface GrupoArtistico {
  id: string
  nome: string
  tipo: 'banda' | 'coral' | 'teatro' | 'danca' | 'grupo_folclorico' | 'orquestra'
  genero_artistico?: string
  descricao?: string
  contato_responsavel: string
  telefone?: string
  email?: string
  endereco?: string
  data_formacao?: string
  membros_total: number
  certificado_municipal: boolean
  ativo: boolean
  created_at: string
  
  // Relacionamentos
  apresentacoes?: ApresentacaoGrupo[]
}

export interface ApresentacaoGrupo {
  id: string
  grupo_id: string
  evento_id?: string
  data_apresentacao: string
  duracao_minutos?: number
  cache: number
  avaliacao?: number
  observacoes?: string
  created_at: string
  
  // Relacionamentos
  grupo?: GrupoArtistico
  evento?: EventoCultural
}

export interface PatrimonioCultural {
  id: string
  nome: string
  tipo: 'edificacao' | 'tradicao' | 'festa' | 'artesanato' | 'culinaria' | 'musica' | 'danca'
  descricao: string
  endereco?: string
  coordenadas?: any
  data_origem?: string
  situacao: 'ativo' | 'em_risco' | 'perdido'
  tombado: boolean
  data_tombamento?: string
  fotos: string[]
  documentos: string[]
  responsavel_registro_id: string
  created_at: string
  
  // Relacionamentos
  responsavel_registro?: {
    nome: string
  }
}

export interface ArquivoHistorico {
  id: string
  titulo: string
  tipo: 'documento' | 'foto' | 'video' | 'audio' | 'mapa'
  periodo?: string
  descricao?: string
  arquivo_url?: string
  tags: string[]
  autor?: string
  fonte?: string
  data_evento?: string
  digitalizacao_completa: boolean
  acesso_publico: boolean
  created_at: string
}

export interface OficinaCultural {
  id: string
  nome: string
  descricao?: string
  tipo: 'musica' | 'danca' | 'teatro' | 'artes_plasticas' | 'literatura' | 'fotografia' | 'artesanato'
  instrutor_nome: string
  instrutor_curriculo?: string
  vagas: number
  carga_horaria: number
  data_inicio: string
  data_fim: string
  horario?: string
  local?: string
  espaco_id?: string
  idade_minima: number
  idade_maxima?: number
  material_incluso: string[]
  valor: number
  certificacao: boolean
  status: 'inscricoes_abertas' | 'inscricoes_encerradas' | 'em_andamento' | 'concluida' | 'cancelada'
  created_at: string
  
  // Relacionamentos
  espaco?: EspacoCultural
  inscricoes?: InscricaoOficina[]
}

export interface InscricaoOficina {
  id: string
  oficina_id: string
  participante_id: string
  data_inscricao: string
  status: 'inscrito' | 'confirmado' | 'concluido' | 'desistente'
  frequencia: number
  avaliacao_final?: number
  certificado_emitido: boolean
  observacoes?: string
  
  // Relacionamentos
  oficina?: OficinaCultural
  participante?: {
    nome: string
    email: string
    telefone: string
  }
}

export const useCultura = () => {
  // Estados principais
  const [espacosCulturais, setEspacosCulturais] = useState<EspacoCultural[]>([])
  const [reservasEspacos, setReservasEspacos] = useState<ReservaEspaco[]>([])
  const [editaisCulturais, setEditaisCulturais] = useState<EditalCultural[]>([])
  const [projetosCulturais, setProjetosCulturais] = useState<ProjetoCultural[]>([])
  const [eventosCulturais, setEventosCulturais] = useState<EventoCultural[]>([])
  const [gruposArtisticos, setGruposArtisticos] = useState<GrupoArtistico[]>([])
  const [apresentacoes, setApresentacoes] = useState<ApresentacaoGrupo[]>([])
  const [patrimonioCultural, setPatrimonioCultural] = useState<PatrimonioCultural[]>([])
  const [arquivoHistorico, setArquivoHistorico] = useState<ArquivoHistorico[]>([])
  const [oficinasCulturais, setOficinasCulturais] = useState<OficinaCultural[]>([])
  const [inscricoesOficinas, setInscricoesOficinas] = useState<InscricaoOficina[]>([])
  
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
        loadEspacosCulturais(),
        loadReservasEspacos(),
        loadEditaisCulturais(),
        loadProjetosCulturais(),
        loadEventosCulturais(),
        loadGruposArtisticos(),
        loadApresentacoes(),
        loadPatrimonioCultural(),
        loadArquivoHistorico(),
        loadOficinasCulturais(),
        loadInscricoesOficinas()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados de cultura:', err)
      setError('Erro ao carregar dados de cultura')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 1. ESPAÇOS CULTURAIS
  // =====================================================

  const loadEspacosCulturais = async () => {
    try {
      const { data, error } = await supabase
        .from('espacos_culturais')
        .select(`
          *,
          responsavel:user_profiles(nome)
        `)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      setEspacosCulturais(data || [])
    } catch (err) {
      console.error('Erro ao carregar espaços culturais:', err)
    }
  }

  const loadReservasEspacos = async (filters?: any) => {
    try {
      let query = supabase
        .from('reservas_espacos_culturais')
        .select(`
          *,
          espaco:espacos_culturais(nome, tipo),
          solicitante:user_profiles(nome, email, telefone)
        `)
        .order('data_inicio', { ascending: true })

      if (filters?.espaco_id) {
        query = query.eq('espaco_id', filters.espaco_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setReservasEspacos(data || [])
    } catch (err) {
      console.error('Erro ao carregar reservas:', err)
    }
  }

  const criarReservaEspaco = async (dadosReserva: Partial<ReservaEspaco>) => {
    try {
      // Verificar disponibilidade
      const conflitos = await verificarDisponibilidadeEspaco(
        dadosReserva.espaco_id!,
        dadosReserva.data_inicio!,
        dadosReserva.data_fim!
      )

      if (conflitos.length > 0) {
        toast.error('Espaço não disponível no horário solicitado')
        return null
      }

      const { data, error } = await supabase
        .from('reservas_espacos_culturais')
        .insert([dadosReserva])
        .select()
        .single()

      if (error) throw error

      toast.success('Reserva solicitada com sucesso!')
      await loadReservasEspacos()
      return data
    } catch (err) {
      console.error('Erro ao criar reserva:', err)
      toast.error('Erro ao criar reserva')
      return null
    }
  }

  const verificarDisponibilidadeEspaco = async (espacoId: string, dataInicio: string, dataFim: string) => {
    const { data } = await supabase
      .from('reservas_espacos_culturais')
      .select('*')
      .eq('espaco_id', espacoId)
      .in('status', ['aprovado', 'realizado'])
      .or(`and(data_inicio.lte.${dataFim},data_fim.gte.${dataInicio})`)

    return data || []
  }

  const aprovarReservaEspaco = async (reservaId: string) => {
    try {
      const { error } = await supabase
        .from('reservas_espacos_culturais')
        .update({ status: 'aprovado' })
        .eq('id', reservaId)

      if (error) throw error

      toast.success('Reserva aprovada!')
      await loadReservasEspacos()
    } catch (err) {
      console.error('Erro ao aprovar reserva:', err)
      toast.error('Erro ao aprovar reserva')
    }
  }

  // =====================================================
  // 2. PROJETOS CULTURAIS
  // =====================================================

  const loadEditaisCulturais = async () => {
    try {
      const { data, error } = await supabase
        .from('editais_culturais')
        .select(`
          *,
          responsavel:user_profiles(nome)
        `)
        .order('data_abertura', { ascending: false })

      if (error) throw error
      setEditaisCulturais(data || [])
    } catch (err) {
      console.error('Erro ao carregar editais:', err)
    }
  }

  const loadProjetosCulturais = async (filters?: any) => {
    try {
      let query = supabase
        .from('projetos_culturais')
        .select(`
          *,
          edital:editais_culturais(titulo, tipo),
          proponente:user_profiles(nome, email)
        `)
        .order('data_inscricao', { ascending: false })

      if (filters?.edital_id) {
        query = query.eq('edital_id', filters.edital_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setProjetosCulturais(data || [])
    } catch (err) {
      console.error('Erro ao carregar projetos:', err)
    }
  }

  const criarEditalCultural = async (dadosEdital: Partial<EditalCultural>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('editais_culturais')
        .insert([{
          ...dadosEdital,
          responsavel_id: user?.id,
          ativo: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Edital criado com sucesso!')
      await loadEditaisCulturais()
      return data
    } catch (err) {
      console.error('Erro ao criar edital:', err)
      toast.error('Erro ao criar edital')
      return null
    }
  }

  const inscreverProjetoCultural = async (dadosProjeto: Partial<ProjetoCultural>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('projetos_culturais')
        .insert([{
          ...dadosProjeto,
          proponente_id: user?.id,
          status: 'inscrito',
          pontuacao: 0
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Projeto inscrito com sucesso!')
      await loadProjetosCulturais()
      return data
    } catch (err) {
      console.error('Erro ao inscrever projeto:', err)
      toast.error('Erro ao inscrever projeto')
      return null
    }
  }

  const avaliarProjetoCultural = async (projetoId: string, pontuacao: number, observacoes?: string) => {
    try {
      const status = pontuacao >= 60 ? 'aprovado' : 'rejeitado'

      const { error } = await supabase
        .from('projetos_culturais')
        .update({
          pontuacao,
          status,
          observacoes,
          data_aprovacao: status === 'aprovado' ? new Date().toISOString() : null
        })
        .eq('id', projetoId)

      if (error) throw error

      toast.success(`Projeto ${status === 'aprovado' ? 'aprovado' : 'rejeitado'}!`)
      await loadProjetosCulturais()
    } catch (err) {
      console.error('Erro ao avaliar projeto:', err)
      toast.error('Erro ao avaliar projeto')
    }
  }

  // =====================================================
  // 3. EVENTOS CULTURAIS
  // =====================================================

  const loadEventosCulturais = async (filters?: any) => {
    try {
      let query = supabase
        .from('eventos_culturais')
        .select(`
          *,
          espaco:espacos_culturais(nome, endereco),
          organizador:user_profiles(nome)
        `)
        .order('data_inicio', { ascending: true })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.mes) {
        const mesInicio = `${filters.mes}-01`
        const mesFim = `${filters.mes}-31`
        query = query.gte('data_inicio', mesInicio).lte('data_inicio', mesFim)
      }

      const { data, error } = await query

      if (error) throw error
      setEventosCulturais(data || [])
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)
    }
  }

  const criarEventoCultural = async (dadosEvento: Partial<EventoCultural>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('eventos_culturais')
        .insert([{
          ...dadosEvento,
          organizador_id: user?.id,
          status: 'planejando'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Evento criado com sucesso!')
      await loadEventosCulturais()
      return data
    } catch (err) {
      console.error('Erro ao criar evento:', err)
      toast.error('Erro ao criar evento')
      return null
    }
  }

  const confirmarEventoCultural = async (eventoId: string) => {
    try {
      const { error } = await supabase
        .from('eventos_culturais')
        .update({ status: 'confirmado' })
        .eq('id', eventoId)

      if (error) throw error

      toast.success('Evento confirmado!')
      await loadEventosCulturais()
    } catch (err) {
      console.error('Erro ao confirmar evento:', err)
      toast.error('Erro ao confirmar evento')
    }
  }

  const registrarPublicoEvento = async (eventoId: string, publicoReal: number, avaliacaoEvento?: any) => {
    try {
      const { error } = await supabase
        .from('eventos_culturais')
        .update({
          publico_real: publicoReal,
          status: 'realizado',
          avaliacao_pos_evento: avaliacaoEvento
        })
        .eq('id', eventoId)

      if (error) throw error

      toast.success('Público registrado!')
      await loadEventosCulturais()
    } catch (err) {
      console.error('Erro ao registrar público:', err)
      toast.error('Erro ao registrar público')
    }
  }

  // =====================================================
  // 4. GRUPOS ARTÍSTICOS
  // =====================================================

  const loadGruposArtisticos = async (filters?: any) => {
    try {
      let query = supabase
        .from('grupos_artisticos')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.certificado_municipal !== undefined) {
        query = query.eq('certificado_municipal', filters.certificado_municipal)
      }

      const { data, error } = await query

      if (error) throw error
      setGruposArtisticos(data || [])
    } catch (err) {
      console.error('Erro ao carregar grupos artísticos:', err)
    }
  }

  const loadApresentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('apresentacoes_grupos')
        .select(`
          *,
          grupo:grupos_artisticos(nome, tipo),
          evento:eventos_culturais(nome, data_inicio)
        `)
        .order('data_apresentacao', { ascending: false })

      if (error) throw error
      setApresentacoes(data || [])
    } catch (err) {
      console.error('Erro ao carregar apresentações:', err)
    }
  }

  const cadastrarGrupoArtistico = async (dadosGrupo: Partial<GrupoArtistico>) => {
    try {
      const { data, error } = await supabase
        .from('grupos_artisticos')
        .insert([{
          ...dadosGrupo,
          ativo: true,
          certificado_municipal: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Grupo cadastrado com sucesso!')
      await loadGruposArtisticos()
      return data
    } catch (err) {
      console.error('Erro ao cadastrar grupo:', err)
      toast.error('Erro ao cadastrar grupo')
      return null
    }
  }

  const certificarGrupoMunicipal = async (grupoId: string) => {
    try {
      const { error } = await supabase
        .from('grupos_artisticos')
        .update({ certificado_municipal: true })
        .eq('id', grupoId)

      if (error) throw error

      toast.success('Grupo certificado como municipal!')
      await loadGruposArtisticos()
    } catch (err) {
      console.error('Erro ao certificar grupo:', err)
      toast.error('Erro ao certificar grupo')
    }
  }

  const agendarApresentacao = async (dadosApresentacao: Partial<ApresentacaoGrupo>) => {
    try {
      const { data, error } = await supabase
        .from('apresentacoes_grupos')
        .insert([dadosApresentacao])
        .select()
        .single()

      if (error) throw error

      toast.success('Apresentação agendada!')
      await loadApresentacoes()
      return data
    } catch (err) {
      console.error('Erro ao agendar apresentação:', err)
      toast.error('Erro ao agendar apresentação')
      return null
    }
  }

  // =====================================================
  // 5. MANIFESTAÇÕES CULTURAIS
  // =====================================================

  const loadPatrimonioCultural = async (filters?: any) => {
    try {
      let query = supabase
        .from('patrimonio_cultural')
        .select(`
          *,
          responsavel_registro:user_profiles(nome)
        `)
        .order('nome', { ascending: true })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.tombado !== undefined) {
        query = query.eq('tombado', filters.tombado)
      }

      if (filters?.situacao) {
        query = query.eq('situacao', filters.situacao)
      }

      const { data, error } = await query

      if (error) throw error
      setPatrimonioCultural(data || [])
    } catch (err) {
      console.error('Erro ao carregar patrimônio cultural:', err)
    }
  }

  const loadArquivoHistorico = async (filters?: any) => {
    try {
      let query = supabase
        .from('arquivo_historico_municipal')
        .select('*')
        .eq('acesso_publico', true)
        .order('created_at', { ascending: false })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.periodo) {
        query = query.eq('periodo', filters.periodo)
      }

      if (filters?.busca) {
        query = query.or(`titulo.ilike.%${filters.busca}%,descricao.ilike.%${filters.busca}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setArquivoHistorico(data || [])
    } catch (err) {
      console.error('Erro ao carregar arquivo histórico:', err)
    }
  }

  const registrarPatrimonioCultural = async (dadosPatrimonio: Partial<PatrimonioCultural>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('patrimonio_cultural')
        .insert([{
          ...dadosPatrimonio,
          responsavel_registro_id: user?.id,
          tombado: false,
          situacao: 'ativo'
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Patrimônio cultural registrado!')
      await loadPatrimonioCultural()
      return data
    } catch (err) {
      console.error('Erro ao registrar patrimônio:', err)
      toast.error('Erro ao registrar patrimônio')
      return null
    }
  }

  const tombarPatrimonio = async (patrimonioId: string) => {
    try {
      const { error } = await supabase
        .from('patrimonio_cultural')
        .update({
          tombado: true,
          data_tombamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', patrimonioId)

      if (error) throw error

      toast.success('Patrimônio tombado!')
      await loadPatrimonioCultural()
    } catch (err) {
      console.error('Erro ao tombar patrimônio:', err)
      toast.error('Erro ao tombar patrimônio')
    }
  }

  const adicionarArquivoHistorico = async (dadosArquivo: Partial<ArquivoHistorico>) => {
    try {
      const { data, error } = await supabase
        .from('arquivo_historico_municipal')
        .insert([{
          ...dadosArquivo,
          digitalizacao_completa: false,
          acesso_publico: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Arquivo adicionado ao acervo!')
      await loadArquivoHistorico()
      return data
    } catch (err) {
      console.error('Erro ao adicionar arquivo:', err)
      toast.error('Erro ao adicionar arquivo')
      return null
    }
  }

  // =====================================================
  // 6. OFICINAS E CURSOS
  // =====================================================

  const loadOficinasCulturais = async (filters?: any) => {
    try {
      let query = supabase
        .from('oficinas_culturais')
        .select(`
          *,
          espaco:espacos_culturais(nome, endereco)
        `)
        .order('data_inicio', { ascending: true })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      setOficinasCulturais(data || [])
    } catch (err) {
      console.error('Erro ao carregar oficinas:', err)
    }
  }

  const loadInscricoesOficinas = async (oficinaId?: string) => {
    try {
      let query = supabase
        .from('inscricoes_oficinas')
        .select(`
          *,
          oficina:oficinas_culturais(nome, tipo),
          participante:user_profiles(nome, email, telefone)
        `)
        .order('data_inscricao', { ascending: false })

      if (oficinaId) {
        query = query.eq('oficina_id', oficinaId)
      }

      const { data, error } = await query

      if (error) throw error
      setInscricoesOficinas(data || [])
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err)
    }
  }

  const criarOficinaCultural = async (dadosOficina: Partial<OficinaCultural>) => {
    try {
      const { data, error } = await supabase
        .from('oficinas_culturais')
        .insert([{
          ...dadosOficina,
          status: 'inscricoes_abertas',
          certificacao: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Oficina criada com sucesso!')
      await loadOficinasCulturais()
      return data
    } catch (err) {
      console.error('Erro ao criar oficina:', err)
      toast.error('Erro ao criar oficina')
      return null
    }
  }

  const inscreverEmOficina = async (oficinaId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Verificar se há vagas
      const { data: oficina } = await supabase
        .from('oficinas_culturais')
        .select('vagas')
        .eq('id', oficinaId)
        .single()

      const { data: inscricoes } = await supabase
        .from('inscricoes_oficinas')
        .select('id')
        .eq('oficina_id', oficinaId)
        .in('status', ['inscrito', 'confirmado'])

      if (oficina && inscricoes && inscricoes.length >= oficina.vagas) {
        toast.error('Oficina lotada!')
        return null
      }

      // Verificar se já está inscrito
      const { data: jaInscrito } = await supabase
        .from('inscricoes_oficinas')
        .select('id')
        .eq('oficina_id', oficinaId)
        .eq('participante_id', user?.id)
        .single()

      if (jaInscrito) {
        toast.error('Você já está inscrito nesta oficina!')
        return null
      }

      const { data, error } = await supabase
        .from('inscricoes_oficinas')
        .insert([{
          oficina_id: oficinaId,
          participante_id: user?.id,
          status: 'inscrito',
          frequencia: 0,
          certificado_emitido: false
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Inscrição realizada!')
      await loadInscricoesOficinas()
      return data
    } catch (err) {
      console.error('Erro ao inscrever em oficina:', err)
      toast.error('Erro ao inscrever em oficina')
      return null
    }
  }

  const emitirCertificadoOficina = async (inscricaoId: string) => {
    try {
      const { error } = await supabase
        .from('inscricoes_oficinas')
        .update({
          status: 'concluido',
          certificado_emitido: true
        })
        .eq('id', inscricaoId)

      if (error) throw error

      toast.success('Certificado emitido!')
      await loadInscricoesOficinas()
    } catch (err) {
      console.error('Erro ao emitir certificado:', err)
      toast.error('Erro ao emitir certificado')
    }
  }

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadoresCultura = () => {
    const espacosAtivos = espacosCulturais.filter(e => e.ativo).length
    const reservasAprovadas = reservasEspacos.filter(r => r.status === 'aprovado').length
    const editaisAtivos = editaisCulturais.filter(e => {
      const hoje = new Date()
      return e.ativo && new Date(e.data_encerramento) >= hoje
    }).length
    const projetosAprovados = projetosCulturais.filter(p => p.status === 'aprovado').length
    const eventosConfirmados = eventosCulturais.filter(e => e.status === 'confirmado').length
    const gruposCertificados = gruposArtisticos.filter(g => g.certificado_municipal).length
    const patrimonioTombado = patrimonioCultural.filter(p => p.tombado).length
    const oficinasAbertas = oficinasCulturais.filter(o => o.status === 'inscricoes_abertas').length

    return {
      espacosAtivos,
      reservasAprovadas,
      editaisAtivos,
      projetosAprovados,
      eventosConfirmados,
      gruposCertificados,
      patrimonioTombado,
      oficinasAbertas,
      totalGruposArtisticos: gruposArtisticos.length,
      totalPatrimonio: patrimonioCultural.length,
      arqivoHistoricoItens: arquivoHistorico.length
    }
  }

  return {
    // Estados
    espacosCulturais,
    reservasEspacos,
    editaisCulturais,
    projetosCulturais,
    eventosCulturais,
    gruposArtisticos,
    apresentacoes,
    patrimonioCultural,
    arquivoHistorico,
    oficinasCulturais,
    inscricoesOficinas,
    loading,
    error,

    // Carregamento
    loadAllData,
    loadEspacosCulturais,
    loadReservasEspacos,
    loadEditaisCulturais,
    loadProjetosCulturais,
    loadEventosCulturais,
    loadGruposArtisticos,
    loadApresentacoes,
    loadPatrimonioCultural,
    loadArquivoHistorico,
    loadOficinasCulturais,
    loadInscricoesOficinas,

    // Espaços Culturais
    criarReservaEspaco,
    verificarDisponibilidadeEspaco,
    aprovarReservaEspaco,

    // Projetos Culturais
    criarEditalCultural,
    inscreverProjetoCultural,
    avaliarProjetoCultural,

    // Eventos Culturais
    criarEventoCultural,
    confirmarEventoCultural,
    registrarPublicoEvento,

    // Grupos Artísticos
    cadastrarGrupoArtistico,
    certificarGrupoMunicipal,
    agendarApresentacao,

    // Patrimônio Cultural
    registrarPatrimonioCultural,
    tombarPatrimonio,
    adicionarArquivoHistorico,

    // Oficinas
    criarOficinaCultural,
    inscreverEmOficina,
    emitirCertificadoOficina,

    // Indicadores
    getIndicadoresCultura
  }
}