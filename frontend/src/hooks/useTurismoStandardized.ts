// =====================================================
// HOOK PADRONIZADO TURISMO - FASE 3
// Seguindo common.ts e padrões React Query
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from "@/lib/supabase"
import { toast } from 'react-hot-toast'
import type { 
  BaseEntity, 
  StatusBase, 
  PrioridadePadrao,
  EnderecoPadrao,
  ContatoPadrao,
  AvaliacaoPadrao
} from "@/types/common"

// =====================================================
// TIPOS PADRONIZADOS TURISMO
// =====================================================

export interface PontoTuristico extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  descricao: string
  categoria: 'historico' | 'natural' | 'cultural' | 'religioso' | 'gastronomico' | 'aventura' | 'praia' | 'montanha' | 'urbano'
  
  // Localização
  endereco: EnderecoPadrao
  coordenadas?: {
    latitude: number
    longitude: number
  }
  
  // Funcionamento
  horario_funcionamento?: Record<string, any>
  entrada_gratuita: boolean
  valor_entrada?: number
  
  // Capacidade e estrutura
  capacidade_visitantes?: number
  acessibilidade: boolean
  estacionamento: boolean
  guia_turistico: boolean
  loja_souvenirs: boolean
  restaurante: boolean
  
  // Avaliações
  avaliacao_media: number
  total_avaliacoes: number
  
  status: StatusBase
}

export interface RotaTuristica extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  descricao: string
  tipo: 'historica' | 'natural' | 'cultural' | 'gastronomica' | 'religiosa' | 'aventura' | 'urbana' | 'rural'
  
  // Características
  duracao_horas: number
  distancia_km: number
  dificuldade: 'facil' | 'moderada' | 'dificil' | 'extrema'
  meio_transporte: 'a_pe' | 'bicicleta' | 'carro' | 'onibus' | 'barco' | 'misto'
  
  // Pontos de interesse
  pontos_turisticos: string[] // IDs dos pontos turísticos
  ponto_partida: string
  ponto_chegada: string
  
  // Público e sazonalidade
  publico_alvo: 'familias' | 'jovens' | 'terceira_idade' | 'aventureiros' | 'todos'
  melhor_epoca: string[]
  
  // Valores
  preco_estimado?: number
  inclui_transporte: boolean
  inclui_alimentacao: boolean
  inclui_guia: boolean
  
  // Avaliações
  avaliacao_media: number
  total_avaliacoes: number
  
  status: StatusBase
}

export interface EventoTuristico extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  descricao: string
  tipo: 'festival' | 'feira' | 'exposicao' | 'show' | 'competicao' | 'encontro' | 'celebracao'
  categoria: 'cultural' | 'gastronomico' | 'religioso' | 'esportivo' | 'musical' | 'artistico'
  
  // Datas
  data_inicio: string
  data_fim: string
  horario_inicio?: string
  horario_fim?: string
  
  // Local
  local: string
  endereco: EnderecoPadrao
  capacidade_maxima?: number
  
  // Organização
  organizador: string
  contato_organizador: ContatoPadrao
  patrocinadores?: string[]
  apoiadores?: string[]
  
  // Participação
  entrada_gratuita: boolean
  valor_entrada?: number
  inscricao_necessaria: boolean
  vagas_limitadas: boolean
  vagas_disponiveis?: number
  
  // Público
  publico_estimado?: number
  publico_presente?: number
  faixa_etaria: 'infantil' | 'juvenil' | 'adulto' | 'terceira_idade' | 'todos'
  
  // Avaliações
  avaliacao_media: number
  total_avaliacoes: number
  
  status: 'planejado' | 'confirmado' | 'em_andamento' | 'realizado' | 'cancelado'
}

export interface GuiaTuristico extends BaseEntity {
  tenant_id: string
  
  // Dados pessoais
  nome_completo: string
  cpf: string
  rg?: string
  data_nascimento: string
  
  // Contato
  endereco: EnderecoPadrao
  telefone: string
  email: string
  
  // Qualificações
  registro_cadastur?: string
  formacao: string
  idiomas: string[]
  especialidades: string[]
  experiencia_anos: number
  
  // Trabalho
  disponibilidade: string[]
  valor_diaria?: number
  valor_meio_periodo?: number
  areas_atuacao: string[]
  
  // Avaliações
  avaliacao_media: number
  total_avaliacoes: number
  grupos_atendidos: number
  
  // Documentação
  documentos_verificados: boolean
  certificacoes: string[]
  
  status: StatusBase
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useTurismoStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Pontos turísticos
  const { data: pontosTuristicos = [], isLoading: loadingPontos } = useQuery({
    queryKey: ['turismo', 'pontos-turisticos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turismo_pontos_turisticos')
        .select('*')
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as PontoTuristico[]
    }
  })

  // Rotas turísticas
  const { data: rotasTuristicas = [], isLoading: loadingRotas } = useQuery({
    queryKey: ['turismo', 'rotas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turismo_roteiros')
        .select(`
          *,
          pontos_inclusos:turismo_pontos_turisticos(id, nome, categoria)
        `)
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as RotaTuristica[]
    }
  })

  // Eventos turísticos
  const { data: eventosTuristicos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ['turismo', 'eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turismo_eventos')
        .select('*')
        .neq('status', 'cancelado')
        .order('data_inicio', { ascending: true })

      if (error) throw error
      return data as EventoTuristico[]
    }
  })

  // Guias turísticos
  const { data: guiasTuristicos = [], isLoading: loadingGuias } = useQuery({
    queryKey: ['turismo', 'guias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turismo_guias')
        .select('*')
        .eq('status', 'ativo')
        .order('nome_completo', { ascending: true })

      if (error) throw error
      return data as GuiaTuristico[]
    }
  })

  // =====================================================
  // MUTATIONS - PONTOS TURÍSTICOS
  // =====================================================

  const criarPontoTuristicoMutation = useMutation({
    mutationFn: async (dados: Partial<PontoTuristico>) => {
      const { data, error } = await supabase
        .from('turismo_pontos_turisticos')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'pontos-turisticos'] })
      toast.success('Ponto turístico criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar ponto turístico:', error)
      toast.error('Erro ao criar ponto turístico')
    }
  })

  const atualizarPontoTuristicoMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<PontoTuristico> }) => {
      const { data, error } = await supabase
        .from('turismo_pontos_turisticos')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'pontos-turisticos'] })
      toast.success('Ponto turístico atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar ponto turístico:', error)
      toast.error('Erro ao atualizar ponto turístico')
    }
  })

  // =====================================================
  // MUTATIONS - ROTAS TURÍSTICAS
  // =====================================================

  const criarRotaTuristicaMutation = useMutation({
    mutationFn: async (dados: Partial<RotaTuristica>) => {
      const { data, error } = await supabase
        .from('turismo_roteiros')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'rotas'] })
      toast.success('Rota turística criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar rota turística:', error)
      toast.error('Erro ao criar rota turística')
    }
  })

  const atualizarRotaTuristicaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<RotaTuristica> }) => {
      const { data, error } = await supabase
        .from('turismo_roteiros')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'rotas'] })
      toast.success('Rota turística atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar rota turística:', error)
      toast.error('Erro ao atualizar rota turística')
    }
  })

  // =====================================================
  // MUTATIONS - EVENTOS TURÍSTICOS
  // =====================================================

  const criarEventoTuristicoMutation = useMutation({
    mutationFn: async (dados: Partial<EventoTuristico>) => {
      const { data, error } = await supabase
        .from('turismo_eventos')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'eventos'] })
      toast.success('Evento turístico criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar evento turístico:', error)
      toast.error('Erro ao criar evento turístico')
    }
  })

  const atualizarStatusEventoMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: EventoTuristico['status'] }) => {
      const { data, error } = await supabase
        .from('turismo_eventos')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'eventos'] })
      toast.success('Status do evento atualizado!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status do evento')
    }
  })

  // =====================================================
  // MUTATIONS - GUIAS TURÍSTICOS
  // =====================================================

  const criarGuiaTuristicoMutation = useMutation({
    mutationFn: async (dados: Partial<GuiaTuristico>) => {
      const { data, error } = await supabase
        .from('turismo_guias')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'guias'] })
      toast.success('Guia turístico cadastrado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao cadastrar guia:', error)
      toast.error('Erro ao cadastrar guia turístico')
    }
  })

  const avaliarGuiaMutation = useMutation({
    mutationFn: async ({ id, avaliacao }: { id: string, avaliacao: number }) => {
      // Buscar dados atuais para recalcular média
      const { data: guiaAtual } = await supabase
        .from('turismo_guias')
        .select('avaliacao_media, total_avaliacoes')
        .eq('id', id)
        .single()

      if (guiaAtual) {
        const novaMedia = (guiaAtual.avaliacao_media * guiaAtual.total_avaliacoes + avaliacao) / (guiaAtual.total_avaliacoes + 1)
        
        const { data, error } = await supabase
          .from('turismo_guias')
          .update({
            avaliacao_media: novaMedia,
            total_avaliacoes: guiaAtual.total_avaliacoes + 1
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turismo', 'guias'] })
      toast.success('Avaliação registrada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao avaliar guia:', error)
      toast.error('Erro ao registrar avaliação')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    const hoje = new Date().toISOString().split('T')[0]
    
    const pontosAtivos = pontosTuristicos.filter(p => p.status === 'ativo').length
    const rotasAtivas = rotasTuristicas.filter(r => r.status === 'ativo').length
    const eventosProximos = eventosTuristicos.filter(e => 
      e.data_inicio >= hoje && ['planejado', 'confirmado'].includes(e.status)
    ).length
    const guiasDisponiveis = guiasTuristicos.filter(g => g.status === 'ativo').length
    const eventosHoje = eventosTuristicos.filter(e => 
      e.data_inicio <= hoje && e.data_fim >= hoje && e.status === 'em_andamento'
    ).length

    return {
      pontosAtivos,
      rotasAtivas,
      eventosProximos,
      guiasDisponiveis,
      eventosHoje,
      avaliacaoMediaPontos: pontosTuristicos.length > 0 
        ? pontosTuristicos.reduce((acc, p) => acc + p.avaliacao_media, 0) / pontosTuristicos.length 
        : 0,
      avaliacaoMediaGuias: guiasTuristicos.length > 0
        ? guiasTuristicos.reduce((acc, g) => acc + g.avaliacao_media, 0) / guiasTuristicos.length
        : 0
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    pontosTuristicos,
    rotasTuristicas,
    eventosTuristicos,
    guiasTuristicos,

    // Loading states
    isLoading: loadingPontos || loadingRotas || loadingEventos || loadingGuias,
    loadingPontos,
    loadingRotas,
    loadingEventos,
    loadingGuias,

    // Mutations - Pontos Turísticos
    criarPontoTuristico: criarPontoTuristicoMutation.mutateAsync,
    atualizarPontoTuristico: atualizarPontoTuristicoMutation.mutateAsync,
    isCreatingPonto: criarPontoTuristicoMutation.isPending,
    isUpdatingPonto: atualizarPontoTuristicoMutation.isPending,

    // Mutations - Rotas
    criarRotaTuristica: criarRotaTuristicaMutation.mutateAsync,
    atualizarRotaTuristica: atualizarRotaTuristicaMutation.mutateAsync,
    isCreatingRota: criarRotaTuristicaMutation.isPending,
    isUpdatingRota: atualizarRotaTuristicaMutation.isPending,

    // Mutations - Eventos
    criarEventoTuristico: criarEventoTuristicoMutation.mutateAsync,
    atualizarStatusEvento: atualizarStatusEventoMutation.mutateAsync,
    isCreatingEvento: criarEventoTuristicoMutation.isPending,
    isUpdatingEvento: atualizarStatusEventoMutation.isPending,

    // Mutations - Guias
    criarGuiaTuristico: criarGuiaTuristicoMutation.mutateAsync,
    avaliarGuia: avaliarGuiaMutation.mutateAsync,
    isCreatingGuia: criarGuiaTuristicoMutation.isPending,
    isAvallandoGuia: avaliarGuiaMutation.isPending,

    // Utilities
    getIndicadores
  }
}