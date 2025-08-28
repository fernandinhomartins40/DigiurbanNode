// =====================================================
// HOOK PADRONIZADO SERVIÇOS PÚBLICOS - FASE 3
// Seguindo common.ts e padrões React Query
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APIClient } from "@/auth/utils/httpInterceptor"
import { toast } from 'react-hot-toast'
import type { 
  BaseEntity, 
  StatusBase, 
  StatusProcesso,
  PrioridadePadrao,
  EnderecoPadrao,
  ContatoPadrao
} from "@/types/common"

// =====================================================
// TIPOS PADRONIZADOS SERVIÇOS PÚBLICOS
// =====================================================

export interface ServicoMunicipal extends BaseEntity {
  tenant_id: string
  
  // Identificação
  nome: string
  codigo_servico: string
  categoria: 'administrativo' | 'assistencial' | 'tecnico' | 'licenciamento' | 'certidoes' | 'tributario' | 'outro'
  subcategoria?: string
  
  // Descrição
  descricao: string
  objetivo: string
  publico_alvo: string[]
  
  // Secretaria responsável
  secretaria_responsavel_id: string
  setor_responsavel?: string
  
  // Requisitos
  documentos_necessarios: string[]
  requisitos_solicitante: string[]
  formularios_necessarios?: string[]
  
  // Processamento
  prazo_atendimento_dias: number
  prazo_maximo_dias?: number
  etapas_processamento: {
    ordem: number
    descricao: string
    prazo_dias: number
    responsavel_setor?: string
  }[]
  
  // Canais de atendimento
  canais_disponveis: ('presencial' | 'online' | 'telefone' | 'correio' | 'whatsapp')[]
  horario_atendimento?: Record<string, any>
  agendamento_necessario: boolean
  
  // Custos
  gratuito: boolean
  valor_taxa?: number
  formas_pagamento?: string[]
  
  // Base legal
  base_legal: string[]
  lei_criacao?: string
  regulamentacao?: string
  
  // Resultados
  tipo_resultado: 'certidao' | 'licenca' | 'autorizacao' | 'protocolo' | 'deferimento' | 'outro'
  formato_entrega: 'fisico' | 'digital' | 'ambos'
  validade_resultado?: number // dias
  
  // Métricas
  total_solicitacoes: number
  tempo_medio_processamento: number
  taxa_aprovacao: number
  avaliacao_media: number
  total_avaliacoes: number
  
  status: StatusBase
}

export interface SolicitacaoServico extends BaseEntity {
  tenant_id: string
  
  // Serviço
  servico_id: string
  numero_protocolo: string
  
  // Solicitante
  solicitante_tipo: 'pessoa_fisica' | 'pessoa_juridica'
  solicitante_nome: string
  solicitante_documento: string
  solicitante_contato: ContatoPadrao
  solicitante_endereco?: EnderecoPadrao
  
  // Representante legal (se aplicável)
  representante_legal?: {
    nome: string
    documento: string
    contato: ContatoPadrao
    procuracao_anexada: boolean
  }
  
  // Dados da solicitação
  data_solicitacao: string
  canal_solicitacao: 'presencial' | 'online' | 'telefone' | 'correio' | 'whatsapp'
  detalhes_solicitacao?: string
  justificativa?: string
  
  // Documentação
  documentos_anexados: {
    nome_documento: string
    arquivo_url: string
    verificado: boolean
    observacoes?: string
  }[]
  documentos_faltantes?: string[]
  
  // Processamento
  data_inicio_processamento?: string
  analista_responsavel_id?: string
  etapa_atual: number
  historico_tramitacao: {
    data: string
    etapa: number
    usuario_id: string
    acao: string
    observacoes?: string
  }[]
  
  // Decisão
  data_decisao?: string
  decisao?: 'deferido' | 'indeferido' | 'deferido_parcial'
  motivo_indeferimento?: string
  exigencias_complementares?: string[]
  
  // Resultado
  resultado_gerado: boolean
  numero_resultado?: string
  arquivo_resultado?: string
  data_disponibilizacao?: string
  forma_entrega: 'retirada_presencial' | 'envio_correio' | 'download_online'
  retirado_entregue: boolean
  data_retirada_entrega?: string
  
  // Prazos
  prazo_atendimento: string
  prorrogacao_prazo?: {
    data_prorrogacao: string
    novo_prazo: string
    motivo: string
    autorizado_por_id: string
  }
  
  // Valores
  taxa_servico?: number
  forma_pagamento?: string
  data_pagamento?: string
  comprovante_pagamento?: string
  
  // Avaliação
  avaliacao_cidadao?: {
    nota: number
    comentario?: string
    data_avaliacao: string
  }
  
  status: 'protocolada' | 'documentacao_pendente' | 'em_analise' | 'exigencias_tecnicas' | 'deferida' | 'indeferida' | 'disponivel_retirada' | 'entregue' | 'cancelada'
  prioridade: PrioridadePadrao
}

export interface AtendimentoPresencial extends BaseEntity {
  tenant_id: string
  
  // Agendamento
  agendamento_previo: boolean
  data_agendamento?: string
  hora_agendamento?: string
  tipo_atendimento: 'agendado' | 'demanda_espontanea' | 'urgencia'
  
  // Cidadão
  cidadao_nome: string
  cidadao_documento: string
  cidadao_contato?: ContatoPadrao
  primeira_vez: boolean
  
  // Atendimento
  data_atendimento: string
  hora_inicio: string
  hora_fim?: string
  duracao_minutos?: number
  
  // Local e atendente
  local_atendimento: string
  guiche_balcao?: string
  atendente_id: string
  
  // Serviços solicitados
  servicos_solicitados: {
    servico_id: string
    protocolo_gerado?: string
    resolvido_no_atendimento: boolean
  }[]
  
  // Documentação
  documentos_apresentados?: string[]
  documentos_protocolados?: string[]
  copias_realizadas?: string[]
  
  // Resolução
  demandas_resolvidas: number
  protocolos_gerados: number
  encaminhamentos?: {
    setor_destino: string
    motivo: string
    prazo_retorno?: string
  }[]
  
  // Satisfação
  pesquisa_satisfacao_respondida: boolean
  nota_atendimento?: number
  comentarios_cidadao?: string
  
  // Observações
  observacoes_atendimento?: string
  intercorrencias?: string
  
  status: 'agendado' | 'em_andamento' | 'concluido' | 'nao_compareceu' | 'cancelado'
}

export interface PesquisaSatisfacao extends BaseEntity {
  tenant_id: string
  
  // Relacionamento
  solicitacao_servico_id?: string
  atendimento_presencial_id?: string
  
  // Identificação
  tipo_avaliacao: 'servico_especifico' | 'atendimento_presencial' | 'satisfacao_geral'
  periodo_referencia?: {
    data_inicio: string
    data_fim: string
  }
  
  // Respondente
  respondente_anonimo: boolean
  respondente_nome?: string
  respondente_contato?: ContatoPadrao
  
  // Avaliação do serviço
  nota_servico: number // 1-5
  aspectos_servico: {
    clareza_informacoes: number
    facilidade_acesso: number
    prazo_atendimento: number
    qualidade_resultado: number
    cortesia_atendimento: number
  }
  
  // Avaliação da estrutura
  avaliacao_estrutura?: {
    instalacoes: number
    sinalizacao: number
    acessibilidade: number
    conforto: number
    organizacao: number
  }
  
  // Comentários
  pontos_positivos?: string
  pontos_negativos?: string
  sugestoes_melhoria?: string
  
  // Recomendação
  recomendaria_servico: boolean
  usaria_novamente: boolean
  
  // Canais preferidos
  canal_preferido_futuro?: 'presencial' | 'online' | 'telefone' | 'whatsapp'
  horario_preferido?: string
  
  data_resposta: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useServicosPublicosStandardized() {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERIES
  // =====================================================

  // Serviços municipais
  const { data: servicosMunicipais = [], isLoading: loadingServicos } = useQuery({
    queryKey: ['servicos-publicos', 'servicos'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('servicos_municipais')
        .select(`
          *,
          secretaria_responsavel:secretarias(nome, sigla)
        `)
        .eq('status', 'ativo')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as ServicoMunicipal[]
    }
  })

  // Solicitações de serviços
  const { data: solicitacoes = [], isLoading: loadingSolicitacoes } = useQuery({
    queryKey: ['servicos-publicos', 'solicitacoes'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('servicos_solicitacoes')
        .select(`
          *,
          servico:servicos_municipais(nome, categoria),
          analista:user_profiles(nome_completo)
        `)
        .order('data_solicitacao', { ascending: false })

      if (error) throw error
      return data as SolicitacaoServico[]
    }
  })

  // Atendimentos presenciais
  const { data: atendimentosPresenciais = [], isLoading: loadingAtendimentos } = useQuery({
    queryKey: ['servicos-publicos', 'atendimentos'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('servicos_atendimentos')
        .select(`
          *,
          atendente:user_profiles(nome_completo)
        `)
        .order('data_atendimento', { ascending: false })

      if (error) throw error
      return data as AtendimentoPresencial[]
    }
  })

  // Pesquisas de satisfação
  const { data: pesquisasSatisfacao = [], isLoading: loadingPesquisas } = useQuery({
    queryKey: ['servicos-publicos', 'pesquisas'],
    queryFn: async () => {
      const { data, error } = await APIClient
        .from('servicos_pesquisas_satisfacao')
        .select('*')
        .order('data_resposta', { ascending: false })

      if (error) throw error
      return data as PesquisaSatisfacao[]
    }
  })

  // =====================================================
  // MUTATIONS - SERVIÇOS
  // =====================================================

  const criarServicoMutation = useMutation({
    mutationFn: async (dados: Partial<ServicoMunicipal>) => {
      // Gerar código do serviço
      const codigoServico = `SRV-${dados.categoria?.toUpperCase()}-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await APIClient
        .from('servicos_municipais')
        .insert([{ ...dados, codigo_servico: codigoServico }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'servicos'] })
      toast.success('Serviço criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar serviço:', error)
      toast.error('Erro ao criar serviço')
    }
  })

  const atualizarServicoMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string, dados: Partial<ServicoMunicipal> }) => {
      const { data, error } = await APIClient
        .from('servicos_municipais')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'servicos'] })
      toast.success('Serviço atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar serviço:', error)
      toast.error('Erro ao atualizar serviço')
    }
  })

  // =====================================================
  // MUTATIONS - SOLICITAÇÕES
  // =====================================================

  const criarSolicitacaoMutation = useMutation({
    mutationFn: async (dados: Partial<SolicitacaoServico>) => {
      // Gerar protocolo
      const ano = new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-8)
      const numeroProtocolo = `${ano}${timestamp}`
      
      const { data, error } = await APIClient
        .from('servicos_solicitacoes')
        .insert([{ ...dados, numero_protocolo: numeroProtocolo, etapa_atual: 1 }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'solicitacoes'] })
      toast.success('Solicitação protocolada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar solicitação:', error)
      toast.error('Erro ao protocolar solicitação')
    }
  })

  const tramitarSolicitacaoMutation = useMutation({
    mutationFn: async ({ id, novaEtapa, observacoes }: { 
      id: string, 
      novaEtapa: number,
      observacoes?: string
    }) => {
      // Buscar solicitação atual
      const { data: solicitacaoAtual } = await APIClient
        .from('servicos_solicitacoes')
        .select('historico_tramitacao, analista_responsavel_id')
        .eq('id', id)
        .single()

      const novoHistorico = [
        ...(solicitacaoAtual?.historico_tramitacao || []),
        {
          data: new Date().toISOString(),
          etapa: novaEtapa,
          usuario_id: solicitacaoAtual?.analista_responsavel_id,
          acao: 'tramitacao',
          observacoes
        }
      ]

      const { data, error } = await APIClient
        .from('servicos_solicitacoes')
        .update({
          etapa_atual: novaEtapa,
          historico_tramitacao: novoHistorico
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'solicitacoes'] })
      toast.success('Solicitação tramitada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao tramitar solicitação:', error)
      toast.error('Erro ao tramitar solicitação')
    }
  })

  const decidirSolicitacaoMutation = useMutation({
    mutationFn: async ({ id, decisao, motivo }: { 
      id: string, 
      decisao: SolicitacaoServico['decisao'],
      motivo?: string
    }) => {
      const { data, error } = await APIClient
        .from('servicos_solicitacoes')
        .update({
          data_decisao: new Date().toISOString(),
          decisao,
          motivo_indeferimento: motivo,
          status: decisao === 'deferido' ? 'deferida' : 'indeferida'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'solicitacoes'] })
      toast.success('Decisão registrada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao decidir solicitação:', error)
      toast.error('Erro ao registrar decisão')
    }
  })

  // =====================================================
  // MUTATIONS - ATENDIMENTOS
  // =====================================================

  const criarAtendimentoMutation = useMutation({
    mutationFn: async (dados: Partial<AtendimentoPresencial>) => {
      const { data, error } = await APIClient
        .from('servicos_atendimentos')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'atendimentos'] })
      toast.success('Atendimento registrado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar atendimento:', error)
      toast.error('Erro ao registrar atendimento')
    }
  })

  const finalizarAtendimentoMutation = useMutation({
    mutationFn: async ({ id, dadosFinalizacao }: { 
      id: string, 
      dadosFinalizacao: {
        hora_fim: string
        demandas_resolvidas: number
        protocolos_gerados: number
        observacoes_atendimento?: string
      }
    }) => {
      const horaInicio = new Date(`1970-01-01T${dadosFinalizacao.hora_fim}`)
      const horaFim = new Date(`1970-01-01T${dadosFinalizacao.hora_fim}`)
      const duracaoMinutos = Math.round((horaFim.getTime() - horaInicio.getTime()) / (1000 * 60))

      const { data, error } = await APIClient
        .from('servicos_atendimentos')
        .update({
          ...dadosFinalizacao,
          duracao_minutos: duracaoMinutos,
          status: 'concluido'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'atendimentos'] })
      toast.success('Atendimento finalizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao finalizar atendimento:', error)
      toast.error('Erro ao finalizar atendimento')
    }
  })

  // =====================================================
  // MUTATIONS - PESQUISAS DE SATISFAÇÃO
  // =====================================================

  const registrarPesquisaSatisfacaoMutation = useMutation({
    mutationFn: async (dados: Partial<PesquisaSatisfacao>) => {
      const { data, error } = await APIClient
        .from('servicos_pesquisas_satisfacao')
        .insert([dados])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos-publicos', 'pesquisas'] })
      // Não mostrar toast para não interferir na experiência do cidadão
    },
    onError: (error) => {
      console.error('Erro ao registrar pesquisa:', error)
      toast.error('Erro ao registrar avaliação')
    }
  })

  // =====================================================
  // INDICADORES E ESTATÍSTICAS
  // =====================================================

  const getIndicadores = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const mesAtual = hoje.substring(0, 7)

    return {
      // Serviços
      totalServicosAtivos: servicosMunicipais.filter(s => s.status === 'ativo').length,
      servicosMaisUtilizados: servicosMunicipais
        .sort((a, b) => b.total_solicitacoes - a.total_solicitacoes)
        .slice(0, 5),
      tempoMedioProcessamento: servicosMunicipais.length > 0
        ? servicosMunicipais.reduce((acc, s) => acc + s.tempo_medio_processamento, 0) / servicosMunicipais.length
        : 0,

      // Solicitações
      solicitacoesMes: solicitacoes.filter(s => s.data_solicitacao.startsWith(mesAtual)).length,
      solicitacoesPendentes: solicitacoes.filter(s => 
        ['protocolada', 'documentacao_pendente', 'em_analise'].includes(s.status)
      ).length,
      solicitacoesDeferidas: solicitacoes.filter(s => s.status === 'deferida').length,
      solicitacoesIndeferidas: solicitacoes.filter(s => s.status === 'indeferida').length,
      taxaAprovacao: solicitacoes.length > 0
        ? (solicitacoes.filter(s => s.decisao === 'deferido').length / 
           solicitacoes.filter(s => s.decisao).length) * 100
        : 0,

      // Atendimentos
      atendimentosHoje: atendimentosPresenciais.filter(a => 
        a.data_atendimento.startsWith(hoje)
      ).length,
      atendimentosMes: atendimentosPresenciais.filter(a => 
        a.data_atendimento.startsWith(mesAtual)
      ).length,
      tempoMedioAtendimento: atendimentosPresenciais
        .filter(a => a.duracao_minutos)
        .reduce((acc, a, _, arr) => 
          acc + (a.duracao_minutos! / arr.length), 0
        ) || 0,
      naoComparecimentos: atendimentosPresenciais.filter(a => 
        a.status === 'nao_compareceu'
      ).length,

      // Satisfação
      avaliacaoMediaGeral: pesquisasSatisfacao.length > 0
        ? pesquisasSatisfacao.reduce((acc, p) => acc + p.nota_servico, 0) / pesquisasSatisfacao.length
        : 0,
      totalAvaliacoes: pesquisasSatisfacao.length,
      recomendacaoMedia: pesquisasSatisfacao.length > 0
        ? (pesquisasSatisfacao.filter(p => p.recomendaria_servico).length / pesquisasSatisfacao.length) * 100
        : 0,
      pesquisasMes: pesquisasSatisfacao.filter(p => 
        p.data_resposta.startsWith(mesAtual)
      ).length
    }
  }

  // =====================================================
  // RETURN DO HOOK
  // =====================================================

  return {
    // Data
    servicosMunicipais,
    solicitacoes,
    atendimentosPresenciais,
    pesquisasSatisfacao,

    // Loading states
    isLoading: loadingServicos || loadingSolicitacoes || loadingAtendimentos || loadingPesquisas,
    loadingServicos,
    loadingSolicitacoes,
    loadingAtendimentos,
    loadingPesquisas,

    // Mutations - Serviços
    criarServico: criarServicoMutation.mutateAsync,
    atualizarServico: atualizarServicoMutation.mutateAsync,
    isCreatingServico: criarServicoMutation.isPending,
    isUpdatingServico: atualizarServicoMutation.isPending,

    // Mutations - Solicitações
    criarSolicitacao: criarSolicitacaoMutation.mutateAsync,
    tramitarSolicitacao: tramitarSolicitacaoMutation.mutateAsync,
    decidirSolicitacao: decidirSolicitacaoMutation.mutateAsync,
    isCreatingSolicitacao: criarSolicitacaoMutation.isPending,
    isTramitandoSolicitacao: tramitarSolicitacaoMutation.isPending,
    isDecidindoSolicitacao: decidirSolicitacaoMutation.isPending,

    // Mutations - Atendimentos
    criarAtendimento: criarAtendimentoMutation.mutateAsync,
    finalizarAtendimento: finalizarAtendimentoMutation.mutateAsync,
    isCreatingAtendimento: criarAtendimentoMutation.isPending,
    isFinalizandoAtendimento: finalizarAtendimentoMutation.isPending,

    // Mutations - Pesquisas
    registrarPesquisaSatisfacao: registrarPesquisaSatisfacaoMutation.mutateAsync,
    isRegistrandoPesquisa: registrarPesquisaSatisfacaoMutation.isPending,

    // Utilities
    getIndicadores
  }
}